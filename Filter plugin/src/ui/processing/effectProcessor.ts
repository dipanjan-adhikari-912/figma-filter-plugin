import type { FilterId } from "../../shared/filterTypes";

type RGBA = [number, number, number, number];

export interface EffectParams {
  brightness?: number;
  contrast?: number;
  hue?: number;
  saturation?: number;
  vibrance?: number;
  gamma?: number;
  intensity?: number;
  radius?: number;
  centerX?: number;
  centerY?: number;
  strength?: number;
  waveFrequency?: number;
  amplitude?: number;
  separation?: number;
  angle?: number;
  colorSteps?: number;
  invert?: boolean;
  smoothness?: number;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, value));
}

function toUnit(value: number): number {
  return clamp(value) / 255;
}

function fromUnit(value: number): number {
  return clamp(value * 255);
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = toUnit(r);
  const gn = toUnit(g);
  const bn = toUnit(b);
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let rgb: [number, number, number] = [0, 0, 0];
  if (hp >= 0 && hp < 1) rgb = [c, x, 0];
  else if (hp < 2) rgb = [x, c, 0];
  else if (hp < 3) rgb = [0, c, x];
  else if (hp < 4) rgb = [0, x, c];
  else if (hp < 5) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  const m = l - c / 2;
  return [fromUnit(rgb[0] + m), fromUnit(rgb[1] + m), fromUnit(rgb[2] + m)];
}

export class EffectProcessor {
  process(
    effectName: FilterId,
    params: EffectParams,
    pixels: Uint8ClampedArray,
    width: number,
    height: number
  ): void {
    switch (effectName) {
      case "brightness-contrast":
        this.applyBrightnessContrast(pixels, params);
        return;
      case "hue-saturation":
      case "vibrance":
        this.applyHueSaturationVibrance(pixels, params);
        return;
      case "gamma":
        this.applyGamma(pixels, params);
        return;
      case "sepia":
      case "grayscale":
      case "mono":
        this.applyColorMatrix(effectName, pixels, params);
        return;
      case "gaussian-blur":
      case "triangle-blur":
        this.applyBlur(effectName, pixels, width, height, params);
        return;
      case "unsharp-mask":
      case "sharpen":
      case "sharpen-luminance":
        this.applyKernel(pixels, width, height, [0, -1, 0, -1, 5, -1, 0, -1, 0]);
        return;
      case "swirl":
      case "ripple":
      case "bulge-pinch":
      case "chromatic-aberration":
        this.applyCoordinateMapping(effectName, pixels, width, height, params);
        return;
      case "posterization":
        this.applyPosterization(pixels, params);
        return;
      case "alpha":
        this.applyAlphaMask(pixels, params);
        return;
      case "fxaa-antialiasing":
        this.applyFxaaLite(pixels, width, height, params);
        return;
      default:
        return;
    }
  }

