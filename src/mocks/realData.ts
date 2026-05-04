/**
 * Curated finished-analysis samples shown in the "真实数据" landing section.
 * Each entry is the kind of output the agent has actually produced — the
 * one-sentence verdict, philosophy scores, key triggers, and timing.
 * Used read-only by RealDataSection.
 */

export interface FinishedVerdict {
  symbol: string;
  name_zh: string;
  name_en: string;
  sector_zh: string;
  sector_en: string;
  action: 'BUY' | 'WATCH' | 'AVOID';
  conviction: number;
  quality: 'EXCELLENT' | 'GOOD' | 'MEDIOCRE' | 'POOR';
  one_sentence_zh: string;
  one_sentence_en: string;
  philosophy: { buffett: number; fisher: number; munger: number };
  key_sell_zh: string;
  key_sell_en: string;
  key_add_zh: string;
  key_add_en: string;
  hold_horizon_zh: string;
  hold_horizon_en: string;
  analyzed_at: string; // relative time string
  model: string;
  total_latency_ms: number;
}

export const REAL_VERDICTS: FinishedVerdict[] = [
  {
    symbol: 'GOOGL', name_zh: '谷歌', name_en: 'Alphabet',
    sector_zh: '通信服务', sector_en: 'Communication Services',
    action: 'BUY', conviction: 0.74, quality: 'EXCELLENT',
    one_sentence_zh: 'Gemini 推理成本拉到行业底，Search 转型边际为正，云业务规模化拐点已现。',
    one_sentence_en: 'Gemini inference cost driven to floor, Search transition turning marginally positive, Cloud scale inflection here.',
    philosophy: { buffett: 0.78, fisher: 0.85, munger: 0.81 },
    key_sell_zh: 'Search 收入连续 2 季度同比下滑 ｜ DOJ 拆分裁决落地',
    key_sell_en: 'Search revenue declines YoY 2 quarters in a row | DOJ breakup ruling',
    key_add_zh: 'Cloud 同比 >30% ｜ Gemini API 渗透率突破 25%',
    key_add_en: 'Cloud >30% YoY | Gemini API penetration breaks 25%',
    hold_horizon_zh: '12-24 个月', hold_horizon_en: '12-24 months',
    analyzed_at: '22h ago', model: 'claude-opus-4-7', total_latency_ms: 29840,
  },
  {
    symbol: 'TSM', name_zh: '台积电', name_en: 'Taiwan Semi',
    sector_zh: '半导体', sector_en: 'Semiconductors',
    action: 'BUY', conviction: 0.72, quality: 'EXCELLENT',
    one_sentence_zh: 'AI 算力的唯一 chokepoint，2nm 进度领先且毛利锁定。',
    one_sentence_en: "The only chokepoint of AI compute — 2nm leadership locked in with margin protected.",
    philosophy: { buffett: 0.72, fisher: 0.88, munger: 0.74 },
    key_sell_zh: '2nm 良率事故 ｜ 台海地缘风险升级',
    key_sell_en: '2nm yield event | Taiwan strait geopolitical escalation',
    key_add_zh: '美国厂量产 ｜ 苹果 + 英伟达双客户 capex 同步上修',
    key_add_en: 'US fab in production | Apple + NVDA capex jointly raised',
    hold_horizon_zh: '6-18 个月', hold_horizon_en: '6-18 months',
    analyzed_at: '1d ago', model: 'gpt-5-pro', total_latency_ms: 27410,
  },
  {
    symbol: 'NVDA', name_zh: '英伟达', name_en: 'NVIDIA',
    sector_zh: '半导体', sector_en: 'Semiconductors',
    action: 'BUY', conviction: 0.78, quality: 'EXCELLENT',
    one_sentence_zh: '推理需求曲线尚未触顶，毛利护城河支撑下一轮再投资。',
    one_sentence_en: 'Inference demand curve has not topped; margin moat funds the next reinvest cycle.',
    philosophy: { buffett: 0.62, fisher: 0.92, munger: 0.84 },
    key_sell_zh: '训练 token 增速 <30% ｜ 客户 ASIC 渗透 >25%',
    key_sell_en: 'Training token growth <30% | Customer ASIC penetration >25%',
    key_add_zh: 'Inference share >50% ｜ AI Enterprise ARR 突破 $30 亿',
    key_add_en: 'Inference share >50% | AI Enterprise ARR crosses $3B',
    hold_horizon_zh: '6-18 个月', hold_horizon_en: '6-18 months',
    analyzed_at: '3h ago', model: 'claude-opus-4-7', total_latency_ms: 31022,
  },
  {
    symbol: 'MSFT', name_zh: '微软', name_en: 'Microsoft',
    sector_zh: '科技', sector_en: 'Technology',
    action: 'WATCH', conviction: 0.61, quality: 'EXCELLENT',
    one_sentence_zh: 'Capex 节奏拐入新阶段，Copilot 单位经济还在等待规模拐点。',
    one_sentence_en: 'Capex enters a new phase; Copilot unit economics still waiting on a scale inflection.',
    philosophy: { buffett: 0.65, fisher: 0.72, munger: 0.66 },
    key_sell_zh: 'Azure 增速跌破 25% ｜ Copilot 用户活跃度连续两月下滑',
    key_sell_en: 'Azure growth drops <25% | Copilot DAU declines 2 months in a row',
    key_add_zh: 'Copilot ARPU >$30 ｜ Azure 重新加速到 30%+',
    key_add_en: 'Copilot ARPU >$30 | Azure re-accelerates to 30%+',
    hold_horizon_zh: '12-24 个月', hold_horizon_en: '12-24 months',
    analyzed_at: '2d ago', model: 'gemini-2.5-pro', total_latency_ms: 28220,
  },
  {
    symbol: 'TSLA', name_zh: '特斯拉', name_en: 'Tesla',
    sector_zh: '可选消费', sector_en: 'Consumer Discretionary',
    action: 'AVOID', conviction: 0.66, quality: 'MEDIOCRE',
    one_sentence_zh: '机器人叙事溢价过高，自动驾驶 unit econ 仍在亏损。',
    one_sentence_en: 'Robotics narrative premium overshot; FSD unit economics still negative.',
    philosophy: { buffett: 0.32, fisher: 0.54, munger: 0.40 },
    key_sell_zh: '已 AVOID — 等估值消化 35% 以上再观察',
    key_sell_en: 'Already AVOID — wait for >35% valuation reset',
    key_add_zh: 'FSD 收入 ARR >$50 亿 ｜ Optimus 商业部署落地',
    key_add_en: 'FSD ARR >$5B | Optimus commercial deployment lands',
    hold_horizon_zh: '不持有', hold_horizon_en: 'No position',
    analyzed_at: '14h ago', model: 'claude-sonnet-4-6', total_latency_ms: 25910,
  },
];

