# 陈小宇简历 · 一页版本（终稿）

> 优化目标：一页 PDF；保留所有强信号；语音 Agent 抽象为"通用 Agent 构建"；Uteki 突出设计哲学
> 配套：[`interview_kit.md`](./interview_kit.md)（自我介绍 + 30 Q&A） + [`uteki_v1_to_v2_evolution.md`](./uteki_v1_to_v2_evolution.md)（v1→v2 附件）

---

## 一页版本（直接复制到 Word / Notion / 简历模板）

```markdown
# 陈小宇

📞 186-0292-0361 · ✉️ rain1104@foxmail.com · 📍 杭州
**Agent 开发工程师** · 长期主义

2 年+ 后端开发经验，专注 Agent 系统架构与落地。
主导过日均 3.6 万+ 调用的实时语音 Agent 系统，
具备 Agent 架构设计、推理优化到业务闭环的全链路能力。

项目深度阅读：github.com/Rain1601/uteki.v2/blob/main/docs/interview/uteki_v1_to_v2_evolution.md

---

## 教育经历

**西安交通大学** · 软件工程  
硕士（2020.09 - 2023.07，电信学部） · 学士（2016.09 - 2020.06，软件学院）

---

## 工作经历

**阿里云智能** · 后端 / Agent 开发工程师（2023.07 - 至今，2024.11 起转 Agent 方向）

---

## Agent 项目经验

### 营销语音 Agent · 阿里云智能外呼
> 高并发场景下的"低延迟 LLM 决策链"工程 —— 端到端实时语音 Agent，
> 面向企业提供 7×24 自动化交互与销售服务

**Agent 推理链路与延迟优化**
- 端到端流式架构：ASR → LLM 决策（含 tool calling + RAG）→ TTS，全链路流式
- vLLM 推理加速 + LLM Cache + 线程池调度，**端到端延迟从 3s+ → 1.2~1.5s**
- 双 VAD + 双路 ASR + 降噪模型（Omni3），系统性解决噪音 / 专名 / 主话人复杂场景

**Agent 平台化与策略迭代**
- 从单一流程升级为**可配置 Agent 平台**：按业务目标快速构建系统 Prompt + 工具集 + 策略
- 在线调试 + 版本管理 + A/B 灰度，**对话策略迭代周期从天级 → 小时级**
- 基于 SFT 微调 + 函数调用 + RAG 构建对话策略体系

**业务规模** · **日均 3.6 万+ 外呼，峰值 200 QPM（约每小时 1 万通），稳定 200+ 并发**

---

### 投研 Agent · 雨滴·Uteki（个人项目 · 跨 v1 + v2 两版迭代）
> 把 Fisher / Buffett / Munger 经典价值投资框架 codify 成可重复、可审计、
> 可量化稳定性的 LLM 决策 pipeline —— 让 LLM 做决策，但每一步可被人审视
> 
> 2024.04 - 2026.05 · 单人主导 · 美股 · 7 家 LLM Provider 统一适配 · Python · FastAPI · PostgreSQL

- **7-Gate 决策流水线** — 业务 → Fisher → Buffett 护城河 → Munger 管理 → Munger 反向测试
  → 估值 → Synthesis；每 gate Pydantic 结构化输出（结论 + 置信度 + 引用源 ID），
  下游强制基于上游引用推理；跨 gate Reflection Checkpoint 检测前后矛盾
- **可信度工程**（核心设计哲学） — 自建 SourceCatalog + DataPoint 模型 + `as_of` 时间窗
  约束，**回测严格无 lookahead bias**；LLM 输出强制 `[src:N]` 引用 + parser 校验；
  完整 execution trace 持久化，决策可逐步 replay 审计
- **评估能力** — ConsistencyRunner 同输入跑 N 次量化 action 一致率 + gate score CV；
  Arena 3-phase（Decide → Vote → Tally）让 N 个 LLM 独立判断 + 匿名互投评审
- **v1 → v2 工程迭代证据** — v1（21 个月 / 1358 commit / 22.7 万行）深度踩坑后重写：
  v2 用 4 个月 / 252 commit / 4.4 万行做出更完整能力，**代码量收敛 ~5×**；
  增补 SourceCatalog 防 lookahead bias、增补 ConsistencyRunner 量化稳定性、
  修复 v1 遗留的 symbol-less cache cross-contamination

---

## 后端项目经验

### 云栖大会核心系统 · 阿里云智能
- 主导核心运营后台、票证、展商、云上峰会等多模块开发与稳定性建设
- 2024 / 2025 年云栖大会**应用开发与技术 PM**，协调多团队推进需求交付与变更管理
- 累计 **8.7 万+ 用户报名**与参会，峰值 200 QPM，**系统可用性 99.9%**
- 主导内容审核系统智能化升级，处理 **800 万文件**，自动化覆盖 95%，**审核人效 +70%**

---

## 技术能力

- **Agent / LLM**：Multi-Agent · ReAct · Tool Calling · Function Calling · Prompt Engineering · RAG · vLLM 推理加速 · LLM Cache · SFT 微调
- **语音 / 对话**：实时 ASR/TTS · 双 VAD + 双路 ASR · 对话状态管理 · 意图识别
- **后端 / 工程**：Java · Python · 分布式系统 · 高并发架构 · 微服务
- **语言**：中文 · 英文（CET-6，技术与业务口语沟通）
```

