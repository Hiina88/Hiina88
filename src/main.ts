import { categories, defaultPrompts } from './prompts.js';
import type { Category, PromptItem, Tab } from './types.js';

const STORAGE_KEY = 'ai-prompt-atelier-prompts-v2';
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'ホーム', icon: '⌂' },
  { id: 'search', label: '検索', icon: '⌕' },
  { id: 'favorites', label: 'お気に入り', icon: '♡' },
  { id: 'history', label: '履歴', icon: '↺' },
  { id: 'settings', label: '使い方', icon: '？' },
];

type State = {
  prompts: PromptItem[];
  activeTab: Tab;
  selectedCategory: Category | 'すべて';
  query: string;
  editing?: PromptItem;
  toast: string;
};

const state: State = {
  prompts: loadPrompts(),
  activeTab: 'home',
  selectedCategory: 'すべて',
  query: '',
  toast: '',
};

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (!appRoot) throw new Error('App root not found');
const app = appRoot;

render();
registerServiceWorker();

function loadPrompts(): PromptItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('ai-prompt-atelier-prompts-v1');
    if (!saved) return defaultPrompts;
    const parsed = JSON.parse(saved) as PromptItem[];
    const savedIds = new Set(parsed.map((prompt) => prompt.id));
    const missingDefaults = defaultPrompts.filter((prompt) => !savedIds.has(prompt.id));
    return [...missingDefaults, ...parsed];
  } catch {
    return defaultPrompts;
  }
}

function savePrompts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts));
}

