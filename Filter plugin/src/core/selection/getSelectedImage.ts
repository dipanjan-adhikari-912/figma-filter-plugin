import type { SelectionInfo } from "../../shared/messages";

function hasImageFill(node: SceneNode): boolean {
  if (!("fills" in node)) {
    return false;
  }

  const fills = node.fills;
  if (!Array.isArray(fills)) {
    return false;
  }

  return fills.some((fill) => fill.type === "IMAGE");
}

export function getSelectedImage(): SelectionInfo {
  const [selectedNode] = figma.currentPage.selection;

  if (!selectedNode) {
    return {
      state: "none",
      reason: "Select a single node with an image fill."
    };
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
