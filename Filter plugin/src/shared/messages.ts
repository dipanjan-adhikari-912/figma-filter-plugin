import type { FilterCategory, FilterDescriptor, FilterId } from "./filterTypes";

export type SelectionState = "none" | "unsupported" | "ready";

export interface SelectionInfo {
  state: SelectionState;
  nodeId?: string;
  nodeName?: string;
  width?: number;
  height?: number;
  reason?: string;
}

export type UiToMainMessage =
  | { type: "GET_SELECTION" }
  | { type: "LIST_FILTERS" }
  | {
      type: "APPLY_FILTER_PLACEHOLDER";
      payload: { filterId: FilterId; saveAsNewImage?: boolean };
    }
  | {
      type: "APPLY_FILTER_STACK";
      payload: { filterIds: FilterId[]; saveAsNewImage: boolean };
    }
  | { type: "SET_RELUNCH_ON_SELECTION" }
  | {
      type: "PROCESSING_RESULT";
      payload: {
        requestId: string;
        filterId: FilterId;
        success: boolean;
        imageBytes?: number[] | Uint8Array;
        mimeType?: string;
        error?: string;
      };
    }
  | { type: "CLOSE_PLUGIN" };

export type MainToUiMessage =
  | { type: "SELECTION_STATUS"; payload: SelectionInfo }
  | { type: "SELECTION_PREVIEW"; payload: { imageBytes: number[] | Uint8Array } }
  | {
      type: "FILTER_CATALOG";
      payload: {
        categories: FilterCategory[];
        filters: FilterDescriptor[];
      };
    }
  | {
      type: "PROCESS_IMAGE";
      payload: {
        requestId: string;
        filterId: FilterId;
        imageBytes: number[] | Uint8Array;
      };
    }
  | {
      type: "PROCESSING_ACK";
      payload: {
        filterId: FilterId;
        status: "accepted" | "applied" | "failed";
        message: string;
      };
    }
  | { type: "ERROR"; payload: { message: string } };
