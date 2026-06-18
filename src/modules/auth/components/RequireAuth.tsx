'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

// Full-screen spinner shown while the session bootstrap is still running.
function AuthLoading() {
  return (
    <div className="min-h-[var(--app-h)] w-full flex items-center justify-center bg-[#F8FAFC]">
      <span className="h-9 w-9 rounded-full border-[3px] border-slate-200 border-t-emerald-500 animate-spin" />
    </div>
  );
}

// Gate for protected routes: waits for the bootstrap, then redirects to login
// if there is no valid session.
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useAppSelector((state) => state.auth.status);
  // Prevent hydration mismatch: returns false on the server and true on the
  // client, so the first client render matches the server HTML (spinner).
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (!mounted || status !== 'authenticated') {
    return <AuthLoading />;
  }
  return <>{children}</>;
}
