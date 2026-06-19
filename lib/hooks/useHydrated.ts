import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

// Returns false during SSR and the first hydration pass, true once mounted on
// the client. Hydration-safe alternative to a `useState`+`useEffect` mount flag
// (no synchronous setState in an effect).
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
