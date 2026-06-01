# 简历附件 · Uteki v1 → v2 工程迭代证据

> **用途**：作为简历"个人项目"段落的附件链接 / 面试时被问"你怎么从 v1 到 v2 改进的"时的回答素材
> **核心叙事**：v2 不是 v1 的迭代版本，而是**基于 v1 4 个月的深度踩坑，把 LLM 投研系统从"工程实现一个想法"升级为"工程实现一个可审计、可衡量、可信任的决策系统"**
> **本文档状态**：iterating —— 部分数字需 Rain 二次核对

---

## 0. 为什么写这份文档

工程师能写出一个能跑的 LLM agent 不稀奇 —— 2024 年以后这是基础能力。
**稀奇的是：能跑过一个版本后，知道哪里是错的、把它重写、并能讲清楚"为什么这样改"**。

这份文档把 v1 → v2 的 7 个关键架构变化列出来 —— 每一项都对应了一个**踩过的痛、形成的反思、做的改造**。

这正好映射 Dalio 的 `Pain + Reflection = Progress`。这不是巧合，这是工程学习的普遍模式。

---

## 1. 一页 stats 对比

| 指标 | v1（已归档） | v2（uteki.open）| 减少 / 增加 |
|---|---|---|---|
| 后端 .py 文件数 | 856 | 189 | **-78%** |
| 后端代码行数 | ~227,000 | ~40,000 | **5.6× 缩减** |
| Commit 总数 | 1,358 | 252 (4 个月) | 更少但更聚焦 |
| Domain 数 | 15 个杂乱子系统 | 12 个 namespaced domain | 模块化 |
| ORM 模型数 | 113 个（混在一起） | 8 个 domain 模型文件 + schema 隔离 | 责任分离 |
| 周期 | ~12 个月（含 backtest / trading / OnChain 等） | 4 个月（聚焦投研决策） | 范围收敛 |
| 前端组件数 | 78 个 JS | 60 个 TS + Vite + Zustand | 类型化 |

**关键解读**：**v2 比 v1 小了 5.6×，但能力反而更强**。这是工程判断力成熟最直接的标志 —— 知道**该删什么**比知道**该写什么**更稀缺。

---

## 2. 7 个核心架构变化（每条都付出过代价）

### Δ1 · Agent 模型：3-Agent 角色 → 7-Gate 显式 pipeline

| | v1 | v2 |
|---|---|---|
| 形态 | 3 个 agent（Lead / Buffett / Munger），上层 delegate 给下层 | 7 个 Gate 序贯执行（业务 → Fisher 15 问 → Buffett 护城河 → Munger 管理 → Munger 反向测试 → 估值 → Synthesis）|
| 决策传递 | Agent 之间 freeform 文本传递 | 每 Gate 输出 Pydantic 结构化 JSON，下游强制基于上游引用源推理 |
| Reflection | 无 | Gate 3 / Gate 5 后跑 Reflection Checkpoint 检测前后矛盾 |

**踩的坑**：v1 的"Buffett Agent + Munger Agent 协同判断"听起来很美，但**两个 freeform agent 给出来的判断怎么综合？谁让谁？**实际跑起来经常出现"两个 agent 都说不错但理由互相矛盾"。

**反思**：投资框架本身是结构化的 —— Fisher 关注什么、Buffett 关注什么、Munger 反向测试什么，这些有清晰的分工。不应该让 LLM **代表一个大师做出整体判断**，应该**按大师们关心的维度逐项分析**，最后由综合 gate 收敛。

**改造**：v2 把"Agent 角色"拆解为"Gate 维度" —— 不再是 "Buffett Agent 在看公司"，而是 "在看公司的护城河"。**框架的颗粒度从'人'细化到'维度'**。

---

### Δ2 · Investment Framework：4 因子权重 → 7-Gate 显式映射

| | v1 | v2 |
|---|---|---|
| 框架编码 | Buffett 4 因子加权（moat 40% / financials 30% / mgmt 20% / valuation 10%）| 每 Gate 一个 Pydantic output_schema + system prompt 显式编码该投资大师的关注点 |
| 可解释性 | 权重是黑盒，调整凭感觉 | Gate 是显式的，prompt 可独立 A/B 改写 |
| Prompt 版本 | 直接改源码 | `CompanyPromptVersion` 表记录每个 gate 的 prompt 版本 + hash + 创建时间 |

