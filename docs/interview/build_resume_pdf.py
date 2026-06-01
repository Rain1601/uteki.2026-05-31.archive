"""Build Chen Xiaoyu's 1-page resume PDF.

Editorial typography: Hiragino Sans GB for body, STHeiti Medium for headers,
Songti SC for serif accents (taglines + philosophy quotes).
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, KeepTogether,
    Table, TableStyle,
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib.colors import HexColor

# ── Fonts ──────────────────────────────────────────────────────────────
# STHeiti Light/Medium are TrueType (Hiragino is PostScript-CFF, unsupported by reportlab)
pdfmetrics.registerFont(TTFont("Hira", "/System/Library/Fonts/STHeiti Light.ttc", subfontIndex=0))
pdfmetrics.registerFont(TTFont("HiraBold", "/System/Library/Fonts/STHeiti Medium.ttc", subfontIndex=0))
pdfmetrics.registerFont(TTFont("Heiti", "/System/Library/Fonts/STHeiti Medium.ttc", subfontIndex=0))
pdfmetrics.registerFont(TTFont("Songti", "/System/Library/Fonts/Supplemental/Songti.ttc", subfontIndex=0))

# ── Colors ─────────────────────────────────────────────────────────────
INK = HexColor("#1a1a1a")
ACCENT = HexColor("#6b3a2e")     # warm dark — for the role title + section accents
SUBINK = HexColor("#3a3a3a")
MUTED = HexColor("#6a6a6a")
FAINT = HexColor("#cfcfcf")
PAPER = HexColor("#fefdf8")       # warm white

# ── Styles ─────────────────────────────────────────────────────────────
def st(name, font="Hira", size=9, leading=12.5, color=INK, **kw):
    return ParagraphStyle(name, fontName=font, fontSize=size, leading=leading, textColor=color, **kw)

s_name = st("Name", font="Heiti", size=22, leading=26, color=INK)
s_contact = st("Contact", font="Hira", size=8.5, leading=11, color=MUTED)
s_title = st("Title", font="HiraBold", size=13, leading=17, color=ACCENT, spaceBefore=2)
s_intro = st("Intro", font="Hira", size=9, leading=13, color=SUBINK, alignment=TA_JUSTIFY)

s_section = st("Section", font="HiraBold", size=10.5, leading=14, color=ACCENT, spaceBefore=4, spaceAfter=2)

s_role = st("Role", font="HiraBold", size=10, leading=13, color=INK)
s_role_meta = st("RoleMeta", font="Hira", size=8.5, leading=11, color=MUTED)
s_role_intro = st("RoleIntro", font="Hira", size=9, leading=12, color=SUBINK)

s_subhead = st("Subhead", font="HiraBold", size=9.5, leading=12.5, color=INK, spaceBefore=3, spaceAfter=1)
s_body = st("Body", font="Hira", size=9, leading=12.5, color=INK)
s_bullet = st("Bullet", font="Hira", size=9, leading=12.5, color=INK, leftIndent=10, bulletIndent=0)

s_quote = st("Quote", font="Songti", size=9.5, leading=14, color=ACCENT, leftIndent=14, rightIndent=6, spaceBefore=1, spaceAfter=1)

s_stat = st("Stat", font="Hira", size=9, leading=12, color=INK)

# ── Doc ────────────────────────────────────────────────────────────────
out_path = "/Users/rain/PycharmProjects/uteki.open/docs/interview/chen_xiaoyu_resume.pdf"

doc = SimpleDocTemplate(
    out_path,
    pagesize=A4,
    leftMargin=1.6*cm,
    rightMargin=1.6*cm,
    topMargin=1.2*cm,
    bottomMargin=1.2*cm,
    title="陈小宇 简历",
    author="陈小宇",
)

story = []


def hr(thickness=0.4, color=FAINT, before=2, after=4):
    return HRFlowable(width="100%", thickness=thickness, color=color,
                      spaceBefore=before, spaceAfter=after)


def section_header(text):
    """Editorial accent-line + bold caption."""
    return [
        HRFlowable(width="100%", thickness=0.6, color=ACCENT, spaceBefore=6, spaceAfter=2),
        Paragraph(text, s_section),
    ]


# ── HEADER ─────────────────────────────────────────────────────────────
story.append(Paragraph("陈小宇", s_name))
story.append(Paragraph(
    "📞 186-0292-0361 &nbsp;｜&nbsp; ✉️ rain1104@foxmail.com &nbsp;｜&nbsp; 📍 杭州",
    s_contact))
story.append(Paragraph("AI 投资决策系统工程师", s_title))
story.append(Spacer(1, 3))
story.append(Paragraph(
    "<b>3 年+ 后端开发经验，2 年+ AI 系统研发经验。</b>"
    "专注于将投资研究方法与决策原则转化为可执行、可审计、可量化评估的智能决策系统；"
    "具备从系统架构设计、推理流程构建、可靠性评估到生产环境落地的完整经验。",
    s_intro))
story.append(Spacer(1, 1.5))
story.append(Paragraph(
    "独立设计并开发投研系统 <b>Uteki</b>，探索大模型在投资决策场景中的可靠性、一致性、"
    "可解释性与偏差控制；同时在阿里云负责实时 AI 决策系统研发与性能优化，"
    "支撑高并发生产环境稳定运行。",
    s_intro))

# ── EDUCATION ──────────────────────────────────────────────────────────
story += section_header("教育经历")
story.append(Paragraph(
    "<b>西安交通大学</b>　软件工程　　"
    "<font color='#3a3a3a'>硕士 2020.09 – 2023.07　·　学士 2016.09 – 2020.06</font>",
    s_body))

# ── WORK EXPERIENCE ────────────────────────────────────────────────────
story += section_header("工作经历")
story.append(Paragraph(
    "<b>阿里云智能</b>　｜　AI 系统工程师　　"
    "<font color='#6a6a6a'>2023.07 – 至今</font>",
    s_role))
story.append(Paragraph(
    "实时 AI 决策系统研发与推理链路优化，聚焦低延迟、高可靠性与复杂任务自动化执行。",
    s_role_intro))
story.append(Spacer(1, 1))

work_bullets = [
    "主导实时决策链路优化，构建 <b>ASR → LLM → TTS</b> 全流式架构，"
    "端到端延迟从 <b>3s+ 降低至 1.5～1.8s</b>",
    "构建可配置 Agent 平台，实现 Prompt、知识库、工具集与执行策略的动态组合",
    "引入 Function Calling 与知识检索机制，实现复杂业务流程的自动化执行",
    "支撑 <b>日均 10 万+ 任务调用</b>，稳定运行于高并发生产环境",
]
for b in work_bullets:
    story.append(Paragraph(f"·　{b}", s_bullet))

# ── CORE PROJECT — UTEKI ───────────────────────────────────────────────
story += section_header("核心项目")
story.append(Paragraph(
    "<b>Uteki</b>　｜　AI 投资研究与决策系统　　"
    "<font color='#6a6a6a'>个人项目　·　2024.04 – 至今　·　Python · FastAPI · PostgreSQL</font>",
    s_role))
story.append(Spacer(1, 2))

# Block 1
story.append(Paragraph("▸ 投资决策流程建模", s_subhead))
story.append(Paragraph(
    "将 Fisher、Buffett、Munger 等经典价值投资框架转化为可执行的智能决策流程：",
    s_body))
story.append(Paragraph(
    "<font color='#6b3a2e'><b>业务分析 → 护城河分析 → 管理层评估 → 风险验证 → 估值分析 → 综合决策</b></font>",
    s_body))
story.append(Paragraph(
    "实现投资研究流程的标准化、结构化与可复用。",
    s_body))

# Block 2
story.append(Paragraph("▸ 决策可靠性与偏差控制", s_subhead))
story.append(Paragraph(
    "设计 SourceCatalog 与 DataPoint 数据模型，建立统一事实层与引用体系：",
    s_body))
story.append(Paragraph(
    "·　引入 <b>as_of 时间约束机制</b>，严格消除 Lookahead Bias",
    s_bullet))
story.append(Paragraph(
    "·　输出结果强制引用数据来源并进行自动校验",
    s_bullet))
story.append(Paragraph(
    "·　完整保存 Execution Trace，实现决策过程回放与审计",
    s_bullet))
story.append(Paragraph(
    "&ldquo;如何相信模型的决策过程，而不仅仅是相信模型输出。&rdquo;",
    s_quote))

# Block 3
story.append(Paragraph("▸ 决策一致性评估", s_subhead))
story.append(Paragraph(
    "构建 <b>Consistency Runner</b>：同一输入重复运行 N 次，量化模型决策一致率，"
    "衡量随机性对投资结论的影响。",
    s_body))
story.append(Paragraph(
    "设计多模型交叉评审机制 <b>Decide → Vote → Tally</b>，"
    "通过独立分析与匿名评审提高结论稳定性。",
    s_body))

# Block 4
story.append(Paragraph("▸ 系统重构与架构演进", s_subhead))

iter_table = Table(
    [
        ["", "周期", "Commits", "代码行数"],
        ["Uteki v1", "21 个月", "1,358", "22.7 万"],
        ["Uteki v2", "4 个月", "252", "4.4 万"],
    ],
    colWidths=[2.4*cm, 2.0*cm, 2.0*cm, 2.4*cm],
    hAlign="LEFT",
)
iter_table.setStyle(TableStyle([
    ("FONT", (0, 0), (-1, -1), "Hira", 8.5),
    ("FONT", (0, 1), (0, -1), "HiraBold", 8.5),
    ("FONT", (0, 0), (-1, 0), "HiraBold", 8),
    ("TEXTCOLOR", (0, 0), (-1, 0), MUTED),
    ("TEXTCOLOR", (0, 1), (-1, -1), INK),
    ("LINEBELOW", (0, 0), (-1, 0), 0.3, FAINT),
    ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ("TOPPADDING", (0, 0), (-1, -1), 2),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
]))
story.append(iter_table)
story.append(Spacer(1, 2))
story.append(Paragraph(
    "基于实际运行问题完成系统重构：<b>代码规模收敛约 5 倍</b>，消除缓存污染，"
    "重构上下文管理机制，显著提升系统可维护性与扩展性。",
    s_body))

# ── TECH ABILITY ───────────────────────────────────────────────────────
story += section_header("技术能力")

skills_data = [
    [
        Paragraph("<b>AI 决策系统</b>", s_body),
        Paragraph("Decision Systems · Agent Architecture · Evaluation Framework · "
                  "Reliability · Explainability · Bias Control", s_body),
    ],
    [
        Paragraph("<b>Agent 能力</b>", s_body),
        Paragraph("Planning · Tool Calling · Memory · Reflection · "
                  "Workflow Orchestration · RAG", s_body),
    ],
    [
        Paragraph("<b>工程能力</b>", s_body),
        Paragraph("Python · FastAPI · PostgreSQL · SQLite · Docker", s_body),
    ],
    [
        Paragraph("<b>LLM 生态</b>", s_body),
        Paragraph("OpenAI · Anthropic · Gemini · DeepSeek", s_body),
    ],
]
skills_table = Table(skills_data, colWidths=[3.0*cm, 14.0*cm], hAlign="LEFT")
skills_table.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ("TOPPADDING", (0, 0), (-1, -1), 1.5),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 1.5),
]))
story.append(skills_table)

# ── PHILOSOPHY ─────────────────────────────────────────────────────────
story += section_header("个人项目理念")
story.append(Paragraph(
    "&ldquo;我的兴趣不在于构建一个会回答问题的大模型应用，"
    "而在于构建一个能够持续产生<b>高质量决策</b>的系统。&rdquo;",
    s_quote))
story.append(Spacer(1, 1))
story.append(Paragraph(
    "&ldquo;Uteki 的核心目标不是替代投资者，而是将优秀投资者的<b>思考过程</b>"
    "结构化、标准化，并通过工程手段不断验证与改进决策质量。&rdquo;",
    s_quote))


# Build
doc.build(story)
print(f"OK -> {out_path}")
