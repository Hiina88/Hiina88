import type { Prompt } from "@/types/prompt";

/**
 * ID 生成。crypto.randomUUID が使えない環境のフォールバック付き。
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

const normalize = (s: string): string => s.toLowerCase().normalize("NFKC");

/**
 * 検索: title / description / prompt / category / tags を対象に部分一致(大文字小文字無視)。
 * 全角半角の差を NFKC で正規化。
 */
export function matchesQuery(p: Prompt, query: string): boolean {
  const q = normalize(query.trim());
  if (!q) return true;
  const haystack = normalize(
    [p.title, p.description, p.prompt, p.category, p.tags.join(" ")].join(" \n ")
  );
  // スペース区切りの AND 検索
  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.every((t) => haystack.includes(t));
}

/**
 * 並び順:
 *  1. pinned が true のものを最上部
 *  2. favorite が true のものを優先
 *  3. usageCount が多いものを優先
 *  4. updatedAt が新しいものを優先
 */
export function sortPrompts(list: Prompt[]): Prompt[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
    if (a.usageCount !== b.usageCount) return b.usageCount - a.usageCount;
    return (
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  });
}

export function filterPrompts(
  list: Prompt[],
  options: {
    query: string;
    category: string | null; // null は全件
    tags: string[]; // 空配列は全件
    favoritesOnly: boolean;
  }
): Prompt[] {
  return list.filter((p) => {
    if (options.favoritesOnly && !p.favorite) return false;
    if (options.category && p.category !== options.category) return false;
    if (options.tags.length > 0) {
      const hasAll = options.tags.every((t) => p.tags.includes(t));
      if (!hasAll) return false;
    }
    if (!matchesQuery(p, options.query)) return false;
    return true;
  });
}

/**
 * 最近使ったプロンプト N 件を返す。lastUsedAt が null のものは除外。
 */
export function getRecentPrompts(list: Prompt[], n = 5): Prompt[] {
  return [...list]
    .filter((p) => p.lastUsedAt)
    .sort(
      (a, b) =>
        new Date(b.lastUsedAt as string).getTime() -
        new Date(a.lastUsedAt as string).getTime()
    )
    .slice(0, n);
}

/**
 * 各カテゴリーの件数を集計。
 */
export function countByCategory(list: Prompt[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of list) {
    out[p.category] = (out[p.category] ?? 0) + 1;
  }
  return out;
}

/**
 * 全タグを使用件数の多い順で返す。
 */
export function collectTags(list: Prompt[]): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const p of list) {
    for (const t of p.tags) {
      map.set(t, (map.get(t) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "ja"));
}

/**
 * 日時を「YYYY/MM/DD HH:mm」っぽく簡潔表示。
 */
export function formatDateTime(iso: string | null): string {
  if (!iso) return "未使用";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const now = Date.now();
  const diff = now - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "たった今";
  if (min < 60) return `${min}分前`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}時間前`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day}日前`;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd}`;
}

/**
 * プロンプト本文をクリップボードへコピー。失敗時は execCommand にフォールバック。
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_e) {
    // fallthrough
  }
  // Fallback
  try {
    if (typeof document === "undefined") return false;
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch (_e) {
    return false;
  }
}
