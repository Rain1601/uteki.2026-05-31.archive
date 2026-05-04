import { useI18n } from '../../i18n/I18nProvider';

/**
 * Hand-drawn-style SVG of the uteki multi-agent architecture.
 * Compact 1200×540 layout — fits in a single viewport even after the page
 * caption + supporting strip.
 *
 * Real concepts mapped from uteki.open: Intent Router · Skill Team (7 gates) ·
 * Reflection · RAG · Web Search · Source Catalog · Memory · Decision Harness ·
 * Arena (multi-model voting) · Evaluation · LLM Adapter foundation.
 */
export default function MultiAgentDiagram() {
  const { lang } = useI18n();
  const T = (zh: string, en: string) => (lang === 'zh' ? zh : en);

  return (
    <svg
      viewBox="0 0 1200 540"
      className="w-full h-auto max-w-6xl mx-auto"
      style={{ fontFamily: "'Newsreader', serif" }}
    >
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="#A8896E" opacity="0.85" />
        </marker>
        <marker id="arrFaint" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="#5C5750" />
        </marker>
        <pattern id="dotgrid" patternUnits="userSpaceOnUse" width="22" height="22">
          <circle cx="1" cy="1" r="0.5" fill="#5C5750" opacity="0.14" />
        </pattern>
      </defs>

      <rect x="0" y="0" width="1200" height="540" fill="url(#dotgrid)" />

      {/* Zone labels */}
      <g fill="#5C5750" fontSize="9" fontFamily="JetBrains Mono, monospace" letterSpacing="3">
        <text x="14" y="68"  transform="rotate(-90 14 68)">{T('入口', 'INPUT')}</text>
        <text x="14" y="220" transform="rotate(-90 14 220)">{T('执行', 'EXECUTION')}</text>
        <text x="14" y="395" transform="rotate(-90 14 395)">{T('协同 · 评测', 'COORD · EVAL')}</text>
        <text x="14" y="510" transform="rotate(-90 14 510)">{T('基础', 'FOUNDATION')}</text>
      </g>

      {/* ── Zone 1: User → Intent Router ───────────────────────────── */}
      <g>
        <circle cx="600" cy="32" r="14" fill="none" stroke="#A8896E" strokeWidth="1.4" />
        <text x="600" y="36" textAnchor="middle" fill="#F4ECDF" fontSize="11" fontStyle="italic" fontFamily="Fraunces, serif">user</text>
      </g>
      <line x1="600" y1="46" x2="600" y2="64" stroke="#A8896E" strokeWidth="1.2" markerEnd="url(#arr)" />

      <NodeBox x={490} y={66} w={220} h={42}
        title="Intent Router" sub={T('一次 LLM · 路由分支', 'one LLM · branch')}
        accent="#A8896E" />

      {/* Branch arrows */}
      <path d="M 510 108 Q 290 138 195 158" stroke="#A8896E" strokeWidth="1.1" fill="none" markerEnd="url(#arr)" opacity="0.5" />
      <line x1="600" y1="108" x2="600" y2="158" stroke="#A8896E" strokeWidth="1.2" markerEnd="url(#arr)" />
      <path d="M 690 108 Q 910 138 1005 158" stroke="#A8896E" strokeWidth="1.1" fill="none" markerEnd="url(#arr)" />

      {/* ── Zone 2: Three lanes ─────────────────────────────────────── */}

      {/* Lane A: RAG (left) */}
      <NodeBox x={70} y={160} w={250} h={48}
        title="RAG · Research" sub={T('Agentic RAG · 5 步', 'Agentic RAG · 5 steps')}
        accent="#6FAF8D" />
      <line x1="195" y1="208" x2="195" y2="224" stroke="#6FAF8D" strokeWidth="1" markerEnd="url(#arrFaint)" opacity="0.7" />
      <NodeBox x={70} y={226} w={250} h={38}
        title="Web Search" sub={T('Google CSE → DuckDuckGo', 'Google CSE → DuckDuckGo')}
        accent="#6FAF8D" muted />
      <line x1="195" y1="264" x2="195" y2="278" stroke="#6FAF8D" strokeWidth="1" markerEnd="url(#arrFaint)" opacity="0.7" />
      <NodeBox x={70} y={280} w={250} h={38}
        title={T('Web 抓取', 'Web Scraper')}
        sub={T('trafilatura → BeautifulSoup', 'trafilatura → BeautifulSoup')}
        accent="#6FAF8D" muted />
      <line x1="195" y1="318" x2="195" y2="332" stroke="#6FAF8D" strokeWidth="1" markerEnd="url(#arrFaint)" opacity="0.7" />
      <NodeBox x={70} y={334} w={250} h={38}
        title="Source Catalog" sub={T('[src:N] 引用 · 防幻觉', '[src:N] · anti-hallucination')}
        accent="#6FAF8D" muted />

      {/* Lane B: Skill Team (center) */}
      <NodeBox x={400} y={160} w={400} h={44}
        title="Company Skill Team" sub={T('7 关 ReAct · GateExecutor', '7-gate ReAct · GateExecutor')}
        accent="#C9A97E" highlight />

      {/* 7 gates strip */}
      <g>
        {[
          ['I',   T('业务',     'Business')],
          ['II',  T('成长',     'Growth')],
          ['III', T('护城河',   'Moat')],
          ['IV',  T('管理',     'Mgmt')],
          ['V',   T('反向',     'Inversion')],
          ['VI',  T('估值',     'Valuation')],
          ['VII', T('裁决',     'Verdict')],
        ].map(([num, label], i) => {
          const x = 405 + i * 56;
          const isVerdict = i === 6;
          return (
            <g key={num}>
              <rect x={x} y={212} width={52} height={42} rx={3}
                fill={isVerdict ? '#1f1812' : '#161310'}
                stroke={isVerdict ? '#6FAF8D' : '#C9A97E'} strokeWidth="1" />
              <text x={x + 26} y={228} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#C9A97E">{num}</text>
              <text x={x + 26} y={244} textAnchor="middle" fontFamily="Fraunces, serif" fontSize="10" fontStyle="italic" fill="#F4ECDF">{label}</text>
            </g>
          );
        })}
      </g>

      {/* Reflection markers */}
      <g>
        <circle cx="567" cy="270" r="7" fill="#1B1814" stroke="#A8896E" strokeWidth="1.1" />
        <text x="567" y="274" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fill="#A8896E">①</text>
        <text x="525" y="282" fontFamily="JetBrains Mono" fontSize="8" fill="#A8A097">reflect</text>

        <circle cx="679" cy="270" r="7" fill="#1B1814" stroke="#A8896E" strokeWidth="1.1" />
        <text x="679" y="274" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fill="#A8896E">②</text>
        <text x="697" y="282" fontFamily="JetBrains Mono" fontSize="8" fill="#A8A097">reflect</text>
      </g>

      {/* Tool registry below gates */}
      <NodeBox x={400} y={296} w={400} h={36}
        title={T('Skill 工具注册表', 'Skill Tool Registry')}
        sub="web_search · compare_peers · get_kline · …"
        accent="#C9A97E" muted />

      {/* Lane C: Memory */}
      <NodeBox x={880} y={160} w={250} h={48}
        title="Memory" sub={T('短期 / 长期 · 6 类标签', 'short / long · 6 categories')}
        accent="#B0524A" />
      <g fill="#A8A097" fontSize="9" fontFamily="JetBrains Mono, monospace">
        <text x="900" y="234">decision</text>
        <text x="900" y="248">reflection</text>
        <text x="900" y="262">experience</text>
        <text x="1010" y="234">observation</text>
        <text x="1010" y="248">arena_learn</text>
        <text x="1010" y="262">vote_reason</text>
      </g>
      <rect x="888" y="222" width="234" height="50" rx="3" fill="none" stroke="#5C5750" strokeWidth="0.7" strokeDasharray="2 3" />

      {/* Memory ↔ Skill (two-way) */}
      <line x1="880" y1="244" x2="800" y2="244" stroke="#B0524A" strokeWidth="0.8" strokeDasharray="3 3" markerStart="url(#arrFaint)" markerEnd="url(#arrFaint)" />
      {/* Source Catalog → Skill */}
      <path d="M 320 354 Q 360 320 400 296" stroke="#6FAF8D" strokeWidth="0.8" strokeDasharray="3 3" fill="none" markerEnd="url(#arrFaint)" opacity="0.7" />

      {/* ── Zone 3: Coordination ────────────────────────────────────── */}

      {/* Skill Team → Harness */}
      <line x1="600" y1="332" x2="600" y2="358" stroke="#C9A97E" strokeWidth="1.2" markerEnd="url(#arr)" />

      <NodeBox x={400} y={360} w={400} h={48}
        title="Decision Harness" sub={T('冻结上下文 · 数据 + 账户 + 记忆', 'frozen context · data + account + memory')}
        accent="#A8896E" />

      <line x1="600" y1="408" x2="600" y2="426" stroke="#A8896E" strokeWidth="1.3" markerEnd="url(#arr)" />

      <NodeBox x={300} y={428} w={600} h={50}
        title="Arena · Multi-Model Voting"
        sub={T('7 模型并行 · 匿名互投 · 自动采纳冠军', '7 models · anonymous voting · auto-adopt')}
        accent="#B0524A" highlight />

      {/* Memory → Harness diagonal */}
      <path d="M 1005 208 Q 1005 320 850 392" stroke="#B0524A" strokeWidth="0.8" strokeDasharray="3 3" fill="none" />

      {/* Evaluation node — observes the arena and skills */}
      <NodeBox x={920} y={360} w={210} h={118}
        title="Evaluation" sub={T('4 维 + 5 维指标', '4-D + 5-D metrics')}
        accent="#6FAF8D" tall />
      <g fill="#A8A097" fontSize="9" fontFamily="JetBrains Mono, monospace">
        <text x="938" y="408">consistency · credibility</text>
        <text x="938" y="422">logic · effectiveness</text>
        <text x="938" y="438" fill="#5C5750">cost · latency · judge</text>
      </g>
      <path d="M 800 332 Q 870 350 920 410" stroke="#5C5750" strokeWidth="0.6" strokeDasharray="2 3" fill="none" />
      <path d="M 900 458 L 920 458" stroke="#5C5750" strokeWidth="0.6" strokeDasharray="2 3" fill="none" markerStart="url(#arrFaint)" />

      {/* ── Zone 4: Foundation ────────────────────────────────────── */}
      <NodeBox x={140} y={494} w={920} h={36}
        title="LLM Adapter Factory · provider-agnostic"
        sub={T('streaming · 工具调用 · ReAct · fallback · 限流', 'streaming · tool-call · ReAct · fallback · rate-limit')}
        accent="#A8896E" muted compact />

      {/* Output arrow on top right */}
      <text x="608" y="496" fill="#5C5750" fontSize="9" fontFamily="JetBrains Mono, monospace">↓ JSON + citations + verdict</text>
    </svg>
  );
}

