# 简历 · Uteki 项目段落优化

> 当前版本（原稿）的诊断与改写建议。
> 关键原则：每段必须有**至少一个量化指标**；先讲难题，再讲做法，最后讲结果。

---

## 一、原稿诊断

### 三个核心问题

**1. 全是"做了什么"，没有"做到什么"**
通篇没有一个能让面试官倒吸一口气的数字。"20+ 数据工具"是唯一的量化，但工具数量本身不值钱。面试官真正想看的是：延迟、准确率、一致性指标、成本、回测指标、覆盖标的数。

**2. Buzzword 密度过高，技术深度被淹没**
"Multi-Agent 协同""可追溯推理""结构化上下文""自动化闭环"——这些词在 2025 年的简历里已经通货膨胀。读完三段不知道**具体解决了什么难题**、**做了什么取舍**。

**3. 看不出个人贡献和技术判断**
"设计并实现"——是一个人？还是团队？哪些是主导的关键决策？面试官最想问的是"你为什么这么设计"，但当前文案没给出钩子。

**4. 项目定位过度营销**
"模拟专业投资机构决策流程"是危险表达——面试官会立刻追问"你做过买方/卖方吗？""你的回测 Sharpe 多少？"。如果答不上来，整段可信度崩塌。

---

## 二、改写版本（建议主用）

### 雨滴·Uteki — 面向个人投资者的多 Agent 投研系统
**2025.05 - 至今 | 个人项目**
**技术栈**：Python · FastAPI · SQLAlchemy async · PostgreSQL · Redis · React/TS · 多 LLM Provider（OpenAI / Claude / DeepSeek / Qwen / Gemini）

**项目概述**：构建支持多 LLM Provider 的投研 Agent 系统，覆盖**美/港/A 股**标的的基本面 + 技术面 + 宏观联合分析，输出带溯源（citation）的投资判断报告。

#### 1. 多 Agent 推理一致性 + 可追溯设计
- 设计 **7-Gate 公司分析流水线**（基本面 → 财务 → 估值 → 技术面 → 宏观 → 风险 → 决策），每个 Gate 输出结构化 JSON（结论 + 置信度 + 引用来源 ID），下游 Gate 强制基于上游引用推理，避免 LLM "幻觉式串联"
- 引入 **`as_of` 时间窗强约束**：所有数据源（yfinance / FMP / SEC EDGAR / CSE）按历史时间点切片，使回测不被未来信息污染——解决了 LLM Agent 回测最容易"作弊"的根因
- **效果**：N=10 次重复运行的一致性评测中，最终 action（买/持/卖）一致率从 XX% → XX%；gate score 方差降低 XX%

#### 2. 多 Provider LLM 适配层 + Tool Registry
- 实现统一 LLM Adapter：streaming / non-streaming 同接口、5 个 Provider 同 schema，切换 Provider 只改 1 行配置
- Tool Registry 注册 **20+ 数据/分析工具**（行情 / 财报 / 宏观 / 新闻），采用**文本解析式 tool-use**（而非 Provider 原生 function call）实现跨 Provider 一致的工具调用语义
- **关键决策**：放弃原生 function call 是因为 DeepSeek / Qwen / OpenAI 的 tool schema 不一致会引发 prompt 漂移，宁可牺牲一点解析鲁棒性也要保证语义统一
- **效果**：单次完整分析 token 成本从 $X.XX → $X.XX（DeepSeek 替代 Claude 后），自建 eval harness 上质量仅下降 X%

#### 3. Arena 式 LLM 评测 + Prompt 持续优化
- 设计 **3-phase Arena 评测**（Decide → Vote → Tally）：N 个模型独立给出投资判断，互相投票，按 adoption / rejection / win 累计模型分
- 基于评测结果迭代 Gate Prompt，建立"**prompt 改动 → 自动化回归 → 一致性指标**"的闭环
- 每个 voter 模型使用独立 DB session（`db_manager.get_postgres_session()`）支持并发写入
- **效果**：跑通 X 轮 prompt 优化迭代，关键 Gate 输出稳定性（同输入 N 次重跑的语义相似度）从 X.XX → X.XX

---

## 三、可选精简版（一栏 / 单页简历用）

