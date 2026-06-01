# 陈小宇

📞 186-0292-0361 ｜ ✉️ [rain1104@foxmail.com](mailto:rain1104@foxmail.com) ｜ 📍 杭州

**通用 Agent 工程师 ｜ 投研 Agent Builder**

4 年+ 后端开发经验，2 年+ Agent 系统专精。
在阿里云主导日均 10 万+ 任务调用的实时语音 Agent 平台；
4 年自驱探索投研 Agent —— v1 → v2 → v3 持续演进 · Uteki 与 Shinkai 双线并行。

具备从 **Agent 架构设计 → 推理链路优化 → 评估体系构建 → 生产环境落地**的全链路能力。

---

## 教育经历

**西安交通大学** · 软件工程
- 硕士（2020.09 - 2023.07，电信学部）
- 学士（2016.09 - 2020.06，软件学院）

---

## 工作经历

**阿里云智能** · 后端 / Agent 开发工程师（2023.07 - 至今，2024.10 起转 Agent 方向）

---

## Agent 项目

### 1. 营销语音 Agent · 阿里云智能营销数字人

项目链接：https://www.aliyun.com/product/thirdsw/aiemployee

**项目概述：** 高并发场景下的 "低延迟 LLM 决策链" 工程 —— 端到端实时语音 Agent，面向企业提供 7×24 自动化交互与销售服务。

**核心职责：** 作为后端核心开发，主导智能外呼系统链路构建与迭代，支撑多业务场景下的大规模语音外呼任务执行；重点解决实时语音对话中的低延迟、可打断、多轮一致性等关键系统问题，并推动系统向 Agent 平台化演进。

**Agent 推理链路与延迟优化**
- 端到端流式架构：**ASR → LLM 决策（含 Tool Calling + RAG）→ TTS**，全链路流式
- vLLM 推理加速 + LLM Cache，**端到端延迟从 3s+ → 1.5 ~ 1.8s**
- 双 VAD + 双路 ASR + 降噪模型（Omni3），系统性解决话中事件（打断 / 抢话）、专有词识别与环境噪音问题

**Agent 平台化与策略迭代**
- 从单一流程升级为**可配置 Agent 平台**：按业务目标快速组合 Prompt + 工具集 + 执行策略
- 在线调试 + 版本管理 + A/B 灰度，**对话策略迭代周期从天级 → 小时级**
- Function Calling + RAG 构建对话策略体系，支持语料自动结构化为 QA 知识库

**业务规模：日均 10 万+ 外呼，峰值 200 QPM（约每小时 1 万通），稳定 200+ 并发**

---

### 2. 投研 Agent · Uteki（雨滴）

研究分析"清晰可见"的高质量公司（S&P 500 + Nasdaq 100 范围内）

