import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFC] px-6 text-center">
      <p className="text-[64px] font-bold leading-none text-emerald-500">404</p>
      <h1 className="mt-4 text-xl font-semibold text-slate-800">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center justify-center h-11 px-6 rounded-full bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
      >
        Back to Dashboard
      </Link>
    </main>
  );
}
