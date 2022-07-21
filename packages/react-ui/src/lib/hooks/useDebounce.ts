import { useEffect, useState } from 'react';

export const useDebounce = <T>(value: T, delay: number): T => {
  // State and setters for debounced value
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const update = setTimeout(() => {
      setDebounced(value);
    }, delay);
    return () => {
      clearTimeout(update);
    };
  }, [value, delay]);

  return debounced;
};
