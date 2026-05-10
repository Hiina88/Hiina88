"use client";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-2xl border border-dashed border-ink-200">
      <div className="w-12 h-12 rounded-full bg-ink-100 flex items-center justify-center text-ink-400 mb-3">
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden>
          <path
            d="M4 7h16M4 12h16M4 17h10"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-ink-800">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-ink-500 max-w-md">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-lg bg-accent-500 text-white text-sm font-semibold hover:bg-accent-600 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
