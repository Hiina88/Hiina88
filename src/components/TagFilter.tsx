"use client";

interface TagFilterProps {
  allTags: { tag: string; count: number }[];
  selected: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
}

export default function TagFilter({
  allTags,
  selected,
  onToggle,
  onClear,
}: TagFilterProps) {
  return (
    <div>
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-xs font-semibold text-ink-500 tracking-wider">
          タグ
        </h3>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-accent-600 hover:underline"
          >
            クリア
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {allTags.map(({ tag, count }) => {
          const active = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggle(tag)}
              className={`px-2.5 py-1 rounded-full text-xs border transition ${
                active
                  ? "bg-accent-500 text-white border-accent-500"
                  : "bg-white text-ink-700 border-ink-200 hover:border-accent-500 hover:text-accent-700"
              }`}
            >
              <span>#{tag}</span>
              <span
                className={`ml-1 tabular-nums ${
                  active ? "text-white/80" : "text-ink-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
        {allTags.length === 0 && (
          <span className="text-xs text-ink-400 px-1">タグなし</span>
        )}
      </div>
    </div>
  );
}