function setToast(message: string) {
  state.toast = message;
  render();
  window.setTimeout(() => {
    state.toast = '';
    render();
  }, 2300);
}

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function escapeHtml(value = '') {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function filteredPrompts() {
  const q = normalize(state.query);
  return state.prompts
    .filter((prompt) => state.selectedCategory === 'すべて' || prompt.category === state.selectedCategory)
    .filter((prompt) => {
      if (state.activeTab === 'favorites') return prompt.favorite;
      if (state.activeTab === 'history') return Boolean(prompt.lastUsedAt);
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
      if (state.activeTab === 'history') return (b.lastUsedAt || '').localeCompare(a.lastUsedAt || '');
      if (b.favorite !== a.favorite) return Number(b.favorite) - Number(a.favorite);
      return b.updatedAt.localeCompare(a.updatedAt);
    });
}

function render() {
  const stats = {
    total: state.prompts.length,
    favorites: state.prompts.filter((prompt) => prompt.favorite).length,
    used: state.prompts.filter((prompt) => prompt.lastUsedAt).length,
  };

  app.innerHTML = `
    <div class="app-shell">
      <header class="hero">
        <p class="eyebrow">My AI Prompt Dictionary</p>
        <h1>AI Prompt Atelier</h1>
        <p>スマホで探す、コピーする、育てる。あなた専用のAIプロンプト辞典です。</p>
        <div class="stats" aria-label="保存状況">
          <span><b>${stats.total}</b>件</span>
          <span><b>${stats.favorites}</b>お気に入り</span>
          <span><b>${stats.used}</b>履歴</span>
        </div>
      </header>
      <main>${state.activeTab === 'settings' ? guideTemplate() : appTemplate()}</main>
      ${tabsTemplate()}
      ${state.editing ? editorTemplate(state.editing) : ''}
      ${state.toast ? `<div class="toast">${escapeHtml(state.toast)}</div>` : ''}
    </div>`;

  bindEvents();
}

function appTemplate() {
  return `
    <section class="toolbar" aria-label="検索とカテゴリ">
      <label class="search-box">
        <span>検索</span>
        <input id="query" value="${escapeHtml(state.query)}" placeholder="タグ・用途・AI名で検索" />
      </label>
      <div class="chips" aria-label="カテゴリ選択">
        ${(['すべて', ...categories] as const).map((category) => `<button class="chip ${state.selectedCategory === category ? 'active' : ''}" data-category="${category}">${category}</button>`).join('')}
      </div>
      <button class="primary full" id="newPrompt">＋ 新しいプロンプトを追加</button>
    </section>
    ${promptListTemplate(filteredPrompts())}`;
}

function promptListTemplate(prompts: PromptItem[]) {
  if (prompts.length === 0) return '<div class="empty">見つかりませんでした。検索ワードを短くするか、カテゴリを「すべて」にしてください。</div>';

  return `<section class="grid">${prompts.map((prompt) => `
    <article class="prompt-card">
      <div class="card-head">
        <div><span class="category">${prompt.category}</span><h2>${escapeHtml(prompt.title)}</h2></div>
        <button class="icon-button" data-favorite="${prompt.id}" aria-label="お気に入り">${prompt.favorite ? '♥' : '♡'}</button>
      </div>
      <p class="subcat">${escapeHtml(prompt.subcategory)}</p>
      <p class="body-preview">${escapeHtml(prompt.body)}</p>
      <div class="tag-row">${prompt.tags.map((tag) => `<span>#${escapeHtml(tag)}</span>`).join('')}</div>
      <div class="note-box"><b>用途</b><p>${escapeHtml(prompt.useCase)}</p></div>
      <div class="note-box"><b>成功率メモ</b><p>${escapeHtml(prompt.successNote)}</p></div>
      <div class="meta">コピー ${prompt.copiedCount}回 ${prompt.lastUsedAt ? `・最終 ${new Date(prompt.lastUsedAt).toLocaleDateString('ja-JP')}` : ''}</div>
      <div class="actions">
        <button class="primary" data-copy="${prompt.id}">コピー</button>
        <button data-edit="${prompt.id}">編集</button>
        <button class="danger" data-delete="${prompt.id}">削除</button>
      </div>
    </article>`).join('')}</section>`;
}

function tabsTemplate() {
  return `<nav class="bottom-tabs" aria-label="下部メニュー">
    ${TABS.map((tab) => `<button class="tab ${state.activeTab === tab.id ? 'active' : ''}" data-tab="${tab.id}"><span>${tab.icon}</span>${tab.label}</button>`).join('')}
  </nav>`;
}

function guideTemplate() {
  return `<section class="guide">
    <h2>初心者向け：使い方と公開手順</h2>
    <div class="guide-card"><h3>毎日の使い方</h3><ol><li>下の「検索」を押します。</li><li>使いたいAI名・Instagram・Xなどで検索します。</li><li>カードの「コピー」を押します。</li><li>Codexスマホ版、Claude Code、GPT-5.5などに貼り付けます。</li></ol></div>
    <div class="guide-card"><h3>ホーム画面に追加する方法（iPhone）</h3><ol><li>Safariで公開URLを開きます。</li><li>画面下の共有ボタン（四角から上矢印）を押します。</li><li>「ホーム画面に追加」を押します。</li><li>右上の「追加」を押します。</li></ol></div>
    <div class="guide-card"><h3>一番ラクな公開方法：Netlify</h3><ol><li>GitHubにこのコードを置きます。</li><li>Netlifyで「Add new site」→「Import an existing project」を押します。</li><li>GitHubを選び、このリポジトリを選択します。</li><li>Build command は「npm run build」、Publish directory は「dist」です。</li><li>「Deploy site」を押すとURLができます。</li></ol><p>理由: 無料で始めやすく、難しいサーバー設定がほぼ不要だからです。</p></div>
    <div class="guide-card"><h3>バックアップ</h3><p>大事なプロンプトを守るため、月1回くらい「バックアップ保存」を押してください。iPhoneの「ファイル」アプリにJSONファイルとして保存できます。</p><div class="guide-actions"><button class="primary full" id="exportBackup">バックアップ保存</button><button class="full" id="importBackupButton">バックアップ読込</button></div><input id="importBackup" class="hidden-input" type="file" accept="application/json" /></div>
    <div class="guide-card"><h3>大切な注意</h3><p>このアプリはログインなし・DBなしです。保存データは今使っているスマホのブラウザ内に保存されます。スマホを変えたり、Safariのデータを消すと消える可能性があります。大事なプロンプトはメモアプリにもコピーしておくと安心です。</p><button class="primary full" id="resetDefaults">初期プロンプトを追加し直す</button></div>
  </section>`;
}

function editorTemplate(prompt: PromptItem) {
  return `<div class="modal-backdrop" role="dialog" aria-modal="true">
    <form class="editor" id="editorForm">
      <div class="editor-head"><h2>プロンプト編集</h2><button type="button" id="closeEditor">×</button></div>
      <label>タイトル<input name="title" value="${escapeHtml(prompt.title)}" placeholder="例: リール台本を作る" /></label>
      <label>カテゴリ<select name="category">${categories.map((category) => `<option ${prompt.category === category ? 'selected' : ''}>${category}</option>`).join('')}</select></label>
      <label>小カテゴリ<input name="subcategory" value="${escapeHtml(prompt.subcategory)}" placeholder="例: フック生成" /></label>
      <label>タグ（カンマ区切り）<input name="tags" value="${escapeHtml(prompt.tags.join(', '))}" placeholder="Instagram, 保存, CTA" /></label>
      <label>プロンプト本文<textarea name="body" rows="8" placeholder="AIに貼り付ける文章">${escapeHtml(prompt.body)}</textarea></label>
      <label>使用用途メモ<textarea name="useCase" rows="3">${escapeHtml(prompt.useCase)}</textarea></label>
      <label>成功率メモ<textarea name="successNote" rows="3">${escapeHtml(prompt.successNote)}</textarea></label>
      <div class="actions"><button class="primary" type="submit">保存</button><button type="button" id="cancelEditor">キャンセル</button></div>
    </form>
  </div>`;
}

function bindEvents() {
  document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeTab = button.dataset.tab as Tab;
      render();
    });
  });

  document.querySelector<HTMLInputElement>('#query')?.addEventListener('input', (event) => {
    state.query = (event.target as HTMLInputElement).value;
    render();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-category]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedCategory = button.dataset.category as Category | 'すべて';
      render();
    });
  });

  document.querySelector<HTMLButtonElement>('#newPrompt')?.addEventListener('click', () => {
    state.editing = emptyDraft();
    render();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
    button.addEventListener('click', () => copyPrompt(button.dataset.copy || ''));
  });

  document.querySelectorAll<HTMLButtonElement>('[data-favorite]').forEach((button) => {
    button.addEventListener('click', () => toggleFavorite(button.dataset.favorite || ''));
  });

  document.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      const prompt = state.prompts.find((item) => item.id === button.dataset.edit);
      if (prompt) state.editing = { ...prompt };
      render();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-delete]').forEach((button) => {
    button.addEventListener('click', () => deletePrompt(button.dataset.delete || ''));
  });

  document.querySelector<HTMLButtonElement>('#closeEditor')?.addEventListener('click', closeEditor);
  document.querySelector<HTMLButtonElement>('#cancelEditor')?.addEventListener('click', closeEditor);
  document.querySelector<HTMLFormElement>('#editorForm')?.addEventListener('submit', saveEditor);
  document.querySelector<HTMLButtonElement>('#exportBackup')?.addEventListener('click', exportBackup);
  document.querySelector<HTMLButtonElement>('#importBackupButton')?.addEventListener('click', () => document.querySelector<HTMLInputElement>('#importBackup')?.click());
  document.querySelector<HTMLInputElement>('#importBackup')?.addEventListener('change', (event) => importBackup((event.target as HTMLInputElement).files?.[0]));
  document.querySelector<HTMLButtonElement>('#resetDefaults')?.addEventListener('click', resetDefaults);
}

