import type { FilterId } from "../../shared/filterTypes";
import { EffectProcessor, type EffectParams } from "./effectProcessor";

const MAX_WORKING_PIXELS = 1_000_000;
const effectProcessor = new EffectProcessor();

function normalizeBytes(bytes: number[] | Uint8Array): Uint8Array {
  return bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
}

async function bytesToImageBitmap(bytes: number[] | Uint8Array): Promise<ImageBitmap> {
  const blob = new Blob([normalizeBytes(bytes)], { type: "image/png" });
  return createImageBitmap(blob);
}

function getProcessingSize(width: number, height: number): { width: number; height: number } {
  const pixelCount = width * height;
  if (pixelCount <= MAX_WORKING_PIXELS) {
    return { width, height };
  }
  const scale = Math.sqrt(MAX_WORKING_PIXELS / pixelCount);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale))
  };
}

async function canvasToBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) {
    throw new Error("Failed to serialize processed image.");
  }
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

export async function processImageOnCanvas(
  filterId: FilterId,
  imageBytes: number[] | Uint8Array,
  params: EffectParams = {}
): Promise<Uint8Array> {
  const bitmap = await bytesToImageBitmap(imageBytes);
  const originalWidth = bitmap.width;
  const originalHeight = bitmap.height;
  const workingSize = getProcessingSize(originalWidth, originalHeight);

  const workingCanvas = document.createElement("canvas");
  workingCanvas.width = workingSize.width;
  workingCanvas.height = workingSize.height;

  const context = workingCanvas.getContext("2d", {
    willReadFrequently: true,
    desynchronized: true
  });
  if (!context) {
    throw new Error("2D Canvas context is unavailable in plugin UI.");
  }

  context.drawImage(bitmap, 0, 0, workingCanvas.width, workingCanvas.height);
  const imageData = context.getImageData(0, 0, workingCanvas.width, workingCanvas.height);
  effectProcessor.process(filterId, params, imageData.data, workingCanvas.width, workingCanvas.height);
  context.putImageData(imageData, 0, 0);

  if (workingCanvas.width === originalWidth && workingCanvas.height === originalHeight) {
    return canvasToBytes(workingCanvas);
  }

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = originalWidth;
  outputCanvas.height = originalHeight;
  const outputContext = outputCanvas.getContext("2d", { desynchronized: true });
  if (!outputContext) {
    throw new Error("2D output Canvas context is unavailable in plugin UI.");
  }
  outputContext.imageSmoothingEnabled = true;
  outputContext.imageSmoothingQuality = "high";
  outputContext.drawImage(workingCanvas, 0, 0, originalWidth, originalHeight);

  return canvasToBytes(outputCanvas);
}
