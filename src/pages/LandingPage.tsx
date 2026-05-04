import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight, ChevronDown, Layers, Vote, Activity,
  Github, Globe, Brain, GitBranch, Award,
} from 'lucide-react';
import { useT, useI18n } from '../i18n/I18nProvider';
import { STRINGS } from '../i18n/strings';
import LangToggle from '../components/LangToggle';
import { BACKGROUND_PAPER, COLOR_BG, COLOR_INK } from '../theme/editorialTokens';
import MultiAgentDiagram from '../components/landing/MultiAgentDiagram';
import ModelLogos from '../components/landing/ModelLogos';
import GatewayPanel from '../components/landing/GatewayPanel';
import HoldingsPanel from '../components/landing/HoldingsPanel';
import DemoPreview from '../components/landing/DemoPreview';
import CopyableEmail from '../components/landing/CopyableEmail';

const SECTIONS = [
  { id: 'hero',         labelZh: '首页', labelEn: 'Top' },
  { id: 'about',        labelZh: '介绍', labelEn: 'About' },
  { id: 'architecture', labelZh: '架构', labelEn: 'Architecture' },
  { id: 'performance',  labelZh: '表现', labelEn: 'Performance' },
  { id: 'models',       labelZh: '模型', labelEn: 'Models' },
  { id: 'demos',        labelZh: '演示', labelEn: 'Demos' },
  { id: 'contact',      labelZh: '联系', labelEn: 'Contact' },
];

