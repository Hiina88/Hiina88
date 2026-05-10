"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Category, NewPromptInput, Prompt } from "@/types/prompt";
import { ensureSeeded, savePrompts } from "@/lib/storage";
import {
  collectTags,
  copyToClipboard,
  countByCategory,
  filterPrompts,
  generateId,
  getRecentPrompts,
  sortPrompts,
} from "@/lib/promptUtils";

import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import TagFilter from "@/components/TagFilter";
import PromptList from "@/components/PromptList";
import PromptDetail from "@/components/PromptDetail";
import PromptEditor from "@/components/PromptEditor";
import RecentPrompts from "@/components/RecentPrompts";
import Toast from "@/components/Toast";

export default function HomePage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // 検索・絞り込み
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // モーダル
  const [detail, setDetail] = useState<Prompt | null>(null);
  const [editing, setEditing] = useState<Prompt | null | undefined>(undefined);
  // editing: undefined = 閉じている / null = 新規 / Prompt = 編集中

  // トースト
  const [toast, setToast] = useState<string | null>(null);

  // サイドバー(モバイル)
  const [sideOpen, setSideOpen] = useState(false);

  // 初期化: LocalStorage から読み込み(なければシード)
  useEffect(() => {
    const initial = ensureSeeded();
    setPrompts(initial);
    setHydrated(true);
  }, []);

  // 永続化(初期ロード前は走らせない)
  useEffect(() => {
    if (!hydrated) return;
    savePrompts(prompts);
  }, [prompts, hydrated]);

  // 派生データ
  const counts = useMemo(() => countByCategory(prompts), [prompts]);
  const allTags = useMemo(() => collectTags(prompts), [prompts]);

  const filtered = useMemo(
    () =>
      sortPrompts(
        filterPrompts(prompts, {
          query,
          category,
          tags: selectedTags,
          favoritesOnly,
        })
      ),
    [prompts, query, category, selectedTags, favoritesOnly]
  );

  const recent = useMemo(() => getRecentPrompts(prompts, 6), [prompts]);

  // ハンドラ
  const handleCopy = useCallback(async (p: Prompt) => {
    const ok = await copyToClipboard(p.prompt);
    if (!ok) {
      setToast("コピーに失敗しました");
      return;
    }
    const now = new Date().toISOString();
    setPrompts((prev) =>
      prev.map((x) =>
        x.id === p.id
          ? { ...x, usageCount: x.usageCount + 1, lastUsedAt: now }
          : x
      )
    );
    setToast("コピーしました");
  }, []);

  const handleToggleFavorite = useCallback((p: Prompt) => {
    setPrompts((prev) =>
      prev.map((x) =>
        x.id === p.id
          ? {
              ...x,
              favorite: !x.favorite,
              updatedAt: new Date().toISOString(),
            }
          : x
      )
    );
  }, []);

  const handleTogglePin = useCallback((p: Prompt) => {
    setPrompts((prev) =>
      prev.map((x) =>
        x.id === p.id
          ? { ...x, pinned: !x.pinned, updatedAt: new Date().toISOString() }
          : x
      )
    );
  }, []);

  const handleDelete = useCallback((p: Prompt) => {
    if (
      !window.confirm(
        `「${p.title}」を削除しますか?\nこの操作は元に戻せません。`
      )
    )
      return;
    setPrompts((prev) => prev.filter((x) => x.id !== p.id));
    setDetail((cur) => (cur && cur.id === p.id ? null : cur));
    setToast("削除しました");
  }, []);

  const handleSave = useCallback(
    (input: NewPromptInput, id: string | null) => {
      const now = new Date().toISOString();
      if (id) {
        // 更新
        setPrompts((prev) =>
          prev.map((x) =>
            x.id === id
              ? {
                  ...x,
                  ...input,
                  updatedAt: now,
                }
              : x
          )
        );
        setToast("プロンプトを更新しました");
      } else {
        // 新規作成
        const created: Prompt = {
          id: generateId(),
          ...input,
          createdAt: now,
          updatedAt: now,
          lastUsedAt: null,
          usageCount: 0,
        };
        setPrompts((prev) => [created, ...prev]);
        setToast("プロンプトを追加しました");
      }
      setEditing(undefined);
    },
    []
  );

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const clearAllFilters = () => {
    setQuery("");
    setCategory(null);
    setSelectedTags([]);
    setFavoritesOnly(false);
  };

  const hasFilter =
    query !== "" ||
    category !== null ||
    selectedTags.length > 0 ||
    favoritesOnly;

  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダ */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-ink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg hover:bg-ink-100 text-ink-600"
            onClick={() => setSideOpen((v) => !v)}
            aria-label="メニューを開く"
          >
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
              <path
                d="M3 6h14M3 10h14M3 14h14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 text-white flex items-center justify-center font-bold shadow-card">
              PV
            </div>
            <div className="leading-tight min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-ink-900">
                Prompt Vault
              </h1>
              <p className="hidden sm:block text-[11px] text-ink-500">
                AI作業の指示書を、目的別に即コピーできる司令塔。
              </p>
            </div>
          </div>
          <div className="flex-1 hidden md:block max-w-2xl mx-auto">
            <SearchBar
              value={query}
              onChange={setQuery}
              total={prompts.length}
              filtered={filtered.length}
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFavoritesOnly((v) => !v)}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition ${
                favoritesOnly
                  ? "bg-rose-50 text-rose-600 border-rose-200"
                  : "bg-white text-ink-700 border-ink-200 hover:bg-ink-100"
              }`}
              aria-pressed={favoritesOnly}
            >
              <svg
                viewBox="0 0 20 20"
                fill={favoritesOnly ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.6"
                className="w-4 h-4"
              >
                <path d="M10 17s-6-4-6-9a3.5 3.5 0 016-2.5A3.5 3.5 0 0116 8c0 5-6 9-6 9z" />
              </svg>
              お気に入り
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-accent-500 text-white hover:bg-accent-600 transition shadow-card"
            >
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                <path
                  d="M10 4v12M4 10h12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="hidden sm:inline">新規追加</span>
              <span className="sm:hidden">追加</span>
            </button>
          </div>
        </div>
        {/* モバイル用検索バー */}
        <div className="md:hidden max-w-7xl mx-auto px-4 pb-3">
          <SearchBar
            value={query}
            onChange={setQuery}
            total={prompts.length}
            filtered={filtered.length}
          />
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 grid lg:grid-cols-[260px_1fr] gap-5">
        {/* サイドバー */}
        <aside
          className={`${
            sideOpen ? "block" : "hidden"
          } lg:block bg-white rounded-2xl border border-ink-200 shadow-card p-4 lg:sticky lg:top-[84px] lg:self-start lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto`}
        >
          <div className="flex items-center justify-between mb-3 lg:hidden">
            <span className="text-sm font-semibold text-ink-700">フィルタ</span>
            <button
              type="button"
              onClick={() => setSideOpen(false)}
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
          </div>

          <button
            type="button"
            onClick={() => setFavoritesOnly((v) => !v)}
            className={`sm:hidden w-full mb-3 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition ${
              favoritesOnly
                ? "bg-rose-50 text-rose-600 border-rose-200"
                : "bg-white text-ink-700 border-ink-200 hover:bg-ink-100"
            }`}
          >
            ♥ お気に入りのみ表示
          </button>

          <CategoryFilter
            selected={category}
            counts={counts}
            total={prompts.length}
            onChange={(c) => {
              setCategory(c);
              setSideOpen(false);
            }}
          />
          <div className="my-4 border-t border-ink-100" />
          <TagFilter
            allTags={allTags}
            selected={selectedTags}
            onToggle={toggleTag}
            onClear={() => setSelectedTags([])}
          />

          {hasFilter && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-4 w-full px-3 py-2 text-xs rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-100"
            >
              すべての条件をクリア
            </button>
          )}
        </aside>

        {/* メインエリア */}
        <main className="flex flex-col gap-5 min-w-0">
          {/* 最近使った */}
          {recent.length > 0 && (
            <RecentPrompts
              prompts={recent}
              onCopy={handleCopy}
              onOpen={(p) => setDetail(p)}
            />
          )}

          {/* 件数表示 */}
          <div className="flex items-center justify-between gap-2 px-1">
            <p className="text-sm text-ink-600">
              {filtered.length === prompts.length ? (
                <>
                  全 <span className="font-semibold">{prompts.length}</span> 件
                </>
              ) : (
                <>
                  <span className="font-semibold">{filtered.length}</span> 件 /
                  全 {prompts.length} 件
                </>
              )}
              {category && (
                <span className="ml-2 text-xs text-ink-500">
                  カテゴリー: {category}
                </span>
              )}
            </p>
            {hasFilter && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-accent-600 hover:underline"
              >
                条件をクリア
              </button>
            )}
          </div>

          {/* 一覧 */}
          {hydrated ? (
            <PromptList
              prompts={filtered}
              onCopy={handleCopy}
              onOpen={(p) => setDetail(p)}
              onEdit={(p) => setEditing(p)}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
              onTogglePin={handleTogglePin}
              onCreateNew={() => setEditing(null)}
            />
          ) : (
            <div className="text-sm text-ink-400 px-1 py-12 text-center">
              読み込み中…
            </div>
          )}
        </main>
      </div>

      <footer className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 text-xs text-ink-400">
        Prompt Vault — データはこのブラウザの LocalStorage に保存されます。
      </footer>

      {/* モーダル類 */}
      {detail && (
        <PromptDetail
          prompt={detail}
          onClose={() => setDetail(null)}
          onCopy={handleCopy}
          onEdit={(p) => {
            setDetail(null);
            setEditing(p);
          }}
        />
      )}
      {editing !== undefined && (
        <PromptEditor
          initial={editing}
          onClose={() => setEditing(undefined)}
          onSave={handleSave}
        />
      )}

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
