import { useI18n } from '../../i18n/I18nProvider';

/**
 * Hand-drawn-style SVG of the uteki multi-agent architecture.
 * Editorial palette: charcoal bg, cream ink, sage/amber/terracotta accents.
 */
export default function MultiAgentDiagram() {
  const { lang } = useI18n();
  const T = (zh: string, en: string) => (lang === 'zh' ? zh : en);

  return (
    <svg
      viewBox="0 0 1100 560"
      className="w-full h-auto max-w-5xl mx-auto"
      style={{ fontFamily: "'Newsreader', serif" }}
    >
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="#A8896E" opacity="0.8" />
        </marker>
        <marker id="arrFaint" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="#5C5750" />
        </marker>
        <pattern id="dotgrid" patternUnits="userSpaceOnUse" width="20" height="20">
          <circle cx="1" cy="1" r="0.6" fill="#5C5750" opacity="0.18" />
        </pattern>
      </defs>

      <rect x="0" y="0" width="1100" height="560" fill="url(#dotgrid)" />

      {/* User node */}
      <g>
        <circle cx="550" cy="48" r="20" fill="none" stroke="#A8896E" strokeWidth="1.4" />
        <text x="550" y="53" textAnchor="middle" fill="#F4ECDF" fontSize="14" fontStyle="italic" fontFamily="Fraunces, serif">
          user
        </text>
      </g>
      <line x1="550" y1="68" x2="550" y2="98" stroke="#A8896E" strokeWidth="1.2" markerEnd="url(#arr)" />

      {/* Intent Router */}
      <g>
        <rect x="430" y="100" width="240" height="62" rx="3" fill="#1B1814" stroke="#A8896E" strokeWidth="1.4" />
        <text x="550" y="124" textAnchor="middle" fill="#F4ECDF" fontSize="14" fontFamily="Fraunces, serif" fontStyle="italic">
          Intent Router
        </text>
        <text x="550" y="146" textAnchor="middle" fill="#A8A097" fontSize="11" fontFamily="JetBrains Mono, monospace">
          {T('一次 LLM · 判断意图分支', 'one LLM call · branch by intent')}
        </text>
      </g>

      {/* Three branch arrows */}
      <path d="M 470 162 Q 280 200 200 220" stroke="#A8896E" strokeWidth="1.2" fill="none" markerEnd="url(#arr)" opacity="0.6" />
      <line x1="550" y1="162" x2="550" y2="218" stroke="#A8896E" strokeWidth="1.2" markerEnd="url(#arr)" />
      <path d="M 630 162 Q 820 200 900 220" stroke="#A8896E" strokeWidth="1.2" fill="none" markerEnd="url(#arr)" opacity="0.6" />

      {/* Chat (faded) */}
      <g opacity="0.5">
        <rect x="120" y="220" width="160" height="46" rx="3" fill="none" stroke="#5C5750" strokeWidth="1" strokeDasharray="3 3" />
        <text x="200" y="240" textAnchor="middle" fill="#A8A097" fontSize="13" fontFamily="Fraunces, serif" fontStyle="italic">Chat</text>
        <text x="200" y="256" textAnchor="middle" fill="#5C5750" fontSize="10" fontFamily="JetBrains Mono, monospace">simple Q&A</text>
      </g>

      {/* IndexAgent — center column */}
      <g>
        <rect x="430" y="220" width="240" height="220" rx="4" fill="#161310" stroke="#6FAF8D" strokeWidth="1.4" />
        <text x="550" y="244" textAnchor="middle" fill="#F4ECDF" fontSize="14" fontFamily="Fraunces, serif" fontStyle="italic">
          IndexAgent
        </text>
        <text x="550" y="262" textAnchor="middle" fill="#6FAF8D" fontSize="10" fontFamily="JetBrains Mono, monospace" letterSpacing="1">
          5-STEP RAG
        </text>
        {[
          T('① 判断是否需要联网', '① decide if search needed'),
          T('② 问题分解', '② decompose query'),
          T('③ 双引擎搜索', '③ dual-engine search'),
          T('④ 并发抓取', '④ concurrent scraping'),
          T('⑤ 流式合成', '⑤ stream synthesis'),
        ].map((s, i) => (
          <text key={i} x="450" y={290 + i * 22} fill="#F4ECDF" fontSize="12" fontFamily="Newsreader, serif">{s}</text>
        ))}
        <text x="550" y="425" textAnchor="middle" fill="#5C5750" fontSize="10" fontFamily="JetBrains Mono, monospace" fontStyle="italic">
          ⚠ agentic RAG · no autonomous loop
        </text>
      </g>

      {/* CompanyAgent — right column */}
      <g>
        <rect x="780" y="220" width="240" height="220" rx="4" fill="#161310" stroke="#C9A97E" strokeWidth="1.4" />
        <text x="900" y="244" textAnchor="middle" fill="#F4ECDF" fontSize="14" fontFamily="Fraunces, serif" fontStyle="italic">
          CompanyAgent
        </text>
        <text x="900" y="262" textAnchor="middle" fill="#C9A97E" fontSize="10" fontFamily="JetBrains Mono, monospace" letterSpacing="1">
          7-GATE REACT
        </text>
        {[
          [T('I  · 业务解析', 'I  · business'), '#C9A97E'],
          [T('II · 成长质量', 'II · growth quality'), '#C9A97E'],
          [T('III· 护城河', 'III· moat'), '#C9A97E'],
          [T('IV · 管理层', 'IV · management'), '#C9A97E'],
          [T('V  · 反向测试', 'V  · inversion'), '#C9A97E'],
          [T('VI · 估值 & 时机', 'VI · valuation & timing'), '#C9A97E'],
          [T('VII· 综合裁决', 'VII· final verdict'), '#6FAF8D'],
        ].map(([s, c], i) => (
          <text key={i} x="800" y={285 + i * 19} fill={c as string} fontSize="11.5" fontFamily="JetBrains Mono, monospace">{s}</text>
        ))}
        {/* Reflection markers */}
        <circle cx="990" cy="335" r="6" fill="none" stroke="#A8896E" strokeWidth="1" />
        <text x="990" y="339" textAnchor="middle" fontSize="9" fill="#A8896E" fontFamily="JetBrains Mono">①</text>
        <text x="1004" y="338" fontSize="9" fill="#A8A097" fontFamily="JetBrains Mono">reflect</text>
        <circle cx="990" cy="392" r="6" fill="none" stroke="#A8896E" strokeWidth="1" />
        <text x="990" y="396" textAnchor="middle" fontSize="9" fill="#A8896E" fontFamily="JetBrains Mono">②</text>
        <text x="1004" y="395" fontSize="9" fill="#A8A097" fontFamily="JetBrains Mono">reflect</text>
      </g>

      {/* Arena layer below */}
      <line x1="550" y1="440" x2="550" y2="478" stroke="#A8896E" strokeWidth="1.2" markerEnd="url(#arr)" />
      <line x1="900" y1="440" x2="900" y2="478" stroke="#A8896E" strokeWidth="1.2" markerEnd="url(#arr)" />

      <g>
        <rect x="320" y="480" width="600" height="62" rx="3" fill="#1B1814" stroke="#B0524A" strokeWidth="1.4" />
        <text x="620" y="503" textAnchor="middle" fill="#F4ECDF" fontSize="14" fontFamily="Fraunces, serif" fontStyle="italic">
          Arena Layer
        </text>
        <text x="620" y="525" textAnchor="middle" fill="#A8A097" fontSize="11" fontFamily="JetBrains Mono, monospace">
          {T('7 模型并行 · 匿名互投 · 自动采纳冠军', '7 models in parallel · anonymous voting · auto-adopt winner')}
        </text>
      </g>

      {/* Decorative provider strip on the right */}
      <g>
        {['Claude', 'GPT', 'Gemini', 'DeepSeek', 'Qwen', 'Doubao', 'MiniMax'].map((p, i) => (
          <text
            key={p}
            x={170 + i * 22}
            y={518 - (i % 2) * 14}
            fill="#5C5750"
            fontSize="9"
            fontFamily="JetBrains Mono, monospace"
            transform={`rotate(-12 ${170 + i * 22} 518)`}
          >
            {p}
          </text>
        ))}
      </g>

      {/* SSE annotation */}
      <line x1="80" y1="320" x2="430" y2="320" stroke="#5C5750" strokeWidth="0.8" strokeDasharray="2 4" markerEnd="url(#arrFaint)" />
      <text x="80" y="316" fill="#5C5750" fontSize="10" fontFamily="JetBrains Mono, monospace">SSE stream →</text>
      <text x="80" y="330" fill="#5C5750" fontSize="9" fontFamily="JetBrains Mono, monospace">
        thought · status · tool_call · token · done
      </text>
    </svg>
  );
}
