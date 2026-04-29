import { useState } from 'react';
import { useAppStore } from '@shared/store';
import { exportToJSON, exportToNetscape, parseImportJSON } from '@shared/utils';

function ExportView() {
  const { entries, currentDomain, setEntries } = useAppStore();
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [exported, setExported] = useState(false);
  const [exportedTxt, setExportedTxt] = useState(false);

  const cookieCount = entries.filter((e) => e.type === 'cookie').length;

  function handleExport() {
    const json = exportToJSON(entries, currentDomain);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cookie-monster-${currentDomain}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  }

  function handleExportNetscape() {
    const txt = exportToNetscape(entries);
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cookies.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setExportedTxt(true);
    setTimeout(() => setExportedTxt(false), 2000);
  }

  function handleImport() {
    setImportError(null);
    const parsed = parseImportJSON(importText);
    if (!parsed) {
      setImportError('Invalid JSON format. Expected { entries: [...] }');
      return;
    }
    setEntries(parsed);
    setImportText('');
  }

  return (
    <div className="p-4 space-y-6 max-w-2xl">
      {/* Export */}
      <section>
        <h2 className="text-sm font-bold text-slate-200 mb-2">Export Storage</h2>
        <p className="text-xs text-slate-500 mb-3">
          ⚠️ Exported data may contain session tokens and sensitive values. Handle with care.
        </p>
        <button
          onClick={handleExport}
          disabled={entries.length === 0}
          className="px-4 py-2 text-xs bg-monster-600 hover:bg-monster-500 rounded disabled:opacity-50 transition-colors"
        >
          {exported ? '✅ Downloaded!' : `💾 Export ${entries.length} entries as JSON`}
        </button>
        <button
          onClick={handleExportNetscape}
          disabled={cookieCount === 0}
          className="ml-2 px-4 py-2 text-xs bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 transition-colors"
        >
          {exportedTxt ? '✅ Downloaded!' : `📄 Export ${cookieCount} cookies as cookies.txt`}
        </button>
      </section>

      {/* Import */}
      <section>
        <h2 className="text-sm font-bold text-slate-200 mb-2">Import Storage</h2>
        <p className="text-xs text-slate-500 mb-3">
          Paste a previously exported JSON to load entries for inspection.
        </p>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Paste JSON here…"
          className="w-full h-32 px-3 py-2 text-xs bg-slate-800 border border-slate-600 rounded focus:outline-none focus:border-monster-500 text-slate-300 placeholder-slate-600 font-mono resize-y"
        />
        {importError && <p className="text-red-400 text-xs mt-1">{importError}</p>}
        <button
          onClick={handleImport}
          disabled={!importText.trim()}
          className="mt-2 px-4 py-2 text-xs bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 transition-colors"
        >
          📥 Import
        </button>
      </section>
    </div>
  );
}

export default ExportView;
