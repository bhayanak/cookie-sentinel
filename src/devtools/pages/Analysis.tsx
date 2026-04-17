import { useAppStore } from '@shared/store';
import { COOKIE_CLASS_LABELS, COOKIE_CLASS_COLORS } from '@shared/constants';
import type { CookieClass } from '@shared/types';

function Analysis() {
  const { entries, privacyScore, currentDomain } = useAppStore();

  const cookies = entries.filter((e) => e.type === 'cookie');
  const classCounts: Record<CookieClass, number> = {
    essential: 0,
    functional: 0,
    analytics: 0,
    tracking: 0,
    unknown: 0,
  };
  for (const c of cookies) {
    const cls = c.classification ?? 'unknown';
    classCounts[cls]++;
  }

  function scoreColor(score: number): string {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  }

  return (
    <div className="p-4 space-y-6 max-w-2xl">
      {/* Privacy Score */}
      <section>
        <h2 className="text-sm font-bold text-slate-200 mb-3">Privacy Score</h2>
        {privacyScore ? (
          <div className="flex items-center gap-6">
            <div
              className="flex items-center justify-center w-20 h-20 rounded-full border-4 text-2xl font-bold"
              style={{
                borderColor: scoreColor(privacyScore.score),
                color: scoreColor(privacyScore.score),
              }}
            >
              {privacyScore.score}
            </div>
            <div className="space-y-1 text-xs text-slate-400">
              <p>
                <strong className="text-slate-300">{currentDomain}</strong>
              </p>
              <p>{privacyScore.breakdown.thirdPartyCookies} third-party cookies</p>
              <p>{privacyScore.breakdown.trackingCookies} tracking cookies</p>
              <p>{privacyScore.breakdown.totalDataSizeKB} KB total stored data</p>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-xs">No score available. Refresh storage data first.</p>
        )}
      </section>

      {/* Cookie Classification */}
      <section>
        <h2 className="text-sm font-bold text-slate-200 mb-3">Cookie Classification</h2>
        <div className="space-y-2">
          {(Object.keys(classCounts) as CookieClass[]).map((cls) => {
            const count = classCounts[cls];
            const total = cookies.length || 1;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={cls} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span style={{ color: COOKIE_CLASS_COLORS[cls] }}>
                    {COOKIE_CLASS_LABELS[cls]}
                  </span>
                  <span className="text-slate-500">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: COOKIE_CLASS_COLORS[cls],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Storage Summary */}
      <section>
        <h2 className="text-sm font-bold text-slate-200 mb-3">Storage Summary</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Cookies', count: entries.filter((e) => e.type === 'cookie').length },
            {
              label: 'LocalStorage',
              count: entries.filter((e) => e.type === 'localStorage').length,
            },
            {
              label: 'SessionStorage',
              count: entries.filter((e) => e.type === 'sessionStorage').length,
            },
            { label: 'IndexedDB', count: entries.filter((e) => e.type === 'indexedDB').length },
            {
              label: 'Cache Storage',
              count: entries.filter((e) => e.type === 'cacheStorage').length,
            },
          ].map((item) => (
            <div key={item.label} className="p-3 bg-slate-800/50 rounded">
              <div className="text-lg font-bold text-slate-200">{item.count}</div>
              <div className="text-[10px] text-slate-500">{item.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Analysis;
