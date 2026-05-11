import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { categories, defaultPrompts } from './prompts';
import { Category, PromptItem, Tab } from './types';
import './styles.css';

const STORAGE_KEY = 'ai-prompt-atelier-prompts-v1';
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'ホーム', icon: '⌂' },
  { id: 'search', label: '検索', icon: '⌕' },
  { id: 'favorites', label: 'お気に入り', icon: '♡' },
  { id: 'history', label: '履歴', icon: '↺' },
  { id: 'settings', label: '使い方', icon: '？' },
];

const emptyDraft = (): PromptItem => ({
  id: crypto.randomUUID(),
  title: '',
  category: 'Codex',
  subcategory: '',
  tags: [],
  body: '',
  useCase: '',
  successNote: '',
  favorite: false,
  copiedCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const loadPrompts = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultPrompts;
    const parsed = JSON.parse(saved) as PromptItem[];
    const savedIds = new Set(parsed.map((prompt) => prompt.id));
    const missingDefaults = defaultPrompts.filter((prompt) => !savedIds.has(prompt.id));
    return [...missingDefaults, ...parsed];
  } catch {
    return defaultPrompts;
  }
};

const normalize = (value: string) => value.toLowerCase().trim();

function App() {
  const [prompts, setPrompts] = useState<PromptItem[]>(loadPrompts);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'すべて'>('すべて');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<PromptItem | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
  }, [prompts]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }
  }, []);

  const stats = useMemo(() => ({
    total: prompts.length,
    favorites: prompts.filter((prompt) => prompt.favorite).length,
    used: prompts.filter((prompt) => prompt.lastUsedAt).length,
  }), [prompts]);

  const filteredPrompts = useMemo(() => {
    const q = normalize(query);
    return prompts
      .filter((prompt) => selectedCategory === 'すべて' || prompt.category === selectedCategory)
      .filter((prompt) => {
        if (activeTab === 'favorites') return prompt.favorite;
        if (activeTab === 'history') return Boolean(prompt.lastUsedAt);
        return true;
      })
      .filter((prompt) => {
        if (!q) return true;
        return [prompt.title, prompt.category, prompt.subcategory, prompt.body, prompt.useCase, prompt.successNote, prompt.tags.join(' ')]
          .join(' ')
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => {
        if (activeTab === 'history') return (b.lastUsedAt || '').localeCompare(a.lastUsedAt || '');
        if (b.favorite !== a.favorite) return Number(b.favorite) - Number(a.favorite);
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [activeTab, prompts, query, selectedCategory]);

  const copyPrompt = async (prompt: PromptItem) => {
    await navigator.clipboard.writeText(prompt.body);
    const usedAt = new Date().toISOString();
    setPrompts((items) => items.map((item) => item.id === prompt.id ? { ...item, copiedCount: item.copiedCount + 1, lastUsedAt: usedAt } : item));
    setToast('コピーしました。AIアプリに貼り付けて使えます。');
    window.setTimeout(() => setToast(''), 2200);
  };

  const savePrompt = (draft: PromptItem) => {
    const cleanDraft = {
      ...draft,
      title: draft.title || '無題のプロンプト',
      tags: draft.tags.map((tag) => tag.trim()).filter(Boolean),
      updatedAt: new Date().toISOString(),
    };
    setPrompts((items) => items.some((item) => item.id === cleanDraft.id) ? items.map((item) => item.id === cleanDraft.id ? cleanDraft : item) : [cleanDraft, ...items]);
    setEditing(null);
    setToast('保存しました。');
    window.setTimeout(() => setToast(''), 1800);
  };

  const deletePrompt = (id: string) => {
    if (!confirm('このプロンプトを削除しますか？')) return;
    setPrompts((items) => items.filter((item) => item.id !== id));
  };

  const resetDefaults = () => {
    if (!confirm('初期プロンプトを追加し直しますか？あなたが追加したものは残ります。')) return;
    const ids = new Set(prompts.map((prompt) => prompt.id));
    setPrompts((items) => [...defaultPrompts.filter((prompt) => !ids.has(prompt.id)), ...items]);
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">My AI Prompt Dictionary</p>
        <h1>AI Prompt Atelier</h1>
        <p>スマホで探す、コピーする、育てる。あなた専用のAIプロンプト辞典です。</p>
        <div className="stats" aria-label="保存状況">
          <span><b>{stats.total}</b>件</span>
          <span><b>{stats.favorites}</b>お気に入り</span>
          <span><b>{stats.used}</b>履歴</span>
        </div>
      </header>

      <main>
        {activeTab !== 'settings' && (
          <section className="toolbar" aria-label="検索とカテゴリ">
            <label className="search-box">
              <span>検索</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="タグ・用途・AI名で検索" />
            </label>
            <div className="chips" aria-label="カテゴリ選択">
              {(['すべて', ...categories] as const).map((category) => (
                <button key={category} className={selectedCategory === category ? 'chip active' : 'chip'} onClick={() => setSelectedCategory(category)}>{category}</button>
              ))}
            </div>
            <button className="primary full" onClick={() => setEditing(emptyDraft())}>＋ 新しいプロンプトを追加</button>
          </section>
        )}

        {activeTab === 'settings' ? <Guide resetDefaults={resetDefaults} /> : <PromptList prompts={filteredPrompts} copyPrompt={copyPrompt} setPrompts={setPrompts} onEdit={setEditing} onDelete={deletePrompt} />}
      </main>

      <nav className="bottom-tabs" aria-label="下部メニュー">
        {TABS.map((tab) => <button key={tab.id} className={activeTab === tab.id ? 'tab active' : 'tab'} onClick={() => setActiveTab(tab.id)}><span>{tab.icon}</span>{tab.label}</button>)}
      </nav>

      {editing && <Editor draft={editing} onCancel={() => setEditing(null)} onSave={savePrompt} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function PromptList({ prompts, copyPrompt, setPrompts, onEdit, onDelete }: {
  prompts: PromptItem[];
  copyPrompt: (prompt: PromptItem) => void;
  setPrompts: React.Dispatch<React.SetStateAction<PromptItem[]>>;
  onEdit: (prompt: PromptItem) => void;
  onDelete: (id: string) => void;
}) {
  if (prompts.length === 0) return <div className="empty">見つかりませんでした。検索ワードを短くするか、カテゴリを「すべて」にしてください。</div>;

  return <section className="grid">{prompts.map((prompt) => (
    <article className="prompt-card" key={prompt.id}>
      <div className="card-head">
        <div><span className="category">{prompt.category}</span><h2>{prompt.title}</h2></div>
        <button className="icon-button" aria-label="お気に入り" onClick={() => setPrompts((items) => items.map((item) => item.id === prompt.id ? { ...item, favorite: !item.favorite } : item))}>{prompt.favorite ? '♥' : '♡'}</button>
      </div>
      <p className="subcat">{prompt.subcategory}</p>
      <p className="body-preview">{prompt.body}</p>
      <div className="tag-row">{prompt.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
      <div className="note-box"><b>用途</b><p>{prompt.useCase}</p></div>
      <div className="note-box"><b>成功率メモ</b><p>{prompt.successNote}</p></div>
      <div className="meta">コピー {prompt.copiedCount}回 {prompt.lastUsedAt ? `・最終 ${new Date(prompt.lastUsedAt).toLocaleDateString('ja-JP')}` : ''}</div>
      <div className="actions">
        <button className="primary" onClick={() => copyPrompt(prompt)}>コピー</button>
        <button onClick={() => onEdit(prompt)}>編集</button>
        <button className="danger" onClick={() => onDelete(prompt.id)}>削除</button>
      </div>
    </article>
  ))}</section>;
}

function Editor({ draft, onCancel, onSave }: { draft: PromptItem; onCancel: () => void; onSave: (draft: PromptItem) => void }) {
  const [form, setForm] = useState({ ...draft, tagsText: draft.tags.join(', ') });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return <div className="modal-backdrop" role="dialog" aria-modal="true">
    <form className="editor" onSubmit={(event) => { event.preventDefault(); onSave({ ...form, tags: form.tagsText.split(',') }); }}>
      <div className="editor-head"><h2>プロンプト編集</h2><button type="button" onClick={onCancel}>×</button></div>
      <label>タイトル<input value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="例: リール台本を作る" /></label>
      <label>カテゴリ<select value={form.category} onChange={(event) => update('category', event.target.value as Category)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
      <label>小カテゴリ<input value={form.subcategory} onChange={(event) => update('subcategory', event.target.value)} placeholder="例: フック生成" /></label>
      <label>タグ（カンマ区切り）<input value={form.tagsText} onChange={(event) => update('tagsText', event.target.value)} placeholder="Instagram, 保存, CTA" /></label>
      <label>プロンプト本文<textarea value={form.body} onChange={(event) => update('body', event.target.value)} rows={8} placeholder="AIに貼り付ける文章" /></label>
      <label>使用用途メモ<textarea value={form.useCase} onChange={(event) => update('useCase', event.target.value)} rows={3} /></label>
      <label>成功率メモ<textarea value={form.successNote} onChange={(event) => update('successNote', event.target.value)} rows={3} /></label>
      <div className="actions"><button className="primary" type="submit">保存</button><button type="button" onClick={onCancel}>キャンセル</button></div>
    </form>
  </div>;
}

function Guide({ resetDefaults }: { resetDefaults: () => void }) {
  return <section className="guide">
    <h2>初心者向け：使い方と公開手順</h2>
    <div className="guide-card"><h3>毎日の使い方</h3><ol><li>下の「検索」を押します。</li><li>使いたいAI名・Instagram・Xなどで検索します。</li><li>カードの「コピー」を押します。</li><li>Codexスマホ版、Claude Code、GPT-5.5などに貼り付けます。</li></ol></div>
    <div className="guide-card"><h3>ホーム画面に追加する方法（iPhone）</h3><ol><li>Safariで公開URLを開きます。</li><li>画面下の共有ボタン（四角から上矢印）を押します。</li><li>「ホーム画面に追加」を押します。</li><li>右上の「追加」を押します。</li></ol></div>
    <div className="guide-card"><h3>一番ラクな公開方法：Netlify</h3><ol><li>GitHubにこのコードを置きます。</li><li>Netlifyで「Add new site」→「Import an existing project」を押します。</li><li>GitHubを選び、このリポジトリを選択します。</li><li>Build command は「npm run build」、Publish directory は「dist」です。</li><li>「Deploy site」を押すとURLができます。</li></ol><p>理由: 無料で始めやすく、難しいサーバー設定がほぼ不要だからです。</p></div>
    <div className="guide-card"><h3>大切な注意</h3><p>このアプリはログインなし・DBなしです。保存データは今使っているスマホのブラウザ内に保存されます。スマホを変えたり、Safariのデータを消すと消える可能性があります。大事なプロンプトはメモアプリにもコピーしておくと安心です。</p><button className="primary full" onClick={resetDefaults}>初期プロンプトを追加し直す</button></div>
  </section>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
