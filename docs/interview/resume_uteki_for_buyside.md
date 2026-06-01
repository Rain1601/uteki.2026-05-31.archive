# 简历 · 基金面试专用 · Uteki 项目段落

> **目标听众**：Bridgewater（桥水） / 千象资本 这类**基金类雇主**
> **关键认知**：你之前以为是"在做 C 端工具"，但**实际架构 = B 端 / 基金更看重的基础设施**
> **本文档状态**：iterating —— 跟 Claude 一起继续讨论展开

---

## 0. 这份文档和 `resume_uteki_optimized.md` 的区别

| | optimized.md（通用） | for_buyside.md（本文档） |
|---|---|---|
| 目标 | Agent / Domain agent / 通用后端岗位 | 基金类雇主（buyside） |
| 措辞 | Multi-Agent / 推理 / LLM 工程 | Systematic / Reproducible / Auditable / Lookahead-bias-free |
| 强调点 | 工程深度、agent 范式创新 | 投资框架系统化、回测可信度、量化稳定性 |
| 该写的 | Arena 创新、Memory 设计、Provider 抽象 | Provenance + `as_of`、Decision Replay、Consistency 量化 |
| 该 downplay | 略 | UI / Mobile / Design System / "AI agent" 字眼 |

---

## 1. 立场重定位（关键洞察）

**你之前 4 个月做的所有"看起来过度工程"的事 —— provenance、`as_of`、event store、ConsistencyRunner、Arena 投票 —— 对 C 端用户全是 nice-to-have**（个人投资者只想看结论）。

**但对基金（合规、审计、回测复盘、决策归因）全是必需品。**

**Pivot 不需要重写代码，只需要换叙事。**

### 一句话定位（基金版）

> "把 Fisher / Buffett / Munger 这套**经典价值投资框架**编码成一个**可重复、可审计、可量化稳定性**的 LLM 决策 pipeline。"

注意：
- 不说 "我做了一个 Multi-Agent 系统"
- 不说 "我做了 AI 投资助手"
- 说 "我把成熟的投资框架**系统化**了"

基金面试官听到 "把 Dalio principles 写成 code" 这类表达会眼睛一亮 —— 因为这正是他们想雇你来做的事。

---

## 2. 项目段落改写

### 2.1 基金通用版（投递桥水 / 千象 / 其他基金都用这版打底）

```
个人投资决策系统 · 系统化 LLM 投研框架 + 量化可靠性评测
2025.05 - 至今 | 个人项目 | Python · FastAPI · PostgreSQL · 多 LLM 适配
4 个月单人主导，218 commit，覆盖美/港/A 股

把 Fisher 15 问 / Buffett 护城河 / Munger 反向测试这套经典价值投资框架，
编码成一个可重复、可审计、可量化稳定性的 LLM 决策 pipeline。

A. 系统化决策框架（codified principles → reproducible pipeline）
   - 7-Gate 线性流水线（业务 → Fisher 15 问 → Buffett 护城河 → Munger 管理
     → Munger 反向测试 → 估值 → Synthesis），每个 gate 输出结构化 JSON
     （结论 + 置信度 + 引用源 ID），下游强制基于上游引用推理
   - 跨 gate Reflection Checkpoint 检测前后矛盾，自动注入修正信号
   - 同输入 N=10 次重跑：action 一致率 XX%，gate score CV XX%   ⭐ 待补

B. 回测可信度工程（lookahead bias prevention + audit trail）
   - 自建 SourceCatalog + DataPoint：每个数据点带 (source / url /
     published_at) 元数据
   - LLM 输出强制带 [src:N,M] 引用标记，parser 校验对应源
   - as_of 时间窗强约束：catalog 拒绝 published_at > as_of 的任何数据点
     → 回测严格无未来信息泄漏（解决了 LLM agent 回测最常见的作弊根因）
   - 完整 execution trace 持久化到 PG，任何决策可逐步 replay 与归因

C. 多模型 ensemble 一致性评测（Arena 3-phase）
   - 设计 Decide → Vote → Tally 流水线：N 个 LLM 独立判断，互相评审，
     按 adoption/rejection/win 累计模型分，量化"哪个模型对这类问题更可靠"
   - 独立 DB session 并发隔离，pipeline_state 支持断点续跑

D. 评估三件套
   - ConsistencyRunner：固定输入 + mock tools 跑 N 次，量化 LLM 内在不稳定
   - LLM-as-Judge：强模型按 rubric 给弱模型输出打分（1-10 + 扣分项）
   - Drift Monitor：每日跑 baseline case 集，pass_rate 跌 10pp 报警
```

