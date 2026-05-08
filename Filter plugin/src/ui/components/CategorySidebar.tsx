import type { FilterCategory } from "../../shared/filterTypes";

interface CategorySidebarProps {
  categories: FilterCategory[];
  activeCategory: FilterCategory | null;
  onSelect: (category: FilterCategory) => void;
}

export function CategorySidebar({
  categories,
  activeCategory,
  onSelect
}: CategorySidebarProps) {
  return (
    <aside className="w-48 border-r border-neutral-800 bg-neutral-950 p-3">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
        Categories
      </p>
      <div className="flex flex-col gap-2">
        {categories.map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelect(category)}
              className={[
                "rounded-md px-3 py-2 text-left text-sm transition",
                isActive
                  ? "bg-neutral-200 text-neutral-900"
                  : "bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
              ].join(" ")}
            >
              {category}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
