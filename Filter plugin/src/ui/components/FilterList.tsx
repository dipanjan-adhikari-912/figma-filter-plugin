import type { FilterDescriptor } from "../../shared/filterTypes";
import type { FilterId } from "../../shared/filterTypes";

interface FilterListProps {
  filters: FilterDescriptor[];
  selectedFilterId: FilterId | null;
  onSelectFilter: (filterId: FilterId) => void;
}

export function FilterList({
  filters,
  selectedFilterId,
  onSelectFilter
}: FilterListProps) {
  if (filters.length === 0) {
    return (
      <div className="rounded-md border border-neutral-800 bg-neutral-900 p-3 text-sm text-neutral-400">
        No filters available for this category.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {filters.map((filter) => {
        const isActive = filter.id === selectedFilterId;
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onSelectFilter(filter.id)}
            className={[
              "rounded-md border p-3 text-left transition",
              isActive
                ? "border-neutral-200 bg-neutral-200 text-neutral-900"
                : "border-neutral-800 bg-neutral-900 text-neutral-100 hover:border-neutral-600"
            ].join(" ")}
          >
            <p className="text-sm font-semibold">{filter.name}</p>
            <p className="mt-1 text-xs opacity-80">{filter.description}</p>
          </button>
        );
      })}
    </div>
  );
}
