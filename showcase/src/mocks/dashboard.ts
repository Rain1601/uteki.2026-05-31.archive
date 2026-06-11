import { sleep } from './stream';

export interface EvalOverview {
  total_arena_runs: number;
  total_decisions: number;
  best_model: string;
  avg_win_rate: number;
  avg_latency_ms: number;
  avg_cost_usd: number;
  total_cost_usd: number;
}

export interface LeaderboardEntry {
  id: string;
  model_provider: string;
  model_name: string;
  adoption_count: number;
  adoption_rate: number;
  win_count: number;
  loss_count: number;
  win_rate: number;
  total_decisions: number;
  avg_return_pct: number;
  rank: number;
}

export interface AccountSummary {
  nav_usd: number;
  cash_usd: number;
  today_pnl_usd: number;
  today_pnl_pct: number;
  week_pnl_usd: number;
  week_pnl_pct: number;
  total_return_pct: number;
}

export interface Position {
  symbol: string;
  name_zh: string;
  name_en: string;
  qty: number;
  price: number;
  market_value: number;
  weight_pct: number;
  return_pct: number;
  day_change_pct: number;
}

export interface AgentVerdictRow {
  symbol: string;
  action: 'BUY' | 'WATCH' | 'AVOID';
  conviction: number;
  one_sentence_zh: string;
  one_sentence_en: string;
  model: string;
  hours_ago: number;
}

export interface DashboardHeadline {
  id: string;
  source: string;
  importance: 'critical' | 'high' | 'medium';
  impact: 'bullish' | 'bearish' | 'neutral';
  zh: string;
  en: string;
  time: string;
}

export async function getOverview(): Promise<EvalOverview> {
  await sleep(60);
  return {
    total_arena_runs: 248,
    total_decisions: 1432,
    best_model: 'claude-opus-4-7',
    avg_win_rate: 0.642,
    avg_latency_ms: 3180,
    avg_cost_usd: 0.082,
    total_cost_usd: 117.42,
  };
}

export async function getAccount(): Promise<AccountSummary> {
  await sleep(80);
  return {
    nav_usd: 127432.16,
    cash_usd: 18204.51,
    today_pnl_usd: 1842.31,
    today_pnl_pct: 1.467,
    week_pnl_usd: 4218.06,
    week_pnl_pct: 3.42,
    total_return_pct: 27.43,
  };
}

export async function getPositions(): Promise<Position[]> {
  await sleep(90);
  return [
    { symbol: 'NVDA',  name_zh: '英伟达', name_en: 'NVIDIA',          qty: 92,  price: 174.32, market_value: 16037.44, weight_pct: 12.58, return_pct: 38.4, day_change_pct: 2.1 },
    { symbol: 'AAPL',  name_zh: '苹果',   name_en: 'Apple',           qty: 78,  price: 195.51, market_value: 15249.78, weight_pct: 11.97, return_pct: 14.8, day_change_pct: 0.6 },
    { symbol: 'MSFT',  name_zh: '微软',   name_en: 'Microsoft',       qty: 32,  price: 442.12, market_value: 14147.84, weight_pct: 11.10, return_pct: 19.7, day_change_pct: 0.9 },
    { symbol: 'BRK.B', name_zh: '伯克希尔', name_en: 'Berkshire',     qty: 28,  price: 451.18, market_value: 12633.04, weight_pct: 9.91,  return_pct: 11.2, day_change_pct: -0.3 },
    { symbol: 'GOOGL', name_zh: '谷歌',   name_en: 'Alphabet',        qty: 56,  price: 198.04, market_value: 11090.24, weight_pct: 8.70,  return_pct: 22.5, day_change_pct: 1.4 },
    { symbol: 'V',     name_zh: '维萨',   name_en: 'Visa',            qty: 32,  price: 287.16, market_value: 9189.12,  weight_pct: 7.21,  return_pct: 8.9,  day_change_pct: 0.4 },
    { symbol: 'COST',  name_zh: '好市多', name_en: 'Costco',          qty: 9,   price: 891.04, market_value: 8019.36,  weight_pct: 6.29,  return_pct: 16.1, day_change_pct: -0.2 },
    { symbol: 'TLT',   name_zh: '长债ETF', name_en: '20Y Treasury ETF', qty: 84, price: 87.92,  market_value: 7385.28, weight_pct: 5.79,  return_pct: -3.2, day_change_pct: -0.5 },
    { symbol: 'GLD',   name_zh: '黄金ETF', name_en: 'Gold ETF',       qty: 28,  price: 268.41, market_value: 7515.48,  weight_pct: 5.89,  return_pct: 9.4,  day_change_pct: 0.7 },
  ];
}

