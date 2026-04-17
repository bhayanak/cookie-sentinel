import { useState } from 'react';
import { useAppStore } from '@shared/store';
import type { SnapshotDiff as SnapshotDiffType, StorageSnapshot } from '@shared/types';
import DiffHighlight from '../components/DiffHighlight';

function DiffView() {
  const { snapshots, addSnapshot, currentDomain } = useAppStore();
  const [selectedA, setSelectedA] = useState<string>('');
  const [selectedB, setSelectedB] = useState<string>('');
  const [diff, setDiff] = useState<SnapshotDiffType | null>(null);
  const [taking, setTaking] = useState(false);

  async function takeNewSnapshot() {
    setTaking(true);
    try {
      const tabId = chrome.devtools.inspectedWindow.tabId;
      const response = await chrome.runtime.sendMessage({
        action: 'TAKE_SNAPSHOT',
        payload: { tabId, domain: currentDomain },
      });
      if (response?.success && response.data) {
        addSnapshot(response.data as StorageSnapshot);
      }
    } finally {
      setTaking(false);
    }
  }

  async function compareDiff() {
    if (!selectedA || !selectedB) return;
    const response = await chrome.runtime.sendMessage({
      action: 'DIFF_SNAPSHOTS',
      payload: { id1: selectedA, id2: selectedB },
    });
    if (response?.success && response.data) {
      setDiff(response.data as SnapshotDiffType);
    }
  }

  return (
    <div className="p-4 space-y-4 max-w-2xl">
      <h2 className="text-sm font-bold text-slate-200">Storage Snapshots & Diff</h2>

      <button
        onClick={takeNewSnapshot}
        disabled={taking}
        className="px-3 py-1.5 text-xs bg-monster-600 hover:bg-monster-500 rounded disabled:opacity-50 transition-colors"
      >
        {taking ? 'Taking snapshot…' : '📸 Take Snapshot'}
      </button>

      {/* Snapshot list */}
      {snapshots.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-slate-500">{snapshots.length} snapshot(s) captured</p>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 block mb-1">Snapshot A (before)</label>
              <select
                value={selectedA}
                onChange={(e) => setSelectedA(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-slate-800 border border-slate-600 rounded text-slate-300"
              >
                <option value="">Select…</option>
                {snapshots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {new Date(s.timestamp).toLocaleTimeString()} ({s.entries.length} entries)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 block mb-1">Snapshot B (after)</label>
              <select
                value={selectedB}
                onChange={(e) => setSelectedB(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-slate-800 border border-slate-600 rounded text-slate-300"
              >
                <option value="">Select…</option>
                {snapshots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {new Date(s.timestamp).toLocaleTimeString()} ({s.entries.length} entries)
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={compareDiff}
            disabled={!selectedA || !selectedB}
            className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 transition-colors"
          >
            Compare
          </button>
        </div>
      )}

      {/* Diff results */}
      {diff && <DiffHighlight diff={diff} />}

      {snapshots.length === 0 && (
        <p className="text-slate-500 text-xs">
          Take snapshots before and after page actions to compare storage changes.
        </p>
      )}
    </div>
  );
}

export default DiffView;