### 2.2 桥水变体（在 2.1 基础上调强调点）

桥水的灵魂是 Ray Dalio 的 *Principles* + "idea meritocracy" + "believability-weighted decision making"。改写时凸显：

**A 段加一句**：
> "本质上是把经验丰富的投资人的 implicit 决策 heuristics 提炼成 explicit、可被新人 / 新模型继承的 principles 系统"

**C 段加一句**：
> "Arena 多模型投票本质是 idea meritocracy 的工程化 —— 不预设哪个模型最权威，而是让每个模型独立判断后通过结构化评审收敛共识"

**D 段加一句**：
> "类似 systematic investing 里的 backtest discipline —— 任何 prompt / 框架改动都通过 ConsistencyRunner + LLM-as-Judge 量化对比，避免凭感觉调优"

### 2.3 千象变体（在 2.1 基础上调强调点）

千象是**量化基金**，工程文化更重 statistical rigor / backtest correctness / factor research process。改写时凸显：

**B 段挪到第一位**（lookahead bias 是 quant 的看家本事，他们一眼能识别你是不是真懂）：
> "B. 回测可信度工程（核心）  -> A. 系统化决策框架  -> C. ensemble  -> D. 评估"

**B 段加一句**：
> "所有 yfinance / FMP / SEC EDGAR 数据通过 published_at 时间戳过滤而非 fetched_at；新闻类源（CSE）按 publication_date 严格切片。回测期间 catalog 主动拒绝任何越过 as_of 的 DataPoint 并记日志"

**C 段加一句**：
> "可推广到 ensemble factor 投票 / 多策略 consensus —— 用同样机制评估 N 个 alpha 信号互相一致 / 互相否定时的决策权重"

**D 段加一句**：
> "ConsistencyRunner 的指标体系（CV / mode agreement / categorical agreement）借鉴 statistical evaluation literature，对接传统 quant 团队的评测语言"

**不要写**：Mobile / Editorial Design / 多 LLM Provider 数量 / "AI Agent" 等字眼。

---

## 3. Buzzword 替换表（贴在改简历时旁边看）

| 不要写 | 写成 |
|---|---|
| Multi-Agent 协同 | systematized decision framework |
| 自动化闭环 | reproducible execution path |
| 推理一致性 | output consistency under stochastic input |
| LLM 推理稳定性 | quantified decision robustness |
| `as_of` 时间窗 | **lookahead bias prevention** |
| Provenance + Citation | audit trail / decision attribution |
| Arena 多模型投票 | ensemble model voting / multi-model consensus |
| Tool Effectiveness Score | feature utility measurement |
| RunStore 事件流 | full execution trace for replay |
| 7-Gate ReAct Pipeline | codified investment principles (Fisher/Buffett/Munger) as a reproducible pipeline |
| LLM-as-Judge | rubric-based output evaluation |
| Drift Monitor | daily regression on baseline cases |

---

## 4. 必须提前准备的 5 个面试问题

> 这 5 个问题**桥水和千象都会问**。前 4 个你能答好，第 5 个是当前的硬伤。

### Q1 · "你怎么确保 backtest 没用未来数据？"
**答**：`as_of` + SourceCatalog 拒绝逻辑。具体说：
- 每个 DataPoint 带 `published_at` 元数据（不是 `fetched_at`）
- catalog 在 `add()` 时检查 `published_at > as_of` → 拒绝 + log warning
- 所有 tool（yfinance / FMP / EDGAR / 新闻源）都通过 catalog 入栈，无 bypass
- yfinance 用 `history(end=as_of)` 切片，FMP 按 quarterly filing date 过滤，EDGAR 用 filing 时间戳

