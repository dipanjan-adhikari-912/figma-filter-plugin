import type { FilterId } from "../../shared/filterTypes";
import { filterHandlers } from "./filters";

export function hasFilterHandler(filterId: FilterId): boolean {
  return typeof filterHandlers[filterId] === "function";
}

export async function runFilterById(filterId: FilterId, nodeId: string) {
  const handler = filterHandlers[filterId];
  if (!handler) {
    throw new Error(`Unknown filter id: ${filterId}`);
  }

  return handler(nodeId);
}
