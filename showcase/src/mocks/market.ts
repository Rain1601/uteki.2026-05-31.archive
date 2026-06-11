import { sleep } from './stream';

export type Signal = 'green' | 'yellow' | 'red' | 'neutral';

export interface HistoryPoint {
  date: string;
  value: number;
}

export interface Indicator {
  id: string;
  name_zh: string;
  name_en: string;
  value: number;
  unit?: string;
  signal: Signal;
  change_pct?: number;
  history?: HistoryPoint[];
}

export interface CategoryData {
  category: 'valuation' | 'liquidity' | 'flow';
  question_zh: string;
  question_en: string;
  signal: Signal;
  signal_label_zh: string;
  signal_label_en: string;
  hero: Indicator;
  indicators: Indicator[];
}

export interface SectorETF {
  symbol: string;
  name_zh: string;
  name_en: string;
  change_pct: number;
}

export interface StyleComparison {
  label_zh: string;
  label_en: string;
  a: { symbol: string; name_zh: string; name_en: string; change_pct: number };
  b: { symbol: string; name_zh: string; name_en: string; change_pct: number };
}

function genHistory(start: number, n = 52, drift = 0, vol = 0.04, seed = 1): HistoryPoint[] {
  let v = start;
  const points: HistoryPoint[] = [];
  let r = seed;
  for (let i = 0; i < n; i++) {
    r = (r * 9301 + 49297) % 233280;
    const rand = r / 233280;
    v = v * (1 + drift + (rand - 0.5) * vol);
    const date = new Date(Date.UTC(2026, 0, 1));
    date.setUTCDate(date.getUTCDate() - (n - i) * 7);
    points.push({ date: date.toISOString().slice(0, 10), value: parseFloat(v.toFixed(3)) });
  }
  return points;
}

export async function getOverview(): Promise<CategoryData[]> {
  await sleep(80);
  return [
    {
      category: 'valuation',
      question_zh: '现在贵不贵？',
      question_en: 'Is the market expensive?',
      signal: 'red',
      signal_label_zh: '偏贵',
      signal_label_en: 'Stretched',
      hero: {
        id: 'shiller_pe', name_zh: 'Shiller CAPE', name_en: 'Shiller CAPE',
        value: 36.2, signal: 'red', change_pct: 0.42,
        history: genHistory(31, 52, 0.001, 0.018, 7),
      },
      indicators: [
        { id: 'spy_pe', name_zh: 'SPY 远期 P/E', name_en: 'SPY Fwd P/E', value: 22.4, signal: 'red', change_pct: 0.21 },
        { id: 'buffett', name_zh: '巴菲特指标', name_en: 'Buffett Indicator', value: 198.4, unit: '%', signal: 'red', change_pct: 0.85 },
        { id: 'erp', name_zh: '股权风险溢价', name_en: 'Equity Risk Premium', value: 1.42, unit: '%', signal: 'red', change_pct: -0.06 },
        { id: 'div_yld', name_zh: '股息率', name_en: 'Dividend Yield', value: 1.31, unit: '%', signal: 'yellow', change_pct: -0.01 },
      ],
    },
    {
      category: 'liquidity',
      question_zh: '钱够不够？',
      question_en: 'Is liquidity tight?',
      signal: 'yellow',
      signal_label_zh: '中性',
      signal_label_en: 'Neutral',
      hero: {
        id: 'fed_bs', name_zh: '美联储资产负债表', name_en: 'Fed Balance Sheet',
        value: 6.74, unit: 'T', signal: 'yellow', change_pct: -0.18,
        history: genHistory(7.2, 52, -0.0008, 0.004, 13),
      },
      indicators: [
        { id: 'rrp', name_zh: '逆回购余额', name_en: 'Reverse Repo', value: 0.182, unit: 'T', signal: 'green', change_pct: -3.4 },
        { id: 'm2', name_zh: 'M2 增速 (yoy)', name_en: 'M2 YoY Growth', value: 4.1, unit: '%', signal: 'yellow', change_pct: 0.2 },
        { id: 'fra_ois', name_zh: 'FRA-OIS 利差', name_en: 'FRA-OIS Spread', value: 18, unit: 'bps', signal: 'green', change_pct: -0.8 },
        { id: 'sofr', name_zh: 'SOFR', name_en: 'SOFR', value: 4.31, unit: '%', signal: 'yellow', change_pct: 0.01 },
      ],
    },
    {
      category: 'flow',
      question_zh: '钱在去哪？',
      question_en: 'Where is the flow going?',
      signal: 'green',
      signal_label_zh: '风险偏好',
      signal_label_en: 'Risk-on',
      hero: {
        id: 'qqq_spy', name_zh: 'QQQ vs SPY 5d', name_en: 'QQQ vs SPY 5d',
        value: 1.42, unit: '%', signal: 'green', change_pct: 0.32,
      },
      indicators: [
        { id: 'iwm_spy', name_zh: 'IWM vs SPY 5d', name_en: 'IWM vs SPY 5d', value: 0.71, unit: '%', signal: 'green', change_pct: 0.18 },
        { id: 'hyg_lqd', name_zh: '高收益债 vs 投资级', name_en: 'HYG vs LQD', value: 0.48, unit: '%', signal: 'green', change_pct: 0.09 },
        { id: 'vix', name_zh: 'VIX', name_en: 'VIX', value: 14.2, signal: 'green', change_pct: -2.1 },
        { id: 'tnx', name_zh: '10Y 收益率', name_en: '10Y Yield', value: 4.18, unit: '%', signal: 'yellow', change_pct: 0.04 },
      ],
    },
  ];
}