**杀手细节**：可以现场画一下数据流 —— "你看，这里有一道闸门" → 面试官印象深。

### Q2 · "你能完整 reproduce 6 个月前的某一次决策吗？"
**答**：可以。每次 decision 都写一条 `DecisionHarness` + N 条 `ModelIO` 持久化：
- `DecisionHarness` 含 market_snapshot / account_state / task / tool_definitions 的 immutable 快照
- `ModelIO` 含完整 input_prompt / output_raw / output_structured / tool_calls / latency / cost
- 给定一个 decision_id，可以**逐 token 重放** LLM 的输入输出和 tool 调用序列

**杀手细节**：演示一次 replay。把 `event stream → JSON dump → 时间线` 画一遍。

### Q3 · "LLM 不可解释，怎么放进投资流程？"
**答**：通过 4 层约束**绕开**不可解释问题：
1. **结构化输出**：每个 gate 强制 Pydantic schema，不接受 freeform；
2. **引用强制**：LLM 输出必须带 `[src:N,M]`，无来源的论断会被 parser 拒绝；
3. **跨 gate 一致性**：Reflection Checkpoint 检查前后矛盾，矛盾必须修复才能继续；
4. **量化稳定性**：ConsistencyRunner 跑 N 次，CV 超阈值时决策回退到人工审核。

也就是说：**我们不解释 LLM 内部，但我们约束它的输出可被审计、可被验证、可被衡量稳定性。**

### Q4 · "为什么 7 个 gate 而不是 5 个或 10 个？"
**答**：7 个 gate 不是技术决策，是**投资框架的逻辑映射**：
- Gate 1-2 = 业务理解（Fisher）
- Gate 3 = 护城河（Buffett）
- Gate 4 = 管理（Fisher + Munger）
- Gate 5 = Munger 反向测试
- Gate 6 = 估值
- Gate 7 = Synthesis

如果删 Gate 5（反向测试），漏掉风险维度；删 Gate 3（护城河），失去长期视角；加更多 gate 边际收益递减。

**这是把成熟投资框架的结构直接搬过来，而不是凭感觉拆步骤。**

### Q5（你目前的硬伤）· "你怎么知道你的框架真的有 alpha 而不是 noise？"

**当前你答不上来。** 需要补：
- 选 10-20 只标的 + 历史 5 年区间
- 每月 / 每季用 `as_of` 跑一次 agent，记录 action（买/持/卖）
- 持有期 60/180/360 天，对比 SPY/QQQ benchmark
- 输出：胜率、平均超额收益、最大回撤、Sharpe
- **数字哪怕一般也比"没数字"强 100 倍**

**优先级**：在面试前 1-2 周必须跑出这组数。`backend/uteki/scripts/backtest_collect.py` 已经有底子，扩展即可。

---

## 5. 关键数字清单（按优先级）

| 优先级 | 指标 | 跑法 | 给哪段简历用 |
|---|---|---|---|
| P0 | 同输入 N=10 次重跑的 **action 一致率**（买/持/卖 mode） | `domains/evaluation/service.py` 已有 | A 段 |
| P0 | gate score **CV / std**（量化输出稳定性） | 同上 | A 段 |
| P0 | **未来数据拒绝次数**（catalog 抓出几次潜在 leak） | 加日志，跑一次回测 | B 段 |
| P0 | **历史回测胜率 + 平均超额** vs SPY | 见 Q5 答案 | 个人陈述 / 答 Q5 时用 |
| P1 | 覆盖标的数（美 / 港 / A 各多少） | DB query | 段首 |
| P1 | 平均单次决策延迟 / 端到端 token 成本 | API 日志 | 技术细节问到时答 |
| P2 | Arena 投票里"模型间互不同意率" | arena_service 已有数据 | C 段 |

---

## 6. 桥水 specific 注意

### 文化关键词（面试时主动用）
- **Principles** / principle-based → 你的 7-Gate 就是 codified principles
- **Believability-weighted decisions** → Arena 的 vote 加权可以这样讲
- **Radical transparency** → Provenance + Citation 是工程化的 radical transparency
- **Idea meritocracy** → Arena 不预设权威，让 idea 自己竞争
- **Systematic** → 你的整个项目就是把 implicit knowledge → systematic process

