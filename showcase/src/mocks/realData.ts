/**
 * Curated finished-analysis samples shown in the "真实结果" landing section.
 * Each entry has both a compact verdict (always visible) and an expanded
 * full-pipeline payload (revealed on click): 7 gate summaries, full mentor
 * commentary, and extended trigger lists.
 */

export interface MentorComment {
  score: number;          // 0..1
  comment_zh: string;
  comment_en: string;
}

export interface GateSummary {
  num: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII';
  title_zh: string;
  title_en: string;
  body_zh: string;
  body_en: string;
}

export interface FinishedVerdict {
  symbol: string;
  name_zh: string;
  name_en: string;
  sector_zh: string;
  sector_en: string;
  current_price: number;
  action: 'BUY' | 'WATCH' | 'AVOID';
  conviction: number;
  quality: 'EXCELLENT' | 'GOOD' | 'MEDIOCRE' | 'POOR';
  one_sentence_zh: string;
  one_sentence_en: string;
  hold_horizon_zh: string;
  hold_horizon_en: string;
  position_size_pct: number;
  analyzed_at: string;
  model: string;
  total_latency_ms: number;
  // Compact triggers (one liner)
  key_sell_zh: string;
  key_sell_en: string;
  key_add_zh: string;
  key_add_en: string;
  // Full triggers (3 each, shown on expand)
  full_sell_zh: string[];
  full_sell_en: string[];
  full_add_zh: string[];
  full_add_en: string[];
  // Mentors
  buffett: MentorComment;
  fisher:  MentorComment;
  munger:  MentorComment;
  // Seven gate summaries
  gates: GateSummary[];
}

const G_TITLES = [
  { num: 'I' as const,   zh: '业务解析',   en: 'Business' },
  { num: 'II' as const,  zh: '成长质量',   en: 'Growth Quality' },
  { num: 'III' as const, zh: '护城河',     en: 'Moat' },
  { num: 'IV' as const,  zh: '管理层',     en: 'Management' },
  { num: 'V' as const,   zh: '反向测试',   en: 'Inversion' },
  { num: 'VI' as const,  zh: '估值与时机', en: 'Valuation & Timing' },
  { num: 'VII' as const, zh: '综合裁决',   en: 'Final Verdict' },
];

function gates(zh: string[], en: string[]): GateSummary[] {
  return G_TITLES.map((g, i) => ({
    num: g.num,
    title_zh: g.zh, title_en: g.en,
    body_zh: zh[i], body_en: en[i],
  }));
}

