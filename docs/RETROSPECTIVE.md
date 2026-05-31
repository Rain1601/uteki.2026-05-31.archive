# uteki.open · 回顾与收尾

> **使命周期**：2026-02-01 → 2026-05-31（约 4 个月）
> **最终形态**：FastAPI + React + Flutter 多端仓，12 个 domain，218 个提交
> **后续承载**：所有可复用资产由 [`uteki`](../../uteki) 接管，本仓进入只读归档状态

本文档不是 README、不是 ARCHITECTURE，是**回头看**的视角：我们为了"用 LLM 帮个人做投研决策"这件事，做对了什么、走了什么弯路、对 agent 工程留下了什么。读者预设是 uteki 仓里的工程师（包括接手的 Claude），他需要知道**这些经验是怎么来的**，而不是只看结论。

---

## 0. 这个项目到底想做什么

一句话：**让 LLM 像专业投研团队一样为个人投资者出决策**，而不是当聊天机器人。

具体三条线：
1. **公司分析 Agent** — 给一只股票，按"业务 → Fisher 15 问 → Buffett 护城河 → Munger 反向测试 → 估值 → 综合"7 步出结构化判断
2. **指数 Arena** — N 个模型独立给指数配置建议 → 互投 → 计票，输出"群体智慧"决策
3. **宏观 Dashboard** — 每天扫一次估值/流动性/资金流，AI 出当日解读

三条线对应三种 agent 范式：**线性 Pipeline（ReAct + 多 Gate）、群体 Arena（多模型并发投票）、单轮 Skill（LLM-as-analyst）**。这是这个项目最大的工程价值——**把"agent 建什么"和"怎么建"做了一次系统性试验**。

---

## 1. 时间线 · 四个阶段

### Phase 1 · 起手式（2026-02 上旬）
**主题**：跑通最小骨架，验证多 LLM Provider 抽象

代表 commit：
- `20f0087` Migrate Agent Chat with Deep Research and Multi-LLM Support
- `8c98db5` 添加指数投资 Arena 多模型决策系统 ⭐ **Arena 雏形诞生**
- `1f8950d` Arena 时间线图表重构 + Prompt 版本管理
- `3d650c8` Arena 多模型投票系统 + Allocation 可视化

**留下的资产**：`LLMAdapterFactory`、ArenaService、PromptVersion 表

**第一个深刻教训**：Arena 是先有"想看 7 个模型怎么吵架"的好奇心，再有"如何聚合输出做决策"的工程方法。**好的 agent 设计来自能讲清楚的好奇心，不是来自抽象的"通用框架"**。

### Phase 2 · 扩展期（2026-02 下旬 → 2026-03 中旬）
**主题**：补齐数据、存储、UI、移动端，扩大表面积

代表 commit：
- `1226126` security: 全端点强制登录鉴权 + LLM API Key 去除 .env fallback ⭐ **架构转折点**
- `6d7eef8` Supabase 数据层 — SupabaseRepository + DatabaseManager 增强（**这一波 8 个 commit 把所有 domain 从 PG 迁到 Supabase**）
- `268c900` Admin LLM配置、豆包模型支持、PostgreSQL fallback、TTS、宏观市场热力图
- `2aab08f` 全品类 K 线数据库 — 后端完整实现
- `3ea0c07` **LLM-driven backtest system with 4-skill pipeline** ⭐ **第一次提出"skill 拆分"**
- `519b90d` **company investment agent backend — 7-gate pipeline with SSE streaming** ⭐ **7-Gate 雏形诞生**

**留下的资产**：双层存储（Supabase + PG fallback）、Skill Pipeline 概念、7-Gate ReAct、SSE 长连接

**第二个教训**：Supabase 迁移是个**没想清楚就开始**的决定，后续因为 Supabase 偶发 503 又必须保留 PG fallback，最终变成"双写双读"的复杂度。**架构变更前先量化收益和回滚成本**，否则会留下永久债务。

### Phase 3 · 收敛期（2026-03 下旬 → 2026-04 中旬）
**主题**：从"散点功能"收敛为"用得动的产品"

