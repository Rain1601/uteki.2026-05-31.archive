import { sleep, tokenize } from './stream';

export type Lang = 'zh' | 'en';
export type VerdictAction = 'BUY' | 'WATCH' | 'AVOID';
export type Quality = 'EXCELLENT' | 'GOOD' | 'MEDIOCRE' | 'POOR';

export interface CompanyMeta {
  symbol: string;
  name_zh: string;
  name_en: string;
  sector_zh: string;
  sector_en: string;
  industry_zh: string;
  industry_en: string;
  current_price: number;
}

export interface GateBlurb {
  zh: string;
  en: string;
  parsed: Record<string, string>;
}

export interface CompanyScript {
  meta: CompanyMeta;
  gates: GateBlurb[]; // exactly 7
  verdict: {
    action: VerdictAction;
    conviction: number;
    quality: Quality;
    position_size_pct: number;
    hold_horizon_zh: string;
    hold_horizon_en: string;
    one_sentence_zh: string;
    one_sentence_en: string;
    sell_triggers_zh: string[];
    sell_triggers_en: string[];
    add_triggers_zh: string[];
    add_triggers_en: string[];
    philosophy_scores: { buffett: number; fisher: number; munger: number };
    buffett_zh: string;
    buffett_en: string;
    fisher_zh: string;
    fisher_en: string;
    munger_zh: string;
    munger_en: string;
  };
  model: string;
}

const GATE_NAMES = [
  { zh: '业务解析',     en: 'Business Analysis' },
  { zh: '护城河',       en: 'Economic Moat' },
  { zh: '财务质量',     en: 'Financial Quality' },
  { zh: '风险与不确定性', en: 'Risk & Uncertainty' },
  { zh: '估值',         en: 'Valuation' },
  { zh: '催化剂',       en: 'Catalysts' },
  { zh: '综合裁决',     en: 'Final Verdict' },
] as const;

export function gateName(idx: number, lang: Lang) {
  return lang === 'zh' ? GATE_NAMES[idx].zh : GATE_NAMES[idx].en;
}