export const REAL_VERDICTS: FinishedVerdict[] = [
  {
    symbol: 'GOOGL', name_zh: '谷歌', name_en: 'Alphabet',
    sector_zh: '通信服务', sector_en: 'Communication Services',
    current_price: 198.04,
    action: 'BUY', conviction: 0.74, quality: 'EXCELLENT',
    one_sentence_zh: 'Gemini 推理成本拉到行业底，Search 转型边际为正，云业务规模化拐点已现。',
    one_sentence_en: 'Gemini inference cost driven to floor, Search turning marginally positive, Cloud scale inflection here.',
    hold_horizon_zh: '12-24 个月', hold_horizon_en: '12-24 months',
    position_size_pct: 11.0,
    analyzed_at: '22h ago', model: 'claude-opus-4-7', total_latency_ms: 29840,
    key_sell_zh: 'Search 收入连续 2 季度同比下滑',
    key_sell_en: 'Search revenue declines YoY 2 quarters in a row',
    key_add_zh: 'Cloud 同比 >30% ｜ Gemini API 渗透率突破 25%',
    key_add_en: 'Cloud >30% YoY | Gemini API penetration breaks 25%',
    full_sell_zh: ['Search 收入连续 2 季度同比下滑', 'DOJ 反垄断拆分实质性裁决', 'Capex 占收入比突破 28% 但 ROIC 同步下滑'],
    full_sell_en: ['Search revenue declines YoY 2 quarters in a row', 'DOJ antitrust breakup ruling materializes', 'Capex/revenue >28% with ROIC declining'],
    full_add_zh: ['Cloud 同比 >30%', 'Gemini API 渗透率突破 25%', 'YouTube 广告环比加速 + Shorts 变现转正'],
    full_add_en: ['Cloud >30% YoY', 'Gemini API penetration breaks 25%', 'YouTube ads re-accelerate + Shorts monetization positive'],
    buffett: {
      score: 0.78,
      comment_zh: '搜索是世界上最好的生意之一：每个用户每天都来找答案，不需要 marketing 支出。问题是 AI 会不会切走这个流量入口——目前看 Gemini 已经基本接住。',
      comment_en: "Search is one of the best businesses ever: every user comes back daily without marketing spend. The question is whether AI cannibalizes the entry point — so far Gemini has held the line.",
    },
    fisher: {
      score: 0.85,
      comment_zh: '管理层在产品（Gemini 2.5 Pro）和资本配置（基础设施 + 自有 TPU）上都展现出长期主义。这是 Fisher 框架最看重的特质。',
      comment_en: 'Management shows long-termism across product (Gemini 2.5 Pro) and capital allocation (infra + in-house TPU). This is exactly what Fisher prizes.',
    },
    munger: {
      score: 0.81,
      comment_zh: 'Invert：什么会让它失败？答案是搜索流量持续被 ChatGPT/Perplexity 切走且 Cloud 增速无法补上缺口。两个都需要发生，概率不高。',
      comment_en: 'Invert: what kills this? Search volume bleeding to ChatGPT/Perplexity AND Cloud failing to backfill. Both need to happen, probability low.',
    },
    gates: gates(
      [
        '广告业务（Search + YouTube）占收入 75%，但毛利贡献已下降到 65%。Cloud 占比从 11% 升至 14%，且利润率快速转正。这是收入结构再平衡的关键阶段。',
        'AI 投入产出曲线：每年 $1,000 亿 capex 推动 Gemini 推理成本下降 40%，对应单位经济转正。属于"重资本短周期回收"的成长类型。',
        '三层护城河：1) 搜索流量入口（22 亿日活）；2) Android 生态（30 亿设备）；3) 数据 + 算力闭环。最弱的是搜索——AI 时代正在接受真实压力测试。',
        'Sundar 已是十年 CEO，资本配置纪律稳定。最近的 capex 上修说明董事会对 AI 投入有共识。继任风险中性。',
        '最坏情况：DOJ 强制拆分 Chrome + Search → 估值打 30% 折扣。但 5 年内执行概率 < 20%。其他风险（Apple 默认搜索协议失效、欧盟 DMA）影响有限。',
        '远期 P/E 22x · PEG 1.1，相对历史中位数（25x）和 SaaS 同行（28x）都偏便宜。Fair value $215，当前 $198 留 9% 安全边际。',
        '综合：质量五星、估值偏便宜、催化剂密集（Cloud 拐点 + Gemini 商业化）。BUY/0.74，目标仓位 11%。',
      ],
      [
        'Ads (Search + YouTube) account for 75% of revenue but only 65% of gross profit. Cloud has risen from 11% to 14% with margins flipping positive — a key revenue-mix rebalancing.',
        'AI capex curve: $100B/yr drives Gemini inference cost down 40%, with unit economics turning positive. Classic "heavy capex, short payback" growth profile.',
        "Three moat layers: (1) search traffic entry (2.2B DAU); (2) Android ecosystem (3B devices); (3) data + compute flywheel. Weakest is search — under live AI pressure.",
        'Sundar is now a decade-long CEO with steady capital-allocation discipline. The recent capex revision shows board consensus on AI investment. Succession risk neutral.',
        'Worst case: DOJ forces Chrome + Search divestiture → 30% valuation haircut. But <20% probability in 5 years. Other risks (Apple search default, EU DMA) limited impact.',
        'Forward P/E 22x · PEG 1.1, cheap vs historical median (25x) and SaaS peers (28x). Fair value $215; current $198 leaves 9% margin of safety.',
        'Synthesis: 5-star quality, slightly cheap, dense catalysts (Cloud inflection + Gemini monetization). BUY/0.74, target 11%.',
      ],
    ),
  },
  {
    symbol: 'TSM', name_zh: '台积电', name_en: 'Taiwan Semi',
    sector_zh: '半导体', sector_en: 'Semiconductors',
    current_price: 222.45,
    action: 'BUY', conviction: 0.72, quality: 'EXCELLENT',
    one_sentence_zh: 'AI 算力的唯一 chokepoint，2nm 进度领先且毛利锁定。',
    one_sentence_en: "The only chokepoint of AI compute — 2nm leadership locked in with margin protected.",
    hold_horizon_zh: '6-18 个月', hold_horizon_en: '6-18 months',
    position_size_pct: 8.0,
    analyzed_at: '1d ago', model: 'gpt-5-pro', total_latency_ms: 27410,
    key_sell_zh: '2nm 良率事故 ｜ 台海地缘风险升级',
    key_sell_en: '2nm yield event | Taiwan strait geopolitical escalation',
    key_add_zh: '美国厂量产 ｜ 苹果 + 英伟达 capex 同步上修',
    key_add_en: 'US fab in production | Apple + NVDA capex jointly raised',
    full_sell_zh: ['2nm 良率掉到 60% 以下', '台海地缘风险定价', '英特尔 18A 量产且良率超 70%'],
    full_sell_en: ['2nm yield drops below 60%', 'Taiwan strait geopolitical pricing', 'Intel 18A mass production with >70% yield'],
    full_add_zh: ['美国 Arizona 厂量产', '苹果 + 英伟达 capex 同步上修', 'CoWoS 产能扩建超预期'],
    full_add_en: ['Arizona fab in mass production', 'Apple + NVDA capex jointly raised', 'CoWoS capacity expansion exceeds plan'],
    buffett: {
      score: 0.72,
      comment_zh: '价格领导者 + 客户必选 = 接近垄断的现金牛。唯一不舒服的是地缘——但这个折扣在估值里已经体现。',
      comment_en: 'Price leader + customer must-have ≈ near-monopoly cash machine. Only discomfort is geopolitics, already priced into the multiple.',
    },
    fisher: {
      score: 0.88,
      comment_zh: '魏哲家延续张忠谋的资本纪律：3nm 上良率打底再扩产能，2nm 同样如此。这种"先验证再扩"的节奏是世界级。',
      comment_en: 'Wei carries on Morris Chang\'s discipline: prove yield at 3nm before scaling, same playbook for 2nm. World-class "validate-then-expand" cadence.',
    },
    munger: {
      score: 0.74,
      comment_zh: '简单：算 AI 时代的 chokepoint。Apple/Nvidia/AMD/Qualcomm 都依赖它，没有备选。这是 Munger 框架里的"一站式 toll road"。',
      comment_en: 'Simple: in the AI era, this is the chokepoint. Apple/Nvidia/AMD/Qualcomm all depend on it, with no alternative. A textbook Munger toll road.',
    },
    gates: gates(
      [
        '收入结构：HPC 56% / 智能手机 28% / IoT 9% / 其他 7%。HPC（含 AI 加速器）三年从 30% 升到 56%，是核心驱动。',
        '2nm 量产时点 2026 H2 + 3nm 良率已达 80%。增长不是周期性，而是产能 + 工艺双轮驱动的长周期。',
        '工艺领先 + 客户深度绑定（Apple / Nvidia 联合开发）+ 设备生态。最强的是工艺壁垒——领先英特尔 18-24 个月。',
        'CC Wei 延续 Morris Chang 文化：先建良率再建产能。Arizona / Kumamoto / Dresden 的全球化布局展示长期主义。',
        '最坏：台海冲突。但即使 30% 概率打折，剩下 70% 的世界仍要算这家公司。其他风险（Intel 突破 / 客户 ASIC）影响 <15%。',
        'P/E 28x · 远期 22x，相对自身 5 年中位数（19x）有溢价但不夸张。Fair value $230，当前 $222 接近合理上沿。',
        '综合：世界级质量、合理估值、密集催化剂。BUY/0.72，目标仓位 8%。',
      ],
      [
        'Revenue mix: HPC 56% / Smartphone 28% / IoT 9% / Other 7%. HPC (incl. AI accelerators) climbed from 30% to 56% in three years — the core driver.',
        '2nm mass production H2 2026 + 3nm yield already 80%. Growth is not cyclical but compounded by capacity + process node.',
        'Process leadership + deep customer co-development (Apple/Nvidia) + equipment ecosystem. Strongest is process — 18-24 months ahead of Intel.',
        "CC Wei carries Morris Chang's discipline: yield before capacity. Arizona / Kumamoto / Dresden global footprint shows long-termism.",
        'Worst case: Taiwan strait conflict. Even discounting 30% probability, the remaining 70% world must own this company. Other risks (Intel breakthrough / customer ASIC) impact <15%.',
        'P/E 28x · forward 22x, premium to 5-year median (19x) but not excessive. Fair value $230; current $222 near upper-fair.',
        'Synthesis: world-class quality, fair valuation, dense catalysts. BUY/0.72, target 8%.',
      ],
    ),
  },
  {
    symbol: 'NVDA', name_zh: '英伟达', name_en: 'NVIDIA',
    sector_zh: '半导体', sector_en: 'Semiconductors',
    current_price: 174.32,
    action: 'BUY', conviction: 0.78, quality: 'EXCELLENT',
    one_sentence_zh: '推理需求曲线尚未触顶，毛利护城河支撑下一轮再投资。',
    one_sentence_en: 'Inference demand curve has not topped; margin moat funds the next reinvest cycle.',
    hold_horizon_zh: '6-18 个月', hold_horizon_en: '6-18 months',
    position_size_pct: 12.0,
    analyzed_at: '3h ago', model: 'claude-opus-4-7', total_latency_ms: 31022,
    key_sell_zh: '训练 token 增速 <30% ｜ 客户 ASIC 渗透 >25%',
    key_sell_en: 'Training token growth <30% | Customer ASIC penetration >25%',
    key_add_zh: 'Inference share >50% ｜ AI Enterprise ARR 突破 $30 亿',
    key_add_en: 'Inference share >50% | AI Enterprise ARR crosses $3B',
    full_sell_zh: ['训练 token 增速 <30%', '客户自研 ASIC 渗透 >25%', 'GB300 良率事故'],
    full_sell_en: ['Training token growth <30%', 'Customer ASIC penetration >25%', 'GB300 yield event'],
    full_add_zh: ['推理需求占比 >50% 确认', 'AI Enterprise ARR 突破 $30 亿', 'Sovereign AI 千亿级订单落地'],
    full_add_en: ['Inference share confirmed >50%', 'AI Enterprise ARR crosses $3B', 'Sovereign AI mega-deal lands'],
    buffett: {
      score: 0.62,
      comment_zh: '我对 P/E 36x 通常抗拒，但 75% 毛利率 + 5 倍资本效率改变了我的看法。是否买入仍然要看入场价。',
      comment_en: 'I usually resist a 36x P/E, but 75% gross margin and 5x capital efficiency change the math. Buy decision still depends on entry price.',
    },
    fisher: {
      score: 0.92,
      comment_zh: '黄仁勋是少见的"工程师 CEO + 长期主义者"。CUDA 投了 15 年没赚钱，现在收割期才刚开始。',
      comment_en: 'Jensen is the rare engineer-CEO long-termist. CUDA absorbed 15 years of investment without payoff — the harvest is only beginning.',
    },
    munger: {
      score: 0.84,
      comment_zh: 'Avoid stupidity. 在 AI infra 周期里和这家公司对赌是 stupidity。',
      comment_en: 'Avoid stupidity. Betting against this company in the AI infra cycle qualifies.',
    },
    gates: gates(
      [
        'Datacenter 占 87%，前 10 大客户贡献 70%。GB200/GB300 月度部署节奏决定未来两年现金流。',
        '加速计算渗透率从 5% 向 50%+ 进发，是 5-7 年长周期。FY26E 数据中心增速 50%+，属于"超大需求 + 软件锁定"型成长。',
        'CUDA + cuDNN + Triton 软件栈（10 年护城河）+ NVLink/InfiniBand 系统级带宽（领先两代）+ 200 万开发者生态。',
        '黄仁勋 30 年掌舵，资本配置极致。最近的 Sovereign AI 战略展示了从硬件到平台的进化能力。',
        '最坏：训练 token 增速放缓 + 客户 ASIC 渗透。但即使两者同时发生，推理需求曲线（占比 50%+）仍是新增长极。',
        '远期 P/E 28x · PEG 0.6，估值合理（不便宜）。Fair value $185，当前 $174 留 6% 余量。',
        '综合：世界级护城河、合理估值、催化剂密集且近端。BUY/0.78，目标仓位 12%。',
      ],
      [
        'Datacenter 87%, top-10 customers 70%. GB200/GB300 monthly cadence decides cash flow for two years.',
        'Accelerated computing penetration heads from 5% toward 50%+, a 5-7 year cycle. FY26E datacenter +50%+, a "mega-demand × software lock-in" growth profile.',
        'CUDA + cuDNN + Triton stack (10-year moat) + NVLink/InfiniBand (two generations ahead) + 2M developer ecosystem.',
        '30 years of Jensen at the helm, surgical capital allocation. The Sovereign AI strategy shows hardware-to-platform evolution.',
        'Worst case: training token growth slows + customer ASIC penetration. Even both, inference (now 50%+) is a new growth pole.',
        'Forward P/E 28x · PEG 0.6, reasonable (not cheap). Fair value $185; current $174 leaves 6% room.',
        'Synthesis: world-class moat, reasonable valuation, dense near-term catalysts. BUY/0.78, target 12%.',
      ],
    ),
  },
  {
    symbol: 'MSFT', name_zh: '微软', name_en: 'Microsoft',
    sector_zh: '科技', sector_en: 'Technology',
    current_price: 442.12,
    action: 'WATCH', conviction: 0.61, quality: 'EXCELLENT',
    one_sentence_zh: 'Capex 节奏拐入新阶段，Copilot 单位经济还在等待规模拐点。',
    one_sentence_en: 'Capex enters a new phase; Copilot unit economics still waiting on a scale inflection.',
    hold_horizon_zh: '12-24 个月', hold_horizon_en: '12-24 months',
    position_size_pct: 6.0,
    analyzed_at: '2d ago', model: 'gemini-2.5-pro', total_latency_ms: 28220,
    key_sell_zh: 'Azure 增速跌破 25% ｜ Copilot DAU 连续两月下滑',
    key_sell_en: 'Azure growth drops <25% | Copilot DAU declines 2 months',
    key_add_zh: 'Copilot ARPU >$30 ｜ Azure 重新加速到 30%+',
    key_add_en: 'Copilot ARPU >$30 | Azure re-accelerates to 30%+',
    full_sell_zh: ['Azure 增速跌破 25%', 'Copilot DAU 连续两月下滑', 'OpenAI 关系生变 / 自研基础模型受阻'],
    full_sell_en: ['Azure growth drops <25%', 'Copilot DAU declines 2 months', 'OpenAI relationship shifts / first-party model stalls'],
    full_add_zh: ['Copilot ARPU >$30', 'Azure 重新加速到 30%+', '游戏业务（Activision）EBITDA 同比 +30%'],
    full_add_en: ['Copilot ARPU >$30', 'Azure re-accelerates to 30%+', 'Gaming (Activision) EBITDA +30% YoY'],
    buffett: {
      score: 0.65,
      comment_zh: 'Office 是几乎不可能被替代的现金牛，但当前股价已经把 AI 故事 priced in 一半。等回踩。',
      comment_en: 'Office is a nearly irreplaceable cash machine, but the current price has already priced in half the AI story. Wait for a pullback.',
    },
    fisher: {
      score: 0.72,
      comment_zh: 'Satya 的整合能力顶级（OpenAI / Activision / GitHub）。但 Copilot 用户活跃度数据偏弱，需要再观察 1-2 个季度。',
      comment_en: "Satya's integration prowess is elite (OpenAI / Activision / GitHub). But Copilot DAU data is soft — needs 1-2 more quarters of observation.",
    },
    munger: {
      score: 0.66,
      comment_zh: '不蠢但不便宜。在 AI 周期里这是"安全的二线选择"——稳但 alpha 有限。',
      comment_en: "Not stupid but not cheap. In the AI cycle this is a 'safe second-tier' — steady but limited alpha.",
    },
    gates: gates(
      [
        '收入结构：Cloud 35% / Productivity 32% / Personal 18% / Gaming 15%。Azure 是核心引擎，但增速从 33% 回落到 28%。',
        'Copilot ARPU $20，距离 $30 目标还有 50% 空间。GitHub Copilot 增速最快（+80% YoY）。',
        '产品矩阵护城河（Office + Azure + GitHub + LinkedIn）+ 企业销售渠道。最弱的是消费级——Bing 仍然边缘。',
        '资本配置极佳但 capex 上修速度过快（FY24 $50B → FY26 $95B），利润率短期承压。',
        '风险：OpenAI 关系生变（控股权 + 模型授权条款）+ 反垄断（Activision 收购后续审查）。',
        '远期 P/E 30x，相对自身 5 年中位数偏贵 12%。Fair value $410，当前 $442 高于合理价 8%。',
        '综合：质量五星、估值上沿偏贵、催化剂中性。WATCH/0.61，目标仓位 6%。',
      ],
      [
        'Revenue: Cloud 35% / Productivity 32% / Personal 18% / Gaming 15%. Azure is the engine but growth has eased from 33% to 28%.',
        'Copilot ARPU $20, with 50% room to the $30 target. GitHub Copilot grows fastest (+80% YoY).',
        'Product matrix moat (Office + Azure + GitHub + LinkedIn) + enterprise sales channel. Weakest is consumer — Bing remains marginal.',
        'Capital allocation excellent but capex revisions are aggressive (FY24 $50B → FY26 $95B), pressuring margins short-term.',
        'Risk: OpenAI relationship shifting (control + license terms) + antitrust (Activision post-deal review).',
        'Forward P/E 30x, ~12% premium to its 5-year median. Fair value $410; current $442 is 8% above fair.',
        'Synthesis: 5-star quality, valuation slightly stretched, neutral catalysts. WATCH/0.61, target 6%.',
      ],
    ),
  },
  {
    symbol: 'TSLA', name_zh: '特斯拉', name_en: 'Tesla',
    sector_zh: '可选消费', sector_en: 'Consumer Discretionary',
    current_price: 248.50,
    action: 'AVOID', conviction: 0.66, quality: 'MEDIOCRE',
    one_sentence_zh: '机器人叙事溢价过高，自动驾驶 unit econ 仍在亏损。',
    one_sentence_en: 'Robotics narrative premium overshot; FSD unit economics still negative.',
    hold_horizon_zh: '不持有', hold_horizon_en: 'No position',
    position_size_pct: 0,
    analyzed_at: '14h ago', model: 'claude-sonnet-4-6', total_latency_ms: 25910,
    key_sell_zh: '已 AVOID — 等估值消化 35% 以上再观察',
    key_sell_en: 'Already AVOID — wait for >35% valuation reset',
    key_add_zh: 'FSD 收入 ARR >$50 亿 ｜ Optimus 商业部署',
    key_add_en: 'FSD ARR >$5B | Optimus commercial deployment',
    full_sell_zh: ['估值已经过高（不持有）', '电车毛利率连续 4 季度 <17%', '中国市场份额跌破 8%'],
    full_sell_en: ['Valuation too high (no position)', 'EV gross margin <17% for 4 quarters', 'China market share falls below 8%'],
    full_add_zh: ['FSD 收入 ARR >$50 亿', 'Optimus 商业部署落地', '估值回踩到 P/E 50x 以下'],
    full_add_en: ['FSD ARR >$5B', 'Optimus commercial deployment lands', 'Valuation retraces to P/E <50x'],
    buffett: {
      score: 0.32,
      comment_zh: '一家 P/E 80x 的车厂，毛利率比传统车厂还低。叙事再多也救不回 unit economics。',
      comment_en: "An 80x P/E carmaker with gross margin below legacy OEMs. No amount of narrative can rescue unit economics.",
    },
    fisher: {
      score: 0.54,
      comment_zh: '马斯克的远景能力一流，但执行节奏（FSD / Robotaxi / Optimus）反复跳票。Fisher 框架要求"长期目标 + 短期可见进度"，目前只有前者。',
      comment_en: "Musk's vision is top-tier, but execution cadence (FSD / Robotaxi / Optimus) keeps slipping. Fisher requires long-term vision plus near-term progress — only the former is here.",
    },
    munger: {
      score: 0.40,
      comment_zh: 'Invert：什么会让我后悔不持有？答案是 FSD 突然商业化 + Optimus 量产。两个都需要发生且监管放行——历史上从未同时实现。',
      comment_en: "Invert: what would make me regret not owning this? FSD sudden commercialization + Optimus mass production, with regulatory blessing — never simultaneously achieved historically.",
    },
    gates: gates(
      [
        '收入：电车 78% / 储能 12% / 服务 10%。电车毛利率从 28% 跌到 17%，价格战触底。',
        '增速从 50% 跌到 5%，已不是高增长股。三个新故事（FSD / Robotaxi / Optimus）合计贡献 <2% 收入。',
        '充电网络是真护城河（北美 60% 份额）；制造效率被 BYD 追上；品牌护城河被价格战削弱。',
        '马斯克分散在 5 家公司（X / SpaceX / xAI / Neuralink / Tesla），且与公开股东关系紧张（薪酬包诉讼）。',
        '风险高：1) 估值（P/E 80x）；2) 中国市场份额持续下滑；3) FSD 监管不确定性。',
        '远期 P/E 80x · PEG 4.0，没有任何安全边际。Fair value $150，当前 $248 高估 65%。',
        '综合：质量降级、估值离谱、催化剂全部远端。AVOID/0.66，仓位 0%。',
      ],
      [
        'Revenue: EV 78% / Energy 12% / Services 10%. EV gross margin slid 28% → 17%, price-war floor.',
        'Growth fell 50% → 5%, no longer a high-growth stock. Three new stories (FSD / Robotaxi / Optimus) together <2% of revenue.',
        'Charging network is a real moat (60% North-America share); manufacturing efficiency caught by BYD; brand moat eroded by price war.',
        'Musk is split across 5 companies (X / SpaceX / xAI / Neuralink / Tesla) and tense with public shareholders (compensation lawsuit).',
        'High risk: (1) valuation (P/E 80x); (2) China share losses; (3) FSD regulatory uncertainty.',
        'Forward P/E 80x · PEG 4.0, no margin of safety. Fair value $150; current $248 is 65% overvalued.',
        'Synthesis: quality downgraded, valuation absurd, catalysts all distant. AVOID/0.66, position 0%.',
      ],
    ),
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
