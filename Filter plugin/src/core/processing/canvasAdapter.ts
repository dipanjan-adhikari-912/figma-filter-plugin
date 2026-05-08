import type { FilterId } from "../../shared/filterTypes";

export interface ProcessingRequest {
  nodeId: string;
  filterId: FilterId;
}

export interface ProcessingResult {
  filterId: FilterId;
  status: "accepted" | "not_implemented";
  message: string;
}

export async function runCanvasProcessingStub(
  request: ProcessingRequest
): Promise<ProcessingResult> {
  return {
    filterId: request.filterId,
    status: "not_implemented",
    message:
      "Canvas processing bridge is connected. Filter algorithm is intentionally not implemented yet."
  };
}
