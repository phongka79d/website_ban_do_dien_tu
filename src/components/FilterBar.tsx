"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "./ui/Button";
import { cn } from "@/utils/cn";

import { SORT_OPTIONS } from "@/utils/productSort";

/**
 * Client-side FilterBar that updates URL search params.
 */
export default function FilterBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const activeValue = searchParams.get("filter") || "all";

  const handleFilterClick = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "all") {
      params.delete("filter");
    } else {
      params.set("filter", value);
    }
    
    // Reset page if filtering
    params.delete("page");
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap gap-3 overflow-x-auto py-4 no-scrollbar">
      {SORT_OPTIONS.map((option) => {
        const isActive = activeValue === option.value;
        return (
          <Button
            key={option.value}
            variant={isActive ? "primary" : "soft"}
            size="sm"
            radius="full"
            onClick={() => handleFilterClick(option.value)}
            className={cn(
              "whitespace-nowrap px-6 border-2",
              isActive ? "border-primary" : "border-transparent"
            )}
          >
            {option.name}
          </Button>
        );
      })}
    </div>
  );
}
