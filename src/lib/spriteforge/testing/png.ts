import { inflateSync } from "node:zlib";

export type DecodedPng = { width: number; height: number; data: Uint8Array };

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

/**
 * Minimal PNG decoder for the 8-bit, non-interlaced RGB/RGBA files this
 * project's pipeline emits (Pillow's default `Image.save`). Not a general
 * PNG reader — throws on anything else so a format drift is loud, not silent.
 */
export function decodePng(buf: Buffer): DecodedPng {
  const SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = 0; i < 8; i++) {
    if (buf[i] !== SIG[i]) throw new Error("not a PNG file");
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const idatChunks: Buffer[] = [];

  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString("ascii", offset + 4, offset + 8);
    const dataStart = offset + 8;
    const data = buf.subarray(dataStart, dataStart + length);
    offset = dataStart + length + 4; // skip CRC

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8]!;
      colorType = data[9]!;
      interlace = data[12]!;
    } else if (type === "IDAT") {
      idatChunks.push(Buffer.from(data));
    } else if (type === "IEND") {
      break;
    }
  }

  if (bitDepth !== 8) throw new Error(`unsupported PNG bit depth ${bitDepth}`);
  if (interlace !== 0) throw new Error("interlaced PNG not supported");
  if (colorType !== 6 && colorType !== 2) {
    throw new Error(`unsupported PNG color type ${colorType} (expected RGB or RGBA)`);
  }

  const srcBpp = colorType === 6 ? 4 : 3;
  const stride = width * srcBpp;
  const inflated = inflateSync(Buffer.concat(idatChunks));
  const raw = new Uint8Array(height * stride);

  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filterType = inflated[pos++]!;
    for (let x = 0; x < stride; x++) {
      const rawByte = inflated[pos++]!;
      const a = x >= srcBpp ? raw[y * stride + x - srcBpp]! : 0;
      const b = y > 0 ? raw[(y - 1) * stride + x]! : 0;
      const c = x >= srcBpp && y > 0 ? raw[(y - 1) * stride + x - srcBpp]! : 0;
      let val: number;
      switch (filterType) {
        case 0:
          val = rawByte;
          break;
        case 1:
          val = (rawByte + a) & 0xff;
          break;
        case 2:
          val = (rawByte + b) & 0xff;
          break;
        case 3:
          val = (rawByte + Math.floor((a + b) / 2)) & 0xff;
          break;
        case 4:
          val = (rawByte + paeth(a, b, c)) & 0xff;
          break;
        default:
          throw new Error(`unsupported PNG filter type ${filterType}`);
      }
      raw[y * stride + x] = val;
    }
  }

  if (srcBpp === 4) return { width, height, data: raw };

  const rgba = new Uint8Array(width * height * 4);
  for (let i = 0, j = 0; i < raw.length; i += 3, j += 4) {
    rgba[j] = raw[i]!;
    rgba[j + 1] = raw[i + 1]!;
    rgba[j + 2] = raw[i + 2]!;
    rgba[j + 3] = 255;
  }
  return { width, height, data: rgba };
}

export function alphaAt(img: DecodedPng, x: number, y: number): number {
  return img.data[(y * img.width + x) * 4 + 3]!;
}
