import { runCanvasProcessingStub } from "../canvasAdapter";
import type { FilterId } from "../../../shared/filterTypes";
import { FILTER_CATALOG } from "../../../shared/filterCatalog";

export type FilterHandler = (nodeId: string) => Promise<{
  filterId: FilterId;
  status: "accepted" | "not_implemented";
  message: string;
}>;

function createStubHandler(filterId: FilterId): FilterHandler {
  return async (nodeId: string) =>
    runCanvasProcessingStub({
      nodeId,
      filterId
    });
}

export const filterHandlers: Record<FilterId, FilterHandler> = FILTER_CATALOG.reduce(
  (handlers, filter) => {
    handlers[filter.id] = createStubHandler(filter.id);
    return handlers;
  },
  {} as Record<FilterId, FilterHandler>
);