### 雨滴·Uteki — 面向个人投资者的多 Agent 投研系统
**2025.05 - 至今 | 个人项目** · Python / FastAPI / PostgreSQL / 多 LLM Provider

- 设计 **7-Gate 投研流水线**（基本面→财务→估值→技术面→宏观→风险→决策），结构化 JSON + 引用 ID 强制溯源；引入 `as_of` 时间窗约束消除回测未来信息泄漏
- 实现统一 **LLM Adapter** 抽象 5 个 Provider（OpenAI/Claude/DeepSeek/Qwen/Gemini）+ **Tool Registry** 编排 20+ 数据工具；切换 Provider 后单次分析成本从 \$X→\$X，质量下降仅 X%
- 设计 **3-phase Arena 评测**（Decide→Vote→Tally）量化 Prompt 迭代效果，N=10 次重跑下 action 一致率 XX%→XX%

---

## 四、待补充的数字清单（优先级排序）

> 这些数字是这段简历能否成立的关键。建议在投递前用一次完整 evaluation 跑出来。

| 优先级 | 指标 | 来源 / 跑法 |
|---|---|---|
| P0 | Action 一致率（N=10 次同输入重跑，买/持/卖三值的多数派比例） | `evaluation` domain 已有的一致性测试 |
| P0 | Gate score 方差 / 标准差 | 同上 |
| P0 | 单次完整分析 token 成本（按 Provider 拆） | LLM Adapter 加 token 计费日志 |
| P1 | 覆盖标的数量（美/港/A 各多少只） | 数据库 query |
| P1 | 平均单次分析延迟（端到端 / 每 Gate） | API 日志 |
| P1 | Prompt 迭代轮数 + 每轮的一致性提升 | git log + eval harness |
| P2 | （如果做了）回测指标：胜率 / 平均收益 / 最大回撤 | 谨慎放，没把握就不放 |

---

## 五、面试预判：最可能被问的 5 个问题

> 简历每写一句话都要想"这句会被问什么"。以下是按当前改写版预判的高频追问。

1. **"你为什么不用原生 function call？解析失败怎么办？"**
   → 答：跨 Provider 一致性 > 单 Provider 鲁棒性；用 JSON schema 严格校验 + 一次重试 + fallback 到 plain text，失败率 < X%。

2. **"`as_of` 时间窗具体怎么实现的？yfinance 的实时接口怎么切片？"**
   → 答：在数据访问层包一层 `AsOfDataProvider`，所有 query 必须带 `as_of` 参数；yfinance 用 history(end=as_of)，FMP 用 quarterly filing date 过滤，EDGAR 用 filing 时间戳。

3. **"7 个 Gate 之间是串行还是并行？依赖怎么管？"**
   → 答：DAG 调度，前 4 个 Gate 可并行，后 3 个依赖前面的引用 ID 必须串行；用 task scheduler 管理依赖。

4. **"Arena 评测里 voter 投票的 prompt 怎么写的？怎么避免 voter 偏向自己？"**
   → 答：voter 看到的是匿名化的 candidate 输出（去掉 model name），评判维度固定为"逻辑一致性 + 引用充分性 + 结论合理性"。

5. **"为什么不直接用 LangChain / AutoGen / CrewAI？"**
   → 答：早期试过，痛点是（1）跨 Provider 抽象不彻底；（2）执行流不可观测，debug 困难；（3）我需要的 7-Gate 流水线在框架里反而要绕弯。自建 ~2k 行核心代码换来完全可控的执行流。

---

## 六、写简历的元原则（送给自己）

1. **每段必须有 1 个数字**——没有数字的段落删掉或合并。
2. **去掉"核心价值"段**——简历里没人读这种总结，只让密度变低。
3. **挑 2 个最难的子问题深挖**——`as_of` 时间窗、文本解析 tool-use、Arena 评测，这三个都是能讲 10 分钟的硬题。其他点弱化。
4. **慎用"模拟专业投资机构"**——改成"个人投资者投研助手"，定位老实反而专业。
5. **标出"个人项目"**——避免面试官以为是公司项目然后追问团队规模。
6. **写完每句话都问自己：这句会被追问什么？我答得上吗？**——答不上就别写。
