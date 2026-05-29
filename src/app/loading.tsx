export default function Loading() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC]"
      role="status"
      aria-label="Loading"
    >
      <span className="h-9 w-9 rounded-full border-[3px] border-slate-200 border-t-emerald-500 animate-spin" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