  private forEachPixel(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    worker: (rgba: RGBA, index: number, x: number, y: number) => RGBA
  ): void {
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = (y * width + x) * 4;
        const next = worker([pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3]], i, x, y);
        pixels[i] = clamp(next[0]);
        pixels[i + 1] = clamp(next[1]);
        pixels[i + 2] = clamp(next[2]);
        pixels[i + 3] = clamp(next[3]);
      }
    }
  }

  private applyColorMatrix(effectName: string, pixels: Uint8ClampedArray, params: EffectParams): void {
    const intensity = Math.max(0, Math.min(1, params.intensity ?? 1));
    const matrices: Record<string, number[]> = {
      sepia: [0.393, 0.769, 0.189, 0, 0, 0.349, 0.686, 0.168, 0, 0, 0.272, 0.534, 0.131, 0, 0, 0, 0, 0, 1, 0],
      grayscale: [0.2126, 0.7152, 0.0722, 0, 0, 0.2126, 0.7152, 0.0722, 0, 0, 0.2126, 0.7152, 0.0722, 0, 0, 0, 0, 0, 1, 0],
      mono: [0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0, 0, 0, 1, 0]
    };
    const m = matrices[effectName];
    if (!m) return;

    this.forEachPixel(pixels, Math.max(1, pixels.length / 4), 1, ([r, g, b, a]) => {
      const mr = r * m[0] + g * m[1] + b * m[2] + a * m[3] + m[4];
      const mg = r * m[5] + g * m[6] + b * m[7] + a * m[8] + m[9];
      const mb = r * m[10] + g * m[11] + b * m[12] + a * m[13] + m[14];
      return [
        r + (mr - r) * intensity,
        g + (mg - g) * intensity,
        b + (mb - b) * intensity,
        a
      ];
    });
  }

  private applyBrightnessContrast(pixels: Uint8ClampedArray, params: EffectParams): void {
    const brightness = Math.max(-100, Math.min(100, params.brightness ?? 0));
    const contrast = Math.max(-100, Math.min(100, params.contrast ?? 0));
    const b = brightness * 2.55;
    const c = (259 * (contrast + 255)) / (255 * (259 - contrast));
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = clamp(c * (pixels[i] - 128) + 128 + b);
      pixels[i + 1] = clamp(c * (pixels[i + 1] - 128) + 128 + b);
      pixels[i + 2] = clamp(c * (pixels[i + 2] - 128) + 128 + b);
    }
  }

  private applyHueSaturationVibrance(pixels: Uint8ClampedArray, params: EffectParams): void {
    const hueShift = ((params.hue ?? 0) % 360 + 360) % 360;
    const satScale = Math.max(0, Math.min(2, params.saturation ?? 1));
    const vibScale = Math.max(0, Math.min(2, params.vibrance ?? 1));
    for (let i = 0; i < pixels.length; i += 4) {
      const [h, s, l] = rgbToHsl(pixels[i], pixels[i + 1], pixels[i + 2]);
      const max = Math.max(pixels[i], pixels[i + 1], pixels[i + 2]) / 255;
      const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / (3 * 255);
      const vibBoost = 1 + (1 - Math.abs(max - avg)) * (vibScale - 1);
      const [r, g, b] = hslToRgb((h + hueShift) % 360, Math.min(1, s * satScale * vibBoost), l);
      pixels[i] = r;
      pixels[i + 1] = g;
      pixels[i + 2] = b;
    }
  }

  private applyGamma(pixels: Uint8ClampedArray, params: EffectParams): void {
    const gamma = Math.max(0.1, Math.min(5, params.gamma ?? 1));
    const inv = 1 / gamma;
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = fromUnit(Math.pow(toUnit(pixels[i]), inv));
      pixels[i + 1] = fromUnit(Math.pow(toUnit(pixels[i + 1]), inv));
      pixels[i + 2] = fromUnit(Math.pow(toUnit(pixels[i + 2]), inv));
    }
  }

  private applyKernel(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    kernel: number[],
    divisor = kernel.reduce((sum, value) => sum + value, 0) || 1
  ): void {
    const source = new Uint8ClampedArray(pixels);
    const size = Math.sqrt(kernel.length);
    const half = Math.floor(size / 2);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        let r = 0;
        let g = 0;
        let b = 0;
        for (let ky = -half; ky <= half; ky += 1) {
          for (let kx = -half; kx <= half; kx += 1) {
            const sx = Math.max(0, Math.min(width - 1, x + kx));
            const sy = Math.max(0, Math.min(height - 1, y + ky));
            const si = (sy * width + sx) * 4;
            const kv = kernel[(ky + half) * size + (kx + half)];
            r += source[si] * kv;
            g += source[si + 1] * kv;
            b += source[si + 2] * kv;
          }
        }
        const i = (y * width + x) * 4;
        pixels[i] = clamp(r / divisor);
        pixels[i + 1] = clamp(g / divisor);
        pixels[i + 2] = clamp(b / divisor);
      }
    }
  }

  private applyBlur(
    effectName: "gaussian-blur" | "triangle-blur",
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    params: EffectParams
  ): void {
    const radius = Math.max(1, Math.min(50, Math.round(params.radius ?? 4)));
    const size = radius * 2 + 1;
    const kernel = new Array(size * size).fill(0).map((_, idx) => {
      const x = idx % size;
      const y = Math.floor(idx / size);
      const dx = x - radius;
      const dy = y - radius;
      if (effectName === "triangle-blur") return radius + 1 - Math.max(Math.abs(dx), Math.abs(dy));
      const sigma = radius / 2 || 1;
      return Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
    });
    this.applyKernel(pixels, width, height, kernel);
  }

  private applyCoordinateMapping(
    effectName: "swirl" | "ripple" | "bulge-pinch" | "chromatic-aberration",
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    params: EffectParams
  ): void {
    const source = new Uint8ClampedArray(pixels);
    const cx = (params.centerX ?? 0.5) * width;
    const cy = (params.centerY ?? 0.5) * height;
    const radius = Math.max(1, (params.radius ?? 0.4) * Math.min(width, height));
    const strength = params.strength ?? 0.5;
    const freq = params.waveFrequency ?? 0.05;
    const amp = params.amplitude ?? 8;
    const sep = params.separation ?? 2;
    const angle = ((params.angle ?? 0) * Math.PI) / 180;

    const sample = (sx: number, sy: number, channel: number): number => {
      const x = Math.max(0, Math.min(width - 1, Math.round(sx)));
      const y = Math.max(0, Math.min(height - 1, Math.round(sy)));
      return source[(y * width + x) * 4 + channel];
    };

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const dx = x - cx;
        const dy = y - cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        let sx = x;
        let sy = y;

        if (effectName === "swirl" && d < radius) {
          const t = (radius - d) / radius;
          const a = Math.atan2(dy, dx) + t * t * strength * 2.4;
          sx = cx + Math.cos(a) * d;
          sy = cy + Math.sin(a) * d;
        } else if (effectName === "bulge-pinch" && d < radius) {
          const t = d / radius;
          const factor = strength >= 0 ? 1 - strength * t * t : 1 + Math.abs(strength) * t * t;
          sx = cx + dx * factor;
          sy = cy + dy * factor;
        } else if (effectName === "ripple") {
          const wave = Math.sin(d * freq) * amp;
          sx = x + (d === 0 ? 0 : (dx / d) * wave);
          sy = y + (d === 0 ? 0 : (dy / d) * wave);
        }

        const i = (y * width + x) * 4;
        if (effectName === "chromatic-aberration") {
          const ox = Math.cos(angle) * sep;
          const oy = Math.sin(angle) * sep;
          pixels[i] = sample(sx + ox, sy + oy, 0);
          pixels[i + 1] = sample(sx, sy, 1);
          pixels[i + 2] = sample(sx - ox, sy - oy, 2);
        } else {
          pixels[i] = sample(sx, sy, 0);
          pixels[i + 1] = sample(sx, sy, 1);
          pixels[i + 2] = sample(sx, sy, 2);
        }
      }
    }
  }

  private applyPosterization(pixels: Uint8ClampedArray, params: EffectParams): void {
    const steps = Math.max(2, Math.min(256, Math.round(params.colorSteps ?? 8)));
    const scale = 255 / (steps - 1);
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = Math.round(pixels[i] / scale) * scale;
      pixels[i + 1] = Math.round(pixels[i + 1] / scale) * scale;
      pixels[i + 2] = Math.round(pixels[i + 2] / scale) * scale;
    }
  }

  private applyAlphaMask(pixels: Uint8ClampedArray, params: EffectParams): void {
    const invert = Boolean(params.invert);
    for (let i = 0; i < pixels.length; i += 4) {
      const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
      pixels[i + 3] = invert ? brightness : 255 - brightness;
    }
  }

  private applyFxaaLite(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    params: EffectParams
  ): void {
    const smoothness = Math.max(0, Math.min(1, params.smoothness ?? 0.35));
    const source = new Uint8ClampedArray(pixels);
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const i = (y * width + x) * 4;
        for (let c = 0; c < 3; c += 1) {
          const a = source[((y - 1) * width + x) * 4 + c];
          const b = source[((y + 1) * width + x) * 4 + c];
          const d = source[(y * width + (x - 1)) * 4 + c];
          const e = source[(y * width + (x + 1)) * 4 + c];
          const avg = (a + b + d + e) / 4;
          pixels[i + c] = clamp(source[i + c] * (1 - smoothness) + avg * smoothness);
        }
      }
    }
  }
}
