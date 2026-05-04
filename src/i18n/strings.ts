export type Lang = 'zh' | 'en';

export type Bilingual = { zh: string; en: string };

export const pick = (s: Bilingual, lang: Lang) => s[lang];

export const STRINGS = {
  brand: { zh: 'uteki', en: 'uteki' },
  tagline: {
    zh: '把投研变成可 reproduce 的工程',
    en: 'Turn investment research into a reproducible pipeline',
  },
  heroEyebrow: { zh: 'Uteki · AI 投研', en: 'Uteki · AI Investment Research' },
  heroBigTitle: {
    zh: '基于 Agent 进行投资研究',
    en: 'Agent-driven investment research',
  },
  heroSubBody: {
    zh: '七关公司分析、深度新闻研判、宏观盘面、智能体路由 — 一个工作台。',
    en: 'Seven-gate company analysis, news deep-reads, macro tape, agent routing — one workbench.',
  },
  livePerf: {
    eyebrow: { zh: '实际表现', en: 'Live Performance' },
    chip: { zh: '实盘', en: 'LIVE' },
    chipNote: { zh: '由 uteki agent 维护的真实账户', en: 'Real account curated by uteki agent' },
  },
  demoProcess: {
    eyebrow: { zh: '工作流程 · 数据为模拟', en: 'Workflow · Mocked data' },
    title: { zh: '看 Agent 怎么跑这一遍流水线', en: 'See the agent run the pipeline end-to-end' },
    sub: {
      zh: '左右翻 5 个产品面，全部内嵌可交互 — 本节为流程演示，数据为预录脚本回放。',
      en: 'Flip through five surfaces side-to-side — fully interactive, but data is replayed from scripts.',
    },
  },
  real: {
    eyebrow: { zh: '真实结果', en: 'Real Results' },
    title: { zh: 'Agent 实际跑出来的判断', en: 'What the agent has actually produced' },
    sub: {
      zh: '研究台与新闻线的真实分析记录 — 点击展开完整 7 关流水线。',
      en: 'Real analyses from the studio and news feed — click to expand the full 7-gate pipeline.',
    },
    verdictsTab: { zh: '公司裁决', en: 'Company verdicts' },
    newsTab:     { zh: '新闻解读', en: 'News reads' },
    openStudio:  { zh: '打开研究台', en: 'Open studio' },
    openTimeline:{ zh: '打开新闻时间线', en: 'Open news timeline' },
    expandPipeline: { zh: '展开完整流水线', en: 'Expand full pipeline' },
    collapsePipeline: { zh: '收起', en: 'Collapse' },
    sevenGates: { zh: '七关流水线', en: 'Seven-gate pipeline' },
    mentorComments: { zh: '三贤评语', en: 'Mentor commentary' },
  },
  archSection: {
    eyebrow: { zh: '系统架构', en: 'System Architecture' },
  },
  contactSection: {
    eyebrow: { zh: '联系我', en: 'Contact me' },
  },
  demoBadge: {
    zh: '产品演示 · 数据为模拟',
    en: 'Product demo · Mocked data',
  },
  nav: {
    home: { zh: '首页', en: 'Home' },
    dashboard: { zh: '交易日报', en: 'Daily Brief' },
    news: { zh: '新闻时间线', en: 'News Timeline' },
    agent: { zh: '智能体助理', en: 'Agent Desk' },
    companyAgent: { zh: '研究台', en: 'Research Studio' },
    market: { zh: '宏观盘面', en: 'Market Dashboard' },
  },
  landing: {
    eyebrow: { zh: '产品演示', en: 'Product Showcase' },
    heroTitle: {
      zh: '让 AI 把投研，变成一条可 reproduce 的流水线。',
      en: 'Let AI turn investment research into a reproducible pipeline.',
    },
    heroSub: {
      zh: '七关公司分析、深度新闻研判、宏观盘面、智能体路由 — 一个工作台。',
      en: 'Seven-gate company analysis, news deep-reads, macro tape, agent routing — one workbench.',
    },
    ctaPrimary: { zh: '进入演示', en: 'Open Demo' },
    ctaSecondary: { zh: '看智能体', en: 'See the Agent' },
    sectionFeatures: { zh: '五个产品面', en: 'Five product surfaces' },
    sectionFeaturesSub: {
      zh: '点开任意一个进入对应 demo。所有数据均为预录制脚本回放，不连接任何真实账户。',
      en: 'Pick any surface to enter the demo. All data is replayed from scripted fixtures — no live accounts touched.',
    },
    footer: {
      zh: '© uteki · 本站为产品演示，数据均为模拟。',
      en: '© uteki · Product showcase. All data is simulated.',
    },
  },
  about: {
    eyebrow: { zh: '产品介绍', en: 'What is uteki' },
    title: {
      zh: 'Uteki — 基于 Agent 进行投资研究',
      en: 'Uteki — agent-driven investment research',
    },
    p1: {
      zh: '一套面向个人投资者的多 agent 系统：把"读公司、看宏观、追新闻、做决策"四件事拆给专门的 agent，每一步都有据可查、可复盘、可重放。',
      en: 'A multi-agent system for individual investors: read companies, watch macro, track news, make decisions — each split out to a specialized agent. Every step is auditable, replayable, reproducible.',
    },
    pillarsTitle: { zh: '三个产品支柱', en: 'Three product pillars' },
    pillar1Title: { zh: '深度公司分析', en: 'Deep Company Analysis' },
    pillar1Desc: {
      zh: '七关流水线：业务、成长质量、护城河、管理层、反向测试、估值、综合裁决 — 每一关独立 ReAct loop，结尾两次 Reflection 矫正矛盾。',
      en: 'Seven gates: business, growth quality, moat, management, inversion, valuation, verdict — each an independent ReAct loop, with two Reflection passes auditing contradictions.',
    },
    pillar2Title: { zh: '组合级仲裁', en: 'Portfolio Arena' },
    pillar2Desc: {
      zh: '七家头部模型并行跑同一道题，匿名互相投票，自动采纳冠军。胜率、成本、延时全部进入榜单。',
      en: 'Seven flagship models run the same prompt in parallel, vote anonymously, the winner is auto-adopted. Win rate, cost, latency all in the leaderboard.',
    },
    pillar3Title: { zh: '宏观与新闻雷达', en: 'Macro & News Radar' },
    pillar3Desc: {
      zh: '估值 / 流动性 / 资金流三盏信号灯 + 日历式新闻 + 逐篇 AI 解读 — 不漏掉任何会改变持仓判断的信号。',
      en: 'Three signal lights (Valuation / Liquidity / Flow) + calendar news feed + per-article AI reads — never miss a signal that should change conviction.',
    },
  },
  arch: {
    eyebrow: { zh: '架构', en: 'Architecture' },
    title: { zh: 'CompanyAgent 是核心', en: 'CompanyAgent is the core' },
    sub: {
      zh: 'Skill 团队 · RAG · Web Search · Memory · Harness · Arena · Evaluation — 整套真实概念都在这张图里。',
      en: 'Skill team · RAG · Web Search · Memory · Harness · Arena · Evaluation — every real concept lives in one diagram.',
    },
    legend: {
      zh: '颜色对应：橙=入口/路由 · 绿=研究/工具 · 米黄=深度调研/Skill · 红=记忆/Arena',
      en: 'Color key: amber = input/router · green = research/tools · cream = skill team · terracotta = memory/arena',
    },
    companyDeepTitle: { zh: 'CompanyAgent · 深度', en: 'CompanyAgent · in detail' },
    companyDeepDesc: {
      zh: 'G1–G6 每关独立的 ReAct loop（最多 6 次搜索 / 5 轮 / 180 秒），G3 后做 Reflection ① 排查 G1–G3 的矛盾，G5 后 Reflection ② 检查风险与正面结论的冲突，G7 不调工具、读全部上下文输出结构化裁决（BUY / WATCH / AVOID + conviction + position size）。',
      en: 'Each of G1–G6 is an autonomous ReAct loop (max 6 searches / 5 rounds / 180s). Reflection ① after G3 audits contradictions across G1–G3; Reflection ② after G5 checks risk vs. positive findings. G7 uses no tools — it reads the full context and emits a structured verdict (BUY / WATCH / AVOID + conviction + position size).',
    },
    overallTitle: { zh: '整体架构', en: 'Overall architecture' },
    overallDesc: {
      zh: 'Intent Router 把用户问题分流到 IndexAgent（线性 Agentic RAG，5 步走完）或 CompanyAgent（深度 ReAct）。两者输出都进 Arena 层做多模型仲裁。',
      en: 'The Intent Router fans queries to IndexAgent (linear Agentic RAG, 5 fixed steps) or CompanyAgent (deep ReAct). Both feed into the Arena layer for multi-model arbitration.',
    },
    evalTitle: { zh: '评测 · Arena', en: 'Evaluation · Arena' },
    evalDesc: {
      zh: '每个公司分析任务由 7 个模型并行执行，匿名互投，自动采纳得分最高的输出。胜率 / 平均回报 / 成本 / 延时全部进 Leaderboard，长期跑成"模型在投研场景的真实排名"。',
      en: 'Each company-analysis task runs across 7 models in parallel, with anonymous cross-voting; the highest-scoring output is auto-adopted. Win rate / avg return / cost / latency all flow into the leaderboard, producing a true ranking of models in the investment-research domain over time.',
    },
    routerTitle: { zh: 'Intent Router', en: 'Intent Router' },
    routerDesc: {
      zh: '一条 LLM 调用判断意图：闲聊 → ChatService；研究 → IndexAgent；公司 → CompanyAgent。',
      en: 'A single LLM call routes intent: chat → ChatService; research → IndexAgent; company → CompanyAgent.',
    },
    indexTitle: { zh: 'IndexAgent · 5 步线性 RAG', en: 'IndexAgent · 5-step linear RAG' },
    indexSteps: {
      zh: ['判断是否需要联网', '问题分解', '双引擎搜索（Google → DuckDuckGo）', '并发抓取（trafilatura → BeautifulSoup）', '流式合成回答'],
      en: ['Decide if search needed', 'Decompose query', 'Dual-engine search (Google → DuckDuckGo)', 'Concurrent scraping (trafilatura → BeautifulSoup)', 'Stream synthesized answer'],
    },
    indexNote: {
      zh: '⚠ 严格说是 Agentic RAG — 没有自主 loop，但事件粒度的 SSE 流让过程对用户完全透明。',
      en: '⚠ Strictly Agentic RAG — no autonomous loop, but event-level SSE streaming keeps the process fully transparent.',
    },
    companyTitle: { zh: 'CompanyAgent · 7 关 ReAct 流水线', en: 'CompanyAgent · 7-gate ReAct pipeline' },
    companyGates: {
      zh: ['业务解析', '成长质量 (Fisher 15Q)', '护城河 (Buffett)', '管理层 (Fisher + Munger)', '反向测试 (Munger)', '估值 & 时机 (Buffett)', '综合裁决'],
      en: ['Business analysis', 'Growth quality (Fisher 15Q)', 'Moat (Buffett)', 'Management (Fisher + Munger)', 'Inversion (Munger)', 'Valuation & timing (Buffett)', 'Final verdict'],
    },
    companyNote: {
      zh: 'G1–G6 每关跑一个 ReAct loop（最多 6 次搜索 / 5 轮 / 180s），G3 后 + G5 后各一次 Reflection 矫正矛盾，G7 读全部上下文输出结构化 JSON。',
      en: 'G1–G6 each runs a ReAct loop (max 6 searches / 5 rounds / 180s); Reflections after G3 and G5 audit contradictions; G7 reads all context and outputs structured JSON.',
    },
    arenaTitle: { zh: 'Arena · 多模型仲裁', en: 'Arena · Multi-model arbitration' },
    arenaDesc: {
      zh: '七家模型并行执行同一任务 → 匿名互相投票 → 打分 + 自动采纳冠军。胜率 / 成本 / 延时全部进 Leaderboard。',
      en: 'Seven models execute the same task in parallel → anonymous cross-voting → scoring + auto-adopt the winner. Win rate / cost / latency all flow into the leaderboard.',
    },
    providers: { zh: '已接入', en: 'Providers in arena' },
  },
  perf: {
    eyebrow: { zh: '产品表现', en: 'Performance' },
    title: { zh: '实盘持仓 · YTD 收益', en: 'Live portfolio · YTD return' },
    sub: {
      zh: '由 uteki agents 持续维护的真实持仓。出于隐私只展示标的与收益率，不展示具体仓位金额。',
      en: 'Real holdings curated by uteki agents. For privacy, we show tickers and returns — not absolute position sizes.',
    },
    weightedYtd: { zh: '组合加权 YTD', en: 'Portfolio weighted YTD' },
    bestPerformer: { zh: '最佳标的', en: 'Top performer' },
    holdings: { zh: '当前持仓', en: 'Current holdings' },
    allocation: { zh: '配比', en: 'Allocation' },
    return: { zh: 'YTD 收益', en: 'YTD return' },
    leaderboard: { zh: '模型擂台榜', en: 'Model leaderboard' },
    leaderboardSub: {
      zh: '同期 arena 数据 — 哪家模型贡献了最多采纳决策。',
      en: 'Same-period arena data — which model contributed the most adopted decisions.',
    },
  },
  models: {
    eyebrow: { zh: '已接入的模型', en: 'Supported models' },
    title: { zh: '七家头部模型 · 同台对决', en: 'Seven flagship models · one arena' },
    sub: {
      zh: '每条决策都让七家模型并行跑同一道题，匿名互投，自动采纳冠军。',
      en: 'For every decision, all seven models run the same prompt in parallel, vote anonymously, and the winner is auto-adopted.',
    },
    gatewayTitle: { zh: '一键接入所有模型', en: 'One key for every model' },
    gatewaySub: {
      zh: '不想一家一家配置？用 OpenRouter 或 AIHubMix 这类网关，一个 API key 就能切换上百款模型。',
      en: "Don't want to wire each provider? Use a gateway like OpenRouter or AIHubMix — one API key, hundreds of models.",
    },
    gatewayCta: { zh: '了解更多', en: 'Learn more' },
    directTitle: { zh: '或直接对接原厂 API', en: 'Or wire providers directly' },
    arenaNote: {
      zh: '在管理面板按需开启 / 关闭。模型名称与商标版权归各模型供应商所有。',
      en: 'Toggleable per provider in the admin panel. All model names and marks are property of their respective owners.',
    },
  },
  contact: {
    eyebrow: { zh: '联系作者', en: 'Get in touch' },
    title: {
      zh: '想聊聊投研工作流、Agent 系统、或者产品本身？',
      en: 'Want to talk about research workflows, agent systems, or the product itself?',
    },
    sub: {
      zh: '点击邮箱即可复制；GitHub 与博客是个人主页。',
      en: 'Click the email to copy. GitHub and blog are my personal pages.',
    },
    emailLabel: { zh: '邮件', en: 'Email' },
    emailHint: { zh: '点击复制', en: 'Click to copy' },
    emailCopied: { zh: '已复制 ✓', en: 'Copied ✓' },
    githubLabel: { zh: 'GitHub', en: 'GitHub' },
    blogLabel: { zh: '个人博客', en: 'Blog' },
  },
  demoPreview: {
    eyebrow: { zh: '产品演示', en: 'Live demo' },
    title: { zh: '不用切页 · 直接看效果', en: 'No tab switching · see it live' },
    sub: {
      zh: '左右翻 5 个产品面，全部内嵌可交互；想看完整版点右上角"打开完整 demo"。',
      en: 'Flip through five surfaces side-to-side, all embedded and interactive. Click "open full demo" for the full-page experience.',
    },
    openFull: { zh: '打开完整 demo', en: 'Open full demo' },
    prev: { zh: '上一个', en: 'Prev' },
    next: { zh: '下一个', en: 'Next' },
  },
  features: {
    dashboard: {
      title: { zh: '交易日报', en: 'Daily Brief' },
      desc: {
        zh: '编辑部式四张幻灯片：净值、持仓、智能体裁决、模型榜单。',
        en: 'Editorial four-slide deck: NAV, holdings, agent verdicts, model leaderboard.',
      },
    },
    market: {
      title: { zh: '宏观盘面', en: 'Market Dashboard' },
      desc: {
        zh: '估值 / 流动性 / 资金流三盏信号灯，配 52 周走势与板块轮动。',
        en: 'Valuation / Liquidity / Flow signal cards with 52-week sparks and sector rotation.',
      },
    },
    news: {
      title: { zh: '新闻时间线', en: 'News Timeline' },
      desc: {
        zh: '日历式信息流，逐篇 AI 解读多空判断与可信度。',
        en: 'Calendar-driven feed with per-article AI direction & confidence read.',
      },
    },
    agent: {
      title: { zh: '智能体助理', en: 'Agent Desk' },
      desc: {
        zh: '自动判断意图：闲聊或深度研究，研究模式实时显示思考与来源。',
        en: 'Intent-routed: chitchat or deep research with live thoughts & sources.',
      },
    },
    company: {
      title: { zh: '公司研究台', en: 'Company Research Studio' },
      desc: {
        zh: '七关流水线：业务、护城河、财务、风险、估值、催化、综合裁决。',
        en: 'Seven gates: business, moat, financials, risk, valuation, catalysts, verdict.',
      },
    },
  },
  agentPage: {
    welcome: { zh: '想分析点什么？', en: 'What would you like to dig into?' },
    welcomeSub: {
      zh: '挑一条预设问题，看智能体怎么思考、怎么调用工具、怎么写答案。',
      en: 'Pick a scripted prompt and watch the agent think, call tools, and answer.',
    },
    sendDisabled: { zh: '请从下方选择预设问题', en: 'Select a scripted prompt below' },
    presets: { zh: '预设问题', en: 'Scripted prompts' },
    abort: { zh: '中止', en: 'Abort' },
    history: { zh: '历史', en: 'History' },
    newChat: { zh: '新对话', en: 'New chat' },
    thinking: { zh: '思考中', en: 'Thinking' },
    sources: { zh: '来源', en: 'Sources' },
    thoughts: { zh: '思考链', en: 'Thoughts' },
    needsResearch: { zh: '需要联网研究', en: 'Needs web research' },
    confirmResearch: { zh: '深度研究', en: 'Run research' },
    skipResearch: { zh: '直接回答', en: 'Just answer' },
    youAsked: { zh: '你问的', en: 'You asked' },
  },
  companyPage: {
    title: { zh: '研究台', en: 'Research Studio' },
    subtitle: { zh: '七关公司分析流水线', en: 'Seven-gate company analysis pipeline' },
    watchlist: { zh: '观察池', en: 'Watchlist' },
    queue: { zh: '在跑分析', en: 'Active runs' },
    log: { zh: '执行日志', en: 'Execution log' },
    draft: { zh: '起草', en: 'Run' },
    running: { zh: '运行中', en: 'Running' },
    abort: { zh: '中止', en: 'Abort' },
    verdict: { zh: '裁决', en: 'Verdict' },
    conviction: { zh: '把握度', en: 'Conviction' },
    quality: { zh: '质量', en: 'Quality' },
    holdHorizon: { zh: '持有周期', en: 'Hold horizon' },
    sellTriggers: { zh: '卖出触发', en: 'Sell triggers' },
    addTriggers: { zh: '加仓触发', en: 'Add triggers' },
    philosophy: { zh: '三贤评分', en: 'Mentor scores' },
    noRuns: { zh: '尚无完成的分析。从左侧选择 ticker 起草一次。', en: 'No completed runs yet. Pick a ticker on the left.' },
  },
  newsPage: {
    title: { zh: '新闻时间线', en: 'News Timeline' },
    todayCount: { zh: '今日 {n} 条', en: '{n} today' },
    filterAll: { zh: '全部', en: 'All' },
    filterCritical: { zh: '关键', en: 'Critical' },
    filterHigh: { zh: '高', en: 'High' },
    filterMedium: { zh: '中', en: 'Medium' },
    filterLow: { zh: '低', en: 'Low' },
    aiAnalyze: { zh: 'AI 解读', en: 'AI read' },
    aiAnalyzing: { zh: '解读中', en: 'Reading' },
    aiDone: { zh: '解读完成', en: 'Done' },
    impactBullish: { zh: '利多', en: 'Bullish' },
    impactBearish: { zh: '利空', en: 'Bearish' },
    impactNeutral: { zh: '中性', en: 'Neutral' },
  },
  marketPage: {
    title: { zh: '宏观盘面', en: 'Market Dashboard' },
    subtitle: { zh: '三个问题，三盏信号灯', en: 'Three questions, three signals' },
    valuation: { zh: '估值', en: 'Valuation' },
    liquidity: { zh: '流动性', en: 'Liquidity' },
    flow: { zh: '资金流', en: 'Flow' },
    valuationQ: { zh: '现在贵不贵？', en: 'Is the market expensive?' },
    liquidityQ: { zh: '钱够不够？', en: 'Is liquidity tight?' },
    flowQ: { zh: '钱在去哪？', en: 'Where is the flow going?' },
    sectorPerf: { zh: '板块表现', en: 'Sector performance' },
    styleRotation: { zh: '风格轮动', en: 'Style rotation' },
    bullish: { zh: '看多', en: 'Bullish' },
    neutral: { zh: '中性', en: 'Neutral' },
    bearish: { zh: '看空', en: 'Bearish' },
    wk52: { zh: '52 周', en: '52-week' },
  },
  dashboardPage: {
    title: { zh: '交易日报', en: 'Daily Brief' },
    slide1: { zh: '净值与头条', en: 'NAV & Headlines' },
    slide2: { zh: '持仓矩阵', en: 'Holdings Matrix' },
    slide3: { zh: '智能体裁决', en: 'Agent Verdicts' },
    slide4: { zh: '模型榜单', en: 'Model Leaderboard' },
    nav: { zh: '账户净值', en: 'Net Asset Value' },
    todayPnl: { zh: '今日盈亏', en: "Today's P&L" },
    weekPnl: { zh: '本周盈亏', en: 'Week P&L' },
    cash: { zh: '现金', en: 'Cash' },
    holdings: { zh: '持仓', en: 'Holdings' },
    topHeadlines: { zh: '头条', en: 'Top Headlines' },
    symbol: { zh: '代码', en: 'Symbol' },
    price: { zh: '价格', en: 'Price' },
    weight: { zh: '权重', en: 'Weight' },
    return: { zh: '回报', en: 'Return' },
    marketValue: { zh: '市值', en: 'Market value' },
    rank: { zh: '名次', en: 'Rank' },
    model: { zh: '模型', en: 'Model' },
    winRate: { zh: '胜率', en: 'Win rate' },
    decisions: { zh: '决策数', en: 'Decisions' },
    avgReturn: { zh: '均值回报', en: 'Avg return' },
    recentVerdicts: { zh: '最新裁决', en: 'Recent verdicts' },
    buyOpportunities: { zh: '买入机会', en: 'Buy opportunities' },
    keyboardHint: { zh: '← → 切换幻灯片', en: '← → switch slides' },
  },
} as const;

export type StringKey =
  | keyof typeof STRINGS
  | string;
