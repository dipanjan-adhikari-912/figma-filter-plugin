import type { FilterId } from "../../shared/filterTypes";

type PixelWorker = (data: Uint8ClampedArray, index: number, width: number, height: number) => void;

function clamp(value: number): number {
  return Math.max(0, Math.min(255, value));
}

function applyPerPixel(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  worker: PixelWorker
): void {
  for (let i = 0; i < pixels.length; i += 4) {
    worker(pixels, i, width, height);
  }
}

function tactileGrain(pixels: Uint8ClampedArray, width: number, height: number): void {
  applyPerPixel(pixels, width, height, (data, i) => {
    const noise = (Math.random() - 0.5) * 24;
    data[i] = clamp(data[i] + noise);
    data[i + 1] = clamp(data[i + 1] + noise);
    data[i + 2] = clamp(data[i + 2] + noise);
  });
}

function tactilePrint(pixels: Uint8ClampedArray, width: number, height: number): void {
  applyPerPixel(pixels, width, height, (data, i) => {
    data[i] = clamp(data[i] * 1.05 + 8);
    data[i + 1] = clamp(data[i + 1] * 1.0 + 5);
    data[i + 2] = clamp(data[i + 2] * 0.95);
  });
}

function glitchRgbSplit(pixels: Uint8ClampedArray, width: number, height: number): void {
  const original = new Uint8ClampedArray(pixels);
  const offset = 2;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const left = (y * width + Math.max(0, x - offset)) * 4;
      const right = (y * width + Math.min(width - 1, x + offset)) * 4;
      pixels[i] = original[right];
      pixels[i + 1] = original[i + 1];
      pixels[i + 2] = original[left + 2];
    }
  }
}

function glitchScanline(pixels: Uint8ClampedArray, width: number, height: number): void {
  for (let y = 0; y < height; y += 1) {
    const attenuation = y % 2 === 0 ? 0.88 : 1;
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      pixels[i] = clamp(pixels[i] * attenuation);
      pixels[i + 1] = clamp(pixels[i + 1] * attenuation);
      pixels[i + 2] = clamp(pixels[i + 2] * attenuation);
    }
  }
}

function uncannyHaze(pixels: Uint8ClampedArray, width: number, height: number): void {
  applyPerPixel(pixels, width, height, (data, i) => {
    const average = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = clamp(data[i] * 0.86 + average * 0.2 + 12);
    data[i + 1] = clamp(data[i + 1] * 0.9 + average * 0.16 + 10);
    data[i + 2] = clamp(data[i + 2] * 1.04 + average * 0.08 + 8);
  });
}

function uncannyEcho(pixels: Uint8ClampedArray, width: number, height: number): void {
  const original = new Uint8ClampedArray(pixels);
  const xShift = 3;
  const yShift = 2;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const sx = Math.max(0, x - xShift);
      const sy = Math.max(0, y - yShift);
      const s = (sy * width + sx) * 4;
      pixels[i] = clamp(original[i] * 0.75 + original[s] * 0.25);
      pixels[i + 1] = clamp(original[i + 1] * 0.8 + original[s + 1] * 0.2);
      pixels[i + 2] = clamp(original[i + 2] * 0.9 + original[s + 2] * 0.1);
    }
  }
}

const algorithmByFilterId: Record<string, (pixels: Uint8ClampedArray, width: number, height: number) => void> = {
  "tactile-grain": tactileGrain,
  "tactile-print": tactilePrint,
  "glitch-rgb-split": glitchRgbSplit,
  "glitch-scanline": glitchScanline,
  "uncanny-haze": uncannyHaze,
  "uncanny-echo": uncannyEcho
};

export function runFilterAlgorithm(
  filterId: FilterId,
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): void {
  const algorithm = algorithmByFilterId[filterId];
  if (!algorithm) {
    return;
  }
  algorithm(pixels, width, height);
}
