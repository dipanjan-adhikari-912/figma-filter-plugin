"use strict";

const FILTER_CATEGORIES = [
  "Color & Tone",
  "Noise & Distort",
  "Sharpen",
  "Blur",
  "Water",
  "Stylize",
  "Retro",
  "Geometry",
  "Utility"
];

const FILTER_CATALOG = [
  { id: "metaball-gradient-mesh", name: "Metaball Gradient Mesh", category: "Color & Tone", description: "Organic gradient blobs and mesh blend.", premium: true },
  { id: "brightness-contrast", name: "Brightness Contrast", category: "Color & Tone", description: "Adjust brightness and contrast levels." },
  { id: "hue-saturation", name: "Hue Saturation", category: "Color & Tone", description: "Shift hue and saturation intensity." },
  { id: "curves", name: "Curves", category: "Color & Tone", description: "Tone curve adjustments for RGB channels." },
  { id: "curves-hsl", name: "Curves HSL", category: "Color & Tone", description: "Curve adjustments in HSL domain." },
  { id: "chromatic-aberration", name: "Chromatic Aberration", category: "Color & Tone", description: "RGB channel fringing effect.", premium: true },
  { id: "gradient-map", name: "Gradient Map", category: "Color & Tone", description: "Map luminance to gradient colors.", premium: true },
  { id: "lavels", name: "Lavels", category: "Color & Tone", description: "Input and output tonal levels.", premium: true },
  { id: "gamma", name: "Gamma", category: "Color & Tone", description: "Midtone gamma correction." },
  { id: "soft-contrast", name: "Soft Contrast", category: "Color & Tone", description: "Gentle contrast curve shaping." },
  { id: "sepia", name: "Sepia", category: "Color & Tone", description: "Warm vintage sepia grading." },
  { id: "vibrance", name: "Vibrance", category: "Color & Tone", description: "Boost muted colors selectively." },
  { id: "grayscale", name: "Grayscale", category: "Color & Tone", description: "Convert image to grayscale." },
  { id: "mono", name: "Mono", category: "Color & Tone", description: "Monochrome tonal treatment." },
  { id: "noise-rgb", name: "Noise RGB", category: "Noise & Distort", description: "RGB channel grain noise." },
  { id: "noise-hsl", name: "Noise HSL", category: "Noise & Distort", description: "Noise in HSL color space." },
  { id: "simplex-noise", name: "Simplex Noise", category: "Noise & Distort", description: "Procedural simplex grain field." },
  { id: "noise-displace", name: "Noise Displace", category: "Noise & Distort", description: "Displacement from noise map." },
  { id: "fluid-destruction", name: "Fluid Destruction", category: "Noise & Distort", description: "Chaotic liquid-like distortion." },
  { id: "ripple", name: "Ripple", category: "Noise & Distort", description: "Circular wave ripple distortion." },
  { id: "sharpen", name: "Sharpen", category: "Sharpen", description: "General edge sharpening." },
  { id: "sharpen-luminance", name: "Sharpen Luminance", category: "Sharpen", description: "Sharpen luminance channel only." },
  { id: "unsharp-mask", name: "Unsharp Mask", category: "Sharpen", description: "Classic unsharp mask sharpening." },
  { id: "gaussian-blur", name: "Gaussian Blur", category: "Blur", description: "Standard gaussian blur." },
  { id: "lens-blur", name: "Lens Blur", category: "Blur", description: "Lens-like depth blur." },
  { id: "triangle-blur", name: "Triangle Blur", category: "Blur", description: "Triangle-kernel blur smoothing." },
  { id: "tilt-shift", name: "Tilt Shift", category: "Blur", description: "Miniature style directional blur." },
  { id: "zoom-blur", name: "Zoom Blur", category: "Blur", description: "Radial zoom streak blur." },
  { id: "denoise", name: "Denoise", category: "Blur", description: "Reduce image noise." },
  { id: "droplets-on-water", name: "Droplets on water", category: "Water", description: "Water droplet refraction effect.", premium: true },
  { id: "ripple-propagation", name: "Ripple Propagation", category: "Water", description: "Animated-like ripple propagation.", premium: true },
  { id: "ink", name: "Ink", category: "Stylize", description: "Ink-style drawing treatment." },
  { id: "cartoon", name: "Cartoon", category: "Stylize", description: "Cartoon edge and color quantization." },
  { id: "posterization", name: "Posterization", category: "Stylize", description: "Reduce tonal color bands.", premium: true },
  { id: "flat-chromatic-aberration", name: "Flat Chromatic Aberration", category: "Stylize", description: "Flat RGB split stylization.", premium: true },
  { id: "emboss", name: "Emboss", category: "Stylize", description: "Embossed relief shading." },
  { id: "crosshatch", name: "Crosshatch", category: "Stylize", description: "Crosshatch sketch lines." },
  { id: "night", name: "Night", category: "Stylize", description: "Cool low-light grading." },
  { id: "bleach", name: "Bleach", category: "Stylize", description: "Bleach bypass inspired look." },
  { id: "neon", name: "Neon", category: "Stylize", description: "Neon glow edge treatment." },
  { id: "lsd", name: "Lsd", category: "Stylize", description: "Psychedelic color treatment." },
  { id: "edge-work", name: "Edge Work", category: "Stylize", description: "Edge extraction and enhancement." },
  { id: "blackwhite", name: "BlackWhite", category: "Stylize", description: "High-contrast black and white." },
  { id: "outline", name: "Outline", category: "Stylize", description: "Outline edge drawing effect." },
  { id: "symbols", name: "Symbols", category: "Stylize", description: "Symbolic stylization effect." },
  { id: "euphoria", name: "Euphoria", category: "Stylize", description: "Dreamy vibrant glow aesthetic.", premium: true },
  { id: "light-rays", name: "Light Rays", category: "Stylize", description: "Directional volumetric rays." },
  { id: "lomo", name: "Lomo", category: "Retro", description: "Lomo camera-inspired style." },
  { id: "night-vision", name: "Night Vision", category: "Retro", description: "Green night-vision look." },
  { id: "vignette", name: "Vignette", category: "Retro", description: "Edge darkening vignette." },
  { id: "color-halftone", name: "Color Halftone", category: "Retro", description: "CMYK halftone dot treatment." },
  { id: "dot-screen", name: "Dot Screen", category: "Retro", description: "Monochrome dot-screen pattern." },
  { id: "invert-color", name: "Invert Color", category: "Retro", description: "Invert RGB channels." },
  { id: "bulge-pinch", name: "Bulge / Pinch", category: "Geometry", description: "Radial bulge and pinch warping." },
  { id: "swirl", name: "Swirl", category: "Geometry", description: "Twist image around center point." },
  { id: "tunnel", name: "Tunnel", category: "Geometry", description: "Tunnel-like radial warp." },
  { id: "perspective", name: "Perspective", category: "Geometry", description: "Perspective distortion transform." },
  { id: "hexagonal-pixelate", name: "Hexagonal Pixelate", category: "Geometry", description: "Hexagonal pixelation blocks." },
  { id: "quadrangular-pixelate", name: "Quadrangular Pixelate", category: "Geometry", description: "Square pixelation blocks." },
  { id: "alpha", name: "Alpha", category: "Utility", description: "Transparency by brightness (darker = more transparent)." },
  { id: "fxaa-antialiasing", name: "FXAA Antialiasing", category: "Utility", description: "Lightweight edge anti-aliasing." }
];

