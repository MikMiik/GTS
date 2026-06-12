"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FilterOption {
  id: string | number;
  name: string;
}

interface FilterProps {
  options: FilterOption[];
  paramName: string;
  placeholder?: string;
  className?: string;
}

export default function Filter({
  options,
  paramName,
  placeholder = "Select option",
  className,
}: FilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = searchParams.get(paramName) || "all";

  function handleValueChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete(paramName);
    } else {
      params.set(paramName, value);
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <Select value={selected} onValueChange={handleValueChange}>
      <SelectTrigger
        className={cn(
          "w-full border-border/30 bg-card/95 py-6 backdrop-blur-xs",
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          All {placeholder.replace("Select ", "")}
        </SelectItem>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.name.toString()}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
