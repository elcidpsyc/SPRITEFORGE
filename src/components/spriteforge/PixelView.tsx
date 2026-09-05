import { useEffect, useRef } from "react";
import { CELL, HITBOX, PIVOT, type BgId, type ZoomLevel } from "@/lib/spriteforge/contract";
import { pixToImageData, type SheetBundle } from "@/lib/spriteforge/sheet";
import type { Pix } from "@/lib/spriteforge/render";
import { cn } from "@/lib/utils";

function paintBg(ctx: CanvasRenderingContext2D, w: number, h: number, bg: BgId) {
  if (bg === "preto") {
    ctx.fillStyle = "#070809";
    ctx.fillRect(0, 0, w, h);
    return;
  }
  if (bg === "grama") {
    ctx.fillStyle = "#1e3a1c";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#3d6b32";
    for (let i = 0; i < 40; i++) {
      ctx.fillRect((i * 17) % w, (i * 29) % h, 3, 2);
    }
    return;
  }
  if (bg === "areia") {
    ctx.fillStyle = "#8a6a3e";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#c4a574";
    for (let i = 0; i < 50; i++) ctx.fillRect((i * 13) % w, (i * 23) % h, 2, 2);
    return;
  }
  if (bg === "pedra") {
    ctx.fillStyle = "#374151";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#6b7280";
    for (let i = 0; i < 30; i++) ctx.fillRect((i * 19) % w, (i * 31) % h, 6, 4);
    return;
  }
  const s = 8;
  for (let y = 0; y < h; y += s) {
    for (let x = 0; x < w; x += s) {
      ctx.fillStyle = ((x / s + y / s) | 0) % 2 === 0 ? "#1a1d23" : "#121418";
      ctx.fillRect(x, y, s, s);
    }
  }
}

export function PixelView({
  cell,
  onion,
  zoom,
  bg,
  showGrid,
  showHitbox,
  className,
}: {
  cell: Pix;
  onion?: Pix | null;
  zoom: ZoomLevel;
  bg: BgId;
  showGrid: boolean;
  showHitbox: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const size = CELL * zoom;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    paintBg(ctx, size, size, bg);

    if (onion) {
      ctx.globalAlpha = 0.28;
      const tmp = document.createElement("canvas");
      tmp.width = CELL;
      tmp.height = CELL;
      tmp.getContext("2d")!.putImageData(pixToImageData(onion), 0, 0);
      ctx.drawImage(tmp, 0, 0, size, size);
      ctx.globalAlpha = 1;
    }

    const tmp = document.createElement("canvas");
    tmp.width = CELL;
    tmp.height = CELL;
    tmp.getContext("2d")!.putImageData(pixToImageData(cell), 0, 0);
    ctx.drawImage(tmp, 0, 0, size, size);

    if (showGrid) {
      ctx.strokeStyle = "rgba(228,184,74,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(size / 2, 0);
      ctx.lineTo(size / 2, size);
      ctx.moveTo(0, size / 2);
      ctx.lineTo(size, size / 2);
      ctx.stroke();
    }
    if (showHitbox) {
      ctx.strokeStyle = "rgba(80,200,255,0.85)";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        HITBOX.x * zoom,
        HITBOX.y * zoom,
        HITBOX.w * zoom,
        HITBOX.h * zoom,
      );
      ctx.fillStyle = "#e4b84a";
      ctx.fillRect(PIVOT.x * zoom - 2, PIVOT.y * zoom - 2, 4, 4);
    }
  }, [cell, onion, zoom, bg, showGrid, showHitbox, size]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      className={cn("pixelated rounded-md", className)}
      style={{ width: size, height: size }}
    />
  );
}

export function SheetCanvas({
  pix,
  className,
  maxWidth,
}: {
  pix: Pix;
  className?: string;
  maxWidth?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = pix.w;
    canvas.height = pix.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.putImageData(pixToImageData(pix), 0, 0);
  }, [pix]);
  return (
    <canvas
      ref={ref}
      className={cn("pixelated", className)}
      style={{
        width: maxWidth ? Math.min(maxWidth, pix.w) : pix.w,
        height: maxWidth ? Math.round((pix.h / pix.w) * Math.min(maxWidth, pix.w)) : pix.h,
      }}
    />
  );
}

export function Portrait({
  pix,
  scale = 3,
  className,
}: {
  pix: Pix;
  scale?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = pix.w * scale;
    canvas.height = pix.h * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    const tmp = document.createElement("canvas");
    tmp.width = pix.w;
    tmp.height = pix.h;
    tmp.getContext("2d")!.putImageData(pixToImageData(pix), 0, 0);
    ctx.drawImage(tmp, 0, 0, pix.w * scale, pix.h * scale);
  }, [pix, scale]);
  return (
    <canvas
      ref={ref}
      className={cn("pixelated", className)}
      style={{ width: pix.w * scale, height: pix.h * scale }}
    />
  );
}

export type { SheetBundle };