function hasImageFill(node) {
  if (!("fills" in node)) return false;
  const fills = node.fills;
  if (!Array.isArray(fills)) return false;
  return fills.some((fill) => fill.type === "IMAGE");
}

function getSelectedImage() {
  const selectedNode = figma.currentPage.selection[0];
  if (!selectedNode) {
    return { state: "none", reason: "Select a single node with an image fill." };
  }
  if (!hasImageFill(selectedNode)) {
    return {
      state: "unsupported",
      nodeId: selectedNode.id,
      nodeName: selectedNode.name,
      reason: "Selected node does not contain an image fill."
    };
  }
  return {
    state: "ready",
    nodeId: selectedNode.id,
    nodeName: selectedNode.name,
    width: "width" in selectedNode ? selectedNode.width : undefined,
    height: "height" in selectedNode ? selectedNode.height : undefined
  };
}

function postToUi(message) {
  figma.ui.postMessage(message);
}

function postError(message) {
  postToUi({ type: "ERROR", payload: { message } });
}

function publishSelectionStatus() {
  postToUi({ type: "SELECTION_STATUS", payload: getSelectedImage() });
}

function publishFilterCatalog() {
  postToUi({
    type: "FILTER_CATALOG",
    payload: {
      categories: FILTER_CATEGORIES.slice(),
      filters: FILTER_CATALOG
    }
  });
}