代表 commit：
- `b31ef5d` **ReAct agent architecture + AIHubMix unified LLM provider** ⭐ **多 Provider 统一为单网关**
- `622ea4f` per-gate instant structuring — structured cards after each gate completes
- `3adcc3b` evaluation domain — **Gate output consistency test** ⭐ **ConsistencyRunner 概念诞生**
- `a70ac6b` LLM-as-Judge gate quality scorer
- `877758a` Evaluation Panel — consistency test + judge + history dashboard
- `02faceb` tool effectiveness tracking in ToolAction and GateResult
- `e8c0d10` **fix: include symbol in company gate cache key to prevent cross-contamination** ⭐ **TSLA 返回 MSFT 结果的著名 bug**
- `c7d5084` index memory service — agent memory CRUD and skill integration
- `feb8ecc` Redis pub/sub for task streaming and notification service

**留下的资产**：评估三件套（Consistency / Judge / History）、Tool effectiveness 指标、AgentMemory 数据模型、SSE 重连机制

**第三个教训**：评估能力（M3 阶段）不是项目的"装饰品"，而是**让 LLM 优化变成工程问题**的关键基础设施。`3adcc3b` 之前我们在凭感觉调 prompt，之后我们有了"action 一致率"和"gate score CV"两个量化指标。

### Phase 4 · 沉淀期（2026-04 下旬 → 2026-05-31）
**主题**：建立可信度（provenance + as_of）、统一设计语言、为接手者收尾

代表 commit：
- `4f3e4f1` **data-source provenance + citations + historical backtesting** ⭐ **可信度基础设施**
- `ab5b5d5` editorial design system + page-level redesigns
- `e7ecda5` rebuild as Studio + Dossier + Composing + Request（Company Agent 信息架构重写）
- `6de0719` **scope yfinance bootstrap by as_of for honest historical backtests** ⭐ **as_of 时间窗**
- `869691d` rebalanced layout + rich per-gate chapter bodies
- `e2c00a0` fix(auth): stabilize local login flows（最后一个）

**留下的资产**：SourceCatalog + DataPoint + `[src:N]` citation parser、`as_of` 时间窗强约束、Studio/Dossier 信息架构

**第四个教训**：**用户对 LLM 输出的信任阈值远高于对人的**。`[src:1,3]` 这样的引用标记不是 nice-to-have——没有它，Agent 说"AAPL 营收增长 8%" 用户就不信。`4f3e4f1` 把"agent 像分析师"和"agent 是个能查证的助手"两条路彻底分开了。

---

## 2. 我们对 Agent 的 12 条具体实践（每条都付出过代价）

### 实践 1：**预算硬约束优于聪明启发** — ToolBudget
**Commit**：`519b90d` 起，多次迭代
**Before**：LLM 死循环调工具，没有 stop condition
**After**：每个 gate 独立 `ToolBudget(max_searches=6, max_rounds=5, timeout=180s)`，预算耗尽时强制注入"请直接给结论"

教训：与其试图"让 LLM 自己知道何时停"，不如**让 harness 强制它停**。Agent 的自由度应该花在**怎么用工具**而不是**用几次工具**。

### 实践 2：**Cache key 必须包含完整上下文标识** — 著名 TSLA→MSFT bug
**Commit**：`e8c0d10` fix: include symbol in company gate cache key
**Before**：`company:gate:{model}:{gate}:{prompt_hash}` — 不同股票共享缓存
**After**：`company:gate:{symbol}:{model}:{gate}:{prompt_hash}` — symbol 维度隔离

教训：**LLM agent 系统里的缓存比传统 cache 危险 10 倍**。错误的缓存命中不会报错，只会输出"看起来合理但完全错误"的内容。给 cache key 加字段的成本远低于一次错误决策。同样的 bug 在 `2d225f9 fix: chartSymbol no longer sticks across group tabs` 又出现了一次（前端版本）。

### 实践 3：**跨 Gate 上下文双模式 — 摘要喂中段，全文喂结论**
**Commit**：`519b90d` 起，`backend/uteki/domains/agent/core/context.py`
**Before**：每个 gate 看完整前文 → Gate 7 超 context window
**After**：Gate 2-6 看 `_summary_context()`（核心结论 + top 5 关键发现 + 置信度），Gate 7 看 `_full_context()`（全文）

