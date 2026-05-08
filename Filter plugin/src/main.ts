import { FILTER_CATALOG } from "./shared/filterCatalog";
import { FILTER_CATEGORIES } from "./shared/filterTypes";
import type { UiToMainMessage } from "./shared/messages";
import type { FilterId } from "./shared/filterTypes";
import { getSelectedImage } from "./core/selection/getSelectedImage";
import { hasFilterHandler } from "./core/processing/filterRegistry";
import { postError, postToUi } from "./core/bridge/uiBridge";

figma.showUI(__html__, {
  width: 980,
  height: 640
});

const pendingProcessing = new Map<
  string,
  {
    resolve: (value: number[]) => void;
    reject: (reason?: unknown) => void;
    filterId: FilterId;
  }
>();

function createRequestId(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function getSelectedImageNodeAndPaint():
  | { node: SceneNode; paintIndex: number; paint: ImagePaint }
  | null {
  const [selectedNode] = figma.currentPage.selection;
  if (!selectedNode || !("fills" in selectedNode)) {
    return null;
  }
  const fills = selectedNode.fills;
  if (!Array.isArray(fills)) {
    return null;
  }

  const paintIndex = fills.findIndex((fill) => fill.type === "IMAGE");
  if (paintIndex < 0) {
    return null;
  }

  const paint = fills[paintIndex];
  if (paint.type !== "IMAGE") {
    return null;
  }

  return { node: selectedNode, paintIndex, paint };
}

async function requestUiProcessing(filterId: FilterId, imageBytes: Uint8Array): Promise<number[]> {
  const requestId = createRequestId();
  const processedBytesPromise = new Promise<number[]>((resolve, reject) => {
    pendingProcessing.set(requestId, { resolve, reject, filterId });
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
    if (!pending) {
      return;
    }
    pendingProcessing.delete(requestId);
    pending.reject(new Error("Timed out waiting for UI image processing."));
  }, 20000);

  try {
    return await processedBytesPromise;
  } finally {
    clearTimeout(timeout);
  }
}

async function publishSelectionPreview(): Promise<void> {
  const selected = getSelectedImageNodeAndPaint();
  if (!selected?.paint.imageHash) {
    return;
  }
  const sourceImage = figma.getImageByHash(selected.paint.imageHash);
  const sourceBytes = await sourceImage.getBytesAsync();
  postToUi({
    type: "SELECTION_PREVIEW",
    payload: { imageBytes: sourceBytes }
  });
}

function publishSelectionStatus(): void {
  postToUi({
    type: "SELECTION_STATUS",
    payload: getSelectedImage()
  });
}

function publishFilterCatalog(): void {
  postToUi({
    type: "FILTER_CATALOG",
    payload: {
      categories: [...FILTER_CATEGORIES],
      filters: FILTER_CATALOG
    }
  });
}

async function applyResultToSelection(
  selected: { node: SceneNode; paintIndex: number; paint: ImagePaint },
  processedBytes: number[],
  saveAsNewImage: boolean
): Promise<void> {
  const outputImage = figma.createImage(new Uint8Array(processedBytes));

  if (saveAsNewImage) {
    if (!("width" in selected.node) || !("height" in selected.node) || !("x" in selected.node) || !("y" in selected.node)) {
      throw new Error("Selected node cannot be used for creating a new image layer.");
    }
    const rect = figma.createRectangle();
    rect.resize(Math.max(1, selected.node.width), Math.max(1, selected.node.height));
    rect.x = selected.node.x + selected.node.width + 24;
    rect.y = selected.node.y;
    rect.name = `${selected.node.name} (Filtered)`;
    rect.fills = [{ type: "IMAGE", scaleMode: "FILL", imageHash: outputImage.hash }];
    figma.currentPage.appendChild(rect);
    return;
  }

  const fills = selected.node.fills;
  if (!Array.isArray(fills)) {
    throw new Error("Selected node fills are not editable.");
  }
  const updatedFills = fills.slice();
  const targetFill = updatedFills[selected.paintIndex];
  if (targetFill.type !== "IMAGE") {
    throw new Error("Image fill changed while processing. Try again.");
  }
  updatedFills[selected.paintIndex] = {
    ...targetFill,
    imageHash: outputImage.hash
  };
  selected.node.fills = updatedFills;
}

figma.ui.onmessage = async (message: UiToMainMessage) => {
  try {
    switch (message.type) {
      case "GET_SELECTION": {
        publishSelectionStatus();
        await publishSelectionPreview();
        break;
      }
      case "LIST_FILTERS": {
        publishFilterCatalog();
        break;
      }
      case "APPLY_FILTER_PLACEHOLDER": {
        const selection = getSelectedImage();
        const selected = getSelectedImageNodeAndPaint();
        if (selection.state !== "ready" || !selection.nodeId || !selected?.paint.imageHash) {
          postError(selection.reason ?? "Please select an image node first.");
          publishSelectionStatus();
          return;
        }

        const filterId = message.payload.filterId;
        if (!hasFilterHandler(filterId)) {
          postError(`Filter "${filterId}" is not registered.`);
          return;
        }

        const sourceImage = figma.getImageByHash(selected.paint.imageHash);
        const sourceBytes = await sourceImage.getBytesAsync();
        const processedBytes = await requestUiProcessing(filterId, sourceBytes);
        await applyResultToSelection(selected, processedBytes, Boolean(message.payload.saveAsNewImage));

        postToUi({
          type: "PROCESSING_ACK",
          payload: {
            filterId,
            status: "applied",
            message: "Filter applied to selected image."
          }
        });
        break;
      }
      case "APPLY_FILTER_STACK": {
        const selection = getSelectedImage();
        const selected = getSelectedImageNodeAndPaint();
        if (selection.state !== "ready" || !selection.nodeId || !selected?.paint.imageHash) {
          postError(selection.reason ?? "Please select an image node first.");
          publishSelectionStatus();
          return;
        }
        const stack = message.payload.filterIds.slice(0, 3);
        if (stack.length === 0) {
          postError("Pick at least one effect before applying.");
          return;
        }
        stack.forEach((filterId) => {
          if (!hasFilterHandler(filterId)) {
            throw new Error(`Filter "${filterId}" is not registered.`);
          }
        });

        const sourceImage = figma.getImageByHash(selected.paint.imageHash);
        let currentBytes = Array.from(await sourceImage.getBytesAsync());
        for (const filterId of stack) {
          currentBytes = await requestUiProcessing(filterId, new Uint8Array(currentBytes));
        }
        await applyResultToSelection(selected, currentBytes, message.payload.saveAsNewImage);
        postToUi({
          type: "PROCESSING_ACK",
          payload: {
            filterId: stack[stack.length - 1],
            status: "applied",
            message: `Applied ${stack.length} effect${stack.length > 1 ? "s" : ""}.`
          }
        });
        await publishSelectionPreview();
        break;
      }
      case "SET_RELUNCH_ON_SELECTION": {
        const selection = figma.currentPage.selection;
        if (selection.length === 0) {
          postError("Select at least one node to add quick launch.");
          return;
        }
        selection.forEach((node) => {
          node.setRelaunchData({
            modernFilters: "Open Modern Image Filters"
          });
        });
        postToUi({
          type: "PROCESSING_ACK",
          payload: {
            filterId: "tactile-grain",
            status: "accepted",
            message: "Quick launch added to selected layer(s)."
          }
        });
        break;
      }
      case "PROCESSING_RESULT": {
        const pending = pendingProcessing.get(message.payload.requestId);
        if (!pending) {
          break;
        }

        pendingProcessing.delete(message.payload.requestId);
        if (!message.payload.success || !message.payload.imageBytes) {
          pending.reject(new Error(message.payload.error ?? "UI processing failed."));
        } else {
          const bytes = Array.isArray(message.payload.imageBytes)
            ? message.payload.imageBytes
            : Array.from(message.payload.imageBytes);
          pending.resolve(bytes);
        }
        break;
      }
      case "CLOSE_PLUGIN": {
        figma.closePlugin();
        break;
      }
      default: {
        const unknownMessage = message as never;
        void unknownMessage;
      }
    }
  } catch (error) {
    const messageText =
      error instanceof Error ? error.message : "Unexpected bridge error";
    postError(messageText);
  }
};

figma.on("selectionchange", () => {
  publishSelectionStatus();
  void publishSelectionPreview();
});

publishFilterCatalog();
publishSelectionStatus();
void publishSelectionPreview();