export interface RealNewsRead {
  id: string;
  source: string;
  time: string;
  headline_zh: string;
  headline_en: string;
  impact: 'bullish' | 'bearish' | 'neutral';
  importance: 'critical' | 'high' | 'medium';
  read_zh: string;
  read_en: string;
  tags: string[];
}

export const REAL_NEWS_READS: RealNewsRead[] = [
  {
    id: 'rn1', source: 'Bloomberg', time: '08:14',
    headline_zh: '美联储 12 月会议纪要：多位委员主张暂停降息',
    headline_en: 'FOMC December minutes: several members push to pause rate cuts',
    impact: 'bearish', importance: 'critical',
    read_zh: '会议纪要把鹰派立场拉到台前。3 月降息概率从 54% 掉到 32%。对持仓影响：长债（TLT）短期承压，科技股若靠盈利驱动反而能扛住——因为利率预期再上移空间有限。短期保持平衡。',
    read_en: 'The minutes elevate the hawkish faction. March cut probability dropped from 54% to 32%. Portfolio read: long bonds (TLT) face short-term pressure, but earnings-driven techs can absorb it because there is little room for rates to move higher. Stay balanced near-term.',
    tags: ['fed', 'rates'],
  },
  {
    id: 'rn2', source: 'Reuters', time: '07:42',
    headline_zh: '英伟达获微软 2026 全年 GB300 优先供货承诺',
    headline_en: 'NVIDIA secures full-year priority GB300 supply commitment from Microsoft',
    impact: 'bullish', importance: 'high',
    read_zh: '微软 capex 从 800 亿上修到 950 亿，全部锁定在 NVDA 头部供应。NVDA 2026 全年 visibility 拉满，估值有望从"周期性溢价"转为"必需品估值"，对应远期 P/E 大概率从 32 上修到 38。结论：NVDA 仍是核心持仓。',
    read_en: 'Microsoft capex revised from $80B → $95B, fully locked into NVDA priority supply. NVDA 2026 visibility now fully pinned down; valuation likely shifts from "cyclical premium" to "essential infrastructure," forward P/E likely rerates 32 → 38. Verdict: NVDA stays core.',
    tags: ['nvda', 'msft', 'ai'],
  },
  {
    id: 'rn3', source: 'FT', time: '06:55',
    headline_zh: '日元单日反弹 1.8%，市场预期 BOJ 鸽派转向',
    headline_en: 'Yen surges 1.8% in a day on bets BOJ pivots dovish',
    impact: 'bearish', importance: 'medium',
    read_zh: 'USDJPY 跌破 152 + 1 周隐含波动率跳到 9.4，是套息交易盘部分平仓的典型组合。如果 BOJ 真的鸽派转向，海外资产（尤其美股）短期会承压，因为日元 carry unwind 历来是流动性虹吸事件。建议短期降低风险敞口。',
    read_en: 'USDJPY through 152 plus 1w vol jumping to 9.4 is a classic partial carry unwind. If BOJ does pivot dovish, foreign assets (especially US equities) face near-term pressure — JPY carry unwinds are historically liquidity-suction events. Trim risk into the move.',
    tags: ['jpy', 'carry'],
  },
];
