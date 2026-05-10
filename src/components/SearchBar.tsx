"use client";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  total: number;
  filtered: number;
}

export default function SearchBar({
  value,
  onChange,
  total,
  filtered,
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
          className="w-5 h-5"
        >
          <circle
            cx="9"
            cy="9"
            r="6"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M14 14l3 3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <input
        type="search"
        inputMode="search"
        placeholder="タイトル・タグ・本文を検索(スペース区切りで AND)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-24 py-3 rounded-2xl bg-white border border-ink-200 text-ink-800 placeholder:text-ink-400 outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-100 transition shadow-card"
        aria-label="プロンプト検索"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500 tabular-nums">
        {filtered}/{total}
      </span>
    </div>
  );
}
