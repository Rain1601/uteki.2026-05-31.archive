import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowUpRight } from 'lucide-react';
import { useT, useI18n } from '../../i18n/I18nProvider';
import { STRINGS } from '../../i18n/strings';
import type { FinishedVerdict, GateSummary, MentorComment } from '../../mocks/realData';

interface Props {
  v: FinishedVerdict | null;
  onClose: () => void;
}

export default function VerdictModal({ v, onClose }: Props) {
  const t = useT();
  const { lang } = useI18n();

  useEffect(() => {
    if (!v) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [v, onClose]);

  if (!v) return null;
  const color = v.action === 'BUY' ? '#6FAF8D' : v.action === 'AVOID' ? '#B0524A' : '#C9A97E';

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-stretch md:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full md:w-[860px] md:max-w-[92vw] md:max-h-[88vh] max-h-screen overflow-y-auto bg-[#15130F] md:rounded border-0 md:border md:border-ink-faint/40 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky modal header */}
        <header className="sticky top-0 z-10 px-5 md:px-7 pt-5 md:pt-6 pb-4 bg-[#15130F]/95 backdrop-blur border-b border-ink-faint/25 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 md:gap-3 flex-wrap mb-1.5">
              <span className="font-display italic-display text-[26px] md:text-[34px] text-ink leading-none">{v.symbol}</span>
              <span className="font-display italic text-[14px] md:text-[16px] text-ink-muted">
                {lang === 'zh' ? v.name_zh : v.name_en}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                {lang === 'zh' ? v.sector_zh : v.sector_en}
              </span>
              <span className="font-mono text-[11px] text-ink-muted">${v.current_price.toFixed(2)}</span>
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-display italic-display text-[24px] md:text-[30px] leading-none" style={{ color }}>
                {v.action}
              </span>
              <span className="font-mono text-[11px] text-ink-muted">
                conviction {v.conviction.toFixed(2)} · quality {v.quality}
              </span>
              <span className="font-mono text-[10px] text-ink-faint">
                {v.analyzed_at} · {v.model} · {(v.total_latency_ms / 1000).toFixed(1)}s
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="close"
            className="p-1.5 rounded border border-ink-faint/30 text-ink-muted hover:text-ink hover:border-accent/60 transition-colors"
          >
            <X size={16} strokeWidth={1.6} />
          </button>
        </header>

        {/* Body */}
        <div className="px-5 md:px-7 py-6 space-y-7">
          <p className="font-display italic text-[16px] md:text-[18px] text-ink leading-snug">
            "{lang === 'zh' ? v.one_sentence_zh : v.one_sentence_en}"
          </p>

          {/* 7 gates */}
          <section>
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent mb-3">
              {t(STRINGS.real.sevenGates)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {v.gates.map((g) => <GateCard key={g.num} g={g} />)}
            </div>
          </section>

          {/* Mentor commentary */}
          <section>
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent mb-3">
              {t(STRINGS.real.mentorComments)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <MentorBlock name="Buffett" m={v.buffett} />
              <MentorBlock name="Fisher"  m={v.fisher} />
              <MentorBlock name="Munger"  m={v.munger} />
            </div>
          </section>

          {/* Full triggers */}
          <section>
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent mb-3">
              {t(STRINGS.real.fullTriggers)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TriggerList
                label={t(STRINGS.companyPage.sellTriggers)}
                items={lang === 'zh' ? v.full_sell_zh : v.full_sell_en}
                variant="loss"
              />
              <TriggerList
                label={t(STRINGS.companyPage.addTriggers)}
                items={lang === 'zh' ? v.full_add_zh : v.full_add_en}
                variant="gain"
              />
            </div>
          </section>

          {/* Footer summary */}
          <section className="border-t border-ink-faint/25 pt-4 flex items-center justify-between flex-wrap gap-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
              {t(STRINGS.companyPage.holdHorizon)}: {lang === 'zh' ? v.hold_horizon_zh : v.hold_horizon_en}
              {v.position_size_pct > 0 && <> · target {v.position_size_pct.toFixed(1)}%</>}
            </div>
            <a
              href="/company-agent"
              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted hover:text-ink"
            >
              {t(STRINGS.real.openStudio)}
              <ArrowUpRight size={11} strokeWidth={1.6} />
            </a>
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function GateCard({ g }: { g: GateSummary }) {
  const { lang } = useI18n();
  return (
    <div className="border border-ink-faint/25 rounded p-3.5 bg-[#1a1612]/60">
      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="font-mono text-[10px] text-accent tracking-wider">{g.num}</span>
        <span className="font-display italic text-[14px] text-ink">
          {lang === 'zh' ? g.title_zh : g.title_en}
        </span>
      </div>
      <p className="font-body text-[12.5px] text-ink-muted leading-relaxed">
        {lang === 'zh' ? g.body_zh : g.body_en}
      </p>
    </div>
  );
}

function MentorBlock({ name, m }: { name: string; m: MentorComment }) {
  const { lang } = useI18n();
  return (
    <div className="border border-ink-faint/30 rounded p-4 bg-[#1a1612]/60">
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-display italic-display text-[18px] text-ink">{name}</span>
        <span className="font-mono text-[11px] text-accent">{(m.score * 100).toFixed(0)}</span>
      </div>
      <div className="h-1 bg-ink-faint/15 rounded-sm overflow-hidden mb-3">
        <div className="h-full bg-accent" style={{ width: `${m.score * 100}%` }} />
      </div>
      <p className="font-body italic text-[12.5px] text-ink-muted leading-relaxed">
        "{lang === 'zh' ? m.comment_zh : m.comment_en}"
      </p>
    </div>
  );
}

function TriggerList({ label, items, variant }: { label: string; items: string[]; variant: 'gain' | 'loss' }) {
  const color = variant === 'gain' ? 'text-gain' : 'text-loss';
  return (
    <div>
      <div className={`font-mono text-[10px] uppercase tracking-wider mb-2 ${color}`}>{label}</div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="font-body text-[12.5px] text-ink-muted leading-snug border-l border-ink-faint/30 pl-3">{it}</li>
        ))}
      </ul>
    </div>
  );
}
