import { useEffect, useState } from 'react';

export function useDebouncedInput(initialValue: string, onDebounce: (value: string) => void, delay = 500) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      onDebounce(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay, onDebounce]);

  return [value, setValue] as const;
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}