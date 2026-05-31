import { useEffect, useRef, useState } from 'react';
import { Play, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SCRIPTS,
  gateName,
  listRecentRuns,
  runCompanyAnalysis,
  type CompanyEvent,
  type CompanyMeta,
  type CompanyScript,
  type CompletedRow,
} from '../mocks/company';
import { useT, useI18n } from '../i18n/I18nProvider';
import { STRINGS } from '../i18n/strings';
import PageMasthead from '../components/PageMasthead';
import { fmtPct } from '../theme/editorialTokens';

interface ActiveRun {
  symbol: string;
  meta?: CompanyMeta;
  currentGate: number;
  gateText: string[];
  gateLatency: Record<number, number>;
  gateParsed: Record<number, Record<string, string>>;
  toolCall?: string;
  status: 'starting' | 'running' | 'complete' | 'aborted';
  verdict?: CompanyScript['verdict'];
  totalLatencyMs?: number;
  analysisId?: string;
}

const TICKERS = Object.keys(SCRIPTS);

export default function CompanyAgentStudio() {
  const t = useT();
  const { lang } = useI18n();
  const [active, setActive] = useState<Record<string, ActiveRun>>({});
  const [recent, setRecent] = useState<CompletedRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const aborts = useRef<Record<string, AbortController>>({});

  useEffect(() => { listRecentRuns().then(setRecent); }, []);

  function startRun(symbol: string) {
    if (active[symbol] && active[symbol].status === 'running') return;
    const ac = new AbortController();
    aborts.current[symbol] = ac;
    setActive((a) => ({
      ...a,
      [symbol]: { symbol, currentGate: 0, gateText: [], gateLatency: {}, gateParsed: {}, status: 'starting' },
    }));
    setSelected(symbol);

    (async () => {
      try {
        for await (const ev of runCompanyAnalysis(symbol, lang, ac.signal) as AsyncGenerator<CompanyEvent>) {
          setActive((a) => {
            const cur = a[symbol];
            if (!cur) return a;
            const next: ActiveRun = { ...cur };
            switch (ev.type) {
              case 'data_loaded':
                next.meta = ev.meta;
                next.analysisId = ev.analysis_id;
                next.status = 'running';
                break;
              case 'gate_start':
                next.currentGate = ev.gate;
                next.gateText = [...next.gateText, ''];
                next.toolCall = undefined;
                break;
              case 'tool_call':
                next.toolCall = ev.tool;
                break;
              case 'gate_text': {
                const idx = ev.gate - 1;
                const arr = [...next.gateText];
                arr[idx] = (arr[idx] ?? '') + ev.chunk;
                next.gateText = arr;
                break;
              }
              case 'gate_complete':
                next.gateLatency = { ...next.gateLatency, [ev.gate]: ev.latency_ms };
                next.gateParsed = { ...next.gateParsed, [ev.gate]: ev.parsed };
                next.toolCall = undefined;
                break;
              case 'result':
                next.status = 'complete';
                next.verdict = ev.verdict;
                next.totalLatencyMs = ev.total_latency_ms;
                next.meta = ev.meta;
                break;
              case 'error':
                next.status = 'aborted';
                break;
            }
            return { ...a, [symbol]: next };
          });
        }
      } catch {/* aborted */}
    })();
  }

  function abortRun(symbol: string) {
    aborts.current[symbol]?.abort();
    setActive((a) => a[symbol] ? { ...a, [symbol]: { ...a[symbol], status: 'aborted' } } : a);
  }

  const selectedRun = selected ? active[selected] : null;

  // Mobile-only tab — auto-switch to "active" when a run starts
  const [mobileTab, setMobileTab] = useState<'watchlist' | 'active' | 'log'>('watchlist');
  useEffect(() => {
    if (selected && active[selected]) setMobileTab('active');
  }, [selected, active]);

  return (
    <div className="min-h-screen flex flex-col">
      <PageMasthead
        eyebrow={lang === 'zh' ? '七关流水线' : 'Seven-gate pipeline'}
        title={t(STRINGS.companyPage.title)}
        subtitle={t(STRINGS.companyPage.subtitle)}
      />

      {/* Mobile tab switcher (lg+ hidden) */}
      <div className="lg:hidden flex border-b border-ink-faint/25 px-4">
        {(['watchlist', 'active', 'log'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-3 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
              mobileTab === tab ? 'text-ink border-b-2 border-accent' : 'text-ink-muted'
            }`}
          >
            {tab === 'watchlist' ? t(STRINGS.companyPage.watchlist) :
             tab === 'active'    ? t(STRINGS.companyPage.queue) :
                                   t(STRINGS.companyPage.log)}
          </button>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-0 overflow-hidden">
        {/* Watchlist */}
        <aside className={`border-r border-ink-faint/25 overflow-y-auto ${mobileTab === 'watchlist' ? '' : 'hidden lg:block'}`}>
          <div className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent mb-3">
              {t(STRINGS.companyPage.watchlist)}
            </div>
            <ul className="space-y-2">
              {TICKERS.map((sym) => {
                const script = SCRIPTS[sym];
                const run = active[sym];
                const isRunning = run?.status === 'running' || run?.status === 'starting';
                const isComplete = run?.status === 'complete';
                const verdict = run?.verdict?.action;
                const swatch = verdict === 'BUY' ? '#6FAF8D' : verdict === 'AVOID' ? '#B0524A' : verdict === 'WATCH' ? '#C9A97E' : 'transparent';
                return (
                  <li
                    key={sym}
                    onClick={() => setSelected(sym)}
                    className={`relative cursor-pointer rounded border ${selected === sym ? 'border-accent/60 bg-[#23191a]' : 'border-ink-faint/25 hover:border-accent/40'} pl-4 pr-3 py-3`}
                  >
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r" style={{ background: swatch }} />
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="font-mono text-ink text-[14px]">{sym}</span>
                      <span className="font-mono text-[10px] text-ink-faint">${script.meta.current_price.toFixed(2)}</span>
                    </div>
                    <div className="font-body text-[11px] text-ink-muted leading-tight mb-2">
                      {lang === 'zh' ? script.meta.name_zh : script.meta.name_en}
                    </div>
                    {isRunning ? (
                      <div className="font-mono text-[10px] text-neutral inline-flex items-center gap-1">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-neutral animate-shimmer" />
                        {t(STRINGS.companyPage.running)} · GATE {run.currentGate}/7
                      </div>
                    ) : isComplete ? (
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: swatch }}>
                          {verdict} · {run.verdict?.conviction.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); startRun(sym); }}
                        className="font-mono text-[10px] uppercase tracking-wider text-ink-muted hover:text-ink inline-flex items-center gap-1"
                      >
                        <Play size={10} /> {t(STRINGS.companyPage.draft)} <ChevronRight size={11} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 text-[11px] font-body italic text-ink-faint leading-relaxed">
              {lang === 'zh'
                ? '点击 Run · 七关流水线会依序执行：业务、护城河、财务、风险、估值、催化、综合裁决。'
                : 'Click Run — the seven gates execute in order: business, moat, financials, risk, valuation, catalysts, verdict.'}
            </div>
          </div>
        </aside>

        {/* Active panel */}
        <main className={`overflow-y-auto px-4 md:px-8 py-4 md:py-6 ${mobileTab === 'active' ? '' : 'hidden lg:block'}`}>
          {!selectedRun && <EmptyPanel />}
          {selectedRun && <ActivePanel run={selectedRun} onAbort={() => abortRun(selectedRun.symbol)} />}
        </main>

        {/* Execution log */}
        <aside className={`border-l border-ink-faint/25 overflow-y-auto ${mobileTab === 'log' ? '' : 'hidden lg:block'}`}>
          <div className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent mb-3">
              {t(STRINGS.companyPage.log)}
            </div>
            <ul className="space-y-2.5">
              {recent.map((r) => (
                <li key={r.id} className="border-t border-ink-faint/20 pt-2.5">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="font-mono text-ink text-[12px]">{r.symbol}</span>
                    <span className={`font-mono text-[10px] uppercase tracking-wider ${
                      r.action === 'BUY' ? 'text-gain' : r.action === 'AVOID' ? 'text-loss' : 'text-neutral'
                    }`}>{r.action} · {r.conviction.toFixed(2)}</span>
                  </div>
                  <p className="font-body italic text-[11.5px] text-ink-muted leading-snug">
                    {lang === 'zh' ? r.one_sentence_zh : r.one_sentence_en}
                  </p>
                  <div className="mt-1 font-mono text-[9px] text-ink-faint flex items-center justify-between">
                    <span>{r.hours_ago}h · {r.model}</span>
                    <span>{(r.latency_ms / 1000).toFixed(1)}s</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function EmptyPanel() {
  const t = useT();
  return (
    <div className="h-full flex items-center justify-center text-center">
      <div>
        <div className="font-display italic-display text-[24px] text-ink-muted mb-2">{t(STRINGS.companyPage.noRuns)}</div>
        <div className="font-mono text-[11px] text-ink-faint uppercase tracking-wider">← {t(STRINGS.companyPage.watchlist)}</div>
      </div>
    </div>
  );
}

function ActivePanel({ run, onAbort }: { run: ActiveRun; onAbort: () => void }) {
  const t = useT();
  const { lang } = useI18n();
  const meta = run.meta;
  const script = SCRIPTS[run.symbol];
  const totalGates = 7;

  return (
    <div>
      {/* Header */}
      <div className="flex items-baseline justify-between mb-5 md:mb-6 gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent mb-1">
            {meta?.sector_zh && (lang === 'zh' ? `${meta.sector_zh} · ${meta.industry_zh}` : `${meta?.sector_en} · ${meta?.industry_en}`)}
          </div>
          <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
            <span className="font-display italic-display text-[32px] md:text-[44px] text-ink leading-none">{run.symbol}</span>
            <span className="font-display italic text-[14px] md:text-[18px] text-ink-muted">
              {meta ? (lang === 'zh' ? meta.name_zh : meta.name_en) : ''}
            </span>
            {meta && <span className="font-mono text-[12px] md:text-[14px] text-ink-muted">${meta.current_price.toFixed(2)}</span>}
          </div>
        </div>
        {run.status === 'running' && (
          <button onClick={onAbort} className="font-mono text-[11px] text-loss hover:text-ink inline-flex items-center gap-1">
            <X size={12} /> {t(STRINGS.companyPage.abort)}
          </button>
        )}
        {run.status === 'complete' && run.totalLatencyMs && (
          <span className="font-mono text-[10px] text-ink-faint">
            {(run.totalLatencyMs / 1000).toFixed(1)}s · {script.model}
          </span>
        )}
      </div>

      {/* 7-gate progress */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {Array.from({ length: totalGates }).map((_, i) => {
          const gateNum = i + 1;
          const isDone = run.gateLatency[gateNum] != null;
          const isActive = run.currentGate === gateNum && run.status === 'running';
          return (
            <div
              key={i}
              className={`relative h-1.5 rounded-sm ${
                isDone ? 'bg-accent' : isActive ? 'bg-accent/40' : 'bg-ink-faint/15'
              }`}
            >
              {isActive && <div className="absolute inset-0 bg-accent rounded-sm animate-shimmer" />}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-7 gap-1 mb-6">
        {Array.from({ length: totalGates }).map((_, i) => {
          const gateNum = i + 1;
          const isDone = run.gateLatency[gateNum] != null;
          const isActive = run.currentGate === gateNum && run.status === 'running';
          return (
            <div key={i} className={`text-center font-mono text-[9px] uppercase tracking-wider ${
              isDone ? 'text-accent' : isActive ? 'text-ink' : 'text-ink-faint/40'
            }`}>
              {['I','II','III','IV','V','VI','VII'][i]}
            </div>
          );
        })}
      </div>

      {/* Active tool call indicator */}
      {run.toolCall && run.status === 'running' && (
        <div className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] text-accent border border-accent/30 rounded px-2 py-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-shimmer" />
          tool · {run.toolCall}
        </div>
      )}

      {/* Per-gate streaming output */}
      <div className="space-y-4">
        {run.gateText.map((text, i) => {
          const gateNum = i + 1;
          const done = run.gateLatency[gateNum] != null;
          const parsed = run.gateParsed[gateNum];
          if (!text) return null;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="border-t border-ink-faint/20 pt-4"
            >
              <div className="flex items-baseline justify-between mb-2">
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
                  GATE {['I','II','III','IV','V','VI','VII'][i]} · {gateName(i, lang)}
                </div>
                {done && run.gateLatency[gateNum] && (
                  <span className="font-mono text-[10px] text-ink-faint">{(run.gateLatency[gateNum] / 1000).toFixed(1)}s</span>
                )}
              </div>
              <div className="font-body text-[14px] text-ink leading-relaxed">
                {text}
                {!done && run.currentGate === gateNum && (
                  <span className="inline-block w-2 h-3 bg-accent ml-0.5 align-middle animate-shimmer" />
                )}
              </div>
              {done && parsed && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(parsed).map(([k, v]) => (
                    <div key={k} className="font-mono text-[11px] border border-ink-faint/25 rounded px-2 py-1.5">
                      <span className="text-ink-faint">{k}: </span><span className="text-ink">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Verdict */}
      <AnimatePresence>
        {run.verdict && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mt-10 border-t-2 border-accent/40 pt-6"
          >
            <VerdictBlock verdict={run.verdict} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VerdictBlock({ verdict }: { verdict: CompanyScript['verdict'] }) {
  const t = useT();
  const { lang } = useI18n();
  const color = verdict.action === 'BUY' ? '#6FAF8D' : verdict.action === 'AVOID' ? '#B0524A' : '#C9A97E';
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent mb-3">{t(STRINGS.companyPage.verdict)}</div>
      <div className="flex items-baseline gap-4 flex-wrap mb-4">
        <span className="font-display italic-display text-[60px] leading-none" style={{ color }}>
          {verdict.action}
        </span>
        <span className="font-mono text-[14px] text-ink-muted">
          {t(STRINGS.companyPage.conviction)} {verdict.conviction.toFixed(2)} · {t(STRINGS.companyPage.quality)} {verdict.quality}
        </span>
        <span className="font-mono text-[12px] text-ink-faint ml-auto">
          {t(STRINGS.companyPage.holdHorizon)}: {lang === 'zh' ? verdict.hold_horizon_zh : verdict.hold_horizon_en} · target weight {verdict.position_size_pct.toFixed(1)}%
        </span>
      </div>
      <p className="font-display italic text-[18px] text-ink leading-snug max-w-3xl mb-6">
        "{lang === 'zh' ? verdict.one_sentence_zh : verdict.one_sentence_en}"
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TriggerList title={t(STRINGS.companyPage.sellTriggers)} items={lang === 'zh' ? verdict.sell_triggers_zh : verdict.sell_triggers_en} variant="loss" />
        <TriggerList title={t(STRINGS.companyPage.addTriggers)} items={lang === 'zh' ? verdict.add_triggers_zh : verdict.add_triggers_en} variant="gain" />
      </div>

      <div className="mt-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent mb-3">{t(STRINGS.companyPage.philosophy)}</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <PhilosophyCard name="Buffett" score={verdict.philosophy_scores.buffett} comment={lang === 'zh' ? verdict.buffett_zh : verdict.buffett_en} />
          <PhilosophyCard name="Fisher"  score={verdict.philosophy_scores.fisher}  comment={lang === 'zh' ? verdict.fisher_zh  : verdict.fisher_en} />
          <PhilosophyCard name="Munger"  score={verdict.philosophy_scores.munger}  comment={lang === 'zh' ? verdict.munger_zh  : verdict.munger_en} />
        </div>
      </div>
    </div>
  );
}

function TriggerList({ title, items, variant }: { title: string; items: string[]; variant: 'gain' | 'loss' }) {
  const color = variant === 'gain' ? 'text-gain' : 'text-loss';
  return (
    <div>
      <div className={`font-mono text-[10px] uppercase tracking-wider mb-2 ${color}`}>{title}</div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="font-body text-[13px] text-ink-muted leading-snug border-l border-ink-faint/30 pl-3">{it}</li>
        ))}
      </ul>
    </div>
  );
}

function PhilosophyCard({ name, score, comment }: { name: string; score: number; comment: string }) {
  return (
    <div className="border border-ink-faint/25 rounded p-4">
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-display italic-display text-[18px] text-ink">{name}</span>
        <span className="font-mono text-[12px] text-accent">{fmtPct(score * 100, 0)}</span>
      </div>
      <p className="font-body italic text-[12.5px] text-ink-muted leading-relaxed">"{comment}"</p>
    </div>
  );
}
