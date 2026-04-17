import { useEffect, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { useAppStore } from '@shared/store';
import type { StorageEntry, PrivacyScore as PrivacyScoreType } from '@shared/types';
import StorageBrowser from './pages/StorageBrowser';
import Analysis from './pages/Analysis';
import DiffView from './pages/DiffView';
import ExportView from './pages/Export';
import SearchBar from './components/SearchBar';

function App() {
  const { setEntries, setCurrentDomain, setPrivacyScore, setLoading, setError } = useAppStore();
  const [activeTab, setActiveTab] = useState('browser');

  useEffect(() => {
    loadStorage();
  }, []);

  async function loadStorage() {
    setLoading(true);
    setError(null);

    try {
      const tabId = chrome.devtools.inspectedWindow.tabId;
      const response = await chrome.runtime.sendMessage({
        action: 'GET_ALL_STORAGE',
        payload: { tabId },
      });

      if (response?.success && response.data) {
        setEntries(response.data as StorageEntry[]);

        // Get current tab domain
        const tab = await chrome.tabs.get(tabId);
        const domain = tab.url ? new URL(tab.url).hostname : '';
        setCurrentDomain(domain);

        // Calculate privacy score
        const scoreResponse = await chrome.runtime.sendMessage({
          action: 'CALCULATE_PRIVACY_SCORE',
          payload: { domain, entries: response.data },
        });
        if (scoreResponse?.success && scoreResponse.data) {
          setPrivacyScore(scoreResponse.data as PrivacyScoreType);
        }
      } else {
        setError(response?.error ?? 'Failed to load storage data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-900">
        <div className="flex items-center gap-2">
          <span className="text-lg">🍪</span>
          <h1 className="text-sm font-bold text-monster-400">Cookie Monster</h1>
        </div>
        <div className="flex-1 max-w-md mx-4">
          <SearchBar />
        </div>
        <button
          onClick={loadStorage}
          className="px-3 py-1 text-xs bg-monster-600 hover:bg-monster-500 rounded transition-colors"
          title="Refresh all storage data"
        >
          ↻ Refresh
        </button>
      </header>

      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <Tabs.List className="flex border-b border-slate-700 bg-slate-900/50">
          {[
            { value: 'browser', label: '📦 Storage' },
            { value: 'analysis', label: '🔍 Analysis' },
            { value: 'diff', label: '📊 Diff' },
            { value: 'export', label: '💾 Export' },
          ].map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 border-b-2 border-transparent data-[state=active]:border-monster-500 data-[state=active]:text-monster-400 transition-colors"
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="browser" className="flex-1 overflow-auto">
          <StorageBrowser />
        </Tabs.Content>
        <Tabs.Content value="analysis" className="flex-1 overflow-auto">
          <Analysis />
        </Tabs.Content>
        <Tabs.Content value="diff" className="flex-1 overflow-auto">
          <DiffView />
        </Tabs.Content>
        <Tabs.Content value="export" className="flex-1 overflow-auto">
          <ExportView />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

export default App;
