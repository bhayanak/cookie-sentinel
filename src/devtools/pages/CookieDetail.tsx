import type { StorageEntry, CookieMetadata } from '@shared/types';
import TypeBadge from '../components/TypeBadge';
import ClassBadge from '../components/ClassBadge';
import { formatExpiry, formatBytes, isSensitiveName, maskValue } from '@shared/utils';
import { useState } from 'react';

interface CookieDetailProps {
  entry: StorageEntry;
  onClose: () => void;
}

function CookieDetail({ entry, onClose }: CookieDetailProps) {
  const [revealed, setRevealed] = useState(false);
  const isSensitive = entry.type === 'cookie' && isSensitiveName(entry.key);
  const displayValue = isSensitive && !revealed ? maskValue(entry.value) : entry.value;

  return (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-200 truncate">{entry.key}</h2>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xs">
          ✕
        </button>
      </div>

      {/* Badges */}
      <div className="flex gap-2">
        <TypeBadge type={entry.type} />
        {entry.classification && <ClassBadge classification={entry.classification} />}
      </div>

      {/* Value */}
      <div>
        <label className="text-[10px] text-slate-500 uppercase tracking-wide">Value</label>
        <div className="mt-1 relative">
          <pre className="p-2 bg-slate-800 rounded text-xs text-slate-300 whitespace-pre-wrap break-all max-h-40 overflow-auto">
            {displayValue}
          </pre>
          {isSensitive && (
            <button
              onClick={() => setRevealed(!revealed)}
              className="absolute top-1 right-1 text-[10px] text-slate-500 hover:text-slate-300"
            >
              {revealed ? '🙈 Hide' : '👁 Reveal'}
            </button>
          )}
        </div>
      </div>

      {/* Domain */}
      <DetailRow label="Domain" value={entry.domain} />

      {/* Cookie-specific metadata */}
      {entry.type === 'cookie' && renderCookieMetadata(entry.metadata as CookieMetadata)}

      {/* Size */}
      <DetailRow label="Size" value={formatBytes((entry.metadata as { size: number }).size)} />
    </div>
  );
}

function renderCookieMetadata(meta: CookieMetadata) {
  return (
    <>
      <DetailRow label="Path" value={meta.path} />
      <DetailRow label="Secure" value={meta.secure ? '✅ Yes' : '❌ No'} />
      <DetailRow label="HttpOnly" value={meta.httpOnly ? '✅ Yes' : '❌ No'} />
      <DetailRow label="SameSite" value={meta.sameSite} />
      <DetailRow label="Expires" value={formatExpiry(meta.expirationDate)} />
      <DetailRow label="Host Only" value={meta.hostOnly ? 'Yes' : 'No'} />
      <DetailRow label="Session" value={meta.session ? 'Yes' : 'No'} />
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-300 font-mono text-right truncate ml-2 max-w-[180px]">
        {value}
      </span>
    </div>
  );
}

export default CookieDetail;