interface NodeBoxProps {
  x: number; y: number; w: number; h: number;
  title: string; sub: string;
  accent: string;
  highlight?: boolean;
  muted?: boolean;
  tall?: boolean;
  compact?: boolean;
}

function NodeBox({ x, y, w, h, title, sub, accent, highlight, muted, tall, compact }: NodeBoxProps) {
  const fill = highlight ? '#1f1812' : muted ? '#15130F' : '#1B1814';
  const titleY = compact ? y + 16 : tall ? y + 22 : y + 19;
  const subY   = compact ? y + 28 : tall ? y + 38 : y + 35;
  const titleSize = compact ? 12 : 13;
  const subSize = compact ? 9.5 : 10.5;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3}
        fill={fill} stroke={accent} strokeWidth={highlight ? 1.6 : 1.2} />
      <text x={x + w / 2} y={titleY} textAnchor="middle"
        fill="#F4ECDF" fontSize={titleSize} fontStyle="italic" fontFamily="Fraunces, serif">
        {title}
      </text>
      {sub && (
        <text x={x + w / 2} y={subY} textAnchor="middle"
          fill={muted ? '#5C5750' : '#A8A097'} fontSize={subSize} fontFamily="JetBrains Mono, monospace">
          {sub}
        </text>
      )}
    </g>
  );
}
