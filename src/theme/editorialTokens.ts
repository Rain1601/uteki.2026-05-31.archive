/**
 * Editorial Finance — shared design tokens.
 * Ported verbatim from uteki.open/frontend/src/theme/editorialTokens.ts
 *
 * Aesthetic: warm dark editorial / FT-Weekend dark mode.
 * Typography: Fraunces (display, italic-leaning) + Newsreader (body) + JetBrains Mono (data).
 */

export const FONT_DISPLAY = "'Fraunces', 'Newsreader', '宋体', 'STSong', Georgia, serif";
export const FONT_BODY = "'Newsreader', '宋体', 'STSong', Georgia, serif";
export const FONT_MONO = "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace";

export const COLOR_BG = '#15130F';
export const COLOR_BG_RAISED = '#1B1814';
export const COLOR_INK = '#F4ECDF';
export const COLOR_INK_MUTED = '#A8A097';
export const COLOR_INK_FAINT = '#5C5750';

export const COLOR_GAIN = '#6FAF8D';
export const COLOR_LOSS = '#B0524A';
export const COLOR_NEUTRAL = '#C9A97E';
export const COLOR_ACCENT = '#A8896E';

export const BACKGROUND_PAPER = `
  radial-gradient(ellipse 1400px 700px at 8% -8%, rgba(168,137,110,0.06), transparent 60%),
  radial-gradient(ellipse 900px 600px at 96% 108%, rgba(91,123,106,0.05), transparent 65%),
  repeating-linear-gradient(0deg, rgba(255,255,255,0.005) 0 1px, transparent 1px 3px)
`;

export const fmtUsd = (
  v: number | null | undefined,
  opts?: { compact?: boolean },
): string => {
  if (v == null || Number.isNaN(v)) return '—';
  const abs = Math.abs(v);
  if (opts?.compact && abs >= 1_000_000) {
    return `$${(v / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`;
  }
  if (opts?.compact && abs >= 1000) {
    return `$${(v / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`;
  }
  return `$${v.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const fmtPct = (
  v: number | null | undefined,
  digits = 2,
): string => {
  if (v == null || Number.isNaN(v)) return '—';
  return `${v >= 0 ? '+' : ''}${v.toFixed(digits)}%`;
};

export const fmtNum = (
  v: number | null | undefined,
  opts?: { compact?: boolean; digits?: number },
): string => {
  if (v == null || Number.isNaN(v)) return '—';
  const digits = opts?.digits ?? 2;
  const abs = Math.abs(v);
  if (opts?.compact && abs >= 1_000_000_000) {
    return `${(v / 1_000_000_000).toFixed(digits)}B`;
  }
  if (opts?.compact && abs >= 1_000_000) {
    return `${(v / 1_000_000).toFixed(digits)}M`;
  }
  if (opts?.compact && abs >= 1000) {
    return `${(v / 1000).toFixed(digits)}k`;
  }
  return v.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

export const PAGE_SHELL_SX = {
  height: '100vh',
  width: '100%',
  bgcolor: COLOR_BG,
  color: COLOR_INK,
  fontFamily: FONT_BODY,
  backgroundImage: BACKGROUND_PAPER,
  display: 'flex',
  flexDirection: 'column' as const,
  overflow: 'hidden' as const,
};

export const PAGE_SHELL_SCROLL_SX = {
  ...PAGE_SHELL_SX,
  overflow: 'auto' as const,
  height: 'auto',
  minHeight: '100vh',
};
