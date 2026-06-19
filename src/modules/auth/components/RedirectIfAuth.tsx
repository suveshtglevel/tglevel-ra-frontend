'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { useHydrated } from '@/lib/hooks/useHydrated';

// Full-screen spinner shown while the session bootstrap is still running.
function AuthLoading() {
  return (
    <div className="min-h-[var(--app-h)] w-full flex items-center justify-center bg-[#F8FAFC]">
      <span className="h-9 w-9 rounded-full border-[3px] border-slate-200 border-t-emerald-500 animate-spin" />
    </div>
  );
}

// Gate for auth pages (login / verify-otp): if a valid session already exists,
// send the user straight to the dashboard instead of showing the login flow.
export default function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useAppSelector((state) => state.auth.status);
  // Render the spinner on the server and the first client render, so the
  // hydrated HTML matches before we branch on client-only auth state. Without
  // this, the login layout could render on the client while the server sent the
  // spinner, causing a hydration mismatch.
  const hydrated = useHydrated();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  if (!hydrated || status === 'pending' || status === 'authenticated') {
    return <AuthLoading />;
  }
  return <>{children}</>;
}
