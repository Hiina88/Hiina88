export type Category =
  | 'Codex'
  | 'Claude Code'
  | 'GPT-5.5'
  | 'ChatGPT image2.0'
  | 'Claude Opus 4.7'
  | 'Instagram運用'
  | 'X運用';

export type PromptItem = {
  id: string;
  title: string;
  category: Category;
  subcategory: string;
  tags: string[];
  body: string;
  useCase: string;
  successNote: string;
  favorite: boolean;
  copiedCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type Tab = 'home' | 'search' | 'favorites' | 'history' | 'settings';
