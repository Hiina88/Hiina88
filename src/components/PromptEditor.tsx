"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CATEGORIES,
  type Category,
  type NewPromptInput,
  type Prompt,
} from "@/types/prompt";

interface PromptEditorProps {
  initial: Prompt | null; // null = 新規
  onClose: () => void;
  onSave: (input: NewPromptInput, id: string | null) => void;
}

export default function PromptEditor({
  initial,
  onClose,
  onSave,
}: PromptEditorProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<Category>(
    initial?.category ?? "その他"
  );
  const [tagsText, setTagsText] = useState(
    initial?.tags.join(", ") ?? ""
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [body, setBody] = useState(initial?.prompt ?? "");
  const [favorite, setFavorite] = useState(initial?.favorite ?? false);
  const [pinned, setPinned] = useState(initial?.pinned ?? false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const tags = useMemo(
    () =>
      tagsText
        .split(/[、,]/)
        .map((t) => t.trim())
        .filter(Boolean),
    [tagsText]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("タイトルを入力してください。");
      return;
    }
    if (!body.trim()) {
      setError("プロンプト本文を入力してください。");
      return;
    }
    setError(null);
    onSave(
      {
        title: title.trim(),
        category,
        tags,
        description: description.trim(),
        prompt: body,
        favorite,
        pinned,
      },
      initial?.id ?? null
    );
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={initial ? "プロンプトを編集" : "新規プロンプトを追加"}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-pop max-h-[92vh] flex flex-col"
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h2 className="text-lg font-bold text-ink-900">
            {initial ? "プロンプトを編集" : "新規プロンプトを追加"}
          </h2>
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
          {/* タイトル */}
          <div>
            <label className="block text-xs font-semibold text-ink-600 mb-1">
              タイトル <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: Codex Cloud バグ修正プロンプト"
              className="w-full px-3 py-2 rounded-lg border border-ink-200 outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-100 transition"
            />
          </div>

          {/* カテゴリー */}
          <div>
            <label className="block text-xs font-semibold text-ink-600 mb-1">
              カテゴリー
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-3 py-2 rounded-lg border border-ink-200 outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-100 bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* タグ */}
          <div>
            <label className="block text-xs font-semibold text-ink-600 mb-1">
              タグ(カンマ区切り)
            </label>
            <input
              type="text"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="例: バグ修正, 実務用"
              className="w-full px-3 py-2 rounded-lg border border-ink-200 outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-100 transition"
            />
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 rounded-full bg-ink-100 text-ink-600"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 説明 */}
          <div>
            <label className="block text-xs font-semibold text-ink-600 mb-1">
              説明
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="何に使うプロンプトか(1 行)"
              className="w-full px-3 py-2 rounded-lg border border-ink-200 outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-100 transition"
            />
          </div>

          {/* 本文 */}
          <div>
            <label className="block text-xs font-semibold text-ink-600 mb-1">
              プロンプト本文 <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              placeholder="ここにプロンプト本文を入力。差し替え箇所は [ ] で書くと分かりやすいです。"
              className="w-full px-3 py-2 rounded-lg border border-ink-200 outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-100 transition font-mono text-sm leading-relaxed"
            />
          </div>

          {/* オプション */}
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
                className="w-4 h-4 accent-rose-500"
              />
              お気に入り
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="w-4 h-4 accent-accent-500"
              />
              上に固定
            </label>
          </div>

          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <footer className="px-5 py-3 border-t border-ink-100 flex items-center justify-end gap-2 bg-white sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-ink-200 text-sm text-ink-700 hover:bg-ink-100"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-accent-500 text-white text-sm font-semibold hover:bg-accent-600 active:scale-[0.99] transition"
          >
            保存
          </button>
        </footer>
      </form>
    </div>
  );
}
