"use client";

import { CATEGORIES, type Category } from "@/types/prompt";

interface CategoryFilterProps {
  selected: Category | null;
  counts: Record<string, number>;
  total: number;
  onChange: (cat: Category | null) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Codex Cloud": "bg-violet-100 text-violet-700 border-violet-200",
  Genspark: "bg-sky-100 text-sky-700 border-sky-200",
  Xポスト: "bg-zinc-100 text-zinc-700 border-zinc-200",
  Instagram投稿: "bg-pink-100 text-pink-700 border-pink-200",
  リール台本: "bg-rose-100 text-rose-700 border-rose-200",
  長文記事: "bg-amber-100 text-amber-700 border-amber-200",
  画像生成: "bg-emerald-100 text-emerald-700 border-emerald-200",
  動画生成: "bg-teal-100 text-teal-700 border-teal-200",
  講座作成: "bg-indigo-100 text-indigo-700 border-indigo-200",
  "LP/セールス": "bg-orange-100 text-orange-700 border-orange-200",
  リサーチ: "bg-lime-100 text-lime-700 border-lime-200",
  文章改善: "bg-cyan-100 text-cyan-700 border-cyan-200",
  壁打ち: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  その他: "bg-slate-100 text-slate-700 border-slate-200",
};

export function getCategoryClass(cat: string): string {
  return (
    CATEGORY_COLORS[cat] ?? "bg-ink-100 text-ink-700 border-ink-200"
  );
}

export default function CategoryFilter({
  selected,
  counts,
  total,
  onChange,
}: CategoryFilterProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-ink-500 px-1 mb-2 tracking-wider">
        カテゴリー
      </h3>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
            selected === null
              ? "bg-accent-50 text-accent-700 font-semibold"
              : "text-ink-700 hover:bg-ink-100"
          }`}
        >
          <span>すべて</span>
          <span className="text-xs text-ink-500 tabular-nums">{total}</span>
        </button>
        {CATEGORIES.map((cat) => {
          const count = counts[cat] ?? 0;
          const active = selected === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange(active ? null : cat)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                active
                  ? "bg-accent-50 text-accent-700 font-semibold"
                  : "text-ink-700 hover:bg-ink-100"
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <span
                  className={`w-2 h-2 rounded-full border ${getCategoryClass(
                    cat
                  )}`}
                  aria-hidden
                />
                <span className="truncate">{cat}</span>
              </span>
              <span className="text-xs text-ink-500 tabular-nums shrink-0">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
