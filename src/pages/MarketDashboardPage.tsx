import { useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import {
  getOverview,
  getSectors,
  getStyleComparisons,
  type CategoryData,
  type Indicator,
  type SectorETF,
  type Signal,
  type StyleComparison,
} from '../mocks/market';
import { useT, useI18n } from '../i18n/I18nProvider';
import { STRINGS } from '../i18n/strings';
import PageMasthead from '../components/PageMasthead';
import { fmtNum, fmtPct } from '../theme/editorialTokens';

const SIGNAL_COLOR: Record<Signal, string> = {
  green: '#6FAF8D',
  yellow: '#C9A97E',
  red: '#B0524A',
  neutral: '#A8A097',
};

export default function MarketDashboardPage() {
  const t = useT();
  const { lang } = useI18n();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [sectors, setSectors] = useState<SectorETF[]>([]);
  const [styles, setStyles] = useState<StyleComparison[]>([]);

  useEffect(() => {
    Promise.all([getOverview(), getSectors(), getStyleComparisons()]).then(([c, s, st]) => {
      setCategories(c); setSectors(s); setStyles(st);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <PageMasthead
        eyebrow={lang === 'zh' ? '宏观盘面 / 每日刷新' : 'Macro Tape / Daily refresh'}
        title={t(STRINGS.marketPage.title)}
        subtitle={t(STRINGS.marketPage.subtitle)}
      />

      <div className="px-8 md:px-12 py-8 max-w-7xl mx-auto w-full">
        {/* 3 hero signal cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {categories.map((c) => (
            <SignalCard key={c.category} cat={c} />
          ))}
        </section>

        {/* Sector performance */}
        <section className="mt-12">
          <SectionHeading
            roman="§ 02"
            title={t(STRINGS.marketPage.sectorPerf)}
            subtitle={lang === 'zh' ? '今日 11 个行业 ETF 表现' : 'Today across 11 sector ETFs'}
          />
          <SectorBars sectors={sectors} />
        </section>

        {/* Style rotation */}
        <section className="mt-12 mb-16">
          <SectionHeading
            roman="§ 03"
            title={t(STRINGS.marketPage.styleRotation)}
            subtitle={lang === 'zh' ? '风格对比' : 'Style pairs'}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {styles.map((s, i) => <StyleRow key={i} s={s} />)}
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHeading({ roman, title, subtitle }: { roman: string; title: string; subtitle: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3 flex-wrap">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent mb-1">{roman}</div>
        <h2 className="font-display italic-display text-[24px] text-ink leading-tight">{title}</h2>
      </div>
      <p className="font-body text-[12px] text-ink-faint">{subtitle}</p>
    </div>
  );
}

function SignalCard({ cat }: { cat: CategoryData }) {
  const t = useT();
  const { lang } = useI18n();
  const sigLabelMap: Record<Signal, string> = {
    green: t(STRINGS.marketPage.bullish),
    yellow: t(STRINGS.marketPage.neutral),
    red: t(STRINGS.marketPage.bearish),
    neutral: t(STRINGS.marketPage.neutral),
  };
  const heroColor = SIGNAL_COLOR[cat.signal];
  const titleStr = lang === 'zh'
    ? cat.category === 'valuation' ? STRINGS.marketPage.valuation : cat.category === 'liquidity' ? STRINGS.marketPage.liquidity : STRINGS.marketPage.flow
    : cat.category === 'valuation' ? STRINGS.marketPage.valuation : cat.category === 'liquidity' ? STRINGS.marketPage.liquidity : STRINGS.marketPage.flow;

  return (
    <div className="rounded border border-ink-faint/30 bg-[#1a1612]/60 p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-faint">
          {t(titleStr)}
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: heroColor }} />
          <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: heroColor }}>
            {sigLabelMap[cat.signal]}
          </span>
        </span>
      </div>
      <p className="font-display italic text-[14px] text-ink-muted mb-4">
        {lang === 'zh' ? cat.question_zh : cat.question_en}
      </p>
      <div className="font-display italic-display text-[44px] leading-none text-ink mb-1">
        {fmtNum(cat.hero.value, { digits: cat.hero.unit === 'T' ? 2 : 1 })}
        {cat.hero.unit && <span className="font-mono text-[16px] text-ink-muted ml-1">{cat.hero.unit}</span>}
      </div>
      <div className="font-mono text-[11px] text-ink-faint mb-3">
        {lang === 'zh' ? cat.hero.name_zh : cat.hero.name_en}
        {cat.hero.change_pct != null && (
          <span className={`ml-2 ${cat.hero.change_pct >= 0 ? 'text-gain' : 'text-loss'}`}>{fmtPct(cat.hero.change_pct, 2)}</span>
        )}
      </div>

      {cat.hero.history && (
        <div className="h-16 -mx-2 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cat.hero.history} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
              <defs>
                <linearGradient id={`grad_${cat.category}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={heroColor} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={heroColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip contentStyle={{ background: '#1B1814', border: `1px solid ${heroColor}55`, borderRadius: 4, fontFamily: 'JetBrains Mono', fontSize: 11 }} />
              <Area dataKey="value" stroke={heroColor} strokeWidth={1.4} fill={`url(#grad_${cat.category})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <ul className="mt-4 space-y-2">
        {cat.indicators.map((ind: Indicator) => (
          <li key={ind.id} className="flex items-baseline justify-between border-t border-ink-faint/15 pt-2">
            <span className="font-body text-[12px] text-ink-muted truncate">
              {lang === 'zh' ? ind.name_zh : ind.name_en}
            </span>
            <span className="font-mono text-[12px] text-ink whitespace-nowrap ml-2">
              {fmtNum(ind.value, { digits: ind.unit === 'T' ? 3 : 2 })}{ind.unit ? ` ${ind.unit}` : ''}
              <span
                className={`ml-2 text-[10px] ${ind.change_pct == null ? 'text-ink-faint' : ind.change_pct >= 0 ? 'text-gain' : 'text-loss'}`}
              >
                {ind.change_pct != null ? fmtPct(ind.change_pct, 2) : ''}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectorBars({ sectors }: { sectors: SectorETF[] }) {
  const { lang } = useI18n();
  const max = Math.max(...sectors.map((s) => Math.abs(s.change_pct)));
  return (
    <div className="rounded border border-ink-faint/30 bg-[#1a1612]/60 p-5">
      <div className="space-y-2">
        {sectors.map((s) => {
          const pct = (Math.abs(s.change_pct) / max) * 50;
          const isUp = s.change_pct >= 0;
          return (
            <div key={s.symbol} className="grid grid-cols-[110px_1fr_70px] items-center gap-3 font-mono text-[12px]">
              <div className="text-ink-muted truncate">
                <span className="text-ink">{s.symbol}</span>
                <span className="text-ink-faint ml-2 text-[10px]">{lang === 'zh' ? s.name_zh : s.name_en}</span>
              </div>
              <div className="relative h-3 bg-[#2a221c]/40 rounded-sm">
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-ink-faint/60" />
                <div
                  className="absolute top-0 bottom-0 rounded-sm"
                  style={{
                    left: isUp ? '50%' : `calc(50% - ${pct}%)`,
                    width: `${pct}%`,
                    background: isUp ? '#6FAF8D' : '#B0524A',
                    opacity: 0.7,
                  }}
                />
              </div>
              <div className={`text-right ${isUp ? 'text-gain' : 'text-loss'}`}>{fmtPct(s.change_pct, 2)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StyleRow({ s }: { s: StyleComparison }) {
  const { lang } = useI18n();
  const winner = s.a.change_pct >= s.b.change_pct ? 'a' : 'b';
  return (
    <div className="rounded border border-ink-faint/30 bg-[#1a1612]/60 p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-faint mb-3">
        {lang === 'zh' ? s.label_zh : s.label_en}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SidePanel name={lang === 'zh' ? s.a.name_zh : s.a.name_en} symbol={s.a.symbol} pct={s.a.change_pct} highlight={winner === 'a'} />
        <SidePanel name={lang === 'zh' ? s.b.name_zh : s.b.name_en} symbol={s.b.symbol} pct={s.b.change_pct} highlight={winner === 'b'} />
      </div>
    </div>
  );
}

function SidePanel({ name, symbol, pct, highlight }: { name: string; symbol: string; pct: number; highlight: boolean }) {
  return (
    <div className={`p-3 rounded ${highlight ? 'bg-[#23191a]' : 'bg-transparent'}`}>
      <div className="font-mono text-[10px] text-ink-faint">{symbol}</div>
      <div className="font-display italic text-[13px] text-ink mb-1">{name}</div>
      <div className={`font-mono text-[18px] ${pct >= 0 ? 'text-gain' : 'text-loss'}`}>{fmtPct(pct, 2)}</div>
    </div>
  );
}
