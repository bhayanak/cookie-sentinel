import type { StorageEntry } from '@shared/types';
import TypeBadge from './TypeBadge';
import ClassBadge from './ClassBadge';
import { truncate, isSensitiveName, maskValue } from '@shared/utils';
import { useState } from 'react';

interface StorageTreeProps {
  entries: StorageEntry[];
  onSelect: (entry: StorageEntry) => void;
  onDelete: (entry: StorageEntry) => void;
}

function StorageTree({ entries, onSelect, onDelete }: StorageTreeProps) {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  function toggleReveal(id: string) {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
        No storage entries found
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-800">
      {entries.map((entry) => {
        const isSensitive = entry.type === 'cookie' && isSensitiveName(entry.key);
        const isRevealed = revealedIds.has(entry.id);
        const displayValue =
          isSensitive && !isRevealed ? maskValue(entry.value) : truncate(entry.value);

        return (
          <div
            key={entry.id}
            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800/50 cursor-pointer group transition-colors"
            onClick={() => onSelect(entry)}
          >
            {/* Type badge */}
            <TypeBadge type={entry.type} />

            {/* Classification badge */}
            {entry.classification && <ClassBadge classification={entry.classification} />}

            {/* Key */}
            <span className="font-mono text-xs text-slate-200 min-w-[120px] truncate">
              {entry.key}
            </span>

            {/* Value */}
            <span className="flex-1 font-mono text-xs text-slate-400 truncate">{displayValue}</span>

            {/* Reveal button for sensitive values */}
            {isSensitive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleReveal(entry.id);
                }}
                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                title={isRevealed ? 'Hide value' : 'Reveal value'}
              >
                {isRevealed ? '🙈' : '👁'}
              </button>
            )}

            {/* Domain */}
            <span className="text-[10px] text-slate-600 min-w-[80px] text-right truncate">
              {entry.domain}
            </span>

            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(entry);
              }}
              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 text-xs transition-opacity"
              title="Delete entry"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default StorageTree;
