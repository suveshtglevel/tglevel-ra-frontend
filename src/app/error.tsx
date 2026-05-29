'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Surface the error for an error-reporting service (Sentry, etc.).
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFC] px-6 text-center">
      <h1 className="text-xl font-semibold text-slate-800">Something went wrong</h1>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">
        An unexpected error occurred. You can try again, and if the problem persists, contact support.
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-6 inline-flex items-center justify-center h-11 px-6 rounded-full bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors cursor-pointer"
      >
        Try again
      </button>
    </main>
  );
}
