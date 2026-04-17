import type { SnapshotDiff as SnapshotDiffType } from '@shared/types';

interface DiffHighlightProps {
  diff: SnapshotDiffType;
}

function DiffHighlight({ diff }: DiffHighlightProps) {
  return (
    <div className="p-4 space-y-4">
      {/* Added */}
      {diff.added.length > 0 && (
        <section>
          <h3 className="text-xs font-bold text-green-400 mb-2">➕ Added ({diff.added.length})</h3>
          <div className="space-y-1">
            {diff.added.map((entry) => (
              <div key={entry.id} className="flex gap-2 px-2 py-1 bg-green-900/20 rounded text-xs">
                <span className="text-green-300 font-mono">{entry.key}</span>
                <span className="text-green-500 truncate">{entry.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Removed */}
      {diff.removed.length > 0 && (
        <section>
          <h3 className="text-xs font-bold text-red-400 mb-2">
            ➖ Removed ({diff.removed.length})
          </h3>
          <div className="space-y-1">
            {diff.removed.map((entry) => (
              <div key={entry.id} className="flex gap-2 px-2 py-1 bg-red-900/20 rounded text-xs">
                <span className="text-red-300 font-mono">{entry.key}</span>
                <span className="text-red-500 truncate">{entry.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modified */}
      {diff.modified.length > 0 && (
        <section>
          <h3 className="text-xs font-bold text-amber-400 mb-2">
            ✏️ Modified ({diff.modified.length})
          </h3>
          <div className="space-y-2">
            {diff.modified.map(({ before, after }) => (
              <div key={before.id} className="px-2 py-1 bg-amber-900/20 rounded text-xs space-y-1">
                <div className="font-mono text-amber-300">{before.key}</div>
                <div className="flex gap-2">
                  <span className="text-red-400 line-through truncate">{before.value}</span>
                  <span className="text-green-400 truncate">{after.value}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* No changes */}
      {diff.added.length === 0 && diff.removed.length === 0 && diff.modified.length === 0 && (
        <p className="text-slate-500 text-sm text-center py-8">No differences found</p>
      )}
    </div>
  );
}

export default DiffHighlight;