**踩的坑**：v1 的权重看起来"科学"，但**调整 moat 40% → 50% 没人能解释为什么**。每次 backtest 结果不好就调权重，本质是 overfit。

**反思**：传统价值投资的方法论从来不是"加权求和" —— Buffett 不会说"护城河得 40 分综合就买"，他会说"没有护城河我直接不看"。**应该是 gate-style filter，不是 weighted score**。

**改造**：v2 删了权重模型，每个 gate 输出"通过 / 警示 / 否决" + 量化分数，但**任何 gate 给出强 negative 信号都能阻断后续推荐**（在 prompt 层面强制约束）。

---

### Δ3 · 数据来源可信度：无 → SourceCatalog + `as_of` 强制

| | v1 | v2 |
|---|---|---|
| 数据获取 | yfinance / FMP 直接调用，inline 喂给 LLM | 每次调用回来注册 `DataPoint(source, url, published_at, fetched_at)` 到 `SourceCatalog` |
| 引用机制 | 无 —— LLM 输出"营收增长 8%"无法溯源 | LLM 输出强制带 `[src:1,3]` 引用，parser 校验对应 DataPoint 存在 |
| 历史回测安全 | 无防御 —— yfinance 接口经常返回截至"现在"的数据，**会在回测时偷偷喂入未来信息** | `as_of` 时间窗约束：catalog 主动拒绝任何 published_at > as_of 的数据点 |

**踩的坑**：v1 我跑历史回测的时候，回测胜率好得不真实。后来发现是 `yf.Ticker("AAPL").history()` 默认拉到当前日期的所有数据，**模型实际看到了 2024 年的数据来推荐 2023 年的买入决策**。**回测在作弊**。

**反思**：这不是 yfinance 的问题，是**架构没在数据层强制 as_of 隔离**。LLM 不会主动遵守"我只看 2023 年之前数据"这个 instruction —— 必须在工具层把未来数据物理隔离。

**改造**：v2 自建 `SourceCatalog`，每个数据点带 published_at 元数据，`as_of` 在 RunContext 一等公民，catalog.add() 时主动 reject 未来数据 + 记 log。**这是 v2 区别于市面上所有 LLM 投研 agent 的关键工程决策**。

---

### Δ4 · 评估能力：零 → ConsistencyRunner + LLM-as-Judge + Drift Monitor

| | v1 | v2 |
|---|---|---|
| 一致性测试 | 无 | `ConsistencyRunner` 跑同输入 N 次，量化 action 一致率 + gate score CV |
| 质量评分 | 无 | LLM-as-Judge：用强模型按 rubric 给 gate 输出打分（1-10 + 扣分项） |
| 长期回归 | 无 | Drift Monitor：每日 cron 跑 baseline case 集，pass_rate 跌 10pp 报警 |
| Prompt 改动反馈 | 直接发布 | 必须先过 ConsistencyRunner + Judge 才能 merge |

**踩的坑**：v1 我花了 N 个晚上调一个 prompt，自己跑几次"感觉变好了"就上了。但**没有量化对比**。三周后回头看，**根本不记得是哪一版 prompt 更稳**。Prompt 优化变成了 superstition。

**反思**：**没有评估的 prompt 优化是迷信**。LLM 输出本身是 stochastic 的，单次结果好坏可能是随机的，**必须有 N 次重跑下的统计量**才能判断"这版更好"。

**改造**：v2 day 1 就在 `domains/evaluation/` 建了评估 domain —— ConsistencyRunner + LLM-as-Judge + Drift Monitor 三件套。之后每次 prompt 改动都跑一遍 baseline。

---

### Δ5 · Cache 隔离：data_type 维度 → operation + params 维度（"TSLA → MSFT" bug 事件）

| | v1 | v2 |
|---|---|---|
| Cache key 模式 | `cache:{data_type}:{ttl}` —— 例 `cache:kline:300s` | `uteki:{domain}:{operation}:{params}` —— 例 `uteki:company:gate_1:symbol=TSLA&prompt_hash=abc` |
| 跨标的隔离 | **无** —— 不同股票的同 data_type 调用共享 cache | 完全隔离 |
| Symbol-aware | 无（隐性） | 显性（params 强制包含 symbol） |

