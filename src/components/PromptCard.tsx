"use client";

import type { Prompt } from "@/types/prompt";
import { formatDateTime } from "@/lib/promptUtils";
import { getCategoryClass } from "./CategoryFilter";

interface PromptCardProps {
  prompt: Prompt;
  onCopy: (p: Prompt) => void;
  onOpen: (p: Prompt) => void;
  onEdit: (p: Prompt) => void;
  onDelete: (p: Prompt) => void;
  onToggleFavorite: (p: Prompt) => void;
  onTogglePin: (p: Prompt) => void;
}

export default function PromptCard({
  prompt,
  onCopy,
  onOpen,
  onEdit,
  onDelete,
  onToggleFavorite,
  onTogglePin,
}: PromptCardProps) {
  return (
    <article className="group relative bg-white rounded-2xl border border-ink-200 shadow-card hover:shadow-pop transition p-5 flex flex-col gap-3">
      {/* ヘッダ: カテゴリ + 固定/お気に入り */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
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
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onTogglePin(prompt)}
            aria-label={prompt.pinned ? "固定を解除" : "固定する"}
            title={prompt.pinned ? "固定を解除" : "上に固定"}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
              prompt.pinned
                ? "text-accent-600 bg-accent-50"
                : "text-ink-400 hover:text-accent-600 hover:bg-ink-100"
            }`}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10 2l2 4 4 .6-3 3 .8 4.4L10 12l-3.8 2 .8-4.4-3-3 4-.6L10 2z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onToggleFavorite(prompt)}
            aria-label={
              prompt.favorite ? "お気に入りから外す" : "お気に入りに追加"
            }
            title={prompt.favorite ? "お気に入りから外す" : "お気に入り"}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
              prompt.favorite
                ? "text-rose-500 bg-rose-50"
                : "text-ink-400 hover:text-rose-500 hover:bg-ink-100"
            }`}
          >
            <svg
              viewBox="0 0 20 20"
              fill={prompt.favorite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.6"
              className="w-4 h-4"
            >
              <path d="M10 17s-6-4-6-9a3.5 3.5 0 016-2.5A3.5 3.5 0 0116 8c0 5-6 9-6 9z" />
            </svg>
          </button>
        </div>
      </div>

      {/* タイトル */}
      <button
        type="button"
        onClick={() => onOpen(prompt)}
        className="text-left"
      >
        <h3 className="text-base font-bold text-ink-900 leading-snug line-clamp-2 group-hover:text-accent-700 transition">
          {prompt.title}
        </h3>
      </button>

      {/* 説明 */}
      {prompt.description && (
        <p className="text-sm text-ink-600 line-clamp-2">
          {prompt.description}
        </p>
      )}

      {/* 本文プレビュー */}
      <button
        type="button"
        onClick={() => onOpen(prompt)}
        className="text-left bg-ink-50 rounded-lg px-3 py-2 text-xs text-ink-600 line-clamp-3 hover:bg-ink-100 transition prompt-body"
        title="クリックで全文を見る"
      >
        {prompt.prompt}
      </button>

      {/* タグ */}
      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {prompt.tags.slice(0, 6).map((t) => (
            <span
              key={t}
              className="text-[11px] px-2 py-0.5 rounded-full bg-ink-100 text-ink-600"
            >
              #{t}
            </span>
          ))}
          {prompt.tags.length > 6 && (
            <span className="text-[11px] px-2 py-0.5 text-ink-400">
              +{prompt.tags.length - 6}
            </span>
          )}
        </div>
      )}

      {/* メタ情報 */}
      <div className="flex items-center justify-between text-xs text-ink-500 tabular-nums">
        <span>使用 {prompt.usageCount} 回</span>
        <span>{formatDateTime(prompt.lastUsedAt)}</span>
      </div>

      {/* アクション */}
      <div className="flex items-center gap-2 mt-1">
        <button
          type="button"
          onClick={() => onCopy(prompt)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-accent-500 text-white text-sm font-semibold hover:bg-accent-600 active:scale-[0.98] transition shadow-card"
          aria-label="プロンプトをコピー"
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
          コピー
        </button>
        <button
          type="button"
          onClick={() => onOpen(prompt)}
          className="px-3 py-2 rounded-lg border border-ink-200 text-sm text-ink-700 hover:bg-ink-100 transition"
        >
          詳細
        </button>
        <button
          type="button"
          onClick={() => onEdit(prompt)}
          className="px-3 py-2 rounded-lg border border-ink-200 text-sm text-ink-700 hover:bg-ink-100 transition"
          aria-label="編集"
          title="編集"
        >
          <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
            <path
              d="M14 4l2 2-9 9H5v-2l9-9z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onDelete(prompt)}
          className="px-3 py-2 rounded-lg border border-ink-200 text-sm text-ink-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition"
          aria-label="削除"
          title="削除"
        >
          <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
            <path
              d="M5 6h10M8 6V4h4v2M6 6l1 10h6l1-10"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </article>
  );
}
