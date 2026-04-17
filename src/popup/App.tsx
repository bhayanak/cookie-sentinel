import { useEffect, useState } from 'react';
import type { StorageEntry, PrivacyScore } from '@shared/types';
import { STORAGE_TYPE_LABELS, COOKIE_CLASS_COLORS, COOKIE_CLASS_LABELS } from '@shared/constants';
import type { StorageType, CookieClass } from '@shared/types';
import { calculatePrivacyScore } from '@background/privacy-scorer';
import { exportToJSON } from '@shared/utils';

function App() {
  const [entries, setEntries] = useState<StorageEntry[]>([]);
  const [domain, setDomain] = useState('');
  const [score, setScore] = useState<PrivacyScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id || !tab.url) return;

      const url = new URL(tab.url);
      setDomain(url.hostname);

      const response = await chrome.runtime.sendMessage({
        action: 'GET_ALL_STORAGE',
        payload: { tabId: tab.id },
      });

      if (response?.success && response.data) {
        const data = response.data as StorageEntry[];
        setEntries(data);
        setScore(calculatePrivacyScore(url.hostname, data));
      }
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    const json = exportToJSON(entries, domain);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cookie-monster-${domain}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleClearAll() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    // Clear cookies for domain
    const cookies = await chrome.cookies.getAll({ domain });
    for (const c of cookies) {
      const url = `http${c.secure ? 's' : ''}://${c.domain}${c.path}`;
      await chrome.cookies.remove({ url, name: c.name });
    }

    // Clear web storage via content script
    await chrome.tabs.sendMessage(tab.id, { action: 'CLEAR_ALL_STORAGE' });

    loadData();
  }

  function scoreColor(s: number): string {
    if (s >= 80) return '#22c55e';
    if (s >= 60) return '#f59e0b';
    if (s >= 40) return '#f97316';
    return '#ef4444';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-500 text-sm">Loading…</div>
    );
  }

  const typeCounts = Object.fromEntries(
    (
      ['cookie', 'localStorage', 'sessionStorage', 'indexedDB', 'cacheStorage'] as StorageType[]
    ).map((t) => [t, entries.filter((e) => e.type === t).length]),
  );

  const classCounts: Record<CookieClass, number> = {
    essential: 0,
    functional: 0,
    analytics: 0,
    tracking: 0,
    unknown: 0,
  };
  for (const e of entries.filter((e) => e.type === 'cookie')) {
    classCounts[e.classification ?? 'unknown']++;
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🍪</span>
        <div>
          <h1 className="text-sm font-bold text-monster-400">Cookie Monster</h1>
          <p className="text-[10px] text-slate-500">{domain}</p>
        </div>
        {score && (
          <div
            className="ml-auto flex items-center justify-center w-12 h-12 rounded-full border-2 text-sm font-bold"
            style={{ borderColor: scoreColor(score.score), color: scoreColor(score.score) }}
          >
            {score.score}
          </div>
        )}
      </div>

      {/* Storage counts */}
      <div className="grid grid-cols-3 gap-2">
        {(Object.entries(typeCounts) as [StorageType, number][]).map(([type, count]) => (
          <div key={type} className="p-2 bg-slate-800/50 rounded text-center">
            <div className="text-base font-bold text-slate-200">{count}</div>
            <div className="text-[9px] text-slate-500">{STORAGE_TYPE_LABELS[type]}</div>
          </div>
        ))}
      </div>

      {/* Cookie classification */}
      <div className="space-y-1">
        <h3 className="text-[10px] text-slate-500 uppercase tracking-wide">Cookie Types</h3>
        <div className="flex gap-1 flex-wrap">
          {(Object.entries(classCounts) as [CookieClass, number][])
            .filter(([, count]) => count > 0)
            .map(([cls, count]) => (
              <span
                key={cls}
                className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                style={{
                  backgroundColor: `${COOKIE_CLASS_COLORS[cls]}20`,
                  color: COOKIE_CLASS_COLORS[cls],
                }}
              >
                {COOKIE_CLASS_LABELS[cls]}: {count}
              </span>
            ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className="flex-1 px-3 py-1.5 text-xs bg-monster-600 hover:bg-monster-500 rounded transition-colors"
        >
          💾 Export
        </button>
        <button
          onClick={handleClearAll}
          className="flex-1 px-3 py-1.5 text-xs bg-red-900/50 hover:bg-red-800/50 text-red-400 rounded transition-colors"
        >
          🗑 Clear All
        </button>
        <button
          onClick={loadData}
          className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 rounded transition-colors"
        >
          ↻
        </button>
      </div>

      <p className="text-[9px] text-slate-600 text-center">
        Open DevTools → Cookie Monster tab for full inspector
      </p>
    </div>
  );
}

export default App;
