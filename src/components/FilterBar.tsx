import { Button } from "./ui/Button";

const FILTERS = ["Tất cả", "Sắp tới", "Đang hot", "Khuyến mãi", "Giá tốt"];

/**
 * Minimalist filter bar with pill-shaped buttons using Atomic Button component.
 */
export default function FilterBar() {
  return (
    <div className="flex flex-wrap gap-3 overflow-x-auto py-4 no-scrollbar">
      {FILTERS.map((filter, index) => (
        <Button
          key={filter}
          variant={index === 0 ? "primary" : "soft"}
          size="sm"
          className={`whitespace-nowrap px-6 rounded-full border-2 ${
            index === 0 
              ? "border-primary" 
              : "border-transparent hover:border-secondary hover:text-secondary bg-white/50"
          }`}
        >
          {filter}
        </Button>
      ))}
    </div>
  );
}
