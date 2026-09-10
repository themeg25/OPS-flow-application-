export function SkeletonLine({ className = '' }) {
  return <div className={`skeleton rounded-md ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-ink-200/70 rounded-xl2 p-4 space-y-3">
      <SkeletonLine className="h-3 w-1/3" />
      <SkeletonLine className="h-6 w-1/2" />
      <SkeletonLine className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 border-b border-ink-200/60">
      <SkeletonLine className="h-3.5 w-20" />
      <SkeletonLine className="h-3.5 w-28" />
      <SkeletonLine className="h-3.5 w-24" />
      <SkeletonLine className="h-3.5 flex-1" />
      <SkeletonLine className="h-5 w-20 rounded-full" />
    </div>
  );
}
