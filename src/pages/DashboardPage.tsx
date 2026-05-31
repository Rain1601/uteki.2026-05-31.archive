import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  getAccount,
  getHeadlines,
  getLeaderboard,
  getOverview,
  getPositions,
  getVerdicts,
  type AccountSummary,
  type AgentVerdictRow,
  type DashboardHeadline,
  type EvalOverview,
  type LeaderboardEntry,
  type Position,
} from '../mocks/dashboard';
import { fmtNum, fmtPct, fmtUsd } from '../theme/editorialTokens';
import { useT, useI18n } from '../i18n/I18nProvider';
import { STRINGS } from '../i18n/strings';
import PageMasthead from '../components/PageMasthead';

const SLIDES = [
  { roman: 'I',   key: 'slide1' as const },
  { roman: 'II',  key: 'slide2' as const },
  { roman: 'III', key: 'slide3' as const },
  { roman: 'IV',  key: 'slide4' as const },
];

export default function DashboardPage() {
  const t = useT();
  const { lang } = useI18n();
  const [slide, setSlide] = useState(0);
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [verdicts, setVerdicts] = useState<AgentVerdictRow[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [headlines, setHeadlines] = useState<DashboardHeadline[]>([]);
  const [overview, setOverview] = useState<EvalOverview | null>(null);

  useEffect(() => {
    Promise.all([
      getAccount(),
      getPositions(),
      getVerdicts(),
      getLeaderboard(),
      getHeadlines(),
      getOverview(),
    ]).then(([a, p, v, l, h, o]) => {
      setAccount(a);
      setPositions(p);
      setVerdicts(v);
      setLeaderboard(l);
      setHeadlines(h);
      setOverview(o);
    });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') setSlide((s) => Math.min(SLIDES.length - 1, s + 1));
      if (e.key === 'ArrowLeft') setSlide((s) => Math.max(0, s - 1));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const today = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
    });
  }, [lang]);

  return (
    <div className="min-h-screen flex flex-col">
      <PageMasthead
        eyebrow={today}
        title={t(STRINGS.dashboardPage.title)}
        subtitle={`${SLIDES[slide].roman}. ${t(STRINGS.dashboardPage[SLIDES[slide].key])}`}
        right={
          <>
            <SlideTabs current={slide} setSlide={setSlide} />
            <span className="font-mono text-[10px] text-ink-faint hidden md:inline">
              {t(STRINGS.dashboardPage.keyboardHint)}
            </span>
          </>
        }
      />

      <div className="relative flex-1 px-8 md:px-12 py-8 overflow-hidden">
        <button
          aria-label="prev slide"
          disabled={slide === 0}
          onClick={() => setSlide((s) => Math.max(0, s - 1))}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-ink-faint hover:text-ink disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={28} strokeWidth={1.4} />
        </button>
        <button
          aria-label="next slide"
          disabled={slide === SLIDES.length - 1}
          onClick={() => setSlide((s) => Math.min(SLIDES.length - 1, s + 1))}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-ink-faint hover:text-ink disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronRight size={28} strokeWidth={1.4} />
        </button>

        <div className="mx-auto max-w-6xl h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
              className="h-full"
            >
              {slide === 0 && account && <Slide1NavHeadlines account={account} positions={positions} headlines={headlines} />}
              {slide === 1 && account && <Slide2Holdings positions={positions} account={account} />}
              {slide === 2 && <Slide3Verdicts verdicts={verdicts} />}
              {slide === 3 && overview && <Slide4Leaderboard leaderboard={leaderboard} overview={overview} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide counter */}
        <div className="absolute bottom-4 right-6 font-mono text-[11px] text-ink-faint tracking-widest">
          {String(slide + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
        </div>
      </div>
    </div>
  );
}

function SlideTabs({ current, setSlide }: { current: number; setSlide: (i: number) => void }) {
  const t = useT();
  return (
    <div className="flex items-center gap-4 border-l border-ink-faint/30 pl-5">
      {SLIDES.map((s, i) => (
        <button
          key={s.key}
          onClick={() => setSlide(i)}
          className={`relative font-mono text-[11px] tracking-widest transition-colors ${
            i === current ? 'text-ink' : 'text-ink-faint hover:text-ink-muted'
          }`}
        >
          {s.roman}
          <span className="ml-2 font-body italic text-[12px] hidden md:inline">
            {t(STRINGS.dashboardPage[s.key])}
          </span>
          {i === current && (
            <span className="absolute -bottom-1.5 left-0 right-0 h-px bg-accent" />
          )}
        </button>
      ))}
    </div>
  );
}

// ── Slide 1 ────────────────────────────────────────────────────────────────
function Slide1NavHeadlines({ account, positions, headlines }: { account: AccountSummary; positions: Position[]; headlines: DashboardHeadline[] }) {
  const t = useT();
  const { lang } = useI18n();
  const top3 = positions.slice(0, 3);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 h-full">
      <div className="lg:col-span-2 flex flex-col justify-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent mb-3 md:mb-4">
          {t(STRINGS.dashboardPage.nav)}
        </div>
        <div className="font-display italic-display text-[52px] sm:text-[72px] md:text-[120px] leading-[0.95] tracking-[-0.04em] text-ink break-all">
          {fmtUsd(account.nav_usd)}
        </div>
        <div className={`mt-4 md:mt-5 font-mono text-[13px] md:text-[16px] flex items-center gap-2 md:gap-3 flex-wrap ${account.today_pnl_usd >= 0 ? 'text-gain' : 'text-loss'}`}>
          {account.today_pnl_usd >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
          {fmtUsd(account.today_pnl_usd)} <span className="text-ink-faint">·</span> {fmtPct(account.today_pnl_pct)}
          <span className="text-ink-faint text-[11px] md:text-[12px] ml-1 md:ml-2">{t(STRINGS.dashboardPage.todayPnl)}</span>
        </div>
        <div className="mt-6 md:mt-12 grid grid-cols-3 gap-3 md:gap-6 text-ink-muted font-mono text-[11px] md:text-[12px]">
          <Stat label={t(STRINGS.dashboardPage.weekPnl)} value={fmtPct(account.week_pnl_pct)} positive={account.week_pnl_pct >= 0} />
          <Stat label={t(STRINGS.dashboardPage.cash)} value={fmtUsd(account.cash_usd, { compact: true })} />
          <Stat label="YTD" value={fmtPct(account.total_return_pct)} positive />
        </div>
      </div>

      <div className="lg:col-span-1 flex flex-col justify-end">
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent mb-4">
          {t(STRINGS.dashboardPage.topHeadlines)}
        </div>
        <ul className="space-y-3">
          {headlines.slice(0, 5).map((h) => (
            <li key={h.id} className="border-t border-ink-faint/25 pt-3">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="font-mono text-[10px] tracking-wider text-ink-faint">{h.source} · {h.time}</span>
                <span className={`font-mono text-[10px] uppercase tracking-wider ${
                  h.impact === 'bullish' ? 'text-gain' : h.impact === 'bearish' ? 'text-loss' : 'text-neutral'
                }`}>
                  {h.impact}
                </span>
              </div>
              <p className="font-body text-[13px] text-ink leading-snug">
                {lang === 'zh' ? h.zh : h.en}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {top3.map((p) => (
            <div key={p.symbol} className="border border-ink-faint/20 rounded p-2 text-center">
              <div className="font-mono text-[10px] text-ink-faint">{p.symbol}</div>
              <div className={`font-mono text-[12px] mt-1 ${p.day_change_pct >= 0 ? 'text-gain' : 'text-loss'}`}>
                {fmtPct(p.day_change_pct, 1)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div>
      <div className="text-ink-faint uppercase tracking-wider text-[10px] mb-1">{label}</div>
      <div className={`text-[18px] ${positive == null ? 'text-ink' : positive ? 'text-gain' : 'text-loss'}`}>{value}</div>
    </div>
  );
}

// ── Slide 2 ────────────────────────────────────────────────────────────────
function Slide2Holdings({ positions, account }: { positions: Position[]; account: AccountSummary }) {
  const t = useT();
  const { lang } = useI18n();
  const totalMv = positions.reduce((s, p) => s + p.market_value, 0);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      <div className="lg:col-span-2 flex flex-col">
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent mb-4">{t(STRINGS.dashboardPage.holdings)}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] font-body">
            <thead>
              <tr className="text-ink-faint font-mono text-[10px] uppercase tracking-wider">
                <th className="text-left py-2">{t(STRINGS.dashboardPage.symbol)}</th>
                <th className="text-right py-2">{t(STRINGS.dashboardPage.price)}</th>
                <th className="text-right py-2">{t(STRINGS.dashboardPage.marketValue)}</th>
                <th className="text-right py-2">{t(STRINGS.dashboardPage.weight)}</th>
                <th className="text-right py-2">{t(STRINGS.dashboardPage.return)}</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.symbol} className="border-t border-ink-faint/20">
                  <td className="py-2.5">
                    <div className="font-mono text-ink text-[13px]">{p.symbol}</div>
                    <div className="text-ink-faint text-[11px]">{lang === 'zh' ? p.name_zh : p.name_en}</div>
                  </td>
                  <td className="py-2.5 text-right font-mono text-ink">{fmtUsd(p.price)}</td>
                  <td className="py-2.5 text-right font-mono text-ink">{fmtUsd(p.market_value, { compact: true })}</td>
                  <td className="py-2.5 text-right font-mono text-ink-muted">{p.weight_pct.toFixed(2)}%</td>
                  <td className={`py-2.5 text-right font-mono ${p.return_pct >= 0 ? 'text-gain' : 'text-loss'}`}>
                    {fmtPct(p.return_pct, 1)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-ink-faint/40 text-ink-muted font-mono text-[11px]">
                <td className="py-3">{t(STRINGS.dashboardPage.cash)}</td>
                <td colSpan={2} className="py-3 text-right">{fmtUsd(account.cash_usd)}</td>
                <td colSpan={2} className="py-3 text-right">{((account.cash_usd / account.nav_usd) * 100).toFixed(2)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="lg:col-span-1 flex flex-col items-center justify-center">
        <PortfolioPie positions={positions} totalMv={totalMv} />
        <div className="mt-4 font-mono text-[10px] text-ink-faint tracking-widest uppercase">
          {fmtUsd(totalMv, { compact: true })} {t(STRINGS.dashboardPage.holdings)}
        </div>
      </div>
    </div>
  );
}

function PortfolioPie({ positions, totalMv }: { positions: Position[]; totalMv: number }) {
  const colors = ['#6FAF8D', '#A8896E', '#C9A97E', '#9C6B5F', '#5B7B6A', '#7B6F5C', '#A0524A', '#658D7C', '#B8A380'];
  const cx = 110, cy = 110, r = 92;
  let acc = 0;
  const segments = positions.map((p, i) => {
    const start = acc / totalMv * Math.PI * 2;
    acc += p.market_value;
    const end = acc / totalMv * Math.PI * 2;
    const x1 = cx + r * Math.sin(start);
    const y1 = cy - r * Math.cos(start);
    const x2 = cx + r * Math.sin(end);
    const y2 = cy - r * Math.cos(end);
    const large = end - start > Math.PI ? 1 : 0;
    return { d: `M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${large} 1 ${x2},${y2} Z`, color: colors[i % colors.length], symbol: p.symbol };
  });
  return (
    <svg viewBox="0 0 220 220" width="220" height="220">
      {segments.map((s, i) => (
        <path key={i} d={s.d} fill={s.color} opacity={0.86} stroke="#15130F" strokeWidth={1} />
      ))}
      <circle cx={cx} cy={cy} r={48} fill="#15130F" />
      <text x={cx} y={cy + 5} textAnchor="middle" fill="#A8896E" fontFamily="Fraunces, serif" fontSize={20} fontStyle="italic">u</text>
    </svg>
  );
}

// ── Slide 3 ────────────────────────────────────────────────────────────────
function Slide3Verdicts({ verdicts }: { verdicts: AgentVerdictRow[] }) {
  const t = useT();
  const { lang } = useI18n();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent mb-4">{t(STRINGS.dashboardPage.recentVerdicts)}</div>
        <ul className="space-y-3">
          {verdicts.map((v) => (
            <li key={v.symbol + v.hours_ago} className="border-t border-ink-faint/25 pt-3">
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-ink text-[14px]">{v.symbol}</span>
                  <span className={`font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                    v.action === 'BUY' ? 'border-gain/50 text-gain' :
                    v.action === 'AVOID' ? 'border-loss/50 text-loss' :
                    'border-neutral/50 text-neutral'
                  }`}>
                    {v.action}
                  </span>
                  <span className="font-mono text-ink-muted text-[11px]">· {v.conviction.toFixed(2)}</span>
                </div>
                <span className="font-mono text-[10px] text-ink-faint">{v.hours_ago}h · {v.model}</span>
              </div>
              <p className="font-body italic text-[13px] text-ink-muted leading-snug">
                {lang === 'zh' ? v.one_sentence_zh : v.one_sentence_en}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent mb-4">{t(STRINGS.dashboardPage.buyOpportunities)}</div>
        <div className="space-y-3">
          {verdicts.filter((v) => v.action === 'BUY').map((v) => (
            <div key={v.symbol} className="rounded border border-gain/30 bg-gain/5 p-4">
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <span className="font-display italic-display text-[24px] text-ink">{v.symbol}</span>
                <span className="font-mono text-[11px] text-gain">conviction {v.conviction.toFixed(2)}</span>
              </div>
              <p className="font-body text-[13px] text-ink-muted leading-snug">
                {lang === 'zh' ? v.one_sentence_zh : v.one_sentence_en}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Slide 4 ────────────────────────────────────────────────────────────────
function Slide4Leaderboard({ leaderboard, overview }: { leaderboard: LeaderboardEntry[]; overview: EvalOverview }) {
  const t = useT();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent mb-4">KPI</div>
        <div className="space-y-6">
          <KpiRow label={t(STRINGS.dashboardPage.decisions)} value={overview.total_decisions.toString()} />
          <KpiRow label={t(STRINGS.dashboardPage.winRate)} value={fmtPct(overview.avg_win_rate * 100, 1)} positive />
          <KpiRow label="Best Model" value={overview.best_model.replace('claude-', '').replace('-', ' ')} />
          <KpiRow label="Total Cost" value={fmtUsd(overview.total_cost_usd)} />
          <KpiRow label="Avg Latency" value={`${(overview.avg_latency_ms / 1000).toFixed(1)}s`} />
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent mb-4">Leaderboard</div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-ink-faint font-mono text-[10px] uppercase tracking-wider">
              <th className="text-left py-2">{t(STRINGS.dashboardPage.rank)}</th>
              <th className="text-left py-2">{t(STRINGS.dashboardPage.model)}</th>
              <th className="text-right py-2">{t(STRINGS.dashboardPage.decisions)}</th>
              <th className="text-right py-2">{t(STRINGS.dashboardPage.winRate)}</th>
              <th className="text-right py-2">{t(STRINGS.dashboardPage.avgReturn)}</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((m) => (
              <tr key={m.id} className="border-t border-ink-faint/20">
                <td className="py-3 font-display italic-display text-[22px] text-ink">{m.rank}</td>
                <td className="py-3">
                  <div className="font-mono text-ink">{m.model_name}</div>
                  <div className="text-ink-faint text-[10px] uppercase tracking-wider">{m.model_provider}</div>
                </td>
                <td className="py-3 text-right font-mono text-ink-muted">{m.total_decisions}</td>
                <td className="py-3 text-right font-mono text-gain">{fmtPct(m.win_rate * 100, 1)}</td>
                <td className="py-3 text-right font-mono text-gain">{fmtPct(m.avg_return_pct, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KpiRow({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="border-t border-ink-faint/25 pt-3">
      <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">{label}</div>
      <div className={`font-display italic-display text-[28px] mt-1 ${positive ? 'text-gain' : 'text-ink'}`}>
        {value}
      </div>
    </div>
  );
}

// silence "unused parameter" warnings from fmtNum re-export safety
void fmtNum;
