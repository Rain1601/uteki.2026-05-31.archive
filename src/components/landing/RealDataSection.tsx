import { useState } from 'react';
import { ArrowUpRight, Sparkles, Maximize2 } from 'lucide-react';
import { useT, useI18n } from '../../i18n/I18nProvider';
import { STRINGS } from '../../i18n/strings';
import {
  REAL_VERDICTS,
  REAL_NEWS_READS,
  type FinishedVerdict,
  type RealNewsRead,
} from '../../mocks/realData';
import VerdictModal from './VerdictModal';

type Tab = 'verdicts' | 'news';

export default function RealDataSection() {
  const t = useT();
  const [tab, setTab] = useState<Tab>('verdicts');
  const [activeVerdict, setActiveVerdict] = useState(0);
  const [activeNews, setActiveNews] = useState(0);
  const [modalVerdict, setModalVerdict] = useState<FinishedVerdict | null>(null);

  const verdict = REAL_VERDICTS[activeVerdict];
  const news = REAL_NEWS_READS[activeNews];

  return (
    <div>
      <VerdictModal v={modalVerdict} onClose={() => setModalVerdict(null)} />
      {/* Tab switcher */}
      <div className="flex items-center gap-2 mb-5 border-b border-ink-faint/25">
        <TabBtn active={tab === 'verdicts'} onClick={() => setTab('verdicts')}>
          {t(STRINGS.real.verdictsTab)}
          <span className="ml-1.5 font-mono text-[10px] text-ink-faint">{REAL_VERDICTS.length}</span>
        </TabBtn>
        <TabBtn active={tab === 'news'} onClick={() => setTab('news')}>
          {t(STRINGS.real.newsTab)}
          <span className="ml-1.5 font-mono text-[10px] text-ink-faint">{REAL_NEWS_READS.length}</span>
        </TabBtn>
      </div>

      {tab === 'verdicts' ? (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 md:gap-5">
          <ul className="grid grid-cols-5 lg:grid-cols-1 gap-2">
            {REAL_VERDICTS.map((v, i) => (
              <li key={v.symbol}>
                <button
                  onClick={() => setActiveVerdict(i)}
                  className={`w-full text-left rounded border px-3 py-2.5 transition-colors ${
                    i === activeVerdict
                      ? 'border-accent/70 bg-[#23191a]'
                      : 'border-ink-faint/25 hover:border-accent/40'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <span className="font-mono text-ink text-[13px]">{v.symbol}</span>
                    <span className={`font-mono text-[9px] uppercase tracking-wider ${
                      v.action === 'BUY' ? 'text-gain' : v.action === 'AVOID' ? 'text-loss' : 'text-neutral'
                    }`}>{v.action}</span>
                  </div>
                  <div className="font-mono text-[10px] text-ink-faint">conv {v.conviction.toFixed(2)}</div>
                </button>
              </li>
            ))}
          </ul>

          <VerdictCard v={verdict} onOpen={() => setModalVerdict(verdict)} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 md:gap-5">
          <ul className="grid grid-cols-1 gap-2">
            {REAL_NEWS_READS.map((n, i) => (
              <li key={n.id}>
                <button
                  onClick={() => setActiveNews(i)}
                  className={`w-full text-left rounded border px-3 py-2.5 transition-colors ${
                    i === activeNews
                      ? 'border-accent/70 bg-[#23191a]'
                      : 'border-ink-faint/25 hover:border-accent/40'
                  }`}
                >
                  <div className="font-mono text-[10px] text-ink-faint mb-0.5">
                    {n.source} · {n.time} · <span className="uppercase">{n.importance}</span>
                  </div>
                  <div className="font-body text-[12.5px] text-ink leading-snug line-clamp-2">
                    <NewsTitle item={n} />
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <NewsCard n={news} />
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
        active ? 'text-ink' : 'text-ink-muted hover:text-ink'
      }`}
    >
      {children}
      {active && <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-accent" />}
    </button>
  );
}

function NewsTitle({ item }: { item: RealNewsRead }) {
  const { lang } = useI18n();
  return <>{lang === 'zh' ? item.headline_zh : item.headline_en}</>;
}

function VerdictCard({ v, onOpen }: { v: FinishedVerdict; onOpen: () => void }) {
  const t = useT();
  const { lang } = useI18n();
  const color = v.action === 'BUY' ? '#6FAF8D' : v.action === 'AVOID' ? '#B0524A' : '#C9A97E';

  return (
    <div className="rounded border border-ink-faint/30 bg-[#1a1612]/60 p-5 md:p-6">
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="font-display italic-display text-[32px] md:text-[44px] text-ink leading-none">{v.symbol}</span>
          <span className="font-display italic text-[14px] md:text-[16px] text-ink-muted">
            {lang === 'zh' ? v.name_zh : v.name_en}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            {lang === 'zh' ? v.sector_zh : v.sector_en}
          </span>
          <span className="font-mono text-[11px] text-ink-muted">${v.current_price.toFixed(2)}</span>
        </div>
        <span className="font-mono text-[10px] text-ink-faint">{v.analyzed_at} · {v.model}</span>
      </div>

      <div className="flex items-baseline gap-3 mb-4 flex-wrap">
        <span className="font-display italic-display text-[32px] md:text-[40px] leading-none" style={{ color }}>
          {v.action}
        </span>
        <span className="font-mono text-[12px] text-ink-muted">
          conviction {v.conviction.toFixed(2)} · quality {v.quality}
        </span>
        <span className="font-mono text-[11px] text-ink-faint ml-auto">
          {(v.total_latency_ms / 1000).toFixed(1)}s
        </span>
      </div>

      <p className="font-display italic text-[15px] md:text-[17px] text-ink leading-snug max-w-3xl mb-5">
        "{lang === 'zh' ? v.one_sentence_zh : v.one_sentence_en}"
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <Trigger label={t(STRINGS.companyPage.sellTriggers)} text={lang === 'zh' ? v.key_sell_zh : v.key_sell_en} variant="loss" />
        <Trigger label={t(STRINGS.companyPage.addTriggers)} text={lang === 'zh' ? v.key_add_zh : v.key_add_en} variant="gain" />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <Score name="Buffett" v={v.buffett.score} />
        <Score name="Fisher"  v={v.fisher.score} />
        <Score name="Munger"  v={v.munger.score} />
      </div>

      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-ink-faint pt-2 border-t border-ink-faint/15">
        <span className="pt-2">{t(STRINGS.companyPage.holdHorizon)}: {lang === 'zh' ? v.hold_horizon_zh : v.hold_horizon_en}{v.position_size_pct > 0 && <> · target {v.position_size_pct.toFixed(1)}%</>}</span>
        <button
          onClick={onOpen}
          className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded border border-accent/60 text-ink hover:bg-[#23191a] transition-colors"
        >
          <Maximize2 size={11} strokeWidth={1.6} />
          {t(STRINGS.real.expandPipeline)}
        </button>
      </div>
    </div>
  );
}

function NewsCard({ n }: { n: RealNewsRead }) {
  const t = useT();
  const { lang } = useI18n();
  const impactColor = n.impact === 'bullish' ? '#6FAF8D' : n.impact === 'bearish' ? '#B0524A' : '#C9A97E';
  const impactLabel = n.impact === 'bullish' ? t(STRINGS.newsPage.impactBullish)
    : n.impact === 'bearish' ? t(STRINGS.newsPage.impactBearish)
    : t(STRINGS.newsPage.impactNeutral);

  return (
    <div className="rounded border border-ink-faint/30 bg-[#1a1612]/60 p-5 md:p-6">
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
          {n.source} · {n.time} · <span style={{ color: impactColor }}>{impactLabel}</span>
        </span>
        {n.tags.map((tag) => (
          <span key={tag} className="font-mono text-[9px] uppercase tracking-wider text-ink-faint border border-ink-faint/30 rounded px-1.5 py-0.5">
            {tag}
          </span>
        ))}
      </div>

      <h4 className="font-display italic-display text-[20px] md:text-[24px] text-ink leading-tight mb-4 max-w-3xl">
        {lang === 'zh' ? n.headline_zh : n.headline_en}
      </h4>

      <div className="rounded border border-[#7c4ec9]/30 bg-[#1a1325]/40 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={13} className="text-[#c8a2ff]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#c8a2ff]">
            AI {t(STRINGS.newsPage.aiAnalyze)}
          </span>
        </div>
        <p className="font-body text-[14px] text-ink leading-relaxed">
          {lang === 'zh' ? n.read_zh : n.read_en}
        </p>
      </div>

      <div className="flex items-center justify-end font-mono text-[10px] uppercase tracking-wider text-ink-faint pt-3">
        <a href="/news-timeline" className="inline-flex items-center gap-1 text-ink-muted hover:text-ink">
          {t(STRINGS.real.openTimeline)}
          <ArrowUpRight size={11} strokeWidth={1.6} />
        </a>
      </div>
    </div>
  );
}

function Trigger({ label, text, variant }: { label: string; text: string; variant: 'gain' | 'loss' }) {
  const color = variant === 'gain' ? 'text-gain' : 'text-loss';
  return (
    <div>
      <div className={`font-mono text-[10px] uppercase tracking-wider mb-1 ${color}`}>{label}</div>
      <p className="font-body text-[12px] text-ink-muted leading-snug">{text}</p>
    </div>
  );
}

function Score({ name, v }: { name: string; v: number }) {
  return (
    <div className="border border-ink-faint/25 rounded px-2.5 py-1.5">
      <div className="flex items-baseline justify-between">
        <span className="font-display italic text-[12px] text-ink-muted">{name}</span>
        <span className="font-mono text-[12px] text-accent">{(v * 100).toFixed(0)}</span>
      </div>
      <div className="mt-1 h-1 bg-ink-faint/15 rounded-sm overflow-hidden">
        <div className="h-full bg-accent" style={{ width: `${v * 100}%` }} />
      </div>
    </div>
  );
}
