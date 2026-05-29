'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    // global-error replaces the root layout, so it must render <html> and <body>.
    <html lang="en">
      <body className="antialiased">
        <main className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFC] px-6 text-center font-sans">
          <h1 className="text-xl font-semibold text-slate-800">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">
            A critical error occurred while loading the application.
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="mt-6 inline-flex items-center justify-center h-11 px-6 rounded-full bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors cursor-pointer"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