### 可能问到的非技术问题
- "你为什么对投资 + AI 这个交叉感兴趣？" → **诚实回答**，但要落到 "我相信成熟投资框架可以被 codify"。不要说 "我觉得 AI 很 cool"
- "你看过 Dalio 的 *Principles* 吗？" → 如果没看完整本，至少看下半部分 *Work Principles*
- "Bridgewater 的 Idea Meritocracy 你怎么理解？" → 联系到 Arena 投票机制

### 该避免的
- 不要批评传统投资方法（"基本面分析过时了"之类）—— 桥水的方法本质就是 systematic 基本面 + macro
- 不要过度强调"我懂 AI"—— 强调"我懂如何把投资过程系统化"

---

## 7. 千象 specific 注意

### 文化关键词（面试时主动用）
- **Lookahead bias** → 你 `as_of` 的核心防御对象
- **Survivorship bias** → 你目前没处理，**这是 Q5 之外的另一个硬伤**，提前想好答案（你的标的池怎么选的？包含已退市公司吗？）
- **Out-of-sample test** → 量化人最在意的概念，回测要按 IS/OOS 拆分
- **Factor / Signal** → Arena 投票可以推广到 multi-factor consensus
- **Statistical significance** → ConsistencyRunner 输出的 CV 是这套语言

### 可能问到的技术深问
- "你的回测 IS 和 OOS 怎么拆？" → 准备答案：用 walk-forward？固定切分？
- "你怎么避免 overfitting prompt 到历史数据？" → 答 ConsistencyRunner 在 mock tools 模式下测稳定性，和 backtest 分开评估
- "为什么用 LLM 而不是因子模型？" → 老实答：LLM 解决"结构化文本理解"（财报、新闻、管理层访谈），因子模型解决"数值信号组合"，两者**互补不互斥**。你的系统是前者，可以和因子模型的输出 ensemble

### 该避免的
- 不要强调 UI / Mobile / 设计系统 —— quant 团队 allergic to 这些
- 不要说 "我训练了一个 model" —— 你没 train，是 prompt + adapter；说成 train 反而扣分
- 不要把"多 LLM Provider"当成卖点 —— 他们只关心稳定性和成本

---

## 8. 接下来的具体动作（按时间顺序）

### Week 1
- [ ] 跑 `ConsistencyRunner` 在 `research` / 7-Gate 上各 10 次，填 P0 数字
- [ ] 跑一次 `backtest_collect.py` 扩展版（5 年 / 10 标的），拿到 Q5 的答案
- [ ] 改一版简历（用 2.1 + 桥水 or 千象变体），让 Claude review

### Week 2
- [ ] 整理一份 **8-10 分钟的项目讲述**（不是 30 秒 pitch，是面试官说"详细讲一下这个项目"时的版本）
- [ ] 准备好 Q1-Q5 的具体说法（最好录一次自己讲，听一下）
- [ ] 看 Ray Dalio *Principles* 关键章节（如果面桥水）/ 一篇 quant 综述（如果面千象）

### Week 3（面试前）
- [ ] 跑一次端到端 demo 在自己机器上（万一面试官想看）
- [ ] 准备 3-5 个 **你想问对方的问题**（不要问"团队规模" / "用什么技术栈"，问业务相关的）
- [ ] 复盘 Q1-Q5 的杀手细节，每个准备一张白板手绘

---

## 9. TODO · 跟 Claude 继续展开的话题

- [ ] 跑出 P0 数字后，把 XX 填进段落，看是不是说服力到位
- [ ] 千象具体是哪个团队？是 fundamental quant 还是纯 stat arb？口味会有差别
- [ ] 你的 LinkedIn / GitHub profile 要不要也对齐 buyside 措辞？
- [ ] 准备一段 "你的 weakness 是什么" 的诚实答案 —— 当前最大短板是没有真实 trading P&L
- [ ] 如果对方追问"为什么不去 hedge fund 而来基金"或反过来 —— 你的 narrative 是什么

---

**iterating** —— 这份文档是给 Rain 和 Claude 一起改的，不是定稿。
