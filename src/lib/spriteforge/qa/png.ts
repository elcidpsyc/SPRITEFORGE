import { unzlibSync } from "fflate";

// Minimal PNG reader for the contract tests.
//
// Written by hand rather than pulled in as a dependency: the only thing needed
// is exact pixels out of the PNGs the pipeline produces, and `fflate` (already
// a dependency, for the export zips) supplies the one hard part, inflate.
//
// Deliberately strict. It handles 8-bit greyscale, RGB, palette and their
// alpha variants -- what PixelLab and our own exporter emit -- and throws on
// anything else rather than guessing. A contract test that silently mis-decodes
// is worse than one that fails.

export type Rgba = { width: number; height: number; data: Uint8Array };

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Paeth predictor, per the PNG spec (RFC 2083 §6.6). */
function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

export function decodePng(buffer: Uint8Array): Rgba {
  for (let i = 0; i < SIGNATURE.length; i += 1) {
    if (buffer[i] !== SIGNATURE[i]) throw new Error("não é um PNG (assinatura inválida)");
  }

  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  let palette: Uint8Array | null = null;
  let transparency: Uint8Array | null = null;
  const idat: Uint8Array[] = [];

  while (offset < buffer.length) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(
      buffer[offset + 4]!,
      buffer[offset + 5]!,
      buffer[offset + 6]!,
      buffer[offset + 7]!,
    );
    const body = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      width = view.getUint32(offset + 8);
      height = view.getUint32(offset + 12);
      bitDepth = buffer[offset + 16]!;
      colorType = buffer[offset + 17]!;
      interlace = buffer[offset + 20]!;
    } else if (type === "PLTE") {
      palette = body.slice();
    } else if (type === "tRNS") {
      transparency = body.slice();
    } else if (type === "IDAT") {
      idat.push(body.slice());
    } else if (type === "IEND") {
      break;
    }

    offset += 12 + length; // length + type + body + CRC
  }

  if (bitDepth !== 8) throw new Error(`bit depth ${bitDepth} não suportado (só 8)`);
  if (interlace !== 0) throw new Error("PNG entrelaçado (Adam7) não suportado");

  const channelsFor: Record<number, number> = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };
  const channels = channelsFor[colorType];
  if (!channels) throw new Error(`color type ${colorType} não suportado`);

  const merged = new Uint8Array(idat.reduce((n, c) => n + c.length, 0));
  let cursor = 0;
  for (const chunk of idat) {
    merged.set(chunk, cursor);
    cursor += chunk.length;
  }
  const raw = unzlibSync(merged); // IDAT is zlib-wrapped, not raw deflate

  // Undo per-scanline filtering. Each row is prefixed with its filter byte.
  const stride = width * channels;
  const pixels = new Uint8Array(height * stride);
  let pos = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[pos]!;
    pos += 1;
    const rowStart = y * stride;
    const prevStart = (y - 1) * stride;

    for (let x = 0; x < stride; x += 1) {
      const value = raw[pos + x]!;
      const a = x >= channels ? pixels[rowStart + x - channels]! : 0;
      const b = y > 0 ? pixels[prevStart + x]! : 0;
      const c = x >= channels && y > 0 ? pixels[prevStart + x - channels]! : 0;

      let out: number;
      switch (filter) {
        case 0:
          out = value;
          break;
        case 1:
          out = value + a;
          break;
        case 2:
          out = value + b;
          break;
        case 3:
          out = value + ((a + b) >> 1);
          break;
        case 4:
          out = value + paeth(a, b, c);
          break;
        default:
          throw new Error(`filtro PNG desconhecido: ${filter}`);
      }
      pixels[rowStart + x] = out & 0xff;
    }
    pos += stride;
  }

  // Expand whatever colour model this was into straight RGBA.
  const data = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    const src = i * channels;
    const dst = i * 4;
    if (colorType === 6) {
      data.set(pixels.subarray(src, src + 4), dst);
    } else if (colorType === 2) {
      data.set(pixels.subarray(src, src + 3), dst);
      data[dst + 3] = 255;
    } else if (colorType === 0) {
      const g = pixels[src]!;
      data[dst] = g;
      data[dst + 1] = g;
      data[dst + 2] = g;
      data[dst + 3] = 255;
    } else if (colorType === 4) {
      const g = pixels[src]!;
      data[dst] = g;
      data[dst + 1] = g;
      data[dst + 2] = g;
      data[dst + 3] = pixels[src + 1]!;
    } else {
      const index = pixels[src]!;
      if (!palette) throw new Error("PNG com paleta mas sem chunk PLTE");
      data[dst] = palette[index * 3]!;
      data[dst + 1] = palette[index * 3 + 1]!;
      data[dst + 2] = palette[index * 3 + 2]!;
      data[dst + 3] = transparency?.[index] ?? 255;
    }
  }

  return { width, height, data };
}

/** RGBA of one pixel. */
export function pixelAt(img: Rgba, x: number, y: number): [number, number, number, number] {
  const i = (y * img.width + x) * 4;
  return [img.data[i]!, img.data[i + 1]!, img.data[i + 2]!, img.data[i + 3]!];
}

/**
 * Distinct colours, counting only pixels that are actually visible.
 * Fully transparent pixels carry arbitrary RGB and would inflate the count
 * without being visible in the game.
 */
export function palette(img: Rgba): Set<string> {
  const colors = new Set<string>();
  for (let i = 0; i < img.data.length; i += 4) {
    if (img.data[i + 3] === 0) continue;
    colors.add(`${img.data[i]},${img.data[i + 1]},${img.data[i + 2]}`);
  }
  return colors;
}

/** Tight bounding box of non-transparent pixels; null if fully transparent. */
export function opaqueBounds(
  img: Rgba,
  cell?: { x: number; y: number; w: number; h: number },
): { x: number; y: number; w: number; h: number } | null {
  const x0 = cell?.x ?? 0;
  const y0 = cell?.y ?? 0;
  const x1 = x0 + (cell?.w ?? img.width);
  const y1 = y0 + (cell?.h ?? img.height);

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      if (img.data[(y * img.width + x) * 4 + 3] === 0) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (minX === Infinity) return null;
  return { x: minX - x0, y: minY - y0, w: maxX - minX + 1, h: maxY - minY + 1 };
}
