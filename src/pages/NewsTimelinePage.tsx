import { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import {
  analyzeNewsStream,
  getMonthlyNews,
  type ImportanceLevel,
  type ImpactDirection,
  type NewsItem,
} from '../mocks/news';
import { useT, useI18n } from '../i18n/I18nProvider';
import { STRINGS } from '../i18n/strings';
import PageMasthead from '../components/PageMasthead';

type Filter = ImportanceLevel | 'all';

export default function NewsTimelinePage() {
  const t = useT();
  const { lang } = useI18n();
  const [data, setData] = useState<Record<string, NewsItem[]>>({});
  const [filter, setFilter] = useState<Filter>('all');
  const [openAi, setOpenAi] = useState<Record<string, { text: string; impact?: ImpactDirection; loading: boolean }>>({});
  const aborts = useRef<Record<string, AbortController>>({});

  useEffect(() => {
    getMonthlyNews(filter).then((r) => setData(r.data));
  }, [filter]);

  const dates = useMemo(() => Object.keys(data).sort((a, b) => (a < b ? 1 : -1)), [data]);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCount = (data[todayStr] ?? []).length;

  function onToggleAi(item: NewsItem) {
    if (openAi[item.id]) {
      // close + abort
      aborts.current[item.id]?.abort();
      delete aborts.current[item.id];
      setOpenAi((o) => {
        const next = { ...o };
        delete next[item.id];
        return next;
      });
      return;
    }
    const ac = new AbortController();
    aborts.current[item.id] = ac;
    setOpenAi((o) => ({ ...o, [item.id]: { text: '', loading: true } }));
    (async () => {
      try {
        for await (const ev of analyzeNewsStream(item, lang, ac.signal)) {
          setOpenAi((o) => {
            const cur = o[item.id];
            if (!cur) return o;
            return {
              ...o,
              [item.id]: {
                text: cur.text + (ev.content ?? ''),
                impact: ev.impact ?? cur.impact,
                loading: !ev.done,
              },
            };
          });
        }
      } catch {
        // aborted
      }
    })();
  }

  const filterChips: { id: Filter; label: string }[] = [
    { id: 'all',      label: t(STRINGS.newsPage.filterAll) },
    { id: 'critical', label: t(STRINGS.newsPage.filterCritical) },
    { id: 'high',     label: t(STRINGS.newsPage.filterHigh) },
    { id: 'medium',   label: t(STRINGS.newsPage.filterMedium) },
    { id: 'low',      label: t(STRINGS.newsPage.filterLow) },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PageMasthead
        eyebrow={lang === 'zh' ? '过去 16 天' : 'Past 16 days'}
        title={t(STRINGS.newsPage.title)}
        subtitle={t(STRINGS.newsPage.todayCount, { n: todayCount })}
        right={
          <div className="flex items-center gap-2 flex-wrap">
            {filterChips.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilter(c.id)}
                className={`font-mono text-[11px] uppercase tracking-wider px-2.5 py-1 rounded border transition-colors ${
                  filter === c.id
                    ? 'border-accent text-ink bg-[#23191a]'
                    : 'border-ink-faint/30 text-ink-muted hover:text-ink hover:border-accent/60'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="flex-1 flex">
        {/* Calendar sidebar */}
        <aside className="w-[260px] border-r border-ink-faint/25 hidden lg:block flex-shrink-0 overflow-y-auto">
          <CalendarMonth dates={dates} highlight={todayStr} />
        </aside>

        {/* Feed */}
        <main className="flex-1 overflow-y-auto">
          {dates.length === 0 && (
            <div className="p-12 text-ink-muted font-body italic">
              {lang === 'zh' ? '没有匹配的新闻' : 'No matching news'}
            </div>
          )}
          {dates.map((date) => (
            <DateGroup key={date} date={date} items={data[date]} openAi={openAi} onToggleAi={onToggleAi} />
          ))}
        </main>
      </div>
    </div>
  );
}

function DateGroup({
  date,
  items,
  openAi,
  onToggleAi,
}: {
  date: string;
  items: NewsItem[];
  openAi: Record<string, { text: string; impact?: ImpactDirection; loading: boolean }>;
  onToggleAi: (i: NewsItem) => void;
}) {
  const { lang } = useI18n();
  const dateLabel = useMemo(() => {
    const d = new Date(date + 'T00:00:00Z');
    return d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
    });
  }, [date, lang]);

  return (
    <section className="border-b border-ink-faint/20">
      <div className="sticky top-0 px-8 py-3 bg-[#15130F]/95 backdrop-blur z-10 border-b border-ink-faint/20 flex items-center justify-between">
        <h3 className="font-display italic-display text-[18px] text-ink">{dateLabel}</h3>
        <span className="font-mono text-[10px] tracking-wider text-ink-faint uppercase">{items.length} items</span>
      </div>
      <ul className="px-8 py-4 space-y-3">
        {items.map((item) => (
          <NewsCard key={item.id} item={item} ai={openAi[item.id]} onToggleAi={() => onToggleAi(item)} />
        ))}
      </ul>
    </section>
  );
}

const IMPORTANCE_DOT: Record<ImportanceLevel, string> = {
  critical: 'bg-loss',
  high: 'bg-neutral',
  medium: 'bg-accent/70',
  low: 'bg-ink-faint',
};

function NewsCard({
  item,
  ai,
  onToggleAi,
}: {
  item: NewsItem;
  ai?: { text: string; impact?: ImpactDirection; loading: boolean };
  onToggleAi: () => void;
}) {
  const t = useT();
  const { lang } = useI18n();
  const impactLabel = ai?.impact
    ? ai.impact === 'bullish' ? t(STRINGS.newsPage.impactBullish)
      : ai.impact === 'bearish' ? t(STRINGS.newsPage.impactBearish)
      : t(STRINGS.newsPage.impactNeutral)
    : null;

  return (
    <li className="border border-ink-faint/20 rounded p-4 bg-[#1a1612]/40">
      <div className="flex items-start gap-3">
        <span className={`mt-2 inline-block h-2 w-2 rounded-full flex-shrink-0 ${IMPORTANCE_DOT[item.importance]}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-3 mb-1.5 flex-wrap">
            <span className="font-mono text-[10px] tracking-wider text-ink-faint">
              {item.source} · {item.time} · <span className="uppercase">{item.importance}</span>
            </span>
            <button
              onClick={onToggleAi}
              className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border inline-flex items-center gap-1.5 transition-colors ${
                ai
                  ? 'border-accent/60 text-ink bg-[#23191a]'
                  : 'border-ink-faint/40 text-ink-muted hover:text-ink hover:border-accent/60'
              }`}
            >
              <Sparkles size={11} />
              {ai ? (ai.loading ? t(STRINGS.newsPage.aiAnalyzing) : t(STRINGS.newsPage.aiDone)) : t(STRINGS.newsPage.aiAnalyze)}
            </button>
          </div>
          <h4 className="font-body text-[15px] text-ink leading-snug">
            {lang === 'zh' ? item.zh : item.en}
          </h4>
          <p className="mt-1.5 font-body text-[12.5px] text-ink-muted leading-relaxed">
            {lang === 'zh' ? item.summary_zh : item.summary_en}
          </p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {item.tags.map((tag) => (
              <span key={tag} className="font-mono text-[9px] uppercase tracking-wider text-ink-faint border border-ink-faint/25 rounded px-1.5 py-0.5">{tag}</span>
            ))}
          </div>

          {ai && (
            <div className="mt-4 rounded border border-[#7c4ec9]/30 bg-[#1a1325]/60 p-3 animate-fade-in">
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#c8a2ff]">
                  AI {t(STRINGS.newsPage.aiAnalyze)}
                </span>
                <div className="flex items-center gap-2">
                  {impactLabel && (
                    <span className={`font-mono text-[10px] uppercase tracking-wider ${
                      ai.impact === 'bullish' ? 'text-gain' :
                      ai.impact === 'bearish' ? 'text-loss' : 'text-neutral'
                    }`}>
                      {impactLabel}
                    </span>
                  )}
                  {ai.loading && <LoadingDots />}
                </div>
              </div>
              <p className="font-body text-[13px] text-ink leading-relaxed whitespace-pre-line">
                {ai.text}
                {ai.loading && <span className="inline-block w-2 h-3 bg-[#c8a2ff] ml-0.5 align-middle animate-shimmer" />}
              </p>
              {!ai.loading && (
                <div className="mt-3 flex items-center gap-3 text-ink-faint">
                  <button className="hover:text-ink"><ThumbsUp size={13} /></button>
                  <button className="hover:text-ink"><ThumbsDown size={13} /></button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function LoadingDots() {
  return (
    <span className="inline-flex gap-1">
      <span className="w-1 h-1 rounded-full bg-[#c8a2ff] animate-shimmer" style={{ animationDelay: '0ms' }} />
      <span className="w-1 h-1 rounded-full bg-[#c8a2ff] animate-shimmer" style={{ animationDelay: '150ms' }} />
      <span className="w-1 h-1 rounded-full bg-[#c8a2ff] animate-shimmer" style={{ animationDelay: '300ms' }} />
    </span>
  );
}

function CalendarMonth({ dates, highlight }: { dates: string[]; highlight: string }) {
  const { lang } = useI18n();
  const dateSet = useMemo(() => new Set(dates), [dates]);
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDayWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = today.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long' });
  const weekdays = lang === 'zh' ? ['日', '一', '二', '三', '四', '五', '六'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent mb-3">{monthLabel}</div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((w, i) => (
          <div key={i} className="font-mono text-[10px] text-ink-faint py-1">{w}</div>
        ))}
        {cells.map((d, i) => {
          if (d == null) return <div key={i} />;
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const has = dateSet.has(iso);
          const isToday = iso === highlight;
          return (
            <div
              key={i}
              className={`font-mono text-[11px] py-1.5 rounded ${
                isToday
                  ? 'bg-ink text-ground'
                  : has
                  ? 'text-ink hover:bg-[#23191a]'
                  : 'text-ink-faint/40'
              }`}
            >
              {d}
              {has && !isToday && (
                <span className="block w-1 h-1 mx-auto mt-0.5 rounded-full bg-accent" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