教训：**信息密度 vs 信息完整性是 agent pipeline 的核心权衡**。摘要要保留"下游能用上的事实 + 置信度"，丢掉"过程性思考"。这条经验直接催生了后面的 Reflection Checkpoint。

### 实践 4：**Reflection Checkpoint 用来抓"自相矛盾"**
**Commit**：体现在 `domains/agent/core/reflection_runner.py`
位置：Gate 3 和 Gate 5 之后
触发：检测前序 gate 间矛盾（如 Gate 1 说"高增长"，Gate 3 说"营收下滑"），把修正建议注入后续所有 gate

教训：**多步 agent 的最大风险是前后矛盾**。Reflection 不需要每个 gate 后都跑，只在"关键交接点"跑就够了。

### 实践 5：**LLM Provider 抽象做两层 — 直接调用 + 网关聚合**
**Commit**：`b31ef5d` ReAct agent architecture + AIHubMix unified LLM provider
**Before**：8 家 Provider 各写一套，API key 管理混乱（admin DB / legacy / hardcoded 三套来源）
**After**：AIHubMix 网关 + `_MODEL_NAME_MAP` 自动映射 + 推理模型特殊处理（o1/o3 禁 temperature，DeepSeek-reasoner 禁 streaming，Claude thinking 强制 temp=1）

教训：**统一 adapter 解决 99% 场景，剩 1% 必须特殊处理**。不要试图把推理模型塞进通用接口——把 special-case 显式写出来，比"通用抽象"更可维护。

### 实践 6：**SSE 长连接 + Redis Pub/Sub + DB 持久化三件套**
**Commit**：`feb8ecc` Redis pub/sub for task streaming and notification service
**Before**：Pipeline 跟随客户端连接，断网即失败
**After**：Fire-and-forget task 独立运行 → 事件同时写 SSE queue + Redis channel + PG → 重连时 DB 回放已完成 gate + Redis 订阅后续

教训：**长任务 agent 必须把"任务执行"和"客户端连接"解耦**。10 分钟分析里有 8 分钟用户在喝咖啡，断网/刷新/换设备都不能让任务白跑。**但要注意 Queue Sentinel** —— task crash 没放 `None` 终止信号客户端会永久挂起。

### 实践 7：**Agent Memory 用 `agent_key` 区分共享 vs 私有**
**Commit**：`c7d5084` index memory service — agent memory CRUD and skill integration
设计：`agent_key="shared"` 跨模型共享；`agent_key="{provider}:{model}"` 模型私有
分类：5 种 category（decision / reflection / experience / arena_learning / arena_vote_reasoning）

教训：**多模型协作时，共享知识和模型私有偏好必须分开存**。否则 Claude 的偏见会污染 DeepSeek，或反之。

### 实践 8：**Arena 3-Phase = Decide → Vote → Tally，每阶段独立可恢复**
**Commit**：`8c98db5` → `3d650c8` → `d1a0b9e`（多次迭代）
设计：每个 model 用独立 `db_manager.get_postgres_session()` 避并发写冲突；`pipeline_state` 字段记录当前阶段，支持断点续跑

教训：**多模型并发不是"开 7 个 asyncio task"那么简单**。共享 DB session 会写冲突，共享 cache key 会污染（实践 2），共享 prompt 上下文会偏见（实践 7）。每条都踩过坑。

### 实践 9：**评估三件套 — Consistency / Judge / History**
**Commit**：`3adcc3b` evaluation domain — Gate output consistency test
- **ConsistencyRunner**：同输入跑 N 次，测 action 一致率 + gate score CV
- **LLM-as-Judge**：用强模型评弱模型的输出（1-10 分 + 扣分项）
- **History Dashboard**：评估结果按 date range 查询，看趋势

教训：**没有评估的 agent 优化是迷信**。这套加入后，prompt 改动可以量化对比，而不是"感觉这次更好"。

### 实践 10：**`as_of` 时间窗 + Provenance 是回测可信的根基**
**Commit**：`4f3e4f1` data-source provenance + citations + historical backtesting
**Commit**：`6de0719` scope yfinance bootstrap by as_of for honest historical backtests