async function publishSelectionPreview() {
  const selected = getSelectedImageNodeAndPaint();
  if (!selected || !selected.paint.imageHash) return;
  const sourceImage = figma.getImageByHash(selected.paint.imageHash);
  const sourceBytes = await sourceImage.getBytesAsync();
  postToUi({ type: "SELECTION_PREVIEW", payload: { imageBytes: sourceBytes } });
}

async function applyResultToSelection(selected, processedBytes, saveAsNewImage) {
  const outputImage = figma.createImage(new Uint8Array(processedBytes));
  if (saveAsNewImage) {
    if (!("width" in selected.node) || !("height" in selected.node) || !("x" in selected.node) || !("y" in selected.node)) {
      throw new Error("Selected node cannot be used for creating a new image layer.");
    }
    const rect = figma.createRectangle();
    rect.resize(Math.max(1, selected.node.width), Math.max(1, selected.node.height));
    rect.x = selected.node.x + selected.node.width + 24;
    rect.y = selected.node.y;
    rect.name = selected.node.name + " (Filtered)";
    rect.fills = [{ type: "IMAGE", scaleMode: "FILL", imageHash: outputImage.hash }];
    figma.currentPage.appendChild(rect);
    return;
  }
  const fills = selected.node.fills;
  if (!Array.isArray(fills)) throw new Error("Selected node fills are not editable.");
  const updatedFills = fills.slice();
  const target = updatedFills[selected.paintIndex];
  if (target.type !== "IMAGE") throw new Error("Image fill changed while processing. Try again.");
  updatedFills[selected.paintIndex] = Object.assign({}, target, { imageHash: outputImage.hash });
  selected.node.fills = updatedFills;
}

figma.showUI(__html__, { width: 980, height: 640 });

const pendingProcessing = new Map();

