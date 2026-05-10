"use client";

import type { Prompt } from "@/types/prompt";
import { formatDateTime } from "@/lib/promptUtils";
import { getCategoryClass } from "./CategoryFilter";

interface RecentPromptsProps {
  prompts: Prompt[];
  onCopy: (p: Prompt) => void;
  onOpen: (p: Prompt) => void;
}

export default function RecentPrompts({
  prompts,
  onCopy,
  onOpen,
}: RecentPromptsProps) {
  if (prompts.length === 0) return null;

  return (
    <section
      aria-label="最近使ったプロンプト"
      className="bg-white rounded-2xl border border-ink-200 shadow-card p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-ink-800 flex items-center gap-2">
          <span aria-hidden>🕘</span>
          最近使ったプロンプト
        </h2>
        <span className="text-xs text-ink-400">{prompts.length} 件</span>
      </div>
      <ul className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
        {prompts.map((p) => (
          <li key={p.id} className="shrink-0">
            <div className="w-64 rounded-xl border border-ink-200 hover:border-accent-500 transition p-3 flex flex-col gap-2 bg-white">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full border ${getCategoryClass(
                    p.category
                  )}`}
                >
                  {p.category}
                </span>
                <span className="text-[11px] text-ink-400">
                  {formatDateTime(p.lastUsedAt)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onOpen(p)}
                className="text-left text-sm font-semibold text-ink-800 line-clamp-2 hover:text-accent-700"
              >
                {p.title}
              </button>
              <button
                type="button"
                onClick={() => onCopy(p)}
                className="mt-auto text-xs px-2.5 py-1.5 rounded-lg bg-accent-500 text-white font-semibold hover:bg-accent-600 transition"
              >
                ワンクリックコピー
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