export const SCRIPTS: Record<string, CompanyScript> = {
  AAPL: {
    meta: {
      symbol: 'AAPL', name_zh: '苹果', name_en: 'Apple Inc.',
      sector_zh: '科技', sector_en: 'Technology',
      industry_zh: '消费电子 + 软件服务', industry_en: 'Consumer Electronics + Software Services',
      current_price: 195.51,
    },
    gates: [
      {
        zh: '苹果的业务结构正在从 "硬件公司 + 配套服务" 演进为 "高黏性平台 + 硬件入口"。FY24 服务收入占比 26%，但贡献了 38% 的毛利。设备装机量超过 22 亿台，每台年均创造 ~$45 服务收入。',
        en: 'Apple is migrating from "hardware company + adjacent services" to "high-stickiness platform + hardware on-ramp." Services were 26% of FY24 revenue but 38% of gross profit. Installed base of 2.2B devices generates ~$45 services revenue per device annually.',
        parsed: { revenue_mix: 'iPhone 52% / Services 26% / Mac+iPad 14% / Wearables 8%', gross_margin: '46.2%' },
      },
      {
        zh: '护城河有三层：1) 硬件 + 操作系统耦合（替换成本高）；2) App Store 双边网络（开发者锁定）；3) 隐私品牌资产（监管壁垒）。最强的是第二层——开发者已经把 App Store 当作必需的分发渠道。',
        en: 'Three moat layers: (1) hardware-OS coupling (high switching cost); (2) App Store two-sided network (developer lock-in); (3) privacy brand equity (regulatory moat). The middle layer is strongest — developers treat App Store as a necessity.',
        parsed: { moat_score: '4/5', durability: '10+ years', primary_source: 'Two-sided platform network' },
      },
      {
        zh: 'TTM 自由现金流 $1,090 亿，FCF 利润率 27%。资产负债表净现金转为净负债（-$56B）但利息保障倍数仍 35x。ROIC 在 50% 区间，远超资本成本，每年的回购把 EPS 增速从 8% 拉到 13%。',
        en: 'TTM free cash flow $109B, FCF margin 27%. Balance sheet flipped from net cash to net debt (-$56B) but interest coverage still 35x. ROIC is in the 50% range, well above cost of capital, and buybacks lift EPS growth from 8% to 13%.',
        parsed: { fcf_yield: '3.6%', roic: '50%+', net_debt: '-$56B' },
      },
      {
        zh: '三个真实风险：1) 大中华区收入下滑（FY24 -8%）；2) iPhone 创新疲态——这一代 AI 没有成为换机驱动；3) 反垄断（DOJ App Store 案 + 欧盟 DMA）可能切走 ~5% 服务收入。',
        en: 'Three real risks: (1) Greater China revenue decline (-8% FY24); (2) iPhone innovation fatigue — this AI cycle has not driven upgrades; (3) antitrust (DOJ App Store case + EU DMA) could shave ~5% off services revenue.',
        parsed: { top_risk: 'China demand', secondary: 'AI cycle missing', regulatory: 'DOJ + EU DMA' },
      },
      {
        zh: '当前 P/E 32x，远期 28.5x。和 SaaS 同行对标其实不贵——MSFT 33x、ADBE 31x。但和它自己 5 年中位数 24x 比有 17% 溢价。合理价值 $175-$210 区间，当前 $195.51 处于上沿偏中。',
        en: 'Current P/E 32x, forward 28.5x. Versus SaaS peers it is not expensive (MSFT 33x, ADBE 31x). Versus its own 5-year median 24x there is a 17% premium. Fair value $175-$210; current $195.51 sits at upper-mid.',
        parsed: { pe_ttm: '32x', fair_value: '$175-$210', position_in_range: 'upper mid' },
      },
      {
        zh: '6-12 个月催化剂：1) Apple Intelligence 在 iPhone 17 周期才会真正变现；2) Vision 第二代降价 50% + 视觉 SDK 普及；3) 服务业务广告变现刚开始；4) 印度产能爬坡解决供应链单点风险。',
        en: '6-12 month catalysts: (1) Apple Intelligence monetizing on the iPhone 17 cycle; (2) Vision 2 priced 50% lower + visual SDK adoption; (3) services ad monetization just starting; (4) India capacity ramp resolving single-point supply risk.',
        parsed: { primary_catalyst: 'iPhone 17 cycle', timing: '6-9 months' },
      },
      {
        zh: '综合：质量极佳，估值上沿偏中，催化剂全部在 6-12 个月外。当前不是加仓时点，但也不应该减——服务业务的二阶导（广告 + 订阅 ARPU）正在反转。WATCH/0.62。',
        en: 'Synthesis: quality is excellent, valuation upper-mid, catalysts all 6-12 months out. Not the moment to add but not the moment to trim either — the second-derivative on services (ads + subscription ARPU) is turning. WATCH/0.62.',
        parsed: { final_action: 'WATCH', conviction: '0.62' },
      },
    ],
    verdict: {
      action: 'WATCH', conviction: 0.62, quality: 'EXCELLENT', position_size_pct: 6.0,
      hold_horizon_zh: '12-24 个月', hold_horizon_en: '12-24 months',
      one_sentence_zh: '世界级质量公司、当前估值上沿偏中、最强催化剂仍在 6-12 个月之外——观察等待。',
      one_sentence_en: 'World-class quality, valuation in the upper-mid range, strongest catalysts still 6-12 months out — wait and watch.',
      sell_triggers_zh: ['服务收入增速跌破 8%', '大中华区单季度同比下滑超 12%', 'DOJ 案件实质性裁决不利'],
      sell_triggers_en: ['Services growth drops below 8%', 'Greater China declines >12% YoY in a quarter', 'Adverse DOJ ruling materializes'],
      add_triggers_zh: ['股价回踩 $175', 'iPhone 17 预订量 +20% YoY', '广告业务披露独立分部'],
      add_triggers_en: ['Pullback to $175', 'iPhone 17 preorders +20% YoY', 'Ads disclosed as separate segment'],
      philosophy_scores: { buffett: 0.78, fisher: 0.66, munger: 0.74 },
      buffett_zh: '我喜欢简单的生意：装机量 + 服务费率 = 永续年金。但当前价格已经把未来 3 年的成长 priced in，我会等回踩。',
      buffett_en: 'I like simple businesses: installed base × services take-rate = a perpetuity. But the current price already reflects the next three years — I would wait for a pullback.',
      fisher_zh: '管理层在产品和资本配置上都展现一致性——10 年回购把流通股从 65 亿压到 15 亿，这是教科书级别。',
      fisher_en: 'Management shows consistency on both product and capital allocation — buybacks have shrunk shares outstanding from 6.5B to 1.5B over a decade, textbook execution.',
      munger_zh: 'Invert：什么会让它值 50%？答案是装机量增长停滞 + 服务变现失败。两者都有可能，但概率不高。',
      munger_en: 'Invert: what makes this worth 50%? Answer: installed base stalls + services monetization fails. Both possible, neither likely.',
    },
    model: 'claude-opus-4-7',
  },

  NVDA: {
    meta: {
      symbol: 'NVDA', name_zh: '英伟达', name_en: 'NVIDIA',
      sector_zh: '半导体', sector_en: 'Semiconductors',
      industry_zh: '加速计算 + 数据中心 GPU', industry_en: 'Accelerated Compute + Datacenter GPU',
      current_price: 174.32,
    },
    gates: [
      {
        zh: '英伟达本质上不再是芯片公司，而是 AI 工厂的"水电卖家"。FY26E 数据中心收入占比 87%，其中 70% 来自前 10 大客户。GB200/GB300 的每月部署节奏决定了未来两年现金流。',
        en: 'NVIDIA is no longer a chip company — it is the utility selling water and power to the AI factory. FY26E datacenter is 87% of revenue, of which 70% comes from the top 10 customers. GB200/GB300 monthly deployment cadence determines cash flow for the next two years.',
        parsed: { revenue_mix: 'Datacenter 87% / Gaming 8% / Auto+Pro 5%', top10_concentration: '70%' },
      },
      {
        zh: '护城河三层：1) CUDA + cuDNN + Triton 软件栈（10 年沉淀）；2) NVLink + InfiniBand 系统级带宽（每代领先 2 代）；3) 开发者生态（每年 200 万 CUDA 开发者）。最深的是第一层——所有训练框架都首先适配 CUDA。',
        en: 'Three moats: (1) CUDA + cuDNN + Triton software stack (10 years of compounding); (2) NVLink + InfiniBand system bandwidth (two generations ahead); (3) developer ecosystem (~2M CUDA devs annually). The deepest is software — every training framework targets CUDA first.',
        parsed: { moat_score: '5/5', durability: '5-7 years', primary_source: 'CUDA software lock-in' },
      },
      {
        zh: 'TTM FCF $700 亿，FCF 利润率 50%。毛利率 75%，远超半导体行业 45% 平均。资本效率惊人——每投入 1 美元资本支出，3 年内产生 8 美元 FCF。净现金 $380 亿。',
        en: 'TTM FCF $70B, FCF margin 50%. Gross margin 75%, well above the semis average 45%. Capital efficiency astonishing — $1 of capex returns $8 of FCF over three years. Net cash $38B.',
        parsed: { fcf_yield: '2.4%', gross_margin: '75%', net_cash: '$38B' },
      },
      {
        zh: '三个风险：1) 客户自研 ASIC（GOOG TPU、AMZN Trainium、MSFT Maia）的渗透速度；2) 中国出口管制进一步收紧（Hopper/Blackwell 受限）；3) AI 资本开支周期下行——但需要看到训练 token 增速放缓才会触发。',
        en: 'Three risks: (1) customer in-house ASIC penetration (GOOG TPU, AMZN Trainium, MSFT Maia); (2) further China export controls (Hopper/Blackwell restricted); (3) AI capex cycle downturn — but would need training token growth to slow to trigger.',
        parsed: { top_risk: 'Customer ASIC migration', secondary: 'China export controls' },
      },
      {
        zh: '当前 P/E 36x，远期 28x。FCF/EV 收益率 3%。EV/Sales 18x 是历史高位但不是疯狂——同期 ARM 38x。如果 FY26 数据中心增速维持 50%+，PEG 0.6，这是非常合理的。',
        en: 'Current P/E 36x, forward 28x. FCF/EV yield 3%. EV/Sales 18x is historically high but not insane — ARM is 38x. If FY26 datacenter growth holds 50%+, PEG is 0.6, very reasonable.',
        parsed: { pe_ttm: '36x', forward_pe: '28x', peg: '0.6' },
      },
      {
        zh: '6-12 个月催化剂：1) GB300 量产（2026 Q1）；2) Sovereign AI 项目（中东、欧洲、印度政府订单）；3) 推理芯片 NIM 商业化；4) 软件订阅业务（NVIDIA AI Enterprise）超 $20 亿 ARR。',
        en: '6-12 month catalysts: (1) GB300 mass production (Q1 2026); (2) Sovereign AI deals (Middle East, EU, India government); (3) NIM inference chip monetization; (4) NVIDIA AI Enterprise software subscription crossing $2B ARR.',
        parsed: { primary_catalyst: 'GB300 ramp', timing: '0-3 months' },
      },
      {
        zh: '综合：质量五星、估值合理（PEG 0.6）、催化剂密集且近端。微软的 capex 上修把 2026 年订单 visibility 锁死。BUY/0.78。仓位上限 12%。',
        en: 'Synthesis: quality 5/5, valuation reasonable (PEG 0.6), catalysts dense and near-term. The Microsoft capex revision locks down 2026 order visibility. BUY/0.78. Cap position at 12%.',
        parsed: { final_action: 'BUY', conviction: '0.78' },
      },
    ],
    verdict: {
      action: 'BUY', conviction: 0.78, quality: 'EXCELLENT', position_size_pct: 12.0,
      hold_horizon_zh: '6-18 个月', hold_horizon_en: '6-18 months',
      one_sentence_zh: '世界级护城河 + 估值仍合理 + 微软 capex 锁单 = 把仓位加到上限。',
      one_sentence_en: 'World-class moat + still-reasonable valuation + Microsoft capex lock-in = run the position at the cap.',
      sell_triggers_zh: ['训练 token 增速跌至 30% 以下', '前 5 大客户 capex guidance 下修', 'GB300 良率事故'],
      sell_triggers_en: ['Training token growth drops below 30%', 'Top-5 customer capex guidance cut', 'GB300 yield event'],
      add_triggers_zh: ['股价回踩 200 周线', '推理需求曲线确认（占比 >50%）', 'AI Enterprise ARR 突破 $30 亿'],
      add_triggers_en: ['Pullback to 200-wk MA', 'Inference share confirmed >50%', 'AI Enterprise ARR crosses $3B'],
      philosophy_scores: { buffett: 0.62, fisher: 0.92, munger: 0.84 },
      buffett_zh: '我对 P/E 36x 通常是抗拒的，但 75% 毛利率 + 5 倍资本效率改变了我的看法。',
      buffett_en: 'I am normally resistant to a 36x P/E, but 75% gross margin and 5x capital efficiency change the math.',
      fisher_zh: '黄仁勋是少见的"工程师 CEO + 长期主义者"。CUDA 投了 15 年没赚钱，现在收割期才刚开始。',
      fisher_en: 'Jensen is the rare engineer-CEO long-termist. CUDA absorbed 15 years of investment without payoff — the harvest is only beginning.',
      munger_zh: 'Avoid stupidity. 在 AI infra 周期里和这家公司对赌是 stupidity。',
      munger_en: 'Avoid stupidity. Betting against this company in the AI infra cycle qualifies.',
    },
    model: 'claude-opus-4-7',
  },

  'BRK.B': {
    meta: {
      symbol: 'BRK.B', name_zh: '伯克希尔哈撒韦', name_en: 'Berkshire Hathaway',
      sector_zh: '金融', sector_en: 'Financials',
      industry_zh: '保险 + 多元化控股', industry_en: 'Insurance + Diversified Holdings',
      current_price: 451.18,
    },
    gates: [
      {
        zh: '伯克希尔的本质是"保险浮存金 + 长期资本配置"。GEICO + General Re 提供 ~$1,800 亿浮存金，零成本甚至负成本资金。下属 60+ 子公司贡献 $480 亿运营利润。',
        en: 'Berkshire is at its core "insurance float + long-term capital allocation." GEICO + General Re provide ~$180B of float, sourced at zero or negative cost. 60+ subsidiaries contribute $48B in operating income.',
        parsed: { float: '$180B', op_income: '$48B', subsidiaries: '60+' },
      },
      {
        zh: '护城河是"巴菲特 + 阿贝尔"建立的资本配置纪律。这种文化能否延续是核心问题。GEICO 的成本优势 + BNSF 铁路的 right-of-way + Berkshire Energy 的监管壁垒——三道分离的护城河。',
        en: 'The moat is the capital allocation discipline built by Buffett + Abel. The core question is whether the culture endures. GEICO cost advantage + BNSF right-of-way + Berkshire Energy regulatory moat — three separate moats.',
        parsed: { moat_score: '4/5', primary_source: 'Capital allocation culture', durability: '15+ years' },
      },
      {
        zh: '账面现金 $3,500 亿是历史最高，已超过 GDP 占比警戒线（伯克希尔总资产 12%）。这意味着巴菲特/阿贝尔找不到合适的标的，或者在等市场重置。年度浮存金成本 -1.4%（即融资成本为负）。',
        en: 'Cash on the balance sheet at $350B is an all-time high, above the historical GDP-share alarm threshold (12% of total assets). It means Buffett/Abel cannot find acceptable targets, or are waiting for a market reset. Annual float cost is -1.4% (financing cost negative).',
        parsed: { cash: '$350B', float_cost: '-1.4%', deployment_status: 'Awaiting' },
      },
      {
        zh: '风险：1) 接班人 Greg Abel 没有经过完整的市场周期考验；2) BNSF 受电气化和卡车竞争挤压；3) GEICO 在 Tesla insurance 等数据驱动竞争中落后。',
        en: 'Risks: (1) successor Greg Abel has not been tested through a full market cycle; (2) BNSF squeezed by electrification and truck competition; (3) GEICO falling behind in data-driven competition like Tesla Insurance.',
        parsed: { top_risk: 'Succession risk', secondary: 'BNSF secular decline' },
      },
      {
        zh: '当前 P/B 1.6x，5 年中位数 1.4x。看起来略贵，但要剔除 Apple 持仓后看核心业务 P/E ~14x，明显便宜。综合估值：合理偏便宜 5%。',
        en: 'Current P/B 1.6x vs 5-year median 1.4x. Looks slightly expensive, but excluding Apple holdings, core business P/E ~14x is clearly cheap. Composite: ~5% below fair value.',
        parsed: { pb: '1.6x', core_pe: '14x', vs_fair: '-5%' },
      },
      {
        zh: '催化剂稀缺但可能性大：1) 现金堆积达到极致后的大型并购（>$500 亿）；2) Apple 仓位调整带来的资本回流；3) 市场大幅回调时的逆势布局。',
        en: 'Catalysts are scarce but plausible: (1) major M&A after cash pile peaks (>$50B); (2) capital recycling from Apple position adjustments; (3) counter-cyclical deployment if markets correct sharply.',
        parsed: { primary_catalyst: 'Major M&A deployment', timing: '6-24 months' },
      },
      {
        zh: '综合：极高质量、合理估值、但缺乏近端催化剂。在等待 Abel 第一次大手笔。WATCH/0.58。仓位维持 5-8%。',
        en: 'Synthesis: very high quality, fair valuation, but lacks near-term catalysts. Waiting for Abel\'s first big move. WATCH/0.58. Hold position at 5-8%.',
        parsed: { final_action: 'WATCH', conviction: '0.58' },
      },
    ],
    verdict: {
      action: 'WATCH', conviction: 0.58, quality: 'EXCELLENT', position_size_pct: 7.5,
      hold_horizon_zh: '5-10 年', hold_horizon_en: '5-10 years',
      one_sentence_zh: '世界级质量 + 历史性现金堆积——耐心等待 Abel 时代的第一次出手。',
      one_sentence_en: 'World-class quality + historic cash pile — patience pays while we wait for the first move of the Abel era.',
      sell_triggers_zh: ['浮存金成本转正', 'Abel 大幅减持苹果且未明确再投资', 'BNSF 现金流连续 4 季度下滑'],
      sell_triggers_en: ['Float cost turns positive', 'Abel sharply trims Apple without redeployment', 'BNSF cash flow declines 4 quarters in a row'],
      add_triggers_zh: ['宣布超 $500 亿并购', 'P/B 回到 1.4 以下', '市场大跌 20%+ 时的资本部署信号'],
      add_triggers_en: ['Announces $50B+ acquisition', 'P/B retraces below 1.4', 'Capital deployment signal during 20%+ market drawdown'],
      philosophy_scores: { buffett: 0.96, fisher: 0.62, munger: 0.94 },
      buffett_zh: '这是我的家。不卖。',
      buffett_en: 'This is my home. Not selling.',
      fisher_zh: '不是 Fisher 风格——伯克希尔不追求最优秀的成长股，而是耐心收集"足够好"的现金牛。',
      fisher_en: 'Not a Fisher-style story — Berkshire does not chase exceptional growth, it patiently collects "good-enough" cash machines.',
      munger_zh: '简单：等价格、等机会、等到了再下重注。这个公司是唯一持续做到的。',
      munger_en: 'Simple: wait for the price, wait for the opportunity, then bet big. This company is the only one that has done it consistently.',
    },
    model: 'claude-opus-4-7',
  },
};