function createRequestId() {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function getSelectedImageNodeAndPaint() {
  const selectedNode = figma.currentPage.selection[0];
  if (!selectedNode || !("fills" in selectedNode)) return null;
  const fills = selectedNode.fills;
  if (!Array.isArray(fills)) return null;
  const paintIndex = fills.findIndex((fill) => fill.type === "IMAGE");
  if (paintIndex < 0) return null;
  const paint = fills[paintIndex];
  if (paint.type !== "IMAGE") return null;
  return { node: selectedNode, paintIndex, paint };
}

async function requestUiProcessing(filterId, imageBytes) {
  const requestId = createRequestId();
  const responsePromise = new Promise((resolve, reject) => {
    pendingProcessing.set(requestId, { resolve, reject });
  });

  postToUi({
    type: "PROCESS_IMAGE",
    payload: {
      requestId,
      filterId,
      imageBytes
    }
  });

  const timeout = setTimeout(() => {
    const pending = pendingProcessing.get(requestId);
    if (!pending) return;
    pendingProcessing.delete(requestId);
    pending.reject(new Error("Timed out waiting for UI processing."));
  }, 20000);

  try {
    return await responsePromise;
  } finally {
    clearTimeout(timeout);
  }
}

figma.ui.onmessage = async (message) => {
  try {
    switch (message.type) {
      case "GET_SELECTION":
        publishSelectionStatus();
        await publishSelectionPreview();
        return;
      case "LIST_FILTERS":
        publishFilterCatalog();
        return;
      case "APPLY_FILTER_PLACEHOLDER": {
        const selection = getSelectedImage();
        const selected = getSelectedImageNodeAndPaint();
        if (selection.state !== "ready" || !selection.nodeId || !selected || !selected.paint.imageHash) {
          postError(selection.reason || "Please select an image node first.");
          publishSelectionStatus();
          return;
        }
        const sourceImage = figma.getImageByHash(selected.paint.imageHash);
        const sourceBytes = await sourceImage.getBytesAsync();
        const processedBytes = await requestUiProcessing(message.payload.filterId, sourceBytes);
        await applyResultToSelection(selected, processedBytes, !!message.payload.saveAsNewImage);
        postToUi({
          type: "PROCESSING_ACK",
          payload: {
            filterId: message.payload.filterId,
            status: "applied",
            message: "Filter applied to selected image."
          }
        });
        return;
      }
      case "APPLY_FILTER_STACK": {
        const selection = getSelectedImage();
        const selected = getSelectedImageNodeAndPaint();
        if (selection.state !== "ready" || !selection.nodeId || !selected || !selected.paint.imageHash) {
          postError(selection.reason || "Please select an image node first.");
          publishSelectionStatus();
          return;
        }
        const stack = message.payload.filterIds.slice(0, 3);
        if (stack.length === 0) {
          postError("Pick at least one effect before applying.");
          return;
        }
        const sourceImage = figma.getImageByHash(selected.paint.imageHash);
        let currentBytes = Array.from(await sourceImage.getBytesAsync());
        for (let i = 0; i < stack.length; i += 1) {
          currentBytes = await requestUiProcessing(stack[i], new Uint8Array(currentBytes));
        }
        await applyResultToSelection(selected, currentBytes, !!message.payload.saveAsNewImage);
        postToUi({
          type: "PROCESSING_ACK",
          payload: {
            filterId: stack[stack.length - 1],
            status: "applied",
            message: "Applied " + stack.length + " effect" + (stack.length > 1 ? "s." : ".")
          }
        });
        await publishSelectionPreview();
        return;
      }
      case "PROCESSING_RESULT": {
        const pending = pendingProcessing.get(message.payload.requestId);
        if (!pending) return;
        pendingProcessing.delete(message.payload.requestId);
        if (!message.payload.success || !message.payload.imageBytes) {
          pending.reject(new Error(message.payload.error || "UI processing failed."));
        } else {
          pending.resolve(
            Array.isArray(message.payload.imageBytes)
              ? message.payload.imageBytes
              : Array.from(message.payload.imageBytes)
          );
        }
        return;
      }
      case "CLOSE_PLUGIN":
        figma.closePlugin();
        return;
      case "SET_RELUNCH_ON_SELECTION": {
        const selection = figma.currentPage.selection;
        if (selection.length === 0) {
          postError("Select at least one node to add quick launch.");
          return;
        }
        selection.forEach((node) => {
          node.setRelaunchData({ modernFilters: "Open Modern Image Filters" });
        });
        postToUi({
          type: "PROCESSING_ACK",
          payload: {
            filterId: "tactile-grain",
            status: "accepted",
            message: "Quick launch added to selected layer(s)."
          }
        });
        return;
      }
      default:
        return;
    }
  } catch (error) {
    postError(error instanceof Error ? error.message : "Unexpected bridge error");
  }
};

figma.on("selectionchange", () => {
  publishSelectionStatus();
  publishSelectionPreview();
});

publishFilterCatalog();
publishSelectionStatus();
publishSelectionPreview();
