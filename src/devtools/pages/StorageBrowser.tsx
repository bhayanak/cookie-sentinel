import { useState } from 'react';
import { useAppStore } from '@shared/store';
import type { StorageEntry, StorageType } from '@shared/types';
import { STORAGE_TYPE_LABELS } from '@shared/constants';
import StorageTree from '../components/StorageTree';
import CookieDetail from './CookieDetail';

const TYPE_OPTIONS: (StorageType | 'all')[] = [
  'all',
  'cookie',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'cacheStorage',
];

function StorageBrowser() {
  const { filteredEntries, entries, activeTypeFilter, setTypeFilter, isLoading, error } =
    useAppStore();
  const [selectedEntry, setSelectedEntry] = useState<StorageEntry | null>(null);

  function handleDelete(entry: StorageEntry) {
    if (entry.type === 'cookie') {
      const url = `http${(entry.metadata as { secure: boolean }).secure ? 's' : ''}://${entry.domain}${(entry.metadata as { path: string }).path}`;
      chrome.runtime.sendMessage({
        action: 'DELETE_COOKIE',
        payload: { url, name: entry.key },
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-500">
        Loading storage data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-40 text-red-400 text-sm">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800 bg-slate-900/30">
        {TYPE_OPTIONS.map((type) => {
          const count =
            type === 'all' ? entries.length : entries.filter((e) => e.type === type).length;
          const label = type === 'all' ? 'All' : STORAGE_TYPE_LABELS[type as StorageType];
          return (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-2 py-1 text-[11px] rounded transition-colors ${
                activeTypeFilter === type
                  ? 'bg-monster-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Entry list */}
        <div className="flex-1 overflow-auto">
          <StorageTree
            entries={filteredEntries}
            onSelect={setSelectedEntry}
            onDelete={handleDelete}
          />
        </div>

        {/* Detail panel */}
        {selectedEntry && (
          <div className="w-80 border-l border-slate-800 overflow-auto">
            <CookieDetail entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-slate-800 bg-slate-900/50 text-[10px] text-slate-500">
        <span>
          {filteredEntries.length} of {entries.length} entries
        </span>
        <span>Cookie Monster v1.0.0</span>
      </div>
    </div>
  );
}

export default StorageBrowser;
