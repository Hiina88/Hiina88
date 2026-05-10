import type { Prompt } from "@/types/prompt";
import { initialPrompts } from "@/data/initialPrompts";

const STORAGE_KEY = "prompt-vault:prompts:v1";
const SEEDED_KEY = "prompt-vault:seeded:v1";
// 適用済みシード ID 一覧(差分マージ用)
const APPLIED_SEED_IDS_KEY = "prompt-vault:appliedSeedIds:v1";
// ユーザーが意図的に削除したシード ID 一覧(再追加されないようにする)
const DELETED_SEED_IDS_KEY = "prompt-vault:deletedSeedIds:v1";

const isBrowser = (): boolean => typeof window !== "undefined";

/**
 * 安全な LocalStorage 読み込み。失敗時は null を返す。
 */
export function loadPrompts(): Prompt[] | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(
      (p): p is Prompt =>
        p &&
        typeof p.id === "string" &&
        typeof p.title === "string" &&
        typeof p.prompt === "string"
    );
  } catch (e) {
    console.warn("[PromptVault] LocalStorage 読み込みに失敗:", e);
    return null;
  }
}

/**
 * 安全な LocalStorage 書き込み。
 */
export function savePrompts(prompts: Prompt[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
  } catch (e) {
    console.warn("[PromptVault] LocalStorage 書き込みに失敗:", e);
  }
}

function readStringSet(key: string): Set<string> {
  if (!isBrowser()) return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function writeStringSet(key: string, set: Set<string>): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    // noop
  }
}

/**
 * ユーザーが seed_xxx を削除したことを記録する。
 * これを記録しておかないと、次回起動時に差分マージで復活してしまう。
 */
export function markSeedDeleted(id: string): void {
  if (!id.startsWith("seed_")) return;
  const set = readStringSet(DELETED_SEED_IDS_KEY);
  set.add(id);
  writeStringSet(DELETED_SEED_IDS_KEY, set);
}

/**
 * 初回起動時のサンプル投入 + 既存ユーザーへの差分マージ。
 *
 * 動作:
 *  1. 既存データがない & 一度もシードしていない → 全件投入(初回ユーザー)
 *  2. 既存データがある → 「ユーザーが持っていない seed_xxx」だけ追加(差分マージ)
 *     - ユーザーが編集済みのものは上書きしない
 *     - ユーザーが削除済み(markSeedDeleted 済み)のものは復活させない
 *  3. 既存データが空 & 過去にシード済み → ユーザーが意図的に空にしたとみなす(従来動作維持)
 *     ただし、削除済みフラグが立っていない seed があれば、それは「新規に追加されたシード」
 *     なので、その分だけ追加する。
 */
export function ensureSeeded(): Prompt[] {
  if (!isBrowser()) return initialPrompts;

  const existing = loadPrompts();
  const appliedIds = readStringSet(APPLIED_SEED_IDS_KEY);
  const deletedIds = readStringSet(DELETED_SEED_IDS_KEY);
  const seededFlag = window.localStorage.getItem(SEEDED_KEY) === "1";

  // ----- ケース 1: 完全初回(prompts キーなし & シード履歴なし)-----
  if (existing === null && !seededFlag && appliedIds.size === 0) {
    savePrompts(initialPrompts);
    const allIds = new Set(initialPrompts.map((p) => p.id));
    writeStringSet(APPLIED_SEED_IDS_KEY, allIds);
    try {
      window.localStorage.setItem(SEEDED_KEY, "1");
    } catch {
      // noop
    }
    return initialPrompts;
  }

  // ----- ケース 2 / 3: 既に何らかの履歴あり → 差分マージを試みる -----
  const currentList: Prompt[] = existing ?? [];
  const currentIds = new Set(currentList.map((p) => p.id));

  // 「currentList にも appliedIds にも deletedIds にも入っていない seed」が新規追加分
  const additions: Prompt[] = initialPrompts.filter(
    (p) =>
      !currentIds.has(p.id) &&
      !appliedIds.has(p.id) &&
      !deletedIds.has(p.id)
  );

  if (additions.length === 0) {
    // 何も追加するものがない場合は既存のまま返す
    if (existing === null) {
      // 過去にシード済みでユーザーが全削除した状態
      return [];
    }
    return currentList;
  }

  // 新規分を先頭に追加(並び替えは page 側のソートで吸収される)
  const merged = [...additions, ...currentList];
  savePrompts(merged);

  // 適用済みフラグを更新
  for (const a of additions) appliedIds.add(a.id);
  // 念のため、現在持っているシードもすべて applied 扱いにする
  for (const p of currentList) {
    if (p.id.startsWith("seed_")) appliedIds.add(p.id);
  }
  writeStringSet(APPLIED_SEED_IDS_KEY, appliedIds);

  try {
    window.localStorage.setItem(SEEDED_KEY, "1");
  } catch {
    // noop
  }

  return merged;
}
