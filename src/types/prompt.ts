export const CATEGORIES = [
  "Codex Cloud",
  "Genspark",
  "Xポスト",
  "Instagram投稿",
  "リール台本",
  "長文記事",
  "画像生成",
  "動画生成",
  "講座作成",
  "LP/セールス",
  "リサーチ",
  "文章改善",
  "壁打ち",
  "その他",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Prompt {
  id: string;
  title: string;
  category: Category;
  tags: string[];
  description: string;
  prompt: string;
  favorite: boolean;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
  usageCount: number;
}

export type NewPromptInput = Omit<
  Prompt,
  "id" | "createdAt" | "updatedAt" | "lastUsedAt" | "usageCount"
>;