function emptyDraft(): PromptItem {
  const now = new Date().toISOString();
  return {
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
    createdAt: now,
    updatedAt: now,
  };
}

function closeEditor() {
  state.editing = undefined;
  render();
}

async function copyText(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', 'true');
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
}

async function copyPrompt(id: string) {
  const prompt = state.prompts.find((item) => item.id === id);
  if (!prompt) return;

  await copyText(prompt.body);
  prompt.copiedCount += 1;
  prompt.lastUsedAt = new Date().toISOString();
  savePrompts();
  setToast('コピーしました。AIアプリに貼り付けて使えます。');
}

function toggleFavorite(id: string) {
  const prompt = state.prompts.find((item) => item.id === id);
  if (!prompt) return;
  prompt.favorite = !prompt.favorite;
  prompt.updatedAt = new Date().toISOString();
  savePrompts();
  render();
}

function deletePrompt(id: string) {
  if (!confirm('このプロンプトを削除しますか？')) return;
  state.prompts = state.prompts.filter((item) => item.id !== id);
  savePrompts();
  render();
}

function saveEditor(event: SubmitEvent) {
  event.preventDefault();
  if (!state.editing) return;

  const formData = new FormData(event.target as HTMLFormElement);
  const updated: PromptItem = {
    ...state.editing,
    title: String(formData.get('title') || '無題のプロンプト'),
    category: String(formData.get('category') || 'Codex') as Category,
    subcategory: String(formData.get('subcategory') || ''),
    tags: String(formData.get('tags') || '').split(',').map((tag) => tag.trim()).filter(Boolean),
    body: String(formData.get('body') || ''),
    useCase: String(formData.get('useCase') || ''),
    successNote: String(formData.get('successNote') || ''),
    updatedAt: new Date().toISOString(),
  };

  const existing = state.prompts.some((prompt) => prompt.id === updated.id);
  state.prompts = existing ? state.prompts.map((prompt) => prompt.id === updated.id ? updated : prompt) : [updated, ...state.prompts];
  state.editing = undefined;
  savePrompts();
  setToast('保存しました。');
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(state.prompts, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `ai-prompt-atelier-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  setToast('バックアップファイルを作成しました。');
}

async function importBackup(file?: File) {
  if (!file) return;

  try {
    const imported = JSON.parse(await file.text()) as PromptItem[];
    if (!Array.isArray(imported)) throw new Error('invalid');
    const existingIds = new Set(state.prompts.map((prompt) => prompt.id));
    const validPrompts = imported.filter((prompt) => prompt.id && prompt.title && prompt.body && !existingIds.has(prompt.id));
    if (validPrompts.length === 0) throw new Error('empty');
    state.prompts = [...validPrompts, ...state.prompts];
    savePrompts();
    setToast(`${validPrompts.length}件を読み込みました。`);
  } catch {
    setToast('読み込みできませんでした。バックアップJSONを選んでください。');
  }
}

function resetDefaults() {
  if (!confirm('初期プロンプトを追加し直しますか？あなたが追加したものは残ります。')) return;
  const ids = new Set(state.prompts.map((prompt) => prompt.id));
  state.prompts = [...defaultPrompts.filter((prompt) => !ids.has(prompt.id)), ...state.prompts];
  savePrompts();
  setToast('初期プロンプトを確認しました。');
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => undefined);
  }
}
