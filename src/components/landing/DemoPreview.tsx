import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowUpRight, LineChart, Activity, Newspaper, Bot, Building2 } from 'lucide-react';
import { useT } from '../../i18n/I18nProvider';
import { STRINGS } from '../../i18n/strings';

interface DemoEntry {
  to: string;
  icon: typeof LineChart;
  key: 'dashboard' | 'market' | 'news' | 'agent' | 'company';
}

const DEMOS: DemoEntry[] = [
  { to: '/dashboard',                icon: LineChart,  key: 'dashboard' },
  { to: '/macro/market-dashboard',   icon: Activity,   key: 'market'    },
  { to: '/news-timeline',            icon: Newspaper,  key: 'news'      },
  { to: '/agent',                    icon: Bot,        key: 'agent'     },
  { to: '/company-agent',            icon: Building2,  key: 'company'   },
];

export default function DemoPreview() {
  const t = useT();
  const [idx, setIdx] = useState(0);
  const cur = DEMOS[idx];
  const Icon = cur.icon;

  const prev = () => setIdx((i) => (i - 1 + DEMOS.length) % DEMOS.length);
  const next = () => setIdx((i) => (i + 1) % DEMOS.length);

  return (
    <div className="w-full">
      {/* Frame header */}
      <div className="flex items-center justify-between mb-2.5 md:mb-3 gap-2 md:gap-3">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <Icon size={15} strokeWidth={1.5} className="text-accent flex-shrink-0" />
          <h3 className="font-display italic-display text-[16px] md:text-[18px] text-ink truncate">
            {t(STRINGS.features[cur.key].title)}
          </h3>
          <span className="font-mono text-[10px] text-ink-faint hidden sm:inline">{cur.to}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            to={cur.to}
            className="font-mono text-[10px] uppercase tracking-wider px-2 md:px-2.5 py-1 rounded border border-ink-faint/40 text-ink-muted hover:text-ink hover:border-accent/60 inline-flex items-center gap-1"
          >
            <span className="hidden sm:inline">{t(STRINGS.demoPreview.openFull)}</span>
            <span className="sm:hidden">{t({ zh: '打开', en: 'Open' })}</span>
            <ArrowUpRight size={11} strokeWidth={1.6} />
          </Link>
        </div>
      </div>

      {/* Iframe panel with side chevrons */}
      <div className="relative rounded border border-ink-faint/30 bg-[#0f0d0a] overflow-hidden" style={{ height: 'min(74vh, 680px)', minHeight: 360 }}>
        <iframe
          key={cur.to}
          src={`${cur.to}?embed=1`}
          title={t(STRINGS.features[cur.key].title)}
          className="w-full h-full"
          style={{ border: 0, background: '#15130F' }}
        />

        {/* Side chevrons */}
        <button
          aria-label={t(STRINGS.demoPreview.prev)}
          onClick={prev}
          className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 p-1.5 md:p-2 rounded-full bg-[#15130F]/85 backdrop-blur border border-ink-faint/40 text-ink-muted hover:text-ink hover:border-accent/60 z-10"
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>
        <button
          aria-label={t(STRINGS.demoPreview.next)}
          onClick={next}
          className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 p-1.5 md:p-2 rounded-full bg-[#15130F]/85 backdrop-blur border border-ink-faint/40 text-ink-muted hover:text-ink hover:border-accent/60 z-10"
        >
          <ChevronRight size={18} strokeWidth={1.5} />
        </button>

        {/* Counter pill */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-widest text-ink-faint bg-[#15130F]/80 backdrop-blur border border-ink-faint/30 rounded-full px-2.5 md:px-3 py-1">
          {String(idx + 1).padStart(2, '0')} / {String(DEMOS.length).padStart(2, '0')}
        </div>
      </div>

      {/* Thumbnail strip — horizontal scroll on mobile */}
      <div className="mt-3 md:mt-4 flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {DEMOS.map((d, i) => {
          const DIcon = d.icon;
          const active = i === idx;
          return (
            <button
              key={d.to}
              onClick={() => setIdx(i)}
              className={`flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 rounded border transition-colors flex-shrink-0 whitespace-nowrap ${
                active
                  ? 'border-accent/70 text-ink bg-[#23191a]'
                  : 'border-ink-faint/30 text-ink-muted hover:text-ink hover:border-accent/40'
              }`}
            >
              <DIcon size={13} strokeWidth={1.5} />
              <span className="font-body text-[11px] md:text-[12px]">{t(STRINGS.features[d.key].title)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
