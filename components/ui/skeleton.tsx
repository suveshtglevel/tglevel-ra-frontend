import * as React from 'react';
import { cn } from '@/lib/utils';

// Lightweight shimmer placeholder. Use to reserve a region's space while its
// real content loads, so the layout is stable and the UI reads as "fast".
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-slate-200/70', className)} {...props} />;
}

// Skeleton rows for a data table — render inside a <tbody> while rows load, so
// the table keeps its shape instead of collapsing to a single "Loading…" line.
export function TableRowsSkeleton({ rows = 8, cols }: { rows?: number; cols: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-t border-slate-100">
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c} className="px-4 py-4">
              <Skeleton className="h-3.5" style={{ width: `${60 + ((r + c) % 4) * 10}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
