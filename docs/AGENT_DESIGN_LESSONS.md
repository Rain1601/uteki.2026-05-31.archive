# Agent 系统设计 · 给下一个 agent 项目的清单

> 这份文档与 [`RETROSPECTIVE.md`](./RETROSPECTIVE.md) 互补：
> - RETROSPECTIVE = "**这个项目**做对/做错了什么"
> - 本文档 = "**下次 agent 项目** day 1 该装好什么"
>
> 站在 uteki.open 完结的位置回头看，专注 **agent 系统设计** 而非协作/执行。

---

## 0. 先校准 — "agent" 不是一个，是一个范式族

uteki.open 里其实有 3 个形态完全不同的 agent 并存：

| Agent | 范式 | 触发 | 关键特征 |
|---|---|---|---|
| 公司分析 | 7-Gate 线性 pipeline + 每 gate 内 ReAct + Reflection | 用户 click 后异步 | 5-10 分钟，SSE 流式 |
| 指数 Arena | N 模型并发 → 互投 → 计票（3-phase） | 调度 + 用户 trigger | 多模型同时跑，结果聚合 |
| 宏观解读 | 单轮 LLM-as-analyst | 每天 22:00 UTC cron | 几十秒结束 |

**第一条经验就来自这里：** 不要试图把不同范式塞进一个框架。
**正解**：一个共享的 `BaseAgent` + 一个共享的 RunContext / Memory / Tools，**每种范式独立一套 Pipeline**。

---

## 1. 这个 agent 做对的 5 件事（要带到下次）

### 1.1 "先加 agent 再抽框架"，不是反过来
7-Gate 是写死的，Arena 是写死的，最后才抽 `BaseAgent`。**避免了过早抽象**。

早期能跑通的 agent，比早期完美的接口重要 10 倍。下次仍然应该这样做。

### 1.2 每一步都有结构化 JSON `output_schema`（Pydantic）
- 不接受 freeform JSON 字符串
- 下游 gate 直接读字段，不用 LLM 解析 LLM 的话
- 这是 LLM 工程能落地的**最低门槛**

> 落地参考：`backend/uteki/domains/company/skills.py` 里每个 gate 的 `output_schema` 字段。

### 1.3 Gate 间用"摘要 → 全文"双模式上下文
- Gate 2-6 看 `_summary_context()`（核心结论 + top 5 findings + 置信度）
- Gate 7 看 `_full_context()`（全部 6 gate 原文）
- 既控了 token 又保了细节
- **意外发现**：这一设计提高了 gate 之间的解耦 —— 后续改单个 gate 时不容易牵一发动全身

> 落地参考：`backend/uteki/domains/agent/core/context.py` 的 `PipelineContext`。

### 1.4 `as_of` 时间窗 + Provenance（每个 DataPoint 带源 ID）
- 每个 tool 调用结果注册 `DataPoint(id, source_url, published_at, ...)`
- LLM 输出强制带 `[src:N,M]` 引用标记
- catalog 拒绝 `published_at > as_of` 的数据
- **回测可信度的根，从 day 1 写进 tool 层比之后补便宜 10 倍**

> 落地参考：`backend/uteki/domains/agent/provenance/catalog.py`。

### 1.5 DB 写完整事件流（DecisionHarness / ModelIO / ArenaVote）
任何 agent 中间态都可以事后 replay。**这条最容易被忽视，回头看是最大的工程胜利。**

具体表现：
- `DecisionHarness`：决策上下文的 immutable 快照
- `ModelIO`：每个模型的完整 input/output + tool_calls + latency + cost
- `ArenaVote`：多模型互投的所有投票记录
- 任何质疑"为什么 agent 当时这么选"都能拉一条记录对答

---

## 2. 该提高的 5 件事（次世代必须解决）

### 2.1 Tool 调用没用 native function call
**症状**：为了多 provider 一致，写了 4 种文本格式 parser（XML-JSON / XML-elements / markdown code block / JSON wrapper）。

**代价**：
- LLM 输出格式经常漂移（特别是 DeepSeek / Qwen 在长 prompt 后期）
- Parser 维护成本高，每次新模型上线都要测 4 个格式
- 调试困难：parser 失败时 LLM 已经"花完"了 token

**下次怎么做**：每个 provider 走自己 native function call（OpenAI tools / Anthropic tool_use / Gemini function declarations）。Adapter 层把 `BaseTool.execute()` 的结果序列化成各 provider 的格式。不要试图统一文本协议。

### 2.2 Prompt 没有 hash + 自动版本化
**症状**：只有 `prompt_version: int` 字段靠人改。改了 prompt 不知道哪次评估对应哪版。