设计：
- 每个 tool 调用结果注册 DataPoint（id / source / url / published_at / fetched_at）
- LLM 输出强制带 `[src:1,3]` 标记，parser 校验对应 DataPoint 存在
- `as_of` 时间戳传入 catalog，发布日期晚于 `as_of` 的 DataPoint 被拒绝

教训：**LLM 做投研回测最容易"作弊"的就是用了未来数据**。`as_of` 不是 nice-to-have，是回测能讲清楚的最低门槛。这一块强烈推荐 port 到 uteki（已在 M1 todolist）。

### 实践 11：**Tool Effectiveness 跟踪 — 给 agent 工具一个 KPI**
**Commit**：`02faceb` tool effectiveness tracking in ToolAction and GateResult
设计：`tool_efficiency_score = (返回 >100 字符的工具次数) / (总工具次数)`

教训：**LLM 经常调工具但用不上结果**。这个指标暴露了"哪些工具是 noise"。后续把无效工具下线、把高效工具放进默认列表。

### 实践 12：**信息架构重构 = 把 agent 输出当书来排版**
**Commit**：`e7ecda5` rebuild as Studio + Dossier + Composing + Request
**Commit**：`869691d` rebalanced layout + rich per-gate chapter bodies
**Commit**：`ab5b5d5` editorial design system + page-level redesigns

设计：
- **Studio**：用户视角，关注 watchlist + active drafts + history
- **Dossier**：报告视角，分章节排版（每个 gate 是一章）
- **Composing / Request**：分析中的状态视图

教训：**LLM agent 的 UI 不能照 chatbot 抄**。投研报告需要的是"可扫描的结构化阅读体验"，不是"对话流"。Editorial design system（Fraunces 衬线显示 / Newsreader 正文 / JetBrains Mono 数据）这种细节决定了用户是否信任输出。

---

## 3. 走过的弯路（不要在 uteki 重蹈）

### 弯路 1：Supabase 大迁移（Phase 2 末）
**代价**：8 个 commit 把所有 domain 迁过去，后来发现 Supabase 偶发 503 → 又写了 PG fallback → 双写双读 → 维护成本永久增加
**教训**：**新存储平台先在一个 domain 试 2 周，再决定全量迁**。当时被"managed 服务省运维"诱惑，没量化迁移成本。uteki 的存储栈选择请审慎。

### 弯路 2：先做 demo 页面，再做 backend
**代价**：Phase 2-3 有一波 demo 页面（`adbbae3 demo pages — index agent, voting, model selector, reflection`）用 mock 数据撑起整个 UI，后续接真 backend 时大改一次
**教训**：**Demo 用 mock 数据可以，但 mock 的 schema 必须跟 backend 真实 schema 一致**。否则前后端接口对齐时 cost 巨大。

### 弯路 3：Tool 调用解析支持 4 种格式
**位置**：`backend/uteki/domains/agent/core/tool_parser.py`
**代价**：XML-JSON / XML-elements / markdown code block / JSON wrapper 都得支持，因为不同 LLM 输出格式不稳定
**教训**：**早期就该用 native function call**（Anthropic / OpenAI 已支持）。但当时为了多 Provider 一致性选了文本解析，结果维护 4 个 parser。uteki 的 ModelRouter 已经走对了这条路（Anthropic 走 native，其他走文本）。

### 弯路 4：Frontend 长期有 TS error
**代价**：`news/calendar` 等组件长期有 TS error，CLAUDE.md 明确写"ignore them"，新人入手成本高
**教训**：**TS error 是债，债越早还越便宜**。或者干脆删掉那个组件。

### 弯路 5：Agent + 评估 + UI 同时改
**代价**：Phase 4 的 e7ecda5（Studio/Dossier 重构）和 4f3e4f1（provenance）同 commit 在一周内，导致两个大改动相互影响，难以独立 review
**教训**：**Agent 系统变更要原子化**。Provenance 是数据层，Studio/Dossier 是表示层，应该分两个 PR。

---

## 4. 留给 uteki 的资产清单（按 ROI 排序）

### 高 ROI（直接 port，已 ship）
1. **SourceCatalog + DataPoint + `[src:N]` 引用解析器** — uteki 已有等价实现，差异在于 `as_of` 还没串到 tool 层（见 M1 todolist）
2. **7-Gate 投研 prompt 集合** — 6 个 gate 的领域 prompt（Fisher 15 问、Buffett 护城河、Munger 反向测试）是稀缺资产，可以作为 uteki 的 `CompanyResearchPipeline` 的 SKILL.md
3. **ConsistencyRunner 的量化指标定义** — action 一致率、gate score CV 是论证 agent 稳定性的关键指标

