// SkeletonLoader.jsx — Skeleton loaders for NEW components only.
// Matches the existing editorial design system (dark/light aware).

/**
 * Generic row-list skeleton (e.g. timing board, standings list)
 */
const SkeletonLoader = ({ rows = 6, className = '' }) => (
  <div className={`space-y-3 animate-pulse ${className}`} aria-busy="true" aria-label="Loading">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-200 dark:border-white/10">
        <div className="w-6 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        </div>
        <div className="h-4 w-14 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    ))}
  </div>
);

/**
 * Solid card placeholder (e.g. driver cards, team cards)
 */
export const CardSkeleton = ({ height = 'h-52', className = '' }) => (
  <div
    className={`${height} ${className} bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl`}
    aria-busy="true"
  />
);

/**
 * Horizontal bar skeleton (e.g. tire strategy timeline)
 */
export const TimelineSkeleton = ({ rows = 8, className = '' }) => (
  <div className={`space-y-3 animate-pulse ${className}`} aria-busy="true">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <div className="w-12 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="flex-1 h-6 bg-slate-200 dark:bg-slate-800 rounded" style={{ opacity: 1 - i * 0.08 }} />
      </div>
    ))}
  </div>
);

/**
 * Stat card skeleton
 */
export const StatCardSkeleton = ({ className = '' }) => (
  <div className={`p-5 border border-slate-200 dark:border-slate-800 space-y-3 animate-pulse ${className}`}>
    <div className="h-2 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
    <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
    <div className="h-2 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
  </div>
);

export default SkeletonLoader;
