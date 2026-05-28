import { useEffect, useState } from 'react';

// Returns a debounced copy of `value` that only updates after `delay` ms of
// no changes. Used to throttle search filtering (and would-be search APIs).
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