### 中 ROI（按需 port）
4. **Arena 3-Phase 投票** — 数据模型（ArenaVote / ModelScore）+ 投票 prompt 模板。但要重新审视：uteki 是否真的需要多模型 Arena，还是单模型 + 后置 Judge 就够？
5. **AgentMemory 的 `agent_key` 设计** — uteki 当前 Memory 是 ephemeral，需要持久化时这是个参考模板
6. **Tool Effectiveness 指标** — 简单但有效，可以接到 RunStore 上

### 低 ROI（可参考可不参考）
7. **SSE + Redis Pub/Sub 重连机制** — uteki 如果不做 10 分钟长任务可以跳过
8. **Editorial Design System** — uteki 已有自己的设计语言（Next.js 16 + shadcn），不要硬抄

### 不要 port
- ❌ Supabase 层（弯路 1）
- ❌ 4 格式 tool parser（弯路 3，用 native function call）
- ❌ Mobile app 代码（Flutter）—— 当前 uteki 没有移动端规划

---

## 5. 这个项目教会我的最重要一件事

**Agent 工程不是 "Prompt Engineering + LLM API"，是"决策可信度工程"。**

LLM 能不能给出合理输出，是个 50% → 95% 的问题，相对容易。
LLM 输出能不能被用户信任，是个 0% → 90% 的问题，需要：
- 数据来源可追溯（Provenance）
- 历史决策可回放（RunStore + Events）
- 同输入可重复（ConsistencyRunner）
- 不同模型可比较（Arena / Judge）
- 时间维度可隔离（`as_of`）

这些都不是写在 prompt 里的话，是写在**架构里**的话。

---

## 6. 第二件大事：我们和 Code Agent 的协作

回头看，这个项目还有一条暗线 —— 它**同时也是一次"如何与 Code Agent 工作"的训练场**。

4 个月里出现过三种协作模式：
- **创作者（Rain）+ Code Agent** —— 大部分时间这是主线（CLAUDE branch 的 PR、本仓的多次会话）
- **Code Agent + Code Agent**（异步） —— codex 写完一个 feature 留在 working tree，Claude 后来 review + 拆 commit + 修 bug
- **Code Agent + Code Agent**（跨仓接力） —— uteki.open 的 Claude 把"M1 todolist"递给 uteki 的 Claude

这一节记录这些模式里**做对的事 / 没做好的事 / 浮现出来的协议**，给未来的 collaborator 团队（无论 human + agent 还是 agent + agent）参考。

### 6.1 关键节点

| 日期 | 节点 | 意义 |
|---|---|---|
| 2026-04-17 | 第一个 Claude PR 合入（`004ac99 Merge #1 claude/init-project-t8GSy`） | Claude 第一次作为 `Co-Authored-By` 进入提交历史 |
| 2026-04-17 | 第二个 Claude PR（`7fe4238 Merge #2 claude/eval-framework`） | 评估框架第一版由 Claude 写出，Rain 审 PR 合入 |
| 2026-04-23 | `c77739c fix(llm): route all create_unified callers through DB-first resolver` | Rain 修了 Claude 一周前留下的多租户 LLM key 路由问题 —— **agent 工作有 bug，creator 兜底** |
| 2026-04-30 → 05-01 | Phase 4 多个大重构（Studio/Dossier、Provenance、Editorial Design） | 主要由创作者主导，agent 协作小颗粒度配合 |
| 2026-05 中旬 | codex 在本地 working tree 完成 macro 解读 feature | **第一个真正的"异步 agent 工作"** —— 提交人是 codex，review 留给后续 |
| 2026-05-22 | 本次会话开始：Claude review codex 工作 | 发现 `localhostd` typo、`utcnow()` 已废弃、并发 upsert 缺保护 —— **agent-as-reviewer 的价值显现** |
| 2026-05-22 | 起草 M1 todolist 给 uteki 仓的 Claude | **跨仓 agent 接力**的第一份正式 handoff 文档 |

