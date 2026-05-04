import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight, ChevronDown, LineChart, Newspaper, Bot, Building2, Activity,
  Layers, Vote, Mail, Github, Globe,
} from 'lucide-react';
import { useT, useI18n } from '../i18n/I18nProvider';
import { STRINGS } from '../i18n/strings';
import LangToggle from '../components/LangToggle';
import { BACKGROUND_PAPER, COLOR_BG, COLOR_INK, fmtPct, fmtUsd } from '../theme/editorialTokens';
import MultiAgentDiagram from '../components/landing/MultiAgentDiagram';
import ModelLogos from '../components/landing/ModelLogos';
import { getLeaderboard, getOverview, type EvalOverview, type LeaderboardEntry } from '../mocks/dashboard';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const SECTIONS = [
  { id: 'hero',         labelZh: '首页', labelEn: 'Top' },
  { id: 'about',        labelZh: '介绍', labelEn: 'About' },
  { id: 'architecture', labelZh: '架构', labelEn: 'Architecture' },
  { id: 'performance',  labelZh: '表现', labelEn: 'Performance' },
  { id: 'models',       labelZh: '模型', labelEn: 'Models' },
  { id: 'demos',        labelZh: '演示', labelEn: 'Demos' },
  { id: 'contact',      labelZh: '联系', labelEn: 'Contact' },
];

const FEATURES = [
  { to: '/dashboard',                icon: LineChart,  key: 'dashboard' as const },
  { to: '/macro/market-dashboard',   icon: Activity,   key: 'market'    as const },
  { to: '/news-timeline',            icon: Newspaper,  key: 'news'      as const },
  { to: '/agent',                    icon: Bot,        key: 'agent'     as const },
  { to: '/company-agent',            icon: Building2,  key: 'company'   as const },
];

