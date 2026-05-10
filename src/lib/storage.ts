import type { Prompt } from "@/types/prompt";
import { initialPrompts } from "@/data/initialPrompts";

const STORAGE_KEY = "prompt-vault:prompts:v1";
const SEEDED_KEY = "prompt-vault:seeded:v1";

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
    // 最低限のバリデーション
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

/**
 * 初回起動時のみ初期サンプルを投入する。
 * 既存ユーザーのデータは破壊しない設計。
 *  - 既に prompts キーが存在する場合は何もしない(ユーザーがすべて削除した場合も含めて尊重)
 *  - 投入済みフラグも別キーで管理する
 */
export function ensureSeeded(): Prompt[] {
  if (!isBrowser()) return initialPrompts;

  const existing = loadPrompts();
  if (existing !== null) {
    return existing;
  }

  // 投入済みフラグがあるなら、ユーザーが意図的に空にしたとみなす
  const seeded = window.localStorage.getItem(SEEDED_KEY);
  if (seeded === "1") {
    return [];
  }

  savePrompts(initialPrompts);
  try {
    window.localStorage.setItem(SEEDED_KEY, "1");
  } catch (e) {
    // noop
  }
  return initialPrompts;
}