### 6.2 三种协作模式 · 各自的优势与坑

#### 模式 A · 创作者 + Code Agent（同步协作）
**形态**：创作者口述目标 → agent 实现 → 创作者 review/redirect → 迭代

**做对的**：
- **小步快跑 + 频繁 gut check**：创作者用一两句话"对/不对/再想想"作为信号，避免 agent 沿错误方向跑远
- **明确范围边界**：在请求里说"只动这个文件 / 不要重命名 / 不要顺手修无关的东西" → 减少 scope creep
- **让 agent 先讲讲再动手**：复杂任务先让 agent 出一个简短计划，看完再说"好，开始"；这一步几乎每次都能避免一次走错方向

**没做好的**：
- 早期 commit 经常是 agent 一次性提交了**多个不相关的改动**（如 `4f3e4f1` 把 provenance + 一个改动顺手做了），后续难以独立 revert
- 部分 prompt 里说了"也顺便检查一下 X"导致 agent 把任务范围扩大，超出预算
- 创作者偶尔不看 diff 就 merge → 后续 14 天内才发现问题（如 LLM key 路由 bug）

#### 模式 B · Code Agent + Code Agent（异步同仓）
**形态**：agent A 在某个时间写完一个 feature 留在 working tree，agent B 后来打开仓库继续

**实例**：codex 写完了 macro AI 解读功能（11 个修改 + 5 个新文件），过了两周本会话的 Claude 才接手 review

**做对的**：
- **agent-as-reviewer 找出真 bug**：本次 review 发现 4 件事 codex 自己没注意（typo、deprecated API、并发竞态、限流缺失）—— 不同 agent 关注点不同，互相补位
- **atomic 拆 commit**：codex 提交时是一坨 working tree，Claude review 后拆成了 6 个 atomic commit（fix typo / dev hygiene / macro feat / detached runs / admin restyle 分开）
- **保持原作者意图**：commit message 用了"adds X, also Y" 的连接描述，承认 codex 在做这件事时确实做了哪些事，不假装是 Claude 写的

**没做好的**：
- **没有 review 闸门** —— codex 直接在 working tree 留了 `localhostd` typo，如果创作者 push 这个文件就直接挂了。需要一个"agent 完成→另一个 agent review→creator 合"的流水线
- **不同 agent 用不同代码约定** —— codex 写了 `datetime.utcnow()`（Python 3.12+ 已 deprecated），Claude 大概率会写 `datetime.now(timezone.utc)`。**代码风格漂移**是异步 agent 协作的隐性税
- **codex 的 commit attribution**：codex 工作进 working tree 时没标自己，要不是看 prompt 痕迹 / 风格猜测，事后无法可靠归因。Co-Authored-By 应当在 working tree 里也留 marker（README、注释、TODO 都行）

#### 模式 C · Code Agent + Code Agent（跨仓接力）
**形态**：agent A 在 repo X 完成阶段任务，写一份 handoff 文档给 repo Y 的 agent B

**实例**：本会话尾端的 M1 todolist（`uteki/docs/M1-consistency-and-asof-todolist.md`），uteki.open 的 Claude 把 ConsistencyRunner + `as_of` 的迁移任务递给 uteki 的 Claude

**做对的**：
- **接收方零上下文假设** —— todolist 自带项目背景（§0）、验收标准（§1）、10 个有序任务（§2）、明确不做的事（§3）、风险点（§4）
- **指明参考但不要求拷贝** —— "参考 uteki.open 的 `domains/evaluation/service.py:69-250`，但 uteki 用 SQLModel + SQLite，建表语法要改"
- **优先级排序** —— 标了 P0/P1/P2，让接收方知道哪些数字最该先跑出来

**没做好的**：
- 这是**第一次正式尝试**，还没经过验证。todolist 写得是否真的"接得住"，要等 uteki 的 Claude 实际跑一遍才知道
- 没有约定"如果接收方有疑问，怎么回到 sender 这边" —— 当前是 fire-and-forget，未来可能需要异步问答机制

### 6.3 协议化的经验（最有复利的产出）

这些是**值得带到任何 agent 协作项目**的工程协议：

