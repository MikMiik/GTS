"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  paramName?: string;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
}

export default function SearchBar({
  paramName = "search",
  placeholder = "Search...",
  className,
  containerClassName,
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get(paramName) || "");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const current = searchParams.get(paramName) || "";
    if (debouncedQuery === current) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) {
      params.set(paramName, debouncedQuery);
    } else {
      params.delete(paramName);
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedQuery, router, pathname, searchParams, paramName]);

  return (
    <div className={cn("relative", containerClassName)}>
      <Search className="absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground/70" />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className={cn(
          "bg-card/95 py-6 pl-12 pr-4 text-base text-foreground backdrop-blur-xs border-border/30",
          className,
        )}
      />
    </div>
  );
}
