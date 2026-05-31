import { useState } from 'react';
import { useT, useI18n } from '../../i18n/I18nProvider';
import { STRINGS } from '../../i18n/strings';
import { fmtPct } from '../../theme/editorialTokens';

interface Holding {
  symbol: string;
  name_zh: string;
  name_en: string;
  alloc_pct: number;   // re-normalized to 100% across the 3 holdings
  return_pct: number;
}

// Companies only (ETFs are excluded per the live-portfolio framing).
// Allocations are re-normalized so the 3 companies sum to 100%.
const HOLDINGS: Holding[] = [
  { symbol: 'GOOGL', name_zh: '谷歌',     name_en: 'Alphabet',     alloc_pct: 66.0, return_pct: 23.13 },
  { symbol: 'TSM',   name_zh: '台积电',   name_en: 'Taiwan Semi',  alloc_pct: 17.0, return_pct: 12.97 },
  { symbol: 'NVDA',  name_zh: '英伟达',   name_en: 'NVIDIA',       alloc_pct: 17.0, return_pct: 6.60  },
];

const PIE_COLORS = ['#A8896E', '#6FAF8D', '#9C6B5F'];

export default function HoldingsPanel() {
  const t = useT();
  const { lang } = useI18n();
  const [hovered, setHovered] = useState<number | null>(null);

  const weighted = HOLDINGS.reduce((sum, h) => sum + (h.alloc_pct / 100) * h.return_pct, 0);
  const top = HOLDINGS.reduce((a, b) => (a.return_pct >= b.return_pct ? a : b));
  const totalAlloc = HOLDINGS.reduce((s, h) => s + h.alloc_pct, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 md:gap-8">
      {/* Left: hero KPIs + holdings table */}
      <div>
        <div className="flex items-baseline gap-5 md:gap-10 flex-wrap mb-6 md:mb-8">
          <KpiBig label={t(STRINGS.perf.weightedYtd)} value={fmtPct(weighted, 2)} positive={weighted >= 0} />
          <KpiSmall label={t(STRINGS.perf.bestPerformer)} value={`${top.symbol} · ${fmtPct(top.return_pct, 2)}`} positive />
          <KpiSmall label={t(STRINGS.perf.holdings)} value={`${HOLDINGS.length}`} />
        </div>

        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent mb-3">{t(STRINGS.perf.holdings)}</div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-ink-faint font-mono text-[10px] uppercase tracking-wider">
              <th className="text-left py-2">ticker</th>
              <th className="text-right py-2">{t(STRINGS.perf.allocation)}</th>
              <th className="text-right py-2">{t(STRINGS.perf.return)}</th>
            </tr>
          </thead>
          <tbody>
            {HOLDINGS.map((h, i) => {
              const isActive = hovered === i;
              return (
                <tr
                  key={h.symbol}
                  className={`border-t border-ink-faint/20 transition-colors ${isActive ? 'bg-[#23191a]' : ''}`}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <div>
                        <div className="font-mono text-ink text-[14px]">{h.symbol}</div>
                        <div className="text-ink-faint text-[11px]">{lang === 'zh' ? h.name_zh : h.name_en}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <div className="font-mono text-ink-muted">{h.alloc_pct.toFixed(1)}%</div>
                    <div className="mt-1 h-1 bg-ink-faint/15 rounded-sm overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${(h.alloc_pct / Math.max(...HOLDINGS.map((x) => x.alloc_pct))) * 100}%`,
                          background: PIE_COLORS[i],
                        }}
                      />
                    </div>
                  </td>
                  <td className={`py-3 text-right font-mono ${h.return_pct >= 0 ? 'text-gain' : 'text-loss'}`}>
                    {fmtPct(h.return_pct, 2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Right: interactive donut + caption */}
      <div className="flex flex-col items-center justify-center mt-2 md:mt-0">
        <Donut
          holdings={HOLDINGS}
          totalAlloc={totalAlloc}
          colors={PIE_COLORS}
          hovered={hovered}
          setHovered={setHovered}
        />
        <p className="mt-4 md:mt-6 font-body italic text-[12px] md:text-[12.5px] text-ink-faint text-center max-w-xs leading-relaxed px-4">
          {lang === 'zh'
            ? '只显示个股持仓，配比已归一化至 100%。具体仓位规模不公开。'
            : 'Showing single-stock positions only, allocations renormalized to 100%. Absolute sizes not disclosed.'}
        </p>
      </div>
    </div>
  );
}

function KpiBig({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-faint mb-1.5 md:mb-2">{label}</div>
      <div className={`font-display italic-display text-[44px] sm:text-[54px] md:text-[72px] leading-none ${positive ? 'text-gain' : 'text-loss'}`}>
        {value}
      </div>
    </div>
  );
}

function KpiSmall({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="border-l-2 border-ink-faint/30 pl-3">
      <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint mb-1">{label}</div>
      <div className={`font-display italic-display text-[20px] leading-none ${positive ? 'text-gain' : 'text-ink'}`}>{value}</div>
    </div>
  );
}

function Donut({
  holdings, totalAlloc, colors, hovered, setHovered,
}: {
  holdings: Holding[];
  totalAlloc: number;
  colors: string[];
  hovered: number | null;
  setHovered: (i: number | null) => void;
}) {
  const cx = 130, cy = 130, r = 105, ir = 64;
  let acc = 0;
  const segments = holdings.map((h, i) => {
    const start = (acc / totalAlloc) * Math.PI * 2;
    acc += h.alloc_pct;
    const end = (acc / totalAlloc) * Math.PI * 2;
    const x1 = cx + r * Math.sin(start);
    const y1 = cy - r * Math.cos(start);
    const x2 = cx + r * Math.sin(end);
    const y2 = cy - r * Math.cos(end);
    const ix1 = cx + ir * Math.sin(end);
    const iy1 = cy - ir * Math.cos(end);
    const ix2 = cx + ir * Math.sin(start);
    const iy2 = cy - ir * Math.cos(start);
    const large = end - start > Math.PI ? 1 : 0;
    return {
      d: `M ${x1},${y1} A ${r},${r} 0 ${large} 1 ${x2},${y2} L ${ix1},${iy1} A ${ir},${ir} 0 ${large} 0 ${ix2},${iy2} Z`,
      color: colors[i % colors.length],
      symbol: h.symbol,
      alloc: h.alloc_pct,
      return_pct: h.return_pct,
    };
  });

  const center = hovered != null ? holdings[hovered] : null;

  return (
    <svg viewBox="0 0 260 260" width="240" height="240" aria-label="portfolio allocation">
      {segments.map((s, i) => {
        const isActive = hovered === i;
        const isDimmed = hovered != null && hovered !== i;
        return (
          <path
            key={i}
            d={s.d}
            fill={s.color}
            opacity={isDimmed ? 0.32 : isActive ? 1 : 0.92}
            stroke="#15130F"
            strokeWidth={isActive ? 2 : 1.2}
            style={{ cursor: 'pointer', transition: 'opacity 160ms' }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setHovered(hovered === i ? null : i)}
          />
        );
      })}
      {center ? (
        <>
          <text x={cx} y={cy - 8} textAnchor="middle" fill="#A8A097" fontSize={10} fontFamily="JetBrains Mono">
            {center.symbol}
          </text>
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            fill={center.return_pct >= 0 ? '#6FAF8D' : '#B0524A'}
            fontSize={18}
            fontStyle="italic"
            fontFamily="Fraunces, serif"
          >
            {center.return_pct >= 0 ? '+' : ''}{center.return_pct.toFixed(2)}%
          </text>
          <text x={cx} y={cy + 26} textAnchor="middle" fill="#5C5750" fontSize={9} fontFamily="JetBrains Mono">
            {center.alloc_pct.toFixed(1)}% alloc
          </text>
        </>
      ) : (
        <>
          <text x={cx} y={cy - 4} textAnchor="middle" fill="#A8A097" fontSize={10} fontFamily="JetBrains Mono">portfolio</text>
          <text x={cx} y={cy + 14} textAnchor="middle" fill="#F4ECDF" fontSize={18} fontStyle="italic" fontFamily="Fraunces, serif">100%</text>
        </>
      )}
    </svg>
  );
}