export default function LandingPage() {
  const t = useT();
  const shellRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const sections = shell.querySelectorAll<HTMLElement>('section[data-snap-id]');
    const obs = new IntersectionObserver(
      (entries) => {
        let bestIdx = -1;
        let bestRatio = 0;
        entries.forEach((e) => {
          const idx = SECTIONS.findIndex((s) => s.id === (e.target as HTMLElement).dataset.snapId);
          if (idx === -1) return;
          if (e.isIntersecting && e.intersectionRatio > bestRatio) {
            bestIdx = idx;
            bestRatio = e.intersectionRatio;
          }
        });
        if (bestIdx >= 0) setActiveIdx(bestIdx);
      },
      { root: shell, threshold: [0.4, 0.6, 0.8] },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  function scrollTo(id: string) {
    const shell = shellRef.current;
    if (!shell) return;
    shell.querySelector<HTMLElement>(`section[data-snap-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div
      style={{ backgroundColor: COLOR_BG, color: COLOR_INK, backgroundImage: BACKGROUND_PAPER }}
      className="relative h-screen overflow-hidden"
    >
      {/* Sticky top bar */}
      <header className="absolute top-0 left-0 right-0 px-5 md:px-14 pt-4 md:pt-6 pb-2.5 md:pb-3 flex items-center justify-between z-50 bg-[#15130F]/75 md:bg-[#15130F]/55 backdrop-blur-md border-b border-ink-faint/15">
        <button
          onClick={() => scrollTo('hero')}
          className="font-display italic-display text-[18px] md:text-[20px] tracking-tight text-ink hover:text-accent transition-colors"
        >
          {t(STRINGS.brand)}
        </button>
        <nav className="hidden md:flex items-center gap-6">
          {SECTIONS.slice(1).map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                SECTIONS[activeIdx]?.id === s.id ? 'text-ink' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {t({ zh: s.labelZh, en: s.labelEn })}
            </button>
          ))}
        </nav>
        <LangToggle />
      </header>

      {/* Right dot indicator */}
      <aside className="absolute right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-3">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            aria-label={`go to ${s.id}`}
            className="group relative flex items-center justify-end"
          >
            <span
              className={`block rounded-full transition-all ${
                activeIdx === i
                  ? 'h-2.5 w-2.5 bg-ink'
                  : 'h-1.5 w-1.5 bg-ink-faint hover:bg-ink-muted'
              }`}
            />
            <span className="absolute right-5 font-mono text-[10px] uppercase tracking-wider text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {t({ zh: s.labelZh, en: s.labelEn })}
            </span>
          </button>
        ))}
      </aside>

      <div ref={shellRef} className="snap-shell">
        <HeroSection onNext={() => scrollTo('about')} />
        <AboutSection />
        <ArchitectureSection />
        <PerformanceSection />
        <ModelsSection />
        <DemosSection />
        <ContactSection />
      </div>
    </div>
  );
}

// ── Section 1: Hero ──────────────────────────────────────────────────────────
function HeroSection({ onNext }: { onNext: () => void }) {
  const t = useT();
  return (
    <section data-snap-id="hero" className="relative flex flex-col items-start justify-center px-6 md:px-14 max-w-7xl mx-auto">
      <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.28em] sm:tracking-[0.32em] text-accent mb-5 mt-4 md:mt-16">
        {t(STRINGS.landing.eyebrow)} · {t({ zh: '数据为模拟', en: 'mocked data' })}
      </div>
      <h1 className="font-display italic-display text-[34px] sm:text-[44px] md:text-[80px] leading-[1.05] md:leading-[1.02] tracking-[-0.02em] text-ink max-w-5xl">
        {t(STRINGS.landing.heroTitle)}
      </h1>
      <p className="mt-6 md:mt-8 font-body text-[15px] sm:text-[17px] md:text-[21px] leading-relaxed text-ink-muted max-w-2xl">
        {t(STRINGS.landing.heroSub)}
      </p>
      <div className="mt-8 md:mt-10 flex flex-wrap gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded border border-ink/60 text-ink font-body text-[14px] sm:text-[15px] hover:bg-ink hover:text-ground transition-colors"
        >
          {t(STRINGS.landing.ctaPrimary)}
          <ArrowUpRight size={16} strokeWidth={1.5} />
        </Link>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded border border-ink-faint/40 text-ink-muted font-body text-[14px] sm:text-[15px] hover:text-ink hover:border-accent/60 transition-colors"
        >
          {t({ zh: '一直往下', en: 'Scroll for more' })}
          <ChevronDown size={16} strokeWidth={1.5} />
        </button>
      </div>
      <button
        onClick={onNext}
        aria-label="scroll to next"
        className="hidden md:block absolute bottom-10 left-1/2 -translate-x-1/2 text-ink-faint hover:text-ink transition-colors animate-shimmer"
      >
        <ChevronDown size={28} strokeWidth={1.4} />
      </button>
    </section>
  );
}

// ── Section 2: About ────────────────────────────────────────────────────────
function AboutSection() {
  const t = useT();
  const pillars = [
    { icon: Layers,   title: STRINGS.about.pillar1Title, desc: STRINGS.about.pillar1Desc, color: '#C9A97E' },
    { icon: Vote,     title: STRINGS.about.pillar2Title, desc: STRINGS.about.pillar2Desc, color: '#B0524A' },
    { icon: Activity, title: STRINGS.about.pillar3Title, desc: STRINGS.about.pillar3Desc, color: '#6FAF8D' },
  ];
  return (
    <section data-snap-id="about" className="flex flex-col justify-center px-6 md:px-14 max-w-6xl mx-auto py-12 md:py-20">
      <SectionEyebrow num="01" label={STRINGS.about.eyebrow} />
      <h2 className="font-display italic-display text-[28px] sm:text-[34px] md:text-[60px] leading-[1.08] text-ink max-w-4xl mb-5 md:mb-6 mt-3">
        {t(STRINGS.about.title)}
      </h2>
      <p className="font-body text-[14px] sm:text-[15px] md:text-[18px] leading-relaxed text-ink-muted max-w-3xl mb-8 md:mb-12">
        {t(STRINGS.about.p1)}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
        {pillars.map(({ icon: Icon, title, desc, color }) => (
          <div key={title.zh} className="rounded border border-ink-faint/30 bg-[#1a1612]/60 p-4 md:p-6 flex flex-col">
            <Icon size={22} strokeWidth={1.4} style={{ color }} className="mb-3 md:mb-4" />
            <h3 className="font-display italic-display text-[18px] md:text-[20px] text-ink mb-2 md:mb-3 leading-tight">{t(title)}</h3>
            <p className="font-body text-[12.5px] md:text-[13.5px] text-ink-muted leading-relaxed">{t(desc)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Section 3: Architecture ─────────────────────────────────────────────────
function ArchitectureSection() {
  const t = useT();
  return (
    <section data-snap-id="architecture" className="flex flex-col justify-center px-6 md:px-14 max-w-7xl mx-auto py-12 md:py-16">
      <SectionEyebrow num="02" label={STRINGS.arch.eyebrow} />
      <div className="flex items-end justify-between gap-3 flex-wrap mb-5 md:mb-6 mt-3">
        <h2 className="font-display italic-display text-[28px] sm:text-[32px] md:text-[48px] leading-[1.1] text-ink">
          {t(STRINGS.arch.title)}
        </h2>
        <p className="font-body text-[13px] md:text-[14px] text-ink-muted max-w-md leading-relaxed">
          {t(STRINGS.arch.sub)}
        </p>
      </div>

      {/* Diagram — horizontally scroll on small viewports */}
      <div className="rounded border border-ink-faint/30 bg-[#1a1612]/40 p-2 md:p-5 mb-4 md:mb-6 overflow-x-auto">
        <div className="min-w-[680px]">
          <MultiAgentDiagram />
        </div>
      </div>

      {/* Three explanatory cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <ArchCard icon={Brain}    color="#C9A97E" title={t(STRINGS.arch.companyDeepTitle)} desc={t(STRINGS.arch.companyDeepDesc)} highlight />
        <ArchCard icon={GitBranch} color="#A8896E" title={t(STRINGS.arch.overallTitle)}     desc={t(STRINGS.arch.overallDesc)} />
        <ArchCard icon={Award}    color="#6FAF8D" title={t(STRINGS.arch.evalTitle)}        desc={t(STRINGS.arch.evalDesc)} />
      </div>
    </section>
  );
}

function ArchCard({
  icon: Icon, color, title, desc, highlight,
}: {
  icon: typeof Brain; color: string; title: string; desc: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded border ${highlight ? 'border-accent/60 bg-[#1f1812]' : 'border-ink-faint/30 bg-[#1a1612]/60'} p-4 md:p-5 flex flex-col`}>
      <div className="flex items-center gap-2 mb-2 md:mb-3">
        <Icon size={18} strokeWidth={1.4} style={{ color }} />
        <h3 className="font-display italic-display text-[16px] md:text-[17px] text-ink">{title}</h3>
      </div>
      <p className="font-body text-[12px] md:text-[12.5px] text-ink-muted leading-relaxed">{desc}</p>
    </div>
  );
}

// ── Section 4: Performance ──────────────────────────────────────────────────
function PerformanceSection() {
  const t = useT();
  return (
    <section data-snap-id="performance" className="flex flex-col justify-center px-6 md:px-14 max-w-6xl mx-auto py-12 md:py-20">
      <SectionEyebrow num="03" label={STRINGS.perf.eyebrow} />
      <h2 className="font-display italic-display text-[28px] sm:text-[32px] md:text-[52px] leading-[1.1] text-ink mb-2 mt-3">
        {t(STRINGS.perf.title)}
      </h2>
      <p className="font-body italic text-[12px] md:text-[13px] text-ink-faint mb-6 md:mb-10 max-w-3xl">{t(STRINGS.perf.sub)}</p>
      <HoldingsPanel />
    </section>
  );
}

// ── Section 5: Models ───────────────────────────────────────────────────────
function ModelsSection() {
  const t = useT();
  return (
    <section data-snap-id="models" className="flex flex-col justify-center px-6 md:px-14 max-w-6xl mx-auto py-12 md:py-16">
      <SectionEyebrow num="04" label={STRINGS.models.eyebrow} />
      <h2 className="font-display italic-display text-[26px] sm:text-[30px] md:text-[44px] leading-[1.12] text-ink mb-3 mt-3 max-w-3xl">
        {t(STRINGS.models.title)}
      </h2>
      <p className="font-body text-[13px] md:text-[15px] text-ink-muted leading-relaxed max-w-3xl mb-5 md:mb-6">
        {t(STRINGS.models.sub)}
      </p>

      <GatewayPanel />

      <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-faint mb-3">
        {t(STRINGS.models.directTitle)}
      </div>
      <ModelLogos variant="grid" size="md" />

      <p className="mt-5 font-body italic text-[11px] md:text-[11.5px] text-ink-faint max-w-3xl">
        {t(STRINGS.models.arenaNote)}
      </p>
    </section>
  );
}

// ── Section 6: Demos (preview iframe + prev/next) ───────────────────────────
function DemosSection() {
  const t = useT();
  return (
    <section data-snap-id="demos" className="flex flex-col justify-center px-6 md:px-14 max-w-6xl mx-auto py-10 md:py-12">
      <SectionEyebrow num="05" label={STRINGS.demoPreview.eyebrow} />
      <div className="flex items-end justify-between gap-3 flex-wrap mb-4 mt-3">
        <h2 className="font-display italic-display text-[26px] sm:text-[30px] md:text-[42px] leading-[1.1] text-ink">
          {t(STRINGS.demoPreview.title)}
        </h2>
        <p className="font-body text-[12px] md:text-[13px] text-ink-muted max-w-md leading-relaxed">
          {t(STRINGS.demoPreview.sub)}
        </p>
      </div>
      <DemoPreview />
    </section>
  );
}

// ── Section 7: Contact + Footer ─────────────────────────────────────────────
function ContactSection() {
  const t = useT();
  const links = [
    { icon: Github, label: STRINGS.contact.githubLabel, value: 'github.com/Rain1601', href: 'https://github.com/Rain1601' },
    { icon: Globe,  label: STRINGS.contact.blogLabel,   value: 'raincraft.dev',       href: 'https://raincraft.dev/' },
  ];
  return (
    <section data-snap-id="contact" className="flex flex-col justify-center px-6 md:px-14 max-w-6xl mx-auto py-12 md:py-20">
      <SectionEyebrow num="06" label={STRINGS.contact.eyebrow} />
      <h2 className="font-display italic-display text-[26px] sm:text-[30px] md:text-[44px] leading-[1.18] text-ink max-w-3xl mb-3 md:mb-4 mt-3">
        {t(STRINGS.contact.title)}
      </h2>
      <p className="font-body text-[13px] md:text-[15px] leading-relaxed text-ink-muted max-w-2xl mb-6 md:mb-10">
        {t(STRINGS.contact.sub)}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-10">
        <CopyableEmail email="rain1104@foxmail.com" />
        {links.map(({ icon: Icon, label, value, href }) => (
          <a
            key={value}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded border border-ink-faint/30 bg-[#1a1612]/60 p-5 hover:border-accent/60 hover:bg-[#1f1a16] transition-colors flex items-start gap-4"
          >
            <Icon size={22} strokeWidth={1.4} className="text-ink-muted group-hover:text-ink transition-colors mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-faint mb-1">{t(label)}</div>
              <div className="font-body text-[15px] text-ink truncate">{value}</div>
            </div>
            <ArrowUpRight size={14} strokeWidth={1.5} className="text-ink-faint group-hover:text-ink transition-colors mt-1" />
          </a>
        ))}
      </div>
      <footer className="border-t border-ink-faint/30 pt-5 text-ink-faint font-mono text-[11px] uppercase tracking-[0.18em] flex items-center justify-between flex-wrap gap-2">
        <span>{t(STRINGS.landing.footer)}</span>
        <span>uteki.app · {new Date().getFullYear()}</span>
      </footer>
    </section>
  );
}

// ── Shared ──────────────────────────────────────────────────────────────────
function SectionEyebrow({ num, label }: { num: string; label: { zh: string; en: string } }) {
  const t = useT();
  return (
    <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.24em] sm:tracking-[0.32em] text-accent mt-4 md:mt-16">
      § {num} · {t(label)}
    </div>
  );
}

void useI18n;
