import { useEffect, useState } from "react";

export default function useDebounce<T>(initialValue: T, time: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setDebouncedValue(initialValue);
    }, time);

    return () => {
      clearTimeout(debounce);
    };
  }, [initialValue, time]);

  return debouncedValue;
}