**踩的坑**：v2 上线后第 3 周（具体 commit `e8c0d10`），有用户分析 Tesla，**返回的 7-gate 内容完全是 Microsoft 的业务模型和财务数据**。诡异的是 Gate 7（synthesis）不走缓存所以最终格式正确，但内容基于错误的前置 gate。这个 bug **在 production 跑了 3 天**才被用户发现 —— 因为 **LLM 输出"看起来合理"，但完全是错的**。

**这是 v1 遗留下来的缓存模式没改干净的后果。**

**反思**：LLM agent 系统里的缓存比传统业务系统的缓存**危险 10 倍**。错误的缓存命中**不会报错**，只会输出"看起来合理但根本错"的内容，用户不仔细读甚至发现不了。

**改造**：v2 把所有 cache key 强制包含上下文标识（symbol、prompt_hash、as_of 等），并增加 self-consistency 检查（gate 输出里的 symbol 必须和请求 symbol 一致才接受 cache 命中）。

---

### Δ6 · 持久化与可审计：73 个混合表 → DecisionHarness + ModelIO + Event Stream

| | v1 | v2 |
|---|---|---|
| 决策记录 | `AgentAnalysis`（单一表，per agent run） | `DecisionHarness`（决策上下文 immutable 快照）+ `ModelIO`（每模型 I/O）+ `ArenaVote` + `DecisionLog` |
| Replay 能力 | 给一个 analysis_id 只能看到结果，**看不到推理过程** | 给一个 decision_id 可以**逐 token 重放**：完整 input_prompt / output_raw / tool_calls / 中间结论 |
| Schema 组织 | 113 个 model 混在一起 | 8 个 model 文件 + namespace（`uteki.index`, `uteki.company`, `uteki.evaluation`...） |

**踩的坑**：v1 出过一次"用户问我为什么 3 个月前给他推这只股票，我打开数据库**也答不上来**" —— 因为 `AgentAnalysis` 只存了 final report，没存推理过程。

**反思**：**对投资决策系统而言"决策不可复现"等于"系统不存在"**。
v1 的可观测性是为了 "debug 时给开发者看"，v2 的可观测性是为了 "几个月后给监管/合规/用户/自己看"。这是两套完全不同的设计。

**改造**：v2 把 event stream 设计为"任何 LLM I/O / tool call / 中间结论必须持久化"，schema 上用 immutable 快照（不允许 update，只 append）。

---

### Δ7 · 代码体量：sprawl → 5.6× 收敛

| | v1 | v2 |
|---|---|---|
| 后端 .py 文件 | 856 | 189 |
| 后端代码行数 | ~227,000 | ~40,000 |
| Subsystems | 15 个杂乱（buffett_agent / trading_agent / backtest / strategies / onchain / FOMC / ...） | 12 个 named domain，每个独立 api/models/schemas/service/repository |

**踩的坑**：v1 后期我已经记不清自己代码里哪些还在用 —— 比如 `strategies/` 目录下有 30+ 个策略文件，但实际跑的只有 3 个。`trading_agent_react/` 是早期实验代码，但被 import 到了关键路径上。**代码 sprawl 让 v1 后期改一行都担心炸**。

**反思**：**单人项目最大的敌人不是没时间写，是没勇气删**。每个未删的实验代码都是一笔利息。

**改造**：v2 启动时**先停 2 周做范围清单**：
- 投研决策 → keep
- 自动交易 → out（个人投资者不需要）
- 链上数据 → out（不投 crypto）
- 移动端 → out（dev only）
- Backtest 框架 → keep
- Trading strategies → out

range 收敛后，工程师每一周写代码都更聚焦。这就是为什么 v2 4 个月 252 commit 能做出**比 v1 12 个月 1358 commit 更完整的系统**。

---

## 3. 元规律：什么变了 / 什么没变

### 变了的（v2 比 v1 进步）
- ✅ **可观测性优先于聪明**：v1 求"agent 决策更聪明"，v2 求"agent 决策更可被审计"
- ✅ **结构化优先于灵活**：v1 让 LLM "自由分析"，v2 让 LLM "按 schema 输出"
- ✅ **删的勇气**：v1 留着所有实验代码，v2 启动时 out-of-scope 列表先写
- ✅ **评估先于优化**：v1 改完 prompt 跑 1 次看结果，v2 改完跑 ConsistencyRunner

