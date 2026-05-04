import { mockStream, tokenize } from './stream';

export type Lang = 'zh' | 'en';

export interface ChatChunk {
  type: 'token' | 'done';
  content?: string;
}

export interface ResearchEvent {
  type:
    | 'thought'
    | 'status'
    | 'sources_update'
    | 'source_read'
    | 'content_chunk'
    | 'done';
  content?: string;
  thought?: string;
  status?: string;
  sources?: SourceRef[];
  source?: SourceRef;
  found_n?: number;
  total_subtasks?: number;
}

export interface SourceRef {
  domain: string;
  title: string;
  url: string;
}

export interface PromptChip {
  id: string;
  mode: 'chat' | 'research';
  prompt_zh: string;
  prompt_en: string;
}

export const PROMPT_CHIPS: PromptChip[] = [
  {
    id: 'fed-rates',
    mode: 'chat',
    prompt_zh: '美联储利率决议会怎样影响我现在的持仓？',
    prompt_en: 'How will the upcoming FOMC decision affect my current portfolio?',
  },
  {
    id: 'china-stimulus',
    mode: 'research',
    prompt_zh: '帮我研究一下今年中国刺激政策对全球资金流的影响。',
    prompt_en: "Research how this year's China stimulus is reshaping global flows.",
  },
  {
    id: 'top-news',
    mode: 'chat',
    prompt_zh: '解读今天最重要的三条新闻。',
    prompt_en: "Walk me through today's three most important headlines.",
  },
];