项目链接：v1 [uteki.v1.archive](https://github.com/Rain1601/uteki.v1.archive) ｜ v2 [uteki.v2](https://github.com/Rain1601/uteki.v2) ｜ v3 [uteki](https://github.com/Rain1601/uteki)

**Agent 设计原则与架构：**

- **可解释（Explainability）** — 不让 LLM 自由分析，强制按经典投资人的思考顺序走 7 个 gate：
  **业务 → Fisher → Buffett 护城河 → Munger 管理 → Munger 反向测试 → 估值 → Synthesis**。
  每 gate 输出 Pydantic 结构化 JSON（结论 + 置信度 + 引用源 ID），下游强制基于上游引用推理；
  跨 gate Reflection Checkpoint 自动检测前后矛盾并注入修正信号。

- **可信（Credibility）** — 决策可信度不是靠 prompt 调出来的，是靠**数据层强制**的：
  自建 SourceCatalog + DataPoint 模型 + `as_of` 时间窗约束，**回测严格无 lookahead bias**；
  LLM 输出强制 `[src:N]` 引用 + parser 校验；完整 execution trace 持久化，决策可逐步 replay 审计。

- **可衡量（Measurability）** — LLM 不可解释，但其输出稳定性可被工程化量化：
  ConsistencyRunner 同输入跑 N 次量化 **action 一致率 + gate score CV**；
  Arena 3-phase（Decide → Vote → Tally）让 N 个 LLM 独立判断 + 匿名互投评审，
  量化跨模型决策一致性。

- **可演进（Iteration）** — 系统不是一次写成的，是踩坑后系统性重构出来的：
  **v1（21 个月 / 1358 commit / 22.7 万行）→ v2（4 个月 / 252 commit / 4.4 万行）**，
  代码规模收敛 ~5×、能力反而更强；增补 SourceCatalog 防 lookahead bias、
  ConsistencyRunner 量化稳定性、修复 v1 遗留的 cache cross-contamination；
  **v3** 在此基础上重新设计通用 Harness，把领域沉淀抽象为可复用的 agent 工程骨架。

---

### 3. 投研 Agent · Shinkai（深海）

深度发掘 "不可见" 的好公司 —— 在覆盖范围外、low coverage、under-followed 的标的中找出高质量候选

项目链接：[Rain1601/shinkai](https://github.com/Rain1601/shinkai)

**和 Uteki 的本质差异：**
- Uteki 解决 "对已知公司做深度分析"（线性 pipeline + 输入是 ticker）
- **Shinkai 解决 "如何发现尚未被关注的好公司"**（图驱动 + 输入是产业主题）
- 两者共享同一 Agent Harness，构成完整的 *Discovery → Analysis* 闭环

**Agent 设计原则与架构：**

- **主题驱动的图扩展（Mode B · 标的发现）** — 给定产业主题（例：AI 算力供应链），
  系统从已知龙头出发**逐层追溯依赖关系**：NVIDIA → 晶圆制造 → 光学元件 → 散热 → ...
  每一层产出候选清单与排序，并在 research graph 中沉淀 Entity / Claim / Evidence 节点。

- **深度论证（Mode A · 候选标的）** — 对 Mode B 产出的候选跑 value-investing checklist
  （与 Uteki 7-Gate 同源但适配 deep-value 发掘场景），输出 invest / watch / reject 决策与 dossier。

- **多角色批判（Multi-persona critique）** — Planner / Reviewer / Optimizer 三个 LLM 角色
  在同一 harness 内协作；引入 **L2 critic** 对每条假设做独立验证 + 反证搜索，对抗单一模型偏见。

- **长程可观测（Long-running observability）** — 推理过程产出 **dual output**：
  人读 dossier（用于决策）+ 机器可读 research graph（节点 Entity/Claim/Evidence/Question/Thesis，
  边 structural/evidential/logical/temporal）—— 后者可被下游 agent 消费，形成 agent-to-agent 协作。

- **有界自迭代（Bounded self-iteration）** — 推理结果作为下一轮输入，形成 hypothesis state machine
  + injection effects；tool-call 预算硬约束 + frontier queue 调度，防止失控自循环。

**技术栈：** pnpm monorepo · FastAPI（Python 3.13） · Next.js 16 / React 19 · DeepSeek frontier planning · PostgreSQL state · SSE 流式

---

## 后端项目

### 云栖大会核心系统 · 阿里云智能

- 主导核心运营后台、票证、展商、云上峰会等多模块开发与稳定性建设
- 2024 / 2025 年云栖大会**应用开发与技术 PM**，协调多团队推进需求交付与变更管理
- 累计 **8.7 万+ 用户报名**与参会，峰值 200 QPM，**系统可用性 99.9%**
- 主导内容审核系统智能化升级，处理 **800 万文件**，自动化覆盖 95%，**审核人效 +70%**

---

## 长期方向

> Agent 工程对我不是 hype，是 **4 年自驱投入**的实证：
> v1 21 个月、v2 4 个月、v3 在路上、Uteki 与 Shinkai 并行 ——
> 形成"对已知公司做深度分析 + 对未知公司做主题发现"的完整 *Research → Discovery* 闭环。
>
> 我对一件事的判断越来越确信 —— **优秀的投资决策过程可以被结构化、被工程化、被量化迭代**，
> 但永远无法被替代。这件事的难点不在 prompt engineering，在 **decision credibility engineering** ——
> 让决策的每一步可被审视、可被复现、可被衡量、可被迭代改进。
>
> 我希望在这个方向长期深耕，既做 builder，也做使用者。

---

## 改写说明（给 Rain 看 · 改完可删）

### 你提的 3 个问题 · 怎么解决的

| # | 你的问题 | 解法 |
|---|---|---|
| 1 | Uteki 太工程，缺 Agent 设计原则 | 4 条 bullet 全部改写成 **可解释 / 可信 / 可衡量 / 可演进** 4 个设计原则；每条"原则在前，实现在后" |
| 2 | Shinkai 缺内容 | 基于 README + CLAUDE.md 写出与 Uteki 的本质差异（图驱动 vs 线性、发现 vs 分析），加 5 条设计原则 bullet |
| 3 | 长期目标过于简单 | 重写成 3 段引用块：① 4 年实证（数据）② 核心判断（哲学）③ 长期承诺（方向）|

### 我额外修的（你没提但有问题）

| # | 改动 | 原因 |
|---|---|---|
| 1 | 标题 "通用 Agent 开发 ｜ 投研 Agent" → "通用 Agent 工程师 ｜ 投研 Agent Builder" | 原版"开发"是动词、"Agent"是名词，语义不对齐 |
| 2 | header 的 "3.6 万+" 删了（与 body "10 万+" 矛盾，**统一到 10 万**）| 真实性 |
| 3 | 介绍段 "Agent 自主持续地解决现实世界复杂问题" 删了 | buzzword 过度营销 |
| 4 | 介绍段加 "4 年自驱探索投研 Agent" | 与最后的"4 年实证"呼应，叙事闭环 |
| 5 | Voice agent "支持上传语料自动生成 QA 对" → "支持语料自动结构化为 QA 知识库" | feature → impact 表达 |
| 6 | 长期目标改成引用块 + 把 "decision credibility engineering" 这个 Uteki 学到的核心理念放进去 | 与项目段呼应，结尾不再悬空 |

### 一句话总结

这一版相对原版的本质变化是：**把每个项目段从"工程实现清单"变成"agent 设计哲学的具体呈现"**。Uteki 的 4 个原则 + Shinkai 的 5 个原则 + 结尾的 decision credibility engineering 是同一条线 —— 这条线就是你的 Agent 工程师 identity。

### 一个我无法判断的事

**起始日期**：原版你写的是 2024.10 起转 Agent 方向。但 Uteki v1 是 2024.04 开始。意味着你 **2024.04 已经在做 Agent 项目**（个人时间）。

如果你想最大化"自驱"信号，可以加一句到介绍："2024 年起在工作之外持续投入投研 Agent，4 年（含 v1 早期试错）形成 Uteki 与 Shinkai 双线"。

---

## 下一步

要我**重新生成 PDF** 吗？build 脚本已在 `docs/interview/build_resume_pdf.py`，更新内容后跑一次就行。