export async function getVerdicts(): Promise<AgentVerdictRow[]> {
  await sleep(70);
  return [
    {
      symbol: 'NVDA', action: 'BUY', conviction: 0.78,
      one_sentence_zh: '推理需求曲线尚未触顶，毛利护城河支撑下一轮再投资。',
      one_sentence_en: 'Inference demand curve has not topped; margin moat funds the next reinvest cycle.',
      model: 'claude-opus-4-7', hours_ago: 3,
    },
    {
      symbol: 'AAPL', action: 'WATCH', conviction: 0.54,
      one_sentence_zh: '服务收入加速但硬件创新缺席，等估值消化。',
      one_sentence_en: 'Services accelerating but hardware lull — wait for valuation reset.',
      model: 'gpt-5-pro', hours_ago: 5,
    },
    {
      symbol: 'COST', action: 'BUY', conviction: 0.71,
      one_sentence_zh: '会员结构性增长 + 自有品牌渗透率到拐点。',
      one_sentence_en: 'Membership compounding plus Kirkland share at an inflection point.',
      model: 'gemini-2.5-pro', hours_ago: 7,
    },
    {
      symbol: 'TSLA', action: 'AVOID', conviction: 0.66,
      one_sentence_zh: '机器人叙事溢价过高，自动驾驶 unit econ 仍在亏损。',
      one_sentence_en: 'Robotics narrative premium overshot; FSD unit economics still negative.',
      model: 'claude-sonnet-4-6', hours_ago: 9,
    },
    {
      symbol: 'BRK.B', action: 'WATCH', conviction: 0.58,
      one_sentence_zh: '现金堆积已逾 GDP 占比警戒线，等待巴菲特重新出手。',
      one_sentence_en: 'Cash pile crossed the historical alarm threshold; wait for the next deployment.',
      model: 'claude-opus-4-7', hours_ago: 11,
    },
    {
      symbol: 'PANW', action: 'BUY', conviction: 0.69,
      one_sentence_zh: 'Cortex 平台化转型完成，ARR 加速 + NRR > 125%。',
      one_sentence_en: 'Cortex platformization done — ARR re-accelerating with NRR above 125%.',
      model: 'gpt-5-pro', hours_ago: 14,
    },
  ];
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  await sleep(70);
  return [
    { id: '1', model_provider: 'anthropic', model_name: 'claude-opus-4-7',  adoption_count: 142, adoption_rate: 0.572, win_count: 78, loss_count: 31, win_rate: 0.715, total_decisions: 109, avg_return_pct: 4.18, rank: 1 },
    { id: '2', model_provider: 'openai',    model_name: 'gpt-5-pro',         adoption_count: 118, adoption_rate: 0.476, win_count: 61, loss_count: 32, win_rate: 0.656, total_decisions: 93,  avg_return_pct: 3.42, rank: 2 },
    { id: '3', model_provider: 'google',    model_name: 'gemini-2.5-pro',    adoption_count: 96,  adoption_rate: 0.387, win_count: 47, loss_count: 28, win_rate: 0.627, total_decisions: 75,  avg_return_pct: 2.91, rank: 3 },
    { id: '4', model_provider: 'anthropic', model_name: 'claude-sonnet-4-6', adoption_count: 84,  adoption_rate: 0.339, win_count: 38, loss_count: 27, win_rate: 0.585, total_decisions: 65,  avg_return_pct: 2.04, rank: 4 },
    { id: '5', model_provider: 'xai',       model_name: 'grok-4',            adoption_count: 52,  adoption_rate: 0.210, win_count: 22, loss_count: 19, win_rate: 0.537, total_decisions: 41,  avg_return_pct: 1.33, rank: 5 },
  ];
}

export async function getHeadlines(): Promise<DashboardHeadline[]> {
  await sleep(60);
  return [
    {
      id: 'h1', source: 'Bloomberg', importance: 'critical', impact: 'bearish',
      zh: '美联储 12 月会议纪要：多位委员主张暂停降息',
      en: 'FOMC December minutes: several members push to pause rate cuts',
      time: '08:14',
    },
    {
      id: 'h2', source: 'Reuters', importance: 'high', impact: 'bullish',
      zh: '英伟达获微软 2026 全年 GB300 优先供货承诺',
      en: 'NVIDIA secures full-year priority GB300 supply commitment from Microsoft',
      time: '07:42',
    },
    {
      id: 'h3', source: 'CNBC', importance: 'high', impact: 'neutral',
      zh: '美国 1 月非农就业新增 18.4 万，符合预期',
      en: 'US January nonfarm payrolls +184k, in line with expectations',
      time: '07:31',
    },
    {
      id: 'h4', source: 'FT', importance: 'medium', impact: 'bullish',
      zh: '日元单日反弹 1.8%，市场预期 BOJ 鸽派转向',
      en: 'Yen surges 1.8% in a day on bets BOJ pivots dovish',
      time: '06:55',
    },
    {
      id: 'h5', source: 'WSJ', importance: 'medium', impact: 'bearish',
      zh: 'OPEC+ 推迟 4 月增产计划，原油 reaction muted',
      en: 'OPEC+ delays April supply hike; crude reaction muted',
      time: '05:28',
    },
  ];
}