---

## 这一版相对你当前简历改了什么

### 整体压缩（为了一页 PDF）
- 删掉"项目概述" 段落里的重复描述（你 "Agent 开发工程师" + "后端应用开发" + 简介里又讲一遍 → 合并）
- "教育经历" 两行合并成一行（同校）
- 工作经历不再单独占大段，下面的"项目经验"已经隐含了

### 语音 Agent 部分 · 抽象为"通用 Agent 构建"
| 原版 | 新版 |
|---|---|
| 标题强调"基于通义大模型的实时语音 Agent" | 标题强调"高并发下的低延迟 LLM 决策链工程" |
| 4 大段独立 bullet（系统架构 / Agent 能力 / 业务） | **3 段聚焦**：① 推理链路与延迟优化（工程深度） ② Agent 平台化（架构判断） ③ 业务规模（结果） |
| ASR / TTS / VAD 是话题主轴 | 这些是**实现细节**，主轴是"端到端 LLM 决策链 + 延迟工程" |
| "支撑..." 业务结果分散 | 业务规模独立加粗一行（**3.6 万+ / 200 QPM / 200+ 并发**） |

**关键判断**：语音是这个项目的**载体**，不是**本质**。新版让 hiring manager 一眼看出"这人懂的是 agent 推理链路工程，不是只懂 voice"。

### Uteki 部分 · 突出设计哲学
| 原版 | 新版 |
|---|---|
| "Multi-Agent / Sub-Agent 分层体系" 这种 buzzword 开场 | 一句话价值主张："**让 LLM 做决策，但每一步可被人审视**" |
| "结构化上下文 + 中间结论 + 置信度" 抽象描述 | 具体到 7-Gate（业务→Fisher→...→Synthesis）+ Pydantic schema + 引用源 ID |
| "ReAct 闭环 / 任务调度 / 20+ 数据工具" 都是 verb-level 描述 | **4 个设计层面**：架构 / 可信度 / 评估 / 迭代证据 |
| 没有"为什么"，只有"做了什么" | 4 个 bullet 都自带 design rationale |
| 没有 v1 → v2 叙事 | **加 v1→v2 迭代证据 bullet**：单人项目里最强的差异化信号 |

**关键判断**：原版 Uteki 看起来像"我做了个 multi-agent 投资 demo"，新版看起来像"我做了 4 个月 + 4 个月、有完整可信度 / 评估 / 迭代证据的决策系统"。可信度天差地别。

### 技术能力 · 不动但顺序调整
- 把 Agent / LLM 放最前（你的目标岗位是 Agent 工程师）
- 移除 "Prompt Engineering" 等过于宽泛的词组合到一起（节省空间）

### 加在 header 的 1 行
```
项目深度阅读：github.com/Rain1601/uteki.v2/blob/main/docs/interview/uteki_v1_to_v2_evolution.md
```
有兴趣的面试官会点开看 —— 这份附件文档本身就是有力补充。

---

## 估算页数

按标准 PDF 字号（12pt、1.15 行距、2.5cm 边距）：

| 区块 | 估算行数 |
|---|---|
| Header（含 5 行）| 5 |
| 教育经历 | 3 |
| 工作经历 | 3 |
| Agent 项目 - 语音 | 13 |
| Agent 项目 - Uteki | 14 |
| 后端项目 - 云栖 | 6 |
| 技术能力 | 5 |
| 章节间空白 | ~6 |
| **总计** | **~55 行** |

**预估**：A4 页面（12pt）约 50-55 行 / 页 → **正好 1 页**。如果你的模板字号略小（10.5-11pt），会有富余空间。

---

## 如果你的模板挤不下一页（fallback）

按优先级**先删**：
1. 教育经历的"电信学部 / 软件学院"细节
2. 工作经历独立一行（合并到 header 或 Agent 项目副标题）
3. 语音 Agent 第三个 sub-section（业务规模）合并到副标题
4. 技术能力压成 3 行

如果**还有空间想加**（向 2 页扩展）：
1. 在 Uteki 段加一句 actual case："已在 GOOGL / AAPL / NVDA 等头部美股完成 7-Gate 分析"
2. 在云栖段加一行 PM 角色细节
3. 加一段"个人兴趣 / 长期主义" 收尾（如果文化匹配重要）

---

## PDF 渲染建议

如果你用 Markdown → PDF 工具（Typora / Pandoc / Notion export）：
- 字体：思源宋体 / 思源黑体 / Inter + 思源黑体（中英混排）
- 段间距比默认稍紧（0.4-0.5em）
- 强调（**加粗**）保留以让 hiring manager 扫读时抓重点
- 邮箱、GitHub URL 设成可点击 hyperlink

如果你用 LaTeX：moderncv / awesome-cv / classictgsong 都行，关键是 **不要用花哨配色**，黑白 + 1 个 accent 色（深红 / 深蓝 / 深绿）。

---

## TODO（投递前 30 分钟检查）

- [ ] 把 §1 的 markdown 块复制到你的简历模板
- [ ] 渲染 PDF 看是否真的 1 页
- [ ] 检查邮箱 / GitHub link 是 hyperlink
- [ ] 用手机打开看一遍（很多面试官在地铁上看简历）
- [ ] 截图发我，我看排版是不是 OK

---

**iterating** —— 你给我反馈具体哪一段觉得太长 / 太空 / 太硬，我们逐段调。