export default function LandingPage() {
  const t = useT();
  const shellRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Track which section is in view via IntersectionObserver
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
    const sec = shell.querySelector<HTMLElement>(`section[data-snap-id="${id}"]`);
    sec?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div
      style={{ backgroundColor: COLOR_BG, color: COLOR_INK, backgroundImage: BACKGROUND_PAPER }}
      className="relative h-screen overflow-hidden"
    >
      {/* Sticky top bar (overlay) */}
      <header className="absolute top-0 left-0 right-0 px-8 md:px-14 pt-6 pb-3 flex items-center justify-between z-50 bg-[#15130F]/55 backdrop-blur-md border-b border-ink-faint/15">
        <button
          onClick={() => scrollTo('hero')}
          className="font-display italic-display text-[20px] tracking-tight text-ink hover:text-accent transition-colors"
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

      {/* Side dot indicator */}
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

      {/* Snap scroll shell */}
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
    <section data-snap-id="hero" className="relative flex flex-col items-start justify-center px-8 md:px-14 max-w-7xl mx-auto">
      <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-accent mb-6 mt-16">
        {t(STRINGS.landing.eyebrow)} · {t({ zh: '数据为模拟', en: 'mocked data' })}
      </div>
      <h1 className="font-display italic-display text-[48px] md:text-[80px] leading-[1.02] tracking-[-0.02em] text-ink max-w-5xl">
        {t(STRINGS.landing.heroTitle)}
      </h1>
      <p className="mt-8 font-body text-[18px] md:text-[21px] leading-relaxed text-ink-muted max-w-2xl">
        {t(STRINGS.landing.heroSub)}
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-3 rounded border border-ink/60 text-ink font-body text-[15px] hover:bg-ink hover:text-ground transition-colors"
        >
          {t(STRINGS.landing.ctaPrimary)}
          <ArrowUpRight size={16} strokeWidth={1.5} />
        </Link>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-3 rounded border border-ink-faint/40 text-ink-muted font-body text-[15px] hover:text-ink hover:border-accent/60 transition-colors"
        >
          {t({ zh: '一直往下', en: 'Scroll for more' })}
          <ChevronDown size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Pulse scroll cue */}
      <button
        onClick={onNext}
        aria-label="scroll to next"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-ink-faint hover:text-ink transition-colors animate-shimmer"
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
    <section data-snap-id="about" className="flex flex-col justify-center px-8 md:px-14 max-w-6xl mx-auto py-20">
      <SectionEyebrow num="01" label={STRINGS.about.eyebrow} />
      <h2 className="font-display italic-display text-[36px] md:text-[52px] leading-[1.1] text-ink max-w-4xl mb-6 mt-3">
        {t(STRINGS.about.title)}
      </h2>
      <p className="font-body text-[16px] md:text-[18px] leading-relaxed text-ink-muted max-w-3xl mb-12">
        {t(STRINGS.about.p1)}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {pillars.map(({ icon: Icon, title, desc, color }) => (
          <div key={title.zh} className="rounded border border-ink-faint/30 bg-[#1a1612]/60 p-6 flex flex-col">
            <Icon size={22} strokeWidth={1.4} style={{ color }} className="mb-4" />
            <h3 className="font-display italic-display text-[20px] text-ink mb-3 leading-tight">{t(title)}</h3>
            <p className="font-body text-[13.5px] text-ink-muted leading-relaxed">{t(desc)}</p>
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
    <section data-snap-id="architecture" className="flex flex-col justify-center px-8 md:px-14 max-w-7xl mx-auto py-20">
      <SectionEyebrow num="02" label={STRINGS.arch.eyebrow} />
      <div className="flex items-end justify-between gap-4 flex-wrap mb-8 mt-3">
        <h2 className="font-display italic-display text-[36px] md:text-[48px] leading-[1.1] text-ink">
          {t(STRINGS.arch.title)}
        </h2>
        <p className="font-body text-[14px] text-ink-muted max-w-md leading-relaxed">
          {t(STRINGS.arch.sub)}
        </p>
      </div>
      <div className="rounded border border-ink-faint/30 bg-[#1a1612]/40 p-3 md:p-6">
        <MultiAgentDiagram />
      </div>
    </section>
  );
}

// ── Section 4: Performance ──────────────────────────────────────────────────
function PerformanceSection() {
  const t = useT();
  const [overview, setOverview] = useState<EvalOverview | null>(null);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  useEffect(() => {
    Promise.all([getOverview(), getLeaderboard()]).then(([o, b]) => { setOverview(o); setBoard(b); });
  }, []);
  const chartData = board.map((m) => ({
    name: m.model_name.replace('claude-', '').replace('gpt-', '').replace('gemini-', '').replace('-', ' '),
    winRate: parseFloat((m.win_rate * 100).toFixed(1)),
  }));
  return (
    <section data-snap-id="performance" className="flex flex-col justify-center px-8 md:px-14 max-w-6xl mx-auto py-20">
      <SectionEyebrow num="03" label={STRINGS.perf.eyebrow} />
      <h2 className="font-display italic-display text-[36px] md:text-[52px] leading-[1.1] text-ink mb-2 mt-3">
        {t(STRINGS.perf.title)}
      </h2>
      <p className="font-body italic text-[13px] text-ink-faint mb-8">{t(STRINGS.perf.sub)}</p>

      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          <Kpi value={overview.total_arena_runs.toString()} label={t(STRINGS.perf.runs)} />
          <Kpi value={overview.total_decisions.toLocaleString()} label={t(STRINGS.perf.decisions)} />
          <Kpi value={fmtPct(overview.avg_win_rate * 100, 1)} label={t(STRINGS.perf.winRate)} positive />
          <Kpi value="opus 4.7" label={t(STRINGS.perf.bestModel)} />
          <Kpi value={fmtUsd(overview.total_cost_usd)} label={t(STRINGS.perf.cost)} />
          <Kpi value={`${(overview.avg_latency_ms / 1000).toFixed(1)}s`} label={t(STRINGS.perf.latency)} />
        </div>
      )}

      <div className="rounded border border-ink-faint/30 bg-[#1a1612]/60 p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent mb-3">{t(STRINGS.perf.leaderboard)}</div>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#A8A097" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#5C5750' }} tickLine={false} />
              <YAxis stroke="#A8A097" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#5C5750' }} tickLine={false} unit="%" domain={[0, 80]} />
              <Tooltip contentStyle={{ background: '#1B1814', border: '1px solid #A8896E55', borderRadius: 4, fontFamily: 'JetBrains Mono', fontSize: 11 }} cursor={{ fill: '#23191a' }} />
              <Bar dataKey="winRate" name="win rate" fill="#6FAF8D" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

// ── Section 5: Models ───────────────────────────────────────────────────────
function ModelsSection() {
  const t = useT();
  return (
    <section data-snap-id="models" className="flex flex-col justify-center px-8 md:px-14 max-w-6xl mx-auto py-20">
      <SectionEyebrow num="04" label={STRINGS.models.eyebrow} />
      <h2 className="font-display italic-display text-[36px] md:text-[52px] leading-[1.1] text-ink mb-3 mt-3 max-w-3xl">
        {t(STRINGS.models.title)}
      </h2>
      <p className="font-body text-[16px] text-ink-muted leading-relaxed max-w-3xl mb-12">
        {t(STRINGS.models.sub)}
      </p>
      <ModelLogos variant="grid" size="lg" />
      <p className="mt-8 font-body italic text-[12px] text-ink-faint max-w-3xl">
        {t(STRINGS.models.arenaNote)}
      </p>
    </section>
  );
}

// ── Section 6: Demos ────────────────────────────────────────────────────────
function DemosSection() {
  const t = useT();
  return (
    <section data-snap-id="demos" className="flex flex-col justify-center px-8 md:px-14 max-w-6xl mx-auto py-20">
      <SectionEyebrow num="05" label={STRINGS.landing.sectionFeatures} />
      <h2 className="font-display italic-display text-[36px] md:text-[48px] leading-[1.1] text-ink mb-3 mt-3">
        {t({ zh: '现在就点开看看', en: 'Open one now' })}
      </h2>
      <p className="font-body text-[14px] text-ink-muted max-w-2xl leading-relaxed mb-10">
        {t(STRINGS.landing.sectionFeaturesSub)}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(({ to, icon: Icon, key }) => (
          <Link
            key={to}
            to={to}
            className="group rounded border border-ink-faint/30 bg-[#1a1612]/60 p-5 hover:border-accent/60 transition-colors flex flex-col min-h-[170px]"
          >
            <div className="flex items-start justify-between mb-3">
              <Icon size={20} strokeWidth={1.4} className="text-ink-muted group-hover:text-ink transition-colors" />
              <ArrowUpRight size={15} strokeWidth={1.5} className="text-ink-faint group-hover:text-ink transition-colors" />
            </div>
            <h3 className="font-display italic-display text-[20px] text-ink mb-2 leading-tight">
              {t(STRINGS.features[key].title)}
            </h3>
            <p className="font-body text-[12.5px] text-ink-muted leading-relaxed mt-auto">
              {t(STRINGS.features[key].desc)}
            </p>
            <div className="mt-3 font-mono text-[10px] tracking-wider text-ink-faint">{to}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Section 7: Contact + Footer ─────────────────────────────────────────────
function ContactSection() {
  const t = useT();
  const contacts = [
    { icon: Mail,   label: STRINGS.contact.emailLabel,  value: 'rain1104@foxmail.com', href: 'mailto:rain1104@foxmail.com' },
    { icon: Github, label: STRINGS.contact.githubLabel, value: 'github.com/Rain1601',  href: 'https://github.com/Rain1601' },
    { icon: Globe,  label: STRINGS.contact.blogLabel,   value: 'raincraft.dev',        href: 'https://raincraft.dev/' },
  ];
  return (
    <section data-snap-id="contact" className="flex flex-col justify-center px-8 md:px-14 max-w-6xl mx-auto py-20">
      <SectionEyebrow num="06" label={STRINGS.contact.eyebrow} />
      <h2 className="font-display italic-display text-[34px] md:text-[44px] leading-[1.15] text-ink max-w-3xl mb-4 mt-3">
        {t(STRINGS.contact.title)}
      </h2>
      <p className="font-body text-[15px] leading-relaxed text-ink-muted max-w-2xl mb-10">
        {t(STRINGS.contact.sub)}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {contacts.map(({ icon: Icon, label, value, href }) => (
          <a
            key={value}
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
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
    <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-accent mt-12 md:mt-16">
      § {num} · {t(label)}
    </div>
  );
}

function Kpi({ value, label, positive }: { value: string; label: string; positive?: boolean }) {
  return (
    <div className="border-l-2 border-ink-faint/30 pl-3">
      <div className={`font-display italic-display text-[28px] leading-none mb-1 ${positive ? 'text-gain' : 'text-ink'}`}>
        {value}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">{label}</div>
    </div>
  );
}

// silence imports kept for backward compatibility
void useI18n;
