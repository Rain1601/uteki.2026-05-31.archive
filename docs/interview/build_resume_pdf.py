"""Build Chen Xiaoyu's 1-page resume PDF (final content).

Editorial typography:
- STHeiti Light for body, STHeiti Medium for bold/headers
- Songti SC for serif pull-quotes
- Warm-dark accent palette
- Tight A4 layout for single-page constraint

Run: python3 build_resume_pdf.py
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable,
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_JUSTIFY
from reportlab.lib.colors import HexColor

# ── Fonts ──────────────────────────────────────────────────────────────
pdfmetrics.registerFont(TTFont("Hira", "/System/Library/Fonts/STHeiti Light.ttc", subfontIndex=0))
pdfmetrics.registerFont(TTFont("HiraBold", "/System/Library/Fonts/STHeiti Medium.ttc", subfontIndex=0))
pdfmetrics.registerFont(TTFont("Heiti", "/System/Library/Fonts/STHeiti Medium.ttc", subfontIndex=0))
pdfmetrics.registerFont(TTFont("Songti", "/System/Library/Fonts/Supplemental/Songti.ttc", subfontIndex=0))

# ── Colors (warm-dark editorial palette) ───────────────────────────────
INK = HexColor("#1a1a1a")
SUBINK = HexColor("#333333")
ACCENT = HexColor("#6b3a2e")       # warm dark — section accents
MUTED = HexColor("#6a6a6a")
FAINT = HexColor("#d4cfc6")

# ── Styles ─────────────────────────────────────────────────────────────
def st(name, font="Hira", size=8.5, leading=11, color=INK, **kw):
    return ParagraphStyle(name, fontName=font, fontSize=size, leading=leading, textColor=color, **kw)

s_name      = st("Name", font="Heiti", size=20, leading=24, color=INK)
s_contact   = st("Contact", font="Hira", size=8, leading=10.5, color=MUTED)
s_title     = st("Title", font="HiraBold", size=11.5, leading=15, color=ACCENT, spaceBefore=2, spaceAfter=2)
s_intro     = st("Intro", font="Hira", size=8.5, leading=11.5, color=SUBINK, alignment=TA_JUSTIFY)

s_section   = st("Section", font="HiraBold", size=9.8, leading=12.5, color=ACCENT,
                 spaceBefore=2, spaceAfter=1)

s_body      = st("Body", font="Hira", size=8.3, leading=11, color=INK)

s_proj_head = st("ProjHead", font="HiraBold", size=9.8, leading=12.5, color=INK, spaceBefore=3, spaceAfter=0)
s_proj_meta = st("ProjMeta", font="Hira", size=7.6, leading=9.5, color=MUTED)
s_proj_desc = st("ProjDesc", font="Hira", size=8.3, leading=11, color=SUBINK,
                 alignment=TA_JUSTIFY, spaceBefore=1, spaceAfter=1)

s_subhead   = st("Subhead", font="HiraBold", size=8.6, leading=11, color=INK, spaceBefore=1, spaceAfter=0)
s_bullet    = st("Bullet", font="Hira", size=8.3, leading=11, color=INK,
                 leftIndent=10, bulletIndent=0, spaceAfter=0)

s_quote     = st("Quote", font="Songti", size=8.8, leading=12.5, color=SUBINK,
                 leftIndent=12, rightIndent=4, spaceBefore=1, spaceAfter=1, alignment=TA_LEFT)


# ── Document ───────────────────────────────────────────────────────────
out_path = "/Users/rain/PycharmProjects/uteki.open/docs/interview/chen_xiaoyu_resume.pdf"

doc = SimpleDocTemplate(
    out_path,
    pagesize=A4,
    leftMargin=1.2*cm,
    rightMargin=1.2*cm,
    topMargin=0.8*cm,
    bottomMargin=0.8*cm,
    title="陈小宇 简历",
    author="陈小宇",
)

story = []


def section_header(text):
    return [
        HRFlowable(width="100%", thickness=0.5, color=ACCENT, spaceBefore=3, spaceAfter=1),
        Paragraph(text, s_section),
    ]


def bullet(text):
    return Paragraph(f"·&nbsp;&nbsp;{text}", s_bullet)


# ─────────────────────────────────────────────────────────────────────
# HEADER
# ─────────────────────────────────────────────────────────────────────
story.append(Paragraph("陈小宇", s_name))
story.append(Paragraph(
    "186-0292-0361 &nbsp;｜&nbsp; rain1104@foxmail.com &nbsp;｜&nbsp; 杭州 &nbsp;｜&nbsp; "
    "<font color='#6b3a2e'>github.com/Rain1601</font>",
    s_contact,
))
story.append(Paragraph("Agent 开发工程师 ｜ 通用 Agent 系统 ｜ 投研 Agent", s_title))
story.append(Paragraph(
    "后端 / Agent 工程师，关注<b>可运行、可观察、可评估、可迭代</b>的 Agent 系统。"
    "在阿里云参与并主导实时语音 Agent 核心链路建设，支撑高并发生产环境，"
    "将<b>端到端对话延迟从 3s+ 优化至 1.5–1.8s</b>。"
    "独立设计并实现投研 Agent <b>Uteki</b>，围绕<b>证据约束、时间一致性、结构化推理、execution trace 和多模型评估</b>，"
    "探索 Agent 在复杂投研决策中的工程化落地。",
    s_intro,
))

# ─────────────────────────────────────────────────────────────────────
# EDUCATION
# ─────────────────────────────────────────────────────────────────────
story += section_header("教育经历")
story.append(Paragraph(
    "<b>西安交通大学</b>　·　软件工程　　"
    "<font color='#6a6a6a'>硕士 2020.09 – 2023.07（电信学部）　·　学士 2016.09 – 2020.06（软件学院）</font>",
    s_body,
))

# ─────────────────────────────────────────────────────────────────────
# WORK EXPERIENCE
# ─────────────────────────────────────────────────────────────────────
story += section_header("工作经历")
story.append(Paragraph(
    "<b>阿里云智能</b>　·　后端 / Agent 开发工程师　　"
    "<font color='#6a6a6a'>2023.07 – 至今，2024.10 起转 Agent 方向</font>",
    s_body,
))

# ─────────────────────────────────────────────────────────────────────
# AGENT PROJECTS
# ─────────────────────────────────────────────────────────────────────
story += section_header("Agent 项目")

# ── Project 1: Voice Agent
story.append(Paragraph("营销语音 Agent · 阿里云智能营销数字人", s_proj_head))
story.append(Paragraph(
    "项目链接：<font color='#6b3a2e'>aliyun.com/product/thirdsw/aiemployee</font>",
    s_proj_meta,
))
story.append(Paragraph(
    "面向企业自动化外呼、销售转化和 7×24 客户交互场景，构建高并发下的低延迟实时语音 Agent。"
    "作为后端核心开发，主导智能外呼系统链路构建与迭代，"
    "重点解决实时语音对话中的<b>低延迟、可打断、多轮一致性和策略平台化</b>问题。",
    s_proj_desc,
))

story.append(Paragraph("Agent 推理链路与延迟优化", s_subhead))
story.append(bullet("设计端到端流式链路：<b>ASR → LLM 决策（tool calling + RAG）→ TTS</b>，降低等待时间和首包延迟"))
story.append(bullet("结合 vLLM 推理加速与 LLM Cache，<b>端到端对话延迟从 3s+ → 1.5–1.8s</b>"))
story.append(bullet("通过双 VAD、双路 ASR 和降噪模型（Omni3），系统性优化打断、抢话、专有词识别和环境噪声场景"))

story.append(Paragraph("Agent 平台化与策略迭代", s_subhead))
story.append(bullet("将单一外呼流程升级为<b>可配置 Agent 平台</b>，按业务目标组合系统 Prompt、知识库、工具集和执行策略"))
story.append(bullet("建设在线调试、版本管理和 A/B 灰度能力，<b>对话策略迭代周期从天级 → 小时级</b>"))
story.append(bullet("基于函数调用和 RAG 构建对话策略体系，支持上传语料后自动生成 QA 对并接入业务流程"))

story.append(Paragraph(
    "<b>业务规模：</b>日均 <b>10 万+ 外呼</b>，峰值 <b>200 QPM</b>（约每小时 1 万通），稳定支撑 <b>200+ 并发</b>",
    s_body,
))

# ── Project 2: Uteki
story.append(Paragraph("投研 Agent · Uteki（雨滴）", s_proj_head))
story.append(Paragraph(
    "项目链接：<font color='#6b3a2e'>v1 / v2 / v3 @ github.com/Rain1601</font>",
    s_proj_meta,
))
story.append(Paragraph(
    "面向<b>标普 500 / Nasdaq 100</b> 中&ldquo;清晰可见&rdquo;的高质量公司，"
    "构建<b>可审计、可回放、可评估</b>的投研 Agent。",
    s_proj_desc,
))

story.append(Paragraph("核心设计原则", s_subhead))
story.append(bullet(
    "<b>证据先于结论</b>　Agent 不直接生成投资判断，而是先构建 SourceCatalog，"
    "将财报、市场数据、新闻和搜索结果统一为带来源、时间、置信度的 DataPoint"
))
story.append(bullet(
    "<b>分阶段推理</b>　将公司研究拆解为 7-Gate 决策链："
    "<font color='#6b3a2e'><b>业务质量 → Fisher 增长 → Buffett 护城河 → Munger 管理层 → 反向测试 → 估值 → 综合裁决</b></font>"
))
story.append(bullet(
    "<b>受约束的自主性</b>　每个 Gate 可调用工具，但输出必须包含结构化结论、置信度和 <b>[src:N]</b> 引用；"
    "parser 校验引用合法性，避免无来源推理"
))
story.append(bullet(
    "<b>时间一致性</b>　引入 <b>as_of</b> 时间窗约束数据和来源时间，"
    "支持历史回测，<b>严格避免 lookahead bias</b>"
))
story.append(bullet(
    "<b>可观察与可评估</b>　持久化 execution trace、gate output、tool calls 和 citation，"
    "支持 replay 审计；通过 <b>ConsistencyRunner</b> 和 <b>Arena</b> 评估多次运行稳定性"
))

story.append(Paragraph("工程实现", s_subhead))
story.append(bullet("FastAPI + React 构建完整 Agent 工作台，支持 SSE 流式执行、运行记录、断线恢复、结果回放"))
story.append(bullet("Pydantic 约束每个 Gate 的结构化输出，降低自由文本不可控问题"))
story.append(bullet("Reflection Checkpoint 检测跨 Gate 矛盾，并将上游结论作为下游推理上下文"))
story.append(bullet("Arena 3-phase（<b>Decide → Vote → Tally</b>），多 LLM 独立判断 + 匿名互评，提高结论稳定性"))

# ── Project 3: Shinkai
story.append(Paragraph("投研 Agent · Shinkai（深海 · 进行中）", s_proj_head))
story.append(Paragraph(
    "项目链接：<font color='#6b3a2e'>github.com/Rain1601/shinkai</font>",
    s_proj_meta,
))
story.append(Paragraph(
    "面向&ldquo;市场尚未充分覆盖&rdquo;的潜在优质公司，"
    "探索从<b>公司发现 → 初筛 → 假设生成 → 深度研究</b>的主动式投研 Agent。",
    s_proj_desc,
))
story.append(bullet(
    "<b>与 Uteki 的差异</b>　Uteki 偏深度审计已知公司，Shinkai 偏<b>主动发现未知机会</b> —— "
    "构成 Research → Discovery 完整闭环"
))
story.append(bullet(
    "<b>候选池发现流程</b>　从财务质量、增长异常、估值错配、行业变化和市场忽视信号中生成研究对象"
))
story.append(bullet(
    "<b>Hypothesis-first 研究链路</b>　先生成投资假设，再反向搜索证据验证或证伪，避免只做信息汇总"
))
story.append(bullet(
    "目标形成 <b>发现 → 假设 → 证据 → 反证 → 深度研究</b> 端到端投研 Agent 流程"
))

# ─────────────────────────────────────────────────────────────────────
# BACKEND PROJECTS
# ─────────────────────────────────────────────────────────────────────
story += section_header("后端项目")
story.append(Paragraph("云栖大会核心系统 · 阿里云智能", s_proj_head))
story.append(bullet("主导核心运营后台、票证、展商、云上峰会等多模块开发与稳定性建设"))
story.append(bullet("2024 / 2025 年云栖大会<b>应用开发与技术 PM</b>，协调多团队推进需求交付与变更管理"))
story.append(bullet("支撑累计 <b>8.7 万+ 用户报名</b>与参会，峰值 200 QPM，<b>系统可用性 99.9%</b>"))
story.append(bullet("主导内容审核系统智能化升级，处理 <b>800 万文件</b>，自动化覆盖 95%，<b>审核人效 +70%</b>"))

# ─────────────────────────────────────────────────────────────────────
# LONG-TERM DIRECTION
# ─────────────────────────────────────────────────────────────────────
story += section_header("长期方向")
story.append(Paragraph(
    "&ldquo;我致力于长期探索应用 Agent 解决现实世界的复杂问题，"
    "将<b>优秀决策认知与经验</b>转化为可持续演化的系统。"
    "在未来，长期聚焦于 AI 与投资研究的结合，"
    "将优秀投资的思考框架<b>结构化、工程化</b>，"
    "并通过 Agent 持续验证、优化与迭代决策质量。&rdquo;",
    s_quote,
))

# ── Build ─────────────────────────────────────────────────────────────
doc.build(story)
print(f"OK -> {out_path}")