export async function getSectors(): Promise<SectorETF[]> {
  await sleep(70);
  return [
    { symbol: 'XLK',  name_zh: '科技',     name_en: 'Technology',     change_pct: 1.84 },
    { symbol: 'XLC',  name_zh: '通信',     name_en: 'Communication',  change_pct: 1.21 },
    { symbol: 'XLY',  name_zh: '可选消费', name_en: 'Consumer Disc.', change_pct: 0.96 },
    { symbol: 'XLF',  name_zh: '金融',     name_en: 'Financials',     change_pct: 0.42 },
    { symbol: 'XLI',  name_zh: '工业',     name_en: 'Industrials',    change_pct: 0.18 },
    { symbol: 'XLP',  name_zh: '必需消费', name_en: 'Staples',        change_pct: -0.21 },
    { symbol: 'XLV',  name_zh: '医疗',     name_en: 'Health Care',    change_pct: -0.34 },
    { symbol: 'XLU',  name_zh: '公用事业', name_en: 'Utilities',      change_pct: -0.52 },
    { symbol: 'XLB',  name_zh: '材料',     name_en: 'Materials',      change_pct: -0.71 },
    { symbol: 'XLRE', name_zh: '地产',     name_en: 'Real Estate',    change_pct: -0.94 },
    { symbol: 'XLE',  name_zh: '能源',     name_en: 'Energy',         change_pct: -1.62 },
  ];
}

export async function getStyleComparisons(): Promise<StyleComparison[]> {
  await sleep(60);
  return [
    {
      label_zh: '成长 vs 价值',
      label_en: 'Growth vs Value',
      a: { symbol: 'IVW', name_zh: '成长', name_en: 'Growth', change_pct: 1.42 },
      b: { symbol: 'IVE', name_zh: '价值', name_en: 'Value',  change_pct: 0.18 },
    },
    {
      label_zh: '大盘 vs 小盘',
      label_en: 'Large vs Small',
      a: { symbol: 'SPY', name_zh: '大盘', name_en: 'Large',  change_pct: 0.92 },
      b: { symbol: 'IWM', name_zh: '小盘', name_en: 'Small',  change_pct: 1.63 },
    },
    {
      label_zh: '美股 vs 海外',
      label_en: 'US vs Intl',
      a: { symbol: 'SPY', name_zh: '美股', name_en: 'US',     change_pct: 0.92 },
      b: { symbol: 'EFA', name_zh: '海外', name_en: 'Intl',   change_pct: 0.31 },
    },
  ];
}

export async function getValuationDetail(): Promise<Indicator[]> {
  await sleep(60);
  return [
    { id: 'spy_pe', name_zh: 'SPY 远期 P/E', name_en: 'SPY Forward P/E', value: 22.4, signal: 'red', change_pct: 0.21, history: genHistory(20.1, 52, 0.0015, 0.012, 3) },
    { id: 'shiller', name_zh: 'Shiller CAPE', name_en: 'Shiller CAPE', value: 36.2, signal: 'red', change_pct: 0.42, history: genHistory(31, 52, 0.0014, 0.014, 11) },
    { id: 'buffett', name_zh: '巴菲特指标', name_en: 'Buffett Indicator', value: 198.4, unit: '%', signal: 'red', change_pct: 0.85, history: genHistory(170, 52, 0.0024, 0.018, 21) },
  ];
}

export async function getLiquidityDetail(): Promise<Indicator[]> {
  await sleep(60);
  return [
    { id: 'fed_bs', name_zh: '美联储资产负债表', name_en: 'Fed Balance Sheet', value: 6.74, unit: 'T', signal: 'yellow', change_pct: -0.18, history: genHistory(7.2, 52, -0.0008, 0.004, 5) },
    { id: 'rrp', name_zh: '逆回购余额', name_en: 'Reverse Repo', value: 0.182, unit: 'T', signal: 'green', change_pct: -3.4, history: genHistory(1.4, 52, -0.04, 0.04, 9) },
    { id: 'm2', name_zh: 'M2 增速', name_en: 'M2 YoY', value: 4.1, unit: '%', signal: 'yellow', change_pct: 0.2, history: genHistory(2.0, 52, 0.012, 0.022, 17) },
  ];
}
