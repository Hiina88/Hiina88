"use client";

import type { Prompt } from "@/types/prompt";
import PromptCard from "./PromptCard";
import EmptyState from "./EmptyState";

interface PromptListProps {
  prompts: Prompt[];
  onCopy: (p: Prompt) => void;
  onOpen: (p: Prompt) => void;
  onEdit: (p: Prompt) => void;
  onDelete: (p: Prompt) => void;
  onToggleFavorite: (p: Prompt) => void;
  onTogglePin: (p: Prompt) => void;
  onCreateNew: () => void;
}

export default function PromptList({
  prompts,
  onCopy,
  onOpen,
  onEdit,
  onDelete,
  onToggleFavorite,
  onTogglePin,
  onCreateNew,
}: PromptListProps) {
  if (prompts.length === 0) {
    return (
      <EmptyState
        title="該当するプロンプトがありません"
        description="検索条件を変えるか、新しいプロンプトを追加してください。"
        actionLabel="新規プロンプトを追加"
        onAction={onCreateNew}
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {prompts.map((p) => (
        <PromptCard
          key={p.id}
          prompt={p}
          onCopy={onCopy}
          onOpen={onOpen}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
          onTogglePin={onTogglePin}
        />
      ))}
    </div>
  );
}
