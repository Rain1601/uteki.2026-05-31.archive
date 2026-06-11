import { mockStream, sleep, tokenize } from './stream';

export type ImportanceLevel = 'critical' | 'high' | 'medium' | 'low';
export type ImpactDirection = 'bullish' | 'bearish' | 'neutral';

export interface NewsItem {
  id: string;
  source: 'Bloomberg' | 'Reuters' | 'CNBC' | 'WSJ' | 'FT';
  category: 'crypto' | 'stocks' | 'forex' | 'macro';
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  zh: string;
  en: string;
  summary_zh: string;
  summary_en: string;
  tags: string[];
  importance: ImportanceLevel;
  impact: ImpactDirection;
  has_ai: boolean;
}

const RAW: Omit<NewsItem, 'id' | 'date'>[] = [
  { source: 'Bloomberg', category: 'macro',  time: '08:14', zh: '美联储 12 月会议纪要：多位委员主张暂停降息', en: 'FOMC December minutes: several members push to pause rate cuts',
    summary_zh: '会议纪要显示鹰派票委明显增多，理由是核心服务通胀仍在 4% 上方。市场已下调 3 月降息概率至 32%。',
    summary_en: 'Minutes reveal a notably more hawkish faction, citing core services inflation still above 4%. March cut odds dropped to 32%.',
    tags: ['fed', 'rates'], importance: 'critical', impact: 'bearish', has_ai: true },
  { source: 'Reuters', category: 'stocks', time: '07:42', zh: '英伟达获微软 2026 全年 GB300 优先供货承诺', en: 'NVIDIA secures full-year priority GB300 supply commitment from Microsoft',
    summary_zh: '微软将在 GB300 量产后获得头批供应，对应的资本支出预算从此前 800 亿上调至 950 亿美元。',
    summary_en: 'Microsoft to receive first GB300 batches; capex budget revised up from $80B to $95B.',
    tags: ['nvda', 'msft', 'ai'], importance: 'high', impact: 'bullish', has_ai: true },
  { source: 'CNBC', category: 'macro', time: '07:31', zh: '美国 1 月非农就业新增 18.4 万，符合预期', en: 'US January nonfarm payrolls +184k, in line',
    summary_zh: '失业率维持 4.0%，平均时薪环比 0.3%。市场反应温和，2 年期收益率上行 3bp。',
    summary_en: 'Unemployment rate steady at 4.0%, average hourly earnings +0.3% MoM. 2Y yield +3bps.',
    tags: ['payrolls'], importance: 'high', impact: 'neutral', has_ai: true },
  { source: 'FT', category: 'forex', time: '06:55', zh: '日元单日反弹 1.8%，市场预期 BOJ 鸽派转向', en: 'Yen surges 1.8% in a day on bets BOJ pivots dovish',
    summary_zh: 'USDJPY 跌破 152，套息交易盘出现部分平仓。期权市场 1 周隐含波动率跳升至 9.4。',
    summary_en: 'USDJPY broke below 152; carry positions partially unwound. 1w implied vol jumped to 9.4.',
    tags: ['jpy', 'carry'], importance: 'medium', impact: 'bullish', has_ai: true },
  { source: 'WSJ', category: 'macro', time: '05:28', zh: 'OPEC+ 推迟 4 月增产计划，原油 reaction muted', en: 'OPEC+ delays April supply hike; crude reaction muted',
    summary_zh: '产量恢复推迟至少一个季度。Brent 仅上行 0.6%，反映需求侧担忧仍主导。',
    summary_en: 'Output restoration delayed at least a quarter. Brent only +0.6%, demand worries still dominant.',
    tags: ['oil', 'opec'], importance: 'medium', impact: 'neutral', has_ai: false },
  { source: 'Bloomberg', category: 'stocks', time: '04:11', zh: '苹果服务业务一季度同比增 14%，超市场预期', en: "Apple Services revenue +14% YoY in Q1, beats consensus",
    summary_zh: '订阅业务和广告分别贡献 9pct 和 3pct 增速。硬件部分 iPhone 同比 -3%。',
    summary_en: 'Subscriptions and ads added 9 and 3 ppts. iPhone hardware -3% YoY.',
    tags: ['aapl', 'earnings'], importance: 'high', impact: 'bullish', has_ai: true },
  { source: 'Reuters', category: 'crypto', time: '03:28', zh: '比特币现货 ETF 单日净流入 8.2 亿美元，刷新本月新高', en: 'Spot Bitcoin ETFs see $820M net inflow, monthly high',
    summary_zh: 'IBIT 占比超 60%。BTC 价格突破 96,000 美元后回踩 94,500。',
    summary_en: 'IBIT captured 60%+ of inflows. BTC topped $96k then retraced to $94.5k.',
    tags: ['btc', 'etf'], importance: 'medium', impact: 'bullish', has_ai: true },
  { source: 'CNBC', category: 'stocks', time: '02:17', zh: 'Costco 1 月同店销售 +6.8%，会员续费率 92.9%', en: 'Costco January comp sales +6.8%, member renewal at 92.9%',
    summary_zh: '美国本土同店 +5.4%，电商 +18.6%。Kirkland 渗透率继续提升。',
    summary_en: 'US comps +5.4%, e-commerce +18.6%. Kirkland penetration rising.',
    tags: ['cost'], importance: 'medium', impact: 'bullish', has_ai: false },
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function dateOffset(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export interface MonthlyNews {
  data: Record<string, NewsItem[]>;
  total: number;
}

export async function getMonthlyNews(filter?: ImportanceLevel | 'all'): Promise<MonthlyNews> {
  await sleep(120);
  const out: Record<string, NewsItem[]> = {};
  // populate today and the previous 14 days with 3-7 items per day from the pool
  for (let dayBack = 0; dayBack < 16; dayBack++) {
    const date = dateOffset(dayBack);
    const count = 4 + ((dayBack * 7) % 4); // 4..7
    const items: NewsItem[] = [];
    for (let i = 0; i < count; i++) {
      const tpl = RAW[(dayBack * 11 + i * 3) % RAW.length];
      const id = `n_${date}_${i}`;
      items.push({ ...tpl, id, date });
    }
    out[date] = items;
  }
  const filtered: Record<string, NewsItem[]> = {};
  let total = 0;
  for (const [date, items] of Object.entries(out)) {
    const f = filter && filter !== 'all' ? items.filter((i) => i.importance === filter) : items;
    if (f.length) {
      filtered[date] = f;
      total += f.length;
    }
  }
  return { data: filtered, total };
}

export async function getTodayCount(): Promise<number> {
  await sleep(40);
  const t = todayISO();
  const r = await getMonthlyNews('all');
  return (r.data[t] ?? []).length;
}

// ── AI analysis stream (mocked SSE) ──────────────────────────────────────
export interface NewsAnalysisChunk {
  content?: string;
  impact?: ImpactDirection;
  done?: boolean;
}

const ANALYSIS_LIBRARY: Record<string, { zh: string; en: string; impact: ImpactDirection }> = {
  fed: {
    zh: '会议纪要把一票委员的鹰派立场拉到台前。这意味着市场之前定价的 3 月降息概率（54%）需要明显下调，已回落至 32%。对持仓影响：长债（TLT）短期承压，但科技股若靠盈利驱动反而能扛住——因为利率预期再上移空间有限。短期保持平衡。',
    en: 'The minutes elevate the hawkish faction. The market-implied March cut probability (was 54%) needs to come down — now at 32%. Portfolio read: long bonds (TLT) face short-term pressure, but earnings-driven techs can absorb it because there is little room for rate expectations to move higher. Stay balanced.',
    impact: 'bearish',
  },
  nvda_msft: {
    zh: '微软的 capex 上修是关键信号——850 亿到 950 亿的增量，全部锁定在 NVDA 头部供应。这把英伟达的 2026 全年 visibility 拉满，估值有望从"周期性溢价"转为"必需品估值"，对应远期 P/E 大概率从 32 上修到 38。结论：NVDA 仍是核心持仓。',
    en: 'The microsoft capex revision is the key signal — the $80B→$95B step-up is fully tied to NVDA priority supply. This pins down NVDA visibility for full-year 2026, and re-rates valuation from "cyclical premium" to "essential infrastructure." Forward P/E likely shifts from 32 to 38. Verdict: NVDA stays core.',
    impact: 'bullish',
  },
  payrolls: {
    zh: '+18.4 万符合预期，时薪 +0.3% MoM 也接近软着陆区间。这种"刚刚好"的数据通常是宏观有利环境的信号——市场不需要重新定价利率路径，权益的盈利逻辑可以继续运转。今日不必调整持仓。',
    en: 'The +184k print is in line, with wages +0.3% MoM near soft-landing range. This Goldilocks signature usually preserves the macro tailwind — markets don\'t need to re-price the rate path, and equity earnings logic can keep running. No portfolio action needed today.',
    impact: 'neutral',
  },
  jpy: {
    zh: 'USDJPY 跌破 152 + 1 周隐含波动率跳到 9.4，这是套息交易盘部分平仓的典型组合。如果 BOJ 真的鸽派转向，海外资产（尤其美股）短期会承压，因为日元 carry unwind 历来是流动性虹吸事件。建议短期降低风险敞口。',
    en: 'USDJPY through 152 plus 1w vol jump to 9.4 is a classic partial carry unwind. If BOJ does pivot dovish, foreign assets (especially US equities) face near-term pressure — JPY carry unwinds are historically liquidity-suction events. Trim risk into the move.',
    impact: 'bearish',
  },
  apple: {
    zh: '服务业务 +14% 把 Apple 的"硬件公司"叙事彻底改写。订阅 ARPU 在涨、广告变现刚刚开始——这两条线的毛利率都在 70% 以上。iPhone -3% 不重要，关键是估值锚从硬件 P/E 转为软件 SaaS P/E。建议 WATCH→BUY 等 24h 复盘。',
    en: 'Services +14% rewrites the "hardware company" narrative. Subscription ARPU is rising and ad monetization just starting — both lines are 70%+ gross margin. iPhone -3% is irrelevant; the valuation anchor shifts from hardware P/E to software SaaS P/E. Lean WATCH→BUY pending 24h re-read.',
    impact: 'bullish',
  },
  btc: {
    zh: '8.2 亿单日净流入 + IBIT 60% 占比，说明机构配置仍在加速。94,500 的回踩在 50% 黄金分割位置，技术面保留多头结构。中期看现货 ETF 进入第二阶段——养老金和州主权基金。',
    en: '$820M net inflow with IBIT capturing 60%+ shows institutional allocation still accelerating. The retracement to $94.5k sits on the 50% Fibonacci, preserving the bullish structure. Medium-term, spot ETFs are entering phase two — pensions and state SWFs.',
    impact: 'bullish',
  },
};

function pickAnalysis(item: NewsItem) {
  const t = item.tags[0] ?? '';
  if (t === 'fed' || t === 'rates') return ANALYSIS_LIBRARY.fed;
  if (t === 'nvda' || t === 'msft' || t === 'ai') return ANALYSIS_LIBRARY.nvda_msft;
  if (t === 'payrolls') return ANALYSIS_LIBRARY.payrolls;
  if (t === 'jpy' || t === 'carry') return ANALYSIS_LIBRARY.jpy;
  if (t === 'aapl' || t === 'earnings') return ANALYSIS_LIBRARY.apple;
  if (t === 'btc' || t === 'etf') return ANALYSIS_LIBRARY.btc;
  return ANALYSIS_LIBRARY.payrolls;
}

export function analyzeNewsStream(item: NewsItem, lang: 'zh' | 'en', signal?: AbortSignal) {
  const a = pickAnalysis(item);
  const text = lang === 'zh' ? a.zh : a.en;
  const tokens = tokenize(text, lang === 'zh' ? 3 : 5);
  const events: { _delayMs?: number; chunk?: NewsAnalysisChunk }[] = [];
  events.push({ _delayMs: 200, chunk: {} }); // initial delay
  for (const tok of tokens) {
    events.push({ _delayMs: 22, chunk: { content: tok } });
  }
  events.push({ _delayMs: 240, chunk: { impact: a.impact, done: true } });
  // Map to an iterable that yields the inner chunk
  type Wrapper = { _delayMs?: number; chunk: NewsAnalysisChunk };
  const stream = mockStream<Wrapper>(
    events as Wrapper[],
    { signal, defaultDelayMs: 22, jitterMs: 14 },
  );
  return (async function* () {
    for await (const ev of stream) {
      yield ev.chunk;
    }
  })();
}