export const MODELS = [
  { id: 'claude-opus-4-7', name: 'Claude Opus 4.7', provider: 'anthropic' },
  { id: 'gpt-5-pro', name: 'GPT-5 Pro', provider: 'openai' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google' },
];

// ── Chat scripts ──────────────────────────────────────────────────────────
const CHAT_SCRIPTS: Record<string, { zh: string; en: string }> = {
  'fed-rates': {
    zh: `这次会议有三个看点。\n\n第一，点阵图。市场已经把 2026 年降息预期从 4 次砍到 2 次，但你的持仓里 TLT 还有 5.79% 权重——如果点阵图维持 2 次，TLT 短期会再跌 1.5%-2%。\n\n第二，再投资政策。如果鲍威尔暗示 QT 提前结束，对你的科技持仓（NVDA + MSFT + GOOGL，合计 32.5%）是流动性利好。\n\n第三，鲍威尔的语气。最近 3 次发布会他都强调 "data-dependent"——这个词如果消失，意味着内部已经达成共识，无论方向都是确定性，对波动率敏感的 BRK.B 反而受益。\n\n操作建议：会议前不动。如果点阵图鸽派 + 暗示 QT 收尾，把 TLT 权重从 5.79% 加到 8%；如果鹰派，先减 GLD 一半保留弹药。`,
    en: `Three things to watch.\n\nFirst, the dot plot. The market has already cut 2026 expectations from 4 cuts to 2. But your portfolio still holds TLT at 5.79% — if the dots stay at 2, TLT will drop another 1.5%-2% short-term.\n\nSecond, the reinvestment policy. If Powell hints QT will end early, that's a liquidity tailwind for your tech book (NVDA + MSFT + GOOGL, 32.5% combined).\n\nThird, Powell's tone. The last three press conferences have leaned on "data-dependent." If that phrase disappears, it means internal consensus has been reached — regardless of direction, that lowers vol, which actually benefits BRK.B.\n\nPlaybook: don't move before the meeting. If the dots are dovish + QT signal, raise TLT from 5.79% → 8%. If hawkish, halve the GLD position to free up dry powder.`,
  },
  'top-news': {
    zh: `今天三条头条按重要性排：\n\n1. 美联储 12 月会议纪要——多位委员主张暂停降息。这是今天最重的事。鹰派票委增多意味着 3 月降息从 54% 概率掉到 32%。对你的影响：TLT 短期承压，但你的科技持仓盈利逻辑没变，不要 panic。\n\n2. 微软给英伟达 GB300 全年优先供货——把微软的 capex 从 800 亿上修到 950 亿，全部锁定在 NVDA。你 12.58% 的 NVDA 仓位 visibility 直接拉满，这是今年最确定的 alpha 之一。\n\n3. 1 月非农 +18.4 万——刚刚好的数字。失业率 4.0%、时薪 0.3%，都是软着陆区间。这种数据下市场不需要重新定价，等于给了一个观察窗口。\n\n净结论：今天不动作。明天看 ISM 数据再决定要不要加 PANW（它今天的裁决 BUY/0.69）。`,
    en: `Today's three headlines, ranked by weight:\n\n1. FOMC December minutes — several members push to pause cuts. This is the heaviest event today. More hawkish voters means March cut probability fell from 54% to 32%. For your portfolio: TLT under short-term pressure, but the earnings logic of your tech book is intact — don't panic.\n\n2. Microsoft commits full-year GB300 priority to NVIDIA — Microsoft's capex was raised from $80B to $95B, all locked into NVDA. Your 12.58% NVDA position now has full-year visibility, which is one of the most certain alpha calls of 2026.\n\n3. January nonfarm +184k — a Goldilocks print. Unemployment 4.0%, wages +0.3%, all soft-landing range. With a print like this the market doesn't need to re-price — it's an observation window.\n\nNet conclusion: no action today. Wait for tomorrow's ISM before deciding whether to add to PANW (today's verdict BUY/0.69).`,
  },
};

export function chatStream(promptId: string, lang: Lang, signal?: AbortSignal) {
  const script = CHAT_SCRIPTS[promptId];
  if (!script) throw new Error(`Unknown chat prompt: ${promptId}`);
  const text = lang === 'zh' ? script.zh : script.en;
  const tokens = tokenize(text, lang === 'zh' ? 3 : 5);
  const events: { _delayMs?: number; type: 'token' | 'done'; content?: string }[] = [];
  events.push({ _delayMs: 320, type: 'token', content: '' });
  for (const tok of tokens) {
    events.push({ _delayMs: 18, type: 'token', content: tok });
  }
  events.push({ _delayMs: 220, type: 'done' });
  return mockStream<ChatChunk>(events as ChatChunk[], {
    signal,
    defaultDelayMs: 18,
    jitterMs: 12,
  });
}

// ── Research script ──────────────────────────────────────────────────────
interface ResearchScript {
  thoughts: { zh: string; en: string }[];
  statuses: { zh: string; en: string }[];
  sources: SourceRef[];
  answer: { zh: string; en: string };
}

const RESEARCH_SCRIPTS: Record<string, ResearchScript> = {
  'china-stimulus': {
    thoughts: [
      { zh: '问题拆解：今年中国刺激 = 财政（特别国债 + 地方专项债）+ 货币（降准、定向再贷款）+ 房地产（白名单、收储）。需要同时看三条线。',
        en: 'Decomposition: 2026 China stimulus = fiscal (special CGBs + local SPBs) + monetary (RRR cuts, targeted relending) + property (whitelist, inventory absorption). Need to track all three.' },
      { zh: '资金流影响通常通过三个渠道：人民币汇率（套利）、大宗商品（铁矿、铜）、新兴市场股票（EEM、ASHR）。',
        en: 'Flow impact runs through three channels: RMB FX (arb), commodities (iron ore, copper), and EM equities (EEM, ASHR).' },
      { zh: '需要找三类数据：1) 近 12 周 EEM/ASHR 资金流 2) 工业金属 ETF 表现 3) USDCNH 远期点。',
        en: 'Need three data sets: 1) trailing 12w EEM/ASHR flows, 2) industrial metals ETF performance, 3) USDCNH forward points.' },
    ],
    statuses: [
      { zh: '正在搜索 8 个主题', en: 'Searching across 8 topics' },
      { zh: '已找到 14 个来源', en: 'Found 14 sources so far' },
      { zh: '正在阅读 federalreserve.gov', en: 'Reading federalreserve.gov' },
      { zh: '正在阅读 reuters.com', en: 'Reading reuters.com' },
      { zh: '正在阅读 bloomberg.com', en: 'Reading bloomberg.com' },
      { zh: '正在合成结论', en: 'Synthesizing the answer' },
    ],
    sources: [
      { domain: 'reuters.com', title: 'China unveils 1.5T yuan special CGB issuance plan', url: 'https://reuters.com/markets/asia/china-special-cgb-2026' },
      { domain: 'bloomberg.com', title: 'EM equity flows hit 18-month high after PBOC RRR cut', url: 'https://bloomberg.com/em-flows-pboc-2026' },
      { domain: 'pboc.gov.cn', title: '中国人民银行公开市场业务交易公告', url: 'https://pboc.gov.cn/announcement' },
      { domain: 'imf.org', title: 'WEO Update — Asia growth revisions', url: 'https://imf.org/weo/update' },
      { domain: 'ft.com', title: 'Property whitelist expansion — what changed', url: 'https://ft.com/china-property-whitelist' },
      { domain: 'wsj.com', title: 'USDCNH forwards back to 2023 levels', url: 'https://wsj.com/usdcnh-forwards' },
      { domain: 'cnbc.com', title: 'Copper rallies 14% as China demand returns', url: 'https://cnbc.com/copper-china-demand' },
      { domain: 'mof.gov.cn', title: '财政部关于 2026 年专项债发行节奏', url: 'https://mof.gov.cn/special-bond-2026' },
    ],
    answer: {
      zh: `**核心结论：今年的中国刺激组合拳已经开始把全球资金流的方向改回亚洲新兴市场。**\n\n三个具体证据：\n\n**1. EM 股票 ETF 资金流**——过去 4 周累计净流入 67 亿美元（EEM 占 41 亿、ASHR 占 18 亿、KWEB 占 8 亿），是 18 个月以来的高点。这不是短期 hot money，因为 EEM 单笔超 5,000 万美元的大额申购占比已超 60%，机构配置盘的特征。\n\n**2. 工业金属重新定价**——铜（HG）从 4.10 一路上行到 4.68（+14%），铁矿石突破 130 美元/吨。这是市场提前定价中国地产收储和"两新"（新能源 + 新基建）的金属需求。\n\n**3. USDCNH 远期点回到 2023 年水平**——意味着海外离岸资金对人民币的套利成本下降，套息平仓压力小于市场预期，同时也说明境外投资者对 RMB 的中期信心在修复。\n\n**对你持仓的具体影响：**\n- 没有直接 EM 敞口，可以用 EEM 5%-7% 仓位作为对冲；\n- COST 受益于全球供应链中国生产端复苏，BUY/0.71 的裁决可以维持；\n- TLT 在 EM 资金流虹吸的环境下短期不会有避险买盘，建议把 5.79% 减到 4%。\n\n**风险点**：如果 PBOC 再次降准但人民币贬值压力重新上升（USDCNH 突破 7.30），上述逻辑会被部分打断。下次政策窗口在月底 PBOC 例会。`,
      en: `**Core takeaway: this year's China stimulus mix has begun bending global flows back toward Asian EM.**\n\nThree concrete data points:\n\n**1. EM equity ETF flows** — trailing 4 weeks net inflow of $6.7B (EEM $4.1B, ASHR $1.8B, KWEB $0.8B), an 18-month high. This isn't short-term hot money — large single-block creations >$50M now account for over 60% of EEM inflows, an institutional-allocation footprint.\n\n**2. Industrial metals re-priced** — copper (HG) from 4.10 → 4.68 (+14%), iron ore breaking $130/ton. The market is pricing in China property inventory absorption plus the "two news" (new energy + new infra) metals demand.\n\n**3. USDCNH forward points back to 2023 levels** — offshore arb cost on RMB is down; carry-unwind pressure is lower than the market expected, and offshore investor mid-term confidence in the RMB is healing.\n\n**For your portfolio specifically:**\n- No direct EM exposure today; consider EEM 5%-7% as a hedge;\n- COST benefits from the China supply-side recovery in global supply chains — keep the BUY/0.71 verdict;\n- TLT won't catch safety-bid in an EM-flow environment, trim 5.79% → 4%.\n\n**Risk**: if PBOC cuts RRR again but RMB depreciation pressure rebuilds (USDCNH > 7.30), the thesis partly breaks. Next policy window: end-of-month PBOC meeting.`,
    },
  },
};

export async function* researchStream(
  promptId: string,
  lang: Lang,
  signal?: AbortSignal,
): AsyncGenerator<ResearchEvent> {
  const script = RESEARCH_SCRIPTS[promptId];
  if (!script) throw new Error(`Unknown research prompt: ${promptId}`);

  // 1) initial planning thoughts
  for (const th of script.thoughts) {
    if (signal?.aborted) return;
    await new Promise((r) => setTimeout(r, 480 + Math.random() * 200));
    yield { type: 'thought', thought: lang === 'zh' ? th.zh : th.en };
  }

  // 2) status: searching
  await new Promise((r) => setTimeout(r, 320));
  if (signal?.aborted) return;
  yield { type: 'status', status: lang === 'zh' ? script.statuses[0].zh : script.statuses[0].en };

  // 3) sources accumulation
  let acc: SourceRef[] = [];
  for (let i = 0; i < script.sources.length; i++) {
    if (signal?.aborted) return;
    await new Promise((r) => setTimeout(r, 220 + Math.random() * 180));
    acc = acc.concat(script.sources[i]);
    yield { type: 'sources_update', sources: acc, found_n: acc.length, total_subtasks: 8 };
  }

  // 4) reading status flips
  for (let i = 2; i < script.statuses.length - 1; i++) {
    if (signal?.aborted) return;
    await new Promise((r) => setTimeout(r, 380));
    yield { type: 'status', status: lang === 'zh' ? script.statuses[i].zh : script.statuses[i].en };
    yield { type: 'source_read', source: script.sources[i - 2] };
  }

  // 5) synthesis
  await new Promise((r) => setTimeout(r, 320));
  if (signal?.aborted) return;
  yield { type: 'status', status: lang === 'zh' ? script.statuses[script.statuses.length - 1].zh : script.statuses[script.statuses.length - 1].en };

  // 6) stream the answer text
  const text = lang === 'zh' ? script.answer.zh : script.answer.en;
  const toks = tokenize(text, lang === 'zh' ? 3 : 6);
  for (const t of toks) {
    if (signal?.aborted) return;
    await new Promise((r) => setTimeout(r, 14 + Math.random() * 12));
    yield { type: 'content_chunk', content: t };
  }

  if (signal?.aborted) return;
  await new Promise((r) => setTimeout(r, 200));
  yield { type: 'done' };
}

// ── Intent router (mocked) ────────────────────────────────────────────────
export async function classifyIntent(promptId: string): Promise<'chat' | 'research'> {
  await new Promise((r) => setTimeout(r, 280));
  const chip = PROMPT_CHIPS.find((p) => p.id === promptId);
  return chip?.mode ?? 'chat';
}