### 没变的（v1 → v2 都对的事）
- ✅ 多 LLM Provider 抽象（v1 6 家、v2 8 家）—— 这条架构判断 v1 就对了
- ✅ 投资框架来自经典大师（Fisher / Buffett / Munger）—— 不试图"AI 发明新框架"
- ✅ 个人项目专注度高 —— 单人主导，决策权集中

---

## 4. 这套经验现在去哪了

v2（uteki.open）也已经完成它的使命。**下一代是 uteki monorepo**（[`uteki.v2`](https://github.com/Rain1601/uteki.v2) 仓库），核心要带过去的不再是代码，而是**这套迭代里学到的设计原则**：

详见同仓 [`docs/AGENT_DESIGN_LESSONS.md`](./..//AGENT_DESIGN_LESSONS.md)（Day 1 architectural checklist）和 [`docs/RETROSPECTIVE.md`](../RETROSPECTIVE.md)（4 个月项目回顾）。

---

## 5. 怎么在简历 / 面试里用这份证据

### 5.1 简历项目段落里加一句
在现有 4-bullet 后面（或前面）加一行：

```
· 系统迭代证据 — 本系统（v2）是基于前作 v1（12 个月 / 1358 commit / 227k 行）
  4 个月深度踩坑后的重写：代码量收敛 5.6×、增补 SourceCatalog 防止
  lookahead bias、增补 ConsistencyRunner 量化输出稳定性、修复 v1 遗留的
  symbol-less cache key 导致的 cross-contamination 问题
```

### 5.2 面试讲述里挑 1 个 delta 深聊
不要全讲 7 个 delta，挑 1 个最契合面试官的：
- **桥水 / behavioral**：讲 Δ7（删的勇气 / range 收敛） —— 直接呼应 "pain + reflection = progress"
- **千象 / quant**：讲 Δ3（`as_of` 防 lookahead bias） —— 这是 quant 的看家本事
- **风险类岗位**：讲 Δ5（cache 污染 bug 事件） —— 凸显你对"看起来合理但完全错的输出"的警觉
- **architecture 类岗位**：讲 Δ4（评估先于优化） —— 凸显工程纪律

### 5.3 被问"那 v1 是不是失败的项目"时怎么答
**❌ 不要承认"v1 失败了"**
**✅ 答**：
> "v1 不是失败的项目，**它是我学习投资 agent 工程的成本**。v1 教会了我 7 件事，每件事都直接对应 v2 的一个架构决策。**如果没有 v1 那 12 个月，v2 不可能在 4 个月就能跑通**。我会把 v1 看作必要的 R&D 投入，不是失败。"
>
> 这个答法直接呼应了 Dalio "Pain + Reflection = Progress" —— **v1 是 pain，v2 是 progress，中间是 reflection**。

---

## 6. 待办（用前要核对的数字）

> 这些数字是 Explore agent 从文件结构推算的，Rain 投递前请二次核对：

- [ ] v1 总 commit 数（1358）—— 跑一次 `git log --oneline | wc -l` 在 `/Users/rain/PycharmProjects/uteki.v1.archive`
- [ ] v1 后端 .py 文件数（856）—— `find /Users/rain/PycharmProjects/uteki.v1.archive/backend -name "*.py" | wc -l`
- [ ] v1 后端代码行数（~227k）—— `cloc backend/` 或 `find ... -name "*.py" -exec cat {} \; | wc -l`
- [ ] v2 同样三个数（189 / ~40k / 252）—— 对照核
- [ ] v1 起止时间（用于"12 个月"这个说法）
- [ ] v1 投资框架的具体形态（是 3-Agent Lead/Buffett/Munger 还是其他？Explore 提到 7 个大师 / 我们 v2 用的是 6 个大师 + 1 综合，需要确认 v1 的实际形态）

**核对完之后这份文档就可以作为简历的 reference 链接**。

---

## 7. 一句话总结（最重要的 100 字）

> "v1 我用 12 个月、1358 commit 实现了一个会跑的 LLM 投研 agent。
> v2 我用 4 个月、252 commit 重写为一个**可被审计、可被衡量、可被信任**的决策系统。
> v2 比 v1 代码量小 5.6 倍，但能力反而更强 —— 这是工程判断力成熟最直接的标志：
> **知道该删什么比知道该写什么更稀缺**。"

---

**iterating** —— 这份文档可作为简历附件链接。每次面试官问到 "v1 / 迭代" 都可以拿出来 ground 讨论。
