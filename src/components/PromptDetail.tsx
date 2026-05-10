"use client";

import { useEffect } from "react";
import type { Prompt } from "@/types/prompt";
import { formatDateTime } from "@/lib/promptUtils";
import { getCategoryClass } from "./CategoryFilter";

interface PromptDetailProps {
  prompt: Prompt;
  onClose: () => void;
  onCopy: (p: Prompt) => void;
  onEdit: (p: Prompt) => void;
}

export default function PromptDetail({
  prompt,
  onClose,
  onCopy,
  onEdit,
}: PromptDetailProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="プロンプト詳細"
    >
      <div
        className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-pop max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 px-5 py-4 border-b border-ink-100">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryClass(
                  prompt.category
                )}`}
              >
                {prompt.category}
              </span>
              {prompt.pinned && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 border border-accent-100">
                  📌 固定
                </span>
              )}
              {prompt.favorite && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                  ♥ お気に入り
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-ink-900 leading-snug">
              {prompt.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-400 hover:text-ink-700 p-1"
            aria-label="閉じる"
          >
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className="px-5 py-4 overflow-y-auto flex-1 space-y-4">
          {prompt.description && (
            <section>
              <h3 className="text-xs font-semibold text-ink-500 mb-1 tracking-wider">
                説明
              </h3>
              <p className="text-sm text-ink-700 whitespace-pre-wrap">
                {prompt.description}
              </p>
            </section>
          )}

          {prompt.tags.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-ink-500 mb-1.5 tracking-wider">
                タグ
              </h3>
              <div className="flex flex-wrap gap-1">
                {prompt.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 rounded-full bg-ink-100 text-ink-600"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-xs font-semibold text-ink-500 mb-1.5 tracking-wider">
              プロンプト本文
            </h3>
            <pre className="prompt-body text-sm bg-ink-50 rounded-xl border border-ink-100 p-4 text-ink-800 leading-relaxed">
              {prompt.prompt}
            </pre>
          </section>

          <section className="grid grid-cols-2 gap-3 text-xs text-ink-500 pt-2 border-t border-ink-100">
            <div>
              <div className="text-ink-400">使用回数</div>
              <div className="text-ink-800 font-semibold tabular-nums">
                {prompt.usageCount} 回
              </div>
            </div>
            <div>
              <div className="text-ink-400">最終使用</div>
              <div className="text-ink-800 font-semibold">
                {formatDateTime(prompt.lastUsedAt)}
              </div>
            </div>
            <div>
              <div className="text-ink-400">作成</div>
              <div className="text-ink-800">
                {formatDateTime(prompt.createdAt)}
              </div>
            </div>
            <div>
              <div className="text-ink-400">更新</div>
              <div className="text-ink-800">
                {formatDateTime(prompt.updatedAt)}
              </div>
            </div>
          </section>
        </div>

        <footer className="px-5 py-3 border-t border-ink-100 flex items-center gap-2 bg-white sticky bottom-0">
          <button
            type="button"
            onClick={() => onCopy(prompt)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-accent-500 text-white text-sm font-semibold hover:bg-accent-600 active:scale-[0.99] transition"
          >
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden>
              <rect
                x="6"
                y="6"
                width="10"
                height="10"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M4 14V5a1 1 0 011-1h9"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            プロンプトをコピー
          </button>
          <button
            type="button"
            onClick={() => onEdit(prompt)}
            className="px-4 py-2.5 rounded-lg border border-ink-200 text-sm text-ink-700 hover:bg-ink-100"
          >
            編集
          </button>
        </footer>
      </div>
    </div>
  );
}
