'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

// Full-screen spinner shown while the session bootstrap is still running.
function AuthLoading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
      <span className="h-9 w-9 rounded-full border-[3px] border-slate-200 border-t-emerald-500 animate-spin" />
    </div>
  );
}

// Gate for auth pages (login / verify-otp): if a valid session already exists,
// send the user straight to the dashboard instead of showing the login flow.
export default function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useAppSelector((state) => state.auth.status);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  if (status === 'pending' || status === 'authenticated') {
    return <AuthLoading />;
  }
  return <>{children}</>;
}