#### CLAUDE.md / AGENTS.md 作为"团队 wiki"
- CLAUDE.md = 给 Claude 的特定指令（命令、惯例、port 号、踩过的坑）
- AGENTS.md = 给任何 agent 的仓库级公约（贡献规范、测试方法、commit 风格）
- 这个项目里 `CLAUDE.md` 第一句就写 "**LOCAL DEV PORT IS 8888** —— 绝对不要用 8000"，每次会话都生效，**5 个月里没出过端口选错的事**
- 教训：CLAUDE.md 必须**短而锋利** —— 长了就被 agent 当背景噪声忽略

#### Memory 系统（用户级跨会话）
- 路径 `/Users/rain/.claude/projects/.../memory/MEMORY.md`
- 记录了"operational autonomy（standing approval to restart backend）"、"default test combo（GOOGL + openai/deepseek-v3.2）"等
- 跨多日恢复时**让 agent 不必每次问相同的问题**
- 教训：memory 里的 fact 会过期，agent 在用之前要先 verify（如 "file 还在不在 / function 还存不存在"）。本会话开头我就 verify 了服务还在不在跑

#### Co-Authored-By 提交 trailer
- Claude 写的代码必须带 `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`
- 让 `git log --author=Claude` 一键看出 agent 的贡献范围
- 教训：codex 工作进 working tree 时**没标 marker**，后期归因痛苦

#### Atomic commits + auto-commit 规则
- CLAUDE.md 后期加了 "Auto + Atomic" 规则：完成一个逻辑单元自动 commit、一个 commit 只装一件事
- 本次会话尾段把 codex 一坨 working tree 拆成 6 个 atomic commit 就是这个规则的成果
- 教训：**atomic 是协作的根本**。多个 agent 写一个仓库，commit 不 atomic 就不能独立 review、独立 revert、独立归因

### 6.4 浮现出来的反模式（不要再做）

1. **"顺手"反模式**：agent 做任务 A 时顺手改了 B、C、D。当下没人拦，事后无法 revert 单独的 D。**对策**：creator 和 reviewer 看 diff 时要果断 reject "顺手"
2. **"重格式化"反模式**：agent 改一行代码顺手 reformat 整个文件（AdminPage 2166 行 mix 进 macro feat 就是例子）。**对策**：格式化必须单独 commit，commit message 直接说 "no functional change"
3. **"沉默错误"反模式**：agent 跑命令失败，不告诉 creator，自己改个参数重试。**对策**：失败立刻报，让 creator 决定路径
4. **"过度道歉"反模式**：agent 每次响应里都说"抱歉、是我的疏忽"。**对策**：creator 直接告诉 agent "stop apologizing, just fix"

### 6.5 给未来 Collaborator 团队的 6 条建议

1. **每个 agent 进入项目前读 AGENTS.md + CLAUDE.md** —— 不读就直接拒绝任务（接收方有责任）
2. **commit 永远 atomic + Co-Authored-By** —— 没例外
3. **跨仓接力必带 handoff 文档**（M1 todolist 是模板），含背景 / 验收标准 / 任务 / 明确不做的事 / 风险点
4. **agent-to-agent review 不是可选项**，是必选项。同伴 agent 的关注点和你不一样，能抓到你看不见的 bug
5. **代码约定要在 AGENTS.md 写死**（如 "all datetimes use `datetime.now(timezone.utc)`, NEVER `datetime.utcnow()`"），不要靠每个 agent 自己的默认
6. **危险动作前 stop-and-ask**：force-push、删数据、改 schema、重命名公开 API —— agent 默认应该停下来确认

---

## 7. 致谢

- 2026-04-17 起 Claude 作为协作者贡献了多个 PR（评估框架初稿、Admin 重构）
- 4 个月里大约 218 个 commit，平均每周 ~13 个
- 最后一个 commit 是 `e2c00a0 fix(auth): stabilize local login flows` —— **以稳定登录收尾，是合适的告别**

uteki.open 完成了它的使命：**用一个能跑起来的实际系统，把"如何用 LLM 做投研 agent"这件事的所有难点都踩了一遍**。这些经验现在归 [`uteki`](../../uteki) 所有。

`/Users/rain/PycharmProjects/uteki.open` —— 2026-02-01 至 2026-05-31，归档。