// ── Stream events emitted during a run ────────────────────────────────────
export type CompanyEvent =
  | { type: 'data_loaded'; meta: CompanyMeta; analysis_id: string }
  | { type: 'gate_start'; gate: number; display_name_zh: string; display_name_en: string }
  | { type: 'gate_text'; gate: number; chunk: string }
  | { type: 'tool_call'; gate: number; tool: string; round: number }
  | { type: 'gate_complete'; gate: number; latency_ms: number; parsed: Record<string, string> }
  | { type: 'result'; analysis_id: string; meta: CompanyMeta; verdict: CompanyScript['verdict']; gate_count: number; total_latency_ms: number; model: string }
  | { type: 'error'; message: string };

const TOOLS_BY_GATE = ['get_company_profile', 'get_segment_revenue', 'get_financials', 'get_news', 'get_peer_multiples', 'get_calendar', 'compose_verdict'];

export async function* runCompanyAnalysis(
  symbol: string,
  lang: Lang,
  signal?: AbortSignal,
): AsyncGenerator<CompanyEvent> {
  const script = SCRIPTS[symbol];
  if (!script) {
    yield { type: 'error', message: `Unknown ticker ${symbol}` };
    return;
  }

  const analysisId = `ana_${Date.now().toString(36)}_${symbol}`;

  // 1) data load
  await sleep(420, signal);
  if (signal?.aborted) return;
  yield { type: 'data_loaded', meta: script.meta, analysis_id: analysisId };

  let totalMs = 420;

  // 2) seven gates
  for (let i = 0; i < 7; i++) {
    if (signal?.aborted) return;
    const gateNum = i + 1;
    yield {
      type: 'gate_start',
      gate: gateNum,
      display_name_zh: GATE_NAMES[i].zh,
      display_name_en: GATE_NAMES[i].en,
    };
    await sleep(220, signal);
    if (signal?.aborted) return;

    yield { type: 'tool_call', gate: gateNum, tool: TOOLS_BY_GATE[i], round: 1 };
    await sleep(380, signal);
    if (signal?.aborted) return;

    const text = lang === 'zh' ? script.gates[i].zh : script.gates[i].en;
    const tokens = tokenize(text, lang === 'zh' ? 4 : 6);
    const gateStart = Date.now();
    for (const tok of tokens) {
      if (signal?.aborted) return;
      await sleep(14 + Math.random() * 10);
      yield { type: 'gate_text', gate: gateNum, chunk: tok };
    }
    const gateLatency = Date.now() - gateStart + 600;
    totalMs += gateLatency;
    if (signal?.aborted) return;
    await sleep(160, signal);
    yield {
      type: 'gate_complete',
      gate: gateNum,
      latency_ms: gateLatency,
      parsed: script.gates[i].parsed,
    };
  }

  // 3) final verdict
  await sleep(320, signal);
  if (signal?.aborted) return;
  yield {
    type: 'result',
    analysis_id: analysisId,
    meta: script.meta,
    verdict: script.verdict,
    gate_count: 7,
    total_latency_ms: totalMs,
    model: script.model,
  };
}