**下次怎么做**：
- Prompt 拆成 markdown 文件（`<skill>/SKILL.md`）
- 启动时 hash → 自动 `v1, v2, v3...`
- `POST /admin/reload-skills` 热重载
- 每次 prompt 改动 hash 变 → 触发 eval 回归

> 这是 uteki 的做法，已经验证可行。

### 2.3 没用 Anthropic Prompt Caching
**症状**：一次 7-Gate 分析里 system prompt ≈ 6K tokens × 7 gates = **42K 重复 tokens**。

**代价**：单次完整分析成本本可以降到现在的 **1/4 ~ 1/5**。

**下次怎么做**：
- LLM Adapter 层为 Anthropic 走专属 client（uteki 已有）
- system prompt 标 `cache_control: ephemeral`
- 5 分钟 TTL，一个 pipeline 内的 N 个 gate 全部命中 cache

### 2.4 Memory 是"事后写"不是"主动 query"
**症状**：当前 agent 结束时写一条 `AgentMemory(category='decision')`，但下次任务**不会先 query 相关记忆**。

**代价**：
- agent 不会从过去的判断里学习
- 同样的 bug pattern 反复出现
- 用户改正过的偏好 agent 记不住

**下次怎么做**：
- 每个 skill 启动前 `memory.recall_facts(symbol=X, category='decision', limit=5)`
- 用 embedding 做语义检索而不是 SQL 等值匹配
- 把检索到的记忆作为 prompt 的"上次我们这样处理过"段落注入

### 2.5 评估是事后补的不是先建的
**症状**：ConsistencyRunner 在 Phase 3 才出现（2026-04 才提出，距项目开始 2 个月）。前 2 个月所有 prompt 改动都是凭感觉。

**代价**：早期的 prompt 优化决策无法事后量化对比。

**下次怎么做**：**day 1 先建 eval 集，再写 agent**（见 §4 哲学 4）。

---

## 3. 下次 agent 项目 Day 1 必须说好的 7 件事

> 这些不是 "应该做"，是 "day 1 不定，day 30 一定回头补"。
> 关键判断：以下每一条**改起来都很贵**（要改架构），所以 day 1 不付小代价，day 30 要付大代价。

| # | 决策 | 不做的代价 |
|---|---|---|
| 1 | **每一步的 output schema（Pydantic）** | 改一次解析逻辑全链路重测 |
| 2 | **每个 skill 的 `recommended_limits()`**（tokens / calls / time / cost） | production OOM/OOC，无法预算 |
| 3 | **`as_of` 是 RunContext 一等公民**，所有 tool 必须接受 | 回测撒谎，复杂度后期指数级 |
| 4 | **每次 LLM 调用必记 Usage**（cost / cache hit / latency / model / provider） | "哪个模型好"的争论全是嘴炮 |
| 5 | **Mock-LLM mode 是开发设施不是测试便利** | 新人 onboard 5 分钟才看到第一个跑通 |
| 6 | **ConsistencyRunner + 至少 1 个 baseline case 集** | prompt 优化变玄学 |
| 7 | **AGENTS.md + CLAUDE.md + Branch 命名约定 + Co-Authored-By** | 多 agent 协作变拉锯 |

每条详解：

### Day 1 #1 · Output schema 用 Pydantic 强制
**反例**：早期 7-Gate 输出是自由文本 + "请尽量带 JSON" 的提示。结果 30% 的输出 JSON 解析失败，全靠 fallback regex 兜底。

**正解**：每个 skill 必须有 `output_schema: Type[BaseModel]`，LLM 输出失败直接重试或降级。

### Day 1 #2 · Per-skill `recommended_limits()`
**反例**：早期 ResearchPipeline 用默认 `max_tool_calls=30`，结果实际跑要 80+，每次都被 budget cut。

**正解**：每个 skill 类必须 override `recommended_limits()` 声明自己的真实成本。Harness 启动时按 skill 累加。Pipeline 自动放大子 skill 的 budget。

### Day 1 #3 · `as_of` 是 RunContext 一等公民
**反例**：早期 yfinance 直接调，没 `as_of` 参数。Backtest 时数据"作弊"，用了未来信息。后来发现要回溯改造**所有** tool。

**正解**：`RunContext.as_of: date | None` 默认 None（生产用），backtest 时显式传。所有 `BaseTool.execute()` 接收 ctx，自己处理 as_of 切片。

### Day 1 #4 · 每次 LLM 调用必记 Usage
**反例**：早期只记 `cost_usd`，没记 cache hit / latency / cache write tokens。后来想算"用 Anthropic caching 能省多少"，**没数据可算**。

**正解**：`UsageDelta(input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens, latency_ms, cost_usd, provider, model)` 每次 LLM 调用都写一条到 RunStore。

