import { categoryList } from "@/data/workers";

interface CategoryFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const allCategories = [{ name: "Tous", emoji: "🔥" }, ...categoryList];

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 py-2">
      {allCategories.map((cat) => {
        const isActive = cat.name === "Tous" ? !value : value === cat.name;
        return (
          <button
            key={cat.name}
            onClick={() => onChange(cat.name === "Tous" ? null : cat.name)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