export interface CompletedRow {
  id: string;
  symbol: string;
  action: VerdictAction;
  conviction: number;
  one_sentence_zh: string;
  one_sentence_en: string;
  hours_ago: number;
  latency_ms: number;
  model: string;
  provider: string;
}

export async function listRecentRuns(): Promise<CompletedRow[]> {
  await sleep(80);
  return [
    { id: 'r1', symbol: 'COST',  action: 'BUY',   conviction: 0.71, one_sentence_zh: '会员结构性增长 + 自有品牌渗透率到拐点。',           one_sentence_en: 'Membership compounding plus Kirkland share at an inflection point.', hours_ago: 6,  latency_ms: 28140, model: 'claude-opus-4-7',  provider: 'anthropic' },
    { id: 'r2', symbol: 'PANW',  action: 'BUY',   conviction: 0.69, one_sentence_zh: 'Cortex 平台化转型完成，ARR 加速 + NRR > 125%。',     one_sentence_en: 'Cortex platformization done — ARR re-accelerating with NRR above 125%.', hours_ago: 9,  latency_ms: 31022, model: 'gpt-5-pro', provider: 'openai' },
    { id: 'r3', symbol: 'TSLA',  action: 'AVOID', conviction: 0.66, one_sentence_zh: '机器人叙事溢价过高，自动驾驶 unit econ 仍在亏损。',   one_sentence_en: 'Robotics premium overshot; FSD unit economics still negative.',         hours_ago: 14, latency_ms: 25910, model: 'claude-sonnet-4-6', provider: 'anthropic' },
    { id: 'r4', symbol: 'GOOGL', action: 'BUY',   conviction: 0.74, one_sentence_zh: 'Gemini 推理成本拉到行业底，Search 转型边际为正。',      one_sentence_en: 'Gemini inference cost driven to floor; Search transition turning marginally positive.', hours_ago: 22, latency_ms: 29840, model: 'claude-opus-4-7',  provider: 'anthropic' },
    { id: 'r5', symbol: 'SHOP',  action: 'WATCH', conviction: 0.55, one_sentence_zh: '商家 GMV 增速恢复但 take rate 提价空间已被 Stripe 锁。', one_sentence_en: 'Merchant GMV reaccelerating, but take-rate ceiling now capped by Stripe.', hours_ago: 27, latency_ms: 26200, model: 'gemini-2.5-pro', provider: 'google' },
  ];
}
