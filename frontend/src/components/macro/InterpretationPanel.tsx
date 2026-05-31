/**
 * InterpretationPanel — daily AI reading of the macro dashboard.
 *
 * Layout (full width, sits below the page header):
 *   ┌──────────────────────────────────────────┬──────────────────┐
 *   │ TODAY · 2026-05-01 · deepseek-v3.2       │ vs yesterday     │
 *   │                                           │ (1-2 line diff)  │
 *   │ [overview paragraph in Fraunces italic]   │                  │
 *   │                                           │ key signals      │
 *   │ ── valuation · liquidity · flow ──        │ (3-5 chips with  │
 *   │ three short readings in body italic       │  level + symbol) │
 *   │                                           │                  │
 *   │ [watchpoints bullets]                     │ [generate now]   │
 *   └──────────────────────────────────────────┴──────────────────┘
 *
 * If today's row is missing (first deployment / scheduler hasn't fired yet),
 * shows a CTA to generate on demand.
 */
import { useCallback, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import {
  FONT_DISPLAY,
  FONT_BODY,
  FONT_MONO,
  COLOR_INK,
  COLOR_INK_MUTED,
  COLOR_INK_FAINT,
  COLOR_GAIN,
  COLOR_LOSS,
  COLOR_NEUTRAL,
} from '../../theme/editorialTokens';
import {
  getInterpretation,
  generateInterpretation,
  type MacroInterpretation,
  type MacroKeySignal,
} from '../../api/marketDashboard';

const CAT_LABEL: Record<string, string> = {
  valuation: '估值',
  liquidity: '流动性',
  flow: '资金流',
};

function levelColor(level: MacroKeySignal['level']): string {
  if (level === 'high') return COLOR_LOSS;
  if (level === 'low') return COLOR_GAIN;
  return COLOR_NEUTRAL;
}

function MonoCaps({ children, color, size = 9.5 }: { children: React.ReactNode; color?: string; size?: number }) {
  return (
    <Typography
      component="span"
      sx={{
        fontFamily: FONT_MONO, fontSize: size, letterSpacing: '0.28em',
        textTransform: 'uppercase', color: color ?? COLOR_INK_MUTED,
        fontFeatureSettings: '"tnum"',
      }}
    >
      {children}
    </Typography>
  );
}

function ItalicSerif({ children, size = 14, color }: { children: React.ReactNode; size?: number; color?: string }) {
  return (
    <Typography
      component="span"
      sx={{
        fontFamily: FONT_DISPLAY, fontStyle: 'italic',
        fontSize: size, color: color ?? COLOR_INK,
        fontVariationSettings: '"opsz" 36', lineHeight: 1.6,
      }}
    >
      {children}
    </Typography>
  );
}

export default function InterpretationPanel() {
  const [today, setToday] = useState<MacroInterpretation | null>(null);
  const [previous, setPrevious] = useState<MacroInterpretation | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const reload = useCallback(async () => {
    const res = await getInterpretation();
    setToday(res.today);
    setPrevious(res.previous);
    setLoading(false);
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const row = await generateInterpretation(true);
      if (row) {
        setToday(row);
        // refetch to also get the new "previous" (in case force overwrote today)
        await reload();
      }
    } finally {
      setGenerating(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <Box sx={{ px: 2.5, py: 2, borderTop: `1px solid ${COLOR_INK_FAINT}33`, borderBottom: `1px solid ${COLOR_INK_FAINT}33` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 6, height: 6, borderRadius: '50%', bgcolor: COLOR_INK_MUTED,
              animation: 'interp-pulse 1.4s ease-in-out infinite',
              '@keyframes interp-pulse': {
                '0%, 100%': { opacity: 0.3, transform: 'scale(0.85)' },
                '50%': { opacity: 1, transform: 'scale(1)' },
              },
            }}
          />
          <MonoCaps color={COLOR_INK_FAINT}>正在加载今日解读</MonoCaps>
        </Box>
      </Box>
    );
  }

  // ── Empty state (first deploy / scheduler hasn't fired) ──
  if (!today) {
    return (
      <Box sx={{ px: 3, py: 4, borderTop: `1px solid ${COLOR_INK_FAINT}33`, borderBottom: `1px solid ${COLOR_INK_FAINT}33` }}>
        <Box sx={{ maxWidth: 720, mx: 'auto', textAlign: 'center' }}>
          <MonoCaps>今日尚无 AI 解读</MonoCaps>
          <Typography sx={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 22, color: COLOR_INK, lineHeight: 1.4, mt: 1.5, fontVariationSettings: '"opsz" 72, "SOFT" 60' }}>
            每日 22:00 UTC 自动生成
          </Typography>
          <Typography sx={{ fontFamily: FONT_BODY, fontStyle: 'italic', fontSize: 13, color: COLOR_INK_MUTED, mt: 1, lineHeight: 1.6 }}>
            可以现在手动生成一份 —— 大约 20 秒。
          </Typography>
          <Box
            onClick={generating ? undefined : handleGenerate}
            sx={{
              display: 'inline-block', mt: 2.5,
              fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: generating ? COLOR_INK_FAINT : '#15130F',
              bgcolor: generating ? 'transparent' : COLOR_INK,
              border: generating ? `1px solid ${COLOR_INK_FAINT}` : 'none',
              px: 2.5, py: 1, cursor: generating ? 'not-allowed' : 'pointer',
              transition: 'all 200ms',
              '&:hover': generating ? {} : { bgcolor: '#FFF8EA' },
            }}
          >
            {generating ? '生成中⋯⋯' : '+ 生成今日解读'}
          </Box>
        </Box>
      </Box>
    );
  }

  // ── Loaded ──
  const p = today.payload;
  const ageMs = Date.now() - new Date(today.created_at).getTime();
  const ageMin = Math.max(1, Math.floor(ageMs / 60000));
  const ageStr = ageMin < 60 ? `${ageMin}m ago` : `${Math.floor(ageMin / 60)}h ago`;

  return (
    <Box sx={{ borderTop: `1px solid ${COLOR_INK_FAINT}33`, borderBottom: `1px solid ${COLOR_INK_FAINT}33` }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 2.5, py: 2.5, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 320px' }, gap: 4 }}>
        {/* ── Left: overview + 3 readings + watchpoints ── */}
        <Box>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
            <Typography sx={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 22, color: COLOR_INK, lineHeight: 1, fontVariationSettings: '"opsz" 72, "SOFT" 60' }}>
              今日解读
            </Typography>
            <ItalicSerif size={13} color={COLOR_INK_MUTED}>· today's reading</ItalicSerif>
            <Box sx={{ flex: 1 }} />
            <MonoCaps>{today.as_of_date}</MonoCaps>
            <MonoCaps color={COLOR_INK_FAINT}>{today.provider}/{today.model}</MonoCaps>
            <MonoCaps color={COLOR_INK_FAINT}>{ageStr}</MonoCaps>
          </Box>

          {/* Overview paragraph */}
          <Typography sx={{ fontFamily: FONT_BODY, fontStyle: 'italic', fontSize: 16, color: COLOR_INK, lineHeight: 1.7, mb: 2.5 }}>
            {p.overview}
          </Typography>

          {/* Three category readings */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 2.5 }}>
            {[
              { label: '估值', sub: 'valuation', text: p.valuation_reading },
              { label: '流动性', sub: 'liquidity', text: p.liquidity_reading },
              { label: '资金流', sub: 'flow', text: p.flow_reading },
            ].map((row) => (
              <Box key={row.sub}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.6 }}>
                  <Typography sx={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 14, color: COLOR_INK }}>
                    {row.label}
                  </Typography>
                  <MonoCaps size={9} color={COLOR_INK_FAINT}>{row.sub}</MonoCaps>
                </Box>
                <Typography sx={{ fontFamily: FONT_BODY, fontStyle: 'italic', fontSize: 13, color: COLOR_INK_MUTED, lineHeight: 1.55 }}>
                  {row.text}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Watchpoints */}
          {p.watchpoints && p.watchpoints.length > 0 && (
            <Box sx={{ pt: 1.5, borderTop: `1px dashed ${COLOR_INK_FAINT}33` }}>
              <MonoCaps>需关注 · watchpoints</MonoCaps>
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                {p.watchpoints.slice(0, 4).map((w, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography sx={{ fontFamily: FONT_MONO, fontSize: 9, color: COLOR_INK_FAINT, mt: 0.2 }}>·</Typography>
                    <Typography sx={{ fontFamily: FONT_BODY, fontStyle: 'italic', fontSize: 12.5, color: COLOR_INK, lineHeight: 1.55 }}>
                      {w}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* ── Right: vs yesterday + key signals ── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, borderLeft: { xs: 'none', lg: `1px solid ${COLOR_INK_FAINT}33` }, pl: { xs: 0, lg: 3 } }}>
          {/* vs yesterday */}
          {p.vs_yesterday && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1 }}>
                <MonoCaps>vs 昨日</MonoCaps>
                {previous && (
                  <Typography sx={{ fontFamily: FONT_MONO, fontSize: 9, color: COLOR_INK_FAINT, letterSpacing: '0.18em', fontFeatureSettings: '"tnum"' }}>
                    {previous.as_of_date}
                  </Typography>
                )}
              </Box>
              <Typography sx={{ fontFamily: FONT_BODY, fontStyle: 'italic', fontSize: 13, color: COLOR_INK, lineHeight: 1.6 }}>
                {p.vs_yesterday}
              </Typography>
            </Box>
          )}

          {/* Key signals */}
          {p.key_signals && p.key_signals.length > 0 && (
            <Box sx={{ pt: p.vs_yesterday ? 1.5 : 0, borderTop: p.vs_yesterday ? `1px dashed ${COLOR_INK_FAINT}33` : 'none' }}>
              <MonoCaps>关键信号 · {p.key_signals.length}</MonoCaps>
              <Box sx={{ mt: 1.2, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                {p.key_signals.slice(0, 5).map((s, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Box sx={{ width: 3, alignSelf: 'stretch', bgcolor: levelColor(s.level), flexShrink: 0, mt: 0.4 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8, mb: 0.2 }}>
                        <Typography sx={{ fontFamily: FONT_MONO, fontSize: 9, color: levelColor(s.level), letterSpacing: '0.18em', fontWeight: 600 }}>
                          {s.level}
                        </Typography>
                        <Typography sx={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 13, color: COLOR_INK }}>
                          {s.indicator_name}
                        </Typography>
                        <Typography sx={{ fontFamily: FONT_MONO, fontSize: 9, color: COLOR_INK_FAINT, letterSpacing: '0.14em' }}>
                          {CAT_LABEL[s.category] ?? s.category}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontFamily: FONT_BODY, fontStyle: 'italic', fontSize: 12, color: COLOR_INK_MUTED, lineHeight: 1.5 }}>
                        {s.comment}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Manual refresh */}
          <Box
            onClick={generating ? undefined : handleGenerate}
            sx={{
              alignSelf: 'flex-end', mt: 1,
              fontFamily: FONT_MONO, fontSize: 9.5, letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: generating ? COLOR_INK_FAINT : COLOR_INK_MUTED,
              cursor: generating ? 'not-allowed' : 'pointer',
              transition: 'color 180ms',
              '&:hover': generating ? {} : { color: COLOR_INK },
            }}
          >
            {generating ? '↻ 生成中⋯' : '↻ 重新生成'}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