### Day 1 #5 · Mock-LLM mode 是开发设施不是测试便利
**反例**：早期跑一次 7-Gate 要 5 分钟 + $0.30。新人改一行 prompt 要等 5 分钟看效果，挫败感极强。

**正解**：`ctx.use_mock_llm=True` 时所有 LLM 调用走 fixture（YAML 文件，每个 skill 一份）。秒级返回。开发体验质变。**这条不是测试便利，是开发体验的根本。**

### Day 1 #6 · ConsistencyRunner + baseline case 集
**反例**：见 §2.5。前 2 个月没有评估，prompt 改了凭感觉对错。

**正解**：第一周写 5-10 个 ground-truth case + 关键指标（action 一致率、score CV、cost）。任何 prompt 改动跑一遍 eval 对比。**不要在没有 eval 的情况下写第二个 prompt 版本**。

### Day 1 #7 · AGENTS.md + CLAUDE.md + Branch 命名
**反例**：早期不同 agent 在同一仓写代码，约定靠口头传。datetime 用 utcnow 还是 timezone-aware、commit message 中英文，每次都漂移。

**正解**：
- `AGENTS.md` 仓库级公约（Python 版本、commit style、测试方法）
- `CLAUDE.md` agent 特定指令（port 号、踩过的坑、专用命令）
- Branch 命名：`claude/<feature>`、`codex/<feature>`，commit 必带 `Co-Authored-By:`

---

## 4. 4 条贯穿性的设计哲学

> 这些是高于具体技术决策的"思维方式"，可能比上面所有清单都重要。

### 哲学 1 · Agent 工程 = Decision Credibility Engineering
不是"怎么让 LLM 输出更好"，是"怎么让用户信任 LLM 输出"。

后者**完全靠架构**：Provenance / Replay / Consistency / Arena / `as_of`。

prompt engineering 解决前者（50%→95%），credibility engineering 解决后者（0%→90%）。

### 哲学 2 · 范式不一统，用 sweet spot 拼
3 种 agent 各有适用场景：
- **Linear pipeline + ReAct**：复杂决策、需要分步推理（投研、医疗）
- **Arena 多模型投票**：任何"单一答案靠不住"的场景（创意、判断、风险评估）
- **单轮 LLM-as-analyst**：每日报告、信号解读、不需要工具（宏观、新闻摘要）

**不要试图一统**。`BaseAgent` 是接口层，具体每种 pipeline 独立。

### 哲学 3 · 可观测性 > 聪明
一个能 replay / diff / 比较的笨 agent，比一个聪明但黑盒的 agent 价值 **10 倍**。

每多一个"我看不见的状态"，agent debug 成本就翻一倍。

具体落地：
- 所有 LLM input / output 持久化
- 所有 tool input / output 持久化
- 所有中间结论（GateResult）持久化
- 每条都带 timestamp + step_id

### 哲学 4 · 从评估往回设计
**先问"怎么知道 agent 做得好不好"，再设计 agent。不是反过来。**

具体节奏：
- **Week 1**：写 5 个 ground-truth case + 评估指标（不写 agent）
- **Week 2**：写最简单的 agent（甚至直接 prompt + 一个 tool）把 5 个 case 跑过
- **Week 3 起**：优化 agent，每次改动跑 eval 对比
- **永远不要**："先写 agent 跑跑看再加评估"

这条**和 day 1 #6 互锁**：没有 eval 集，所有"优化"都是赌博。

---

## 5. 移植到 uteki 的优先级（与 RETROSPECTIVE §4 互补）

最值得在 uteki 里**提前布置**的 3 件事：

### 5.1 `RunContext.as_of` + Tool 层透传
- 让所有 tool 默认 honor `as_of`
- catalog 已经有了，只差 harness/tool 层的串通
- **见 [`M1 todolist`](../../uteki/docs/M1-consistency-and-asof-todolist.md)**

### 5.2 Per-skill `recommended_limits()` + 默认 budget 强制
- `Harness` 启动时校验 skill 的预算声明
- 违规直接报错而不是运行时被截断
- 让 skill 的真实成本透明化，方便做 budget 规划

### 5.3 Mock-LLM mode 接到 RunContext
- `ctx.use_mock_llm=True` 时所有 LLM 调用走 fixture，秒级返回
- 是 ConsistencyRunner 成立的前提（不 mock 工具，外部数据波动会掩盖 LLM 内在不稳定）
- 也是新人 onboard 体验的关键

这 3 件做了，uteki 的 ConsistencyRunner / Provenance / 预算控制就全有了底。

---

## 6. 一句话总结

uteki.open 用 4 个月**踩着坑学会**的这些事，下次 agent 项目可以在 **week 1** 就装进 day 0 架构。

**这是这个项目最大的复利。**
