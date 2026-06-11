import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Layers, Vote, Activity, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useT, useI18n } from '../../i18n/I18nProvider';
import { STRINGS } from '../../i18n/strings';

interface Pillar {
  num: string;
  icon: typeof Layers;
  color: string;
  title: { zh: string; en: string };
  desc:  { zh: string; en: string };
  hint:  { zh: string; en: string };
}

const PILLARS: Pillar[] = [
  { num: 'I',   icon: Layers,    color: '#C9A97E', title: STRINGS.about.pillar1Title, desc: STRINGS.about.pillar1Desc, hint: STRINGS.about.pillar1Hint },
  { num: 'II',  icon: Vote,      color: '#B0524A', title: STRINGS.about.pillar2Title, desc: STRINGS.about.pillar2Desc, hint: STRINGS.about.pillar2Hint },
  { num: 'III', icon: Activity,  color: '#6FAF8D', title: STRINGS.about.pillar3Title, desc: STRINGS.about.pillar3Desc, hint: STRINGS.about.pillar3Hint },
  { num: 'IV',  icon: Clock,     color: '#A8896E', title: STRINGS.about.pillar4Title, desc: STRINGS.about.pillar4Desc, hint: STRINGS.about.pillar4Hint },
];

export default function PillarCarousel() {
  const t = useT();
  const { lang } = useI18n();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  const prev = () => setIdx((i) => (i - 1 + PILLARS.length) % PILLARS.length);
  const next = () => setIdx((i) => (i + 1) % PILLARS.length);

  // Auto-advance every 6s when not paused
  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  // Keyboard support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const pillar = PILLARS[idx];
  const Icon = pillar.icon;

  // Touch swipe
  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (dx > 40) prev();
    else if (dx < -40) next();
    touchStart.current = null;
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative rounded border border-ink-faint/30 bg-[#1a1612]/60 overflow-hidden min-h-[260px] md:min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            className="relative px-7 md:px-12 py-7 md:py-10"
          >
            {/* Roman numeral watermark */}
            <span
              aria-hidden
              className="absolute right-6 md:right-12 top-4 md:top-7 font-display italic-display text-[88px] md:text-[140px] leading-none text-ink-faint/15 select-none pointer-events-none"
            >
              {pillar.num}
            </span>

            <div className="flex items-center gap-3 mb-4 md:mb-5">
              <Icon size={22} strokeWidth={1.4} style={{ color: pillar.color }} />
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-faint">
                {pillar.num} / {String(PILLARS.length).padStart(2, '0')}
              </span>
            </div>

            <h3 className="font-display italic-display text-[26px] md:text-[34px] leading-tight text-ink mb-3 md:mb-4 max-w-3xl">
              {t(pillar.title)}
            </h3>

            <p className="font-body text-[14px] md:text-[15.5px] leading-relaxed text-ink-muted max-w-3xl mb-4 md:mb-5">
              {t(pillar.desc)}
            </p>

            <p className="font-body italic text-[12.5px] md:text-[13px] text-ink-faint leading-relaxed max-w-3xl border-l-2 pl-3" style={{ borderColor: pillar.color }}>
              {t(pillar.hint)}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Side chevrons */}
        <button
          onClick={prev}
          aria-label="prev pillar"
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#15130F]/85 backdrop-blur border border-ink-faint/40 text-ink-muted hover:text-ink hover:border-accent/60"
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>
        <button
          onClick={next}
          aria-label="next pillar"
          className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#15130F]/85 backdrop-blur border border-ink-faint/40 text-ink-muted hover:text-ink hover:border-accent/60"
        >
          <ChevronRight size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Dots / progress */}
      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {PILLARS.map((p, i) => (
            <button
              key={p.num}
              onClick={() => setIdx(i)}
              aria-label={`pillar ${p.num}`}
              className={`group h-2.5 transition-all rounded-full ${
                i === idx ? 'w-10 bg-accent' : 'w-2.5 bg-ink-faint/40 hover:bg-ink-muted'
              }`}
            />
          ))}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
          {lang === 'zh' ? '左右滑动 / 键盘 ← →' : 'swipe or ← →'}
        </span>
      </div>

      {/* Mobile-only inline chevrons (under the dots) */}
      <div className="md:hidden flex items-center justify-center gap-2 mt-3">
        <button onClick={prev} aria-label="prev pillar"
          className="p-2 rounded border border-ink-faint/40 text-ink-muted hover:text-ink">
          <ChevronLeft size={16} strokeWidth={1.5} />
        </button>
        <button onClick={next} aria-label="next pillar"
          className="p-2 rounded border border-ink-faint/40 text-ink-muted hover:text-ink">
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
