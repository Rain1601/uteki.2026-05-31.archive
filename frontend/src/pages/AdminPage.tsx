/**
 * /admin — Editorial restyle.
 *
 * The control room for system configuration: API keys (LLM providers,
 * aggregator configs), exchange credentials (SNB/Binance), and system
 * health. Restyled in 2026-04 to speak the same warm-dark editorial
 * finance language as Studio / Dashboard / Dossier.
 *
 * Aesthetic notes:
 *   - sharp 1px borders (no rounded corners)
 *   - Fraunces italic display + Newsreader body + JetBrains Mono for data
 *   - mono-caps labels, italic-serif section heads
 *   - sage / terracotta / amber verdict colors for status
 */
import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Dialog,
  Collapse,
  Switch,
} from '@mui/material';
import {
  RefreshCw as RefreshIcon,
  Copy as CopyIcon,
  Plus as AddIcon,
  Trash2 as DeleteIcon,
  X as CloseIcon,
  Pencil as EditIcon,
  Save as SaveIcon,
  Eye as VisibilityIcon,
  EyeOff as VisibilityOffIcon,
  Star as StarIcon,
  LogOut as LogOutIcon,
  ShieldCheck as ShieldCheckIcon,
  Zap as ZapIcon,
  CircleCheck as CheckIcon,
  CircleAlert as AlertIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { get } from '../api/client';
import { adminApi } from '../api/admin';
import { useSystemHealth } from '../hooks/useAdmin';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ModelLogo, getProviderDisplayName } from '../components/index/ModelLogos';
import {
  FONT_DISPLAY,
  FONT_BODY,
  FONT_MONO,
  COLOR_BG,
  COLOR_BG_RAISED,
  COLOR_INK,
  COLOR_INK_MUTED,
  COLOR_INK_FAINT,
  COLOR_GAIN,
  COLOR_LOSS,
  COLOR_NEUTRAL,
  COLOR_ACCENT,
  BACKGROUND_PAPER,
} from '../theme/editorialTokens';
import type { APIKey, LLMProvider, AggregatorConfig, AggregatorBalance, AggregatorProvider } from '../types/admin';

/* ─── constants ─── */

const EXCHANGES = [
  { name: 'snb', label: '雪盈证券', sub: 'SNB · Snowball Brokerage', features: ['现货', '港美股'], fields: ['api_key', 'account', 'totp_secret'] },
  { name: 'binance', label: '币安', sub: 'Binance · Crypto', features: ['现货', '合约', '加密货币'], fields: ['api_key', 'api_secret'] },
];

const PROVIDER_DEFAULTS: Record<string, { model: string; base_url?: string }> = {
  anthropic: { model: 'claude-sonnet-4-20250514' },
  openai: { model: 'gpt-4o' },
  deepseek: { model: 'deepseek-chat', base_url: 'https://api.deepseek.com' },
  google: { model: 'gemini-2.5-pro-thinking' },
  qwen: { model: 'qwen-plus', base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
  minimax: { model: 'MiniMax-Text-01', base_url: 'https://api.minimax.chat/v1' },
  doubao: { model: 'doubao-seed-2-0-pro-260215', base_url: 'https://ark.cn-beijing.volces.com/api/v3' },
};

const PROVIDERS = Object.keys(PROVIDER_DEFAULTS);

/* ─── editorial atoms (inline; same pattern as Studio/Dossier) ─── */

function MonoCaps({
  children,
  color,
  size = 10,
  letterSpacing = '0.28em',
}: {
  children: React.ReactNode;
  color?: string;
  size?: number;
  letterSpacing?: string;
}) {
  return (
    <Typography
      component="span"
      sx={{
        fontFamily: FONT_MONO,
        fontSize: size,
        letterSpacing,
        textTransform: 'uppercase',
        color: color ?? COLOR_INK_MUTED,
        fontFeatureSettings: '"tnum"',
      }}
    >
      {children}
    </Typography>
  );
}

function ItalicSerif({
  children,
  size = 14,
  color,
  weight = 400,
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: number;
}) {
  return (
    <Typography
      component="span"
      sx={{
        fontFamily: FONT_DISPLAY,
        fontStyle: 'italic',
        fontSize: size,
        color: color ?? COLOR_INK,
        fontVariationSettings: '"opsz" 36',
        lineHeight: 1.5,
        fontWeight: weight,
      }}
    >
      {children}
    </Typography>
  );
}

function SectionHead({
  zh,
  en,
  meta,
  right,
}: {
  zh: string;
  en?: string;
  meta?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 2.5 }}>
      <Typography
        sx={{
          fontFamily: FONT_DISPLAY,
          fontStyle: 'italic',
          fontSize: 22,
          color: COLOR_INK,
          letterSpacing: '-0.015em',
          lineHeight: 1,
          fontVariationSettings: '"opsz" 72, "SOFT" 60',
        }}
      >
        {zh}
      </Typography>
      {en && <ItalicSerif size={13} color={COLOR_INK_MUTED}>· {en}</ItalicSerif>}
      <Box sx={{ flex: 1, height: 1, bgcolor: `${COLOR_INK_FAINT}55`, alignSelf: 'center' }} />
      {meta && <MonoCaps size={9.5}>{meta}</MonoCaps>}
      {right}
    </Box>
  );
}

function Pill({
  children,
  onClick,
  variant = 'outline',
  startIcon,
  disabled,
  tone,
  size = 'md',
}: {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  variant?: 'outline' | 'solid' | 'ghost';
  startIcon?: React.ReactNode;
  disabled?: boolean;
  tone?: 'default' | 'gain' | 'loss' | 'neutral';
  size?: 'sm' | 'md';
}) {
  const toneColor =
    tone === 'gain' ? COLOR_GAIN
    : tone === 'loss' ? COLOR_LOSS
    : tone === 'neutral' ? COLOR_NEUTRAL
    : COLOR_INK_MUTED;

  const isSolid = variant === 'solid';
  const isGhost = variant === 'ghost';

  return (
    <Box
      component="span"
      onClick={disabled ? undefined : onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        fontFamily: FONT_MONO,
        fontSize: size === 'sm' ? 9.5 : 10.5,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: isSolid ? COLOR_BG : toneColor,
        bgcolor: isSolid ? COLOR_INK : 'transparent',
        border: isGhost ? '1px solid transparent' : isSolid ? 'none' : `1px solid ${toneColor === COLOR_INK_MUTED ? `${COLOR_INK_FAINT}99` : `${toneColor}66`}`,
        px: size === 'sm' ? 1 : 1.5,
        py: size === 'sm' ? 0.4 : 0.7,
        cursor: disabled ? 'not-allowed' : onClick ? 'pointer' : 'default',
        opacity: disabled ? 0.45 : 1,
        transition: 'all 180ms',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        '&:hover': onClick && !disabled
          ? isSolid
            ? { bgcolor: '#FFF8EA' }
            : { borderColor: tone && tone !== 'default' ? toneColor : COLOR_INK, color: tone && tone !== 'default' ? toneColor : COLOR_INK }
          : undefined,
      }}
    >
      {startIcon && <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>{startIcon}</Box>}
      {children}
    </Box>
  );
}

function StatusBadge({ tone, label }: { tone: 'gain' | 'loss' | 'neutral' | 'faint'; label: string }) {
  const color =
    tone === 'gain' ? COLOR_GAIN
    : tone === 'loss' ? COLOR_LOSS
    : tone === 'neutral' ? COLOR_NEUTRAL
    : COLOR_INK_FAINT;
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        fontFamily: FONT_MONO,
        fontSize: 9,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color,
        border: `1px solid ${color}55`,
        px: 0.8,
        py: 0.25,
      }}
    >
      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: color }} />
      {label}
    </Box>
  );
}

function LoadingDot({ text = '正在加载' }: { text?: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: COLOR_INK_FAINT, py: 4, justifyContent: 'center' }}>
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: COLOR_INK_MUTED,
          animation: 'admin-pulse-dot 1.4s ease-in-out infinite',
          '@keyframes admin-pulse-dot': {
            '0%, 100%': { opacity: 0.3, transform: 'scale(0.85)' },
            '50%': { opacity: 1, transform: 'scale(1)' },
          },
        }}
      />
      <MonoCaps size={10} color={COLOR_INK_FAINT} letterSpacing="0.32em">{text}…</MonoCaps>
    </Box>
  );
}

/* Editorial input — bottom-bordered, mono-keyed, no rounded box */
function EditorialInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  endAdornment,
  label,
  fontFamily = FONT_MONO,
  autoFocus,
  fullWidth = true,
  onKeyDown,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  endAdornment?: React.ReactNode;
  label?: string;
  fontFamily?: string;
  autoFocus?: boolean;
  fullWidth?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  ariaLabel?: string;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, width: fullWidth ? '100%' : undefined }}>
      {label && <MonoCaps size={9} color={COLOR_INK_FAINT} letterSpacing="0.22em">{label}</MonoCaps>}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: `1px solid ${COLOR_INK_FAINT}88`,
          py: 0.6,
          transition: 'border-color 160ms',
          '&:focus-within': { borderColor: COLOR_INK },
        }}
      >
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onKeyDown={onKeyDown}
          aria-label={ariaLabel || label}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: COLOR_INK,
            fontFamily,
            fontSize: 13,
            letterSpacing: fontFamily === FONT_MONO ? '0.04em' : 'normal',
            outline: 'none',
            padding: 0,
            minWidth: 0,
          }}
        />
        {endAdornment}
      </Box>
    </Box>
  );
}

/* Editorial number/range input combo */
function EditorialNumber({
  value,
  onChange,
  label,
  width = 88,
}: {
  value: number;
  onChange: (v: number) => void;
  label?: string;
  width?: number;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, width }}>
      {label && <MonoCaps size={9} color={COLOR_INK_FAINT} letterSpacing="0.22em">{label}</MonoCaps>}
      <Box sx={{ borderBottom: `1px solid ${COLOR_INK_FAINT}88`, py: 0.6, '&:focus-within': { borderColor: COLOR_INK } }}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: COLOR_INK,
            fontFamily: FONT_MONO,
            fontSize: 13,
            outline: 'none',
            padding: 0,
            fontFeatureSettings: '"tnum"',
          }}
        />
      </Box>
    </Box>
  );
}

/* Editorial slider — minimal track */
function EditorialSlider({
  value,
  onChange,
  min = 0,
  max = 2,
  step = 0.1,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 160 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        {label && <MonoCaps size={9} color={COLOR_INK_FAINT} letterSpacing="0.22em">{label}</MonoCaps>}
        <Typography sx={{ fontFamily: FONT_MONO, fontSize: 11, color: COLOR_INK, fontFeatureSettings: '"tnum"' }}>
          {value.toFixed(1)}
        </Typography>
      </Box>
      <Box sx={{ position: 'relative', height: 16, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ position: 'absolute', left: 0, right: 0, height: 1, bgcolor: `${COLOR_INK_FAINT}88` }} />
        <Box sx={{ position: 'absolute', left: 0, width: `${pct}%`, height: 1, bgcolor: COLOR_INK }} />
        <Box
          sx={{
            position: 'absolute',
            left: `calc(${pct}% - 4px)`,
            width: 8,
            height: 8,
            bgcolor: COLOR_INK,
            border: `1px solid ${COLOR_INK}`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            cursor: 'pointer',
            margin: 0,
            padding: 0,
            width: '100%',
          }}
        />
      </Box>
    </Box>
  );
}

/* ═══════════════ Main Page ═══════════════ */

export default function AdminPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'overview' | 'exchanges' | 'models'>('overview');
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogoutConfirm = async () => {
    await logout();
    setLogoutDialogOpen(false);
    navigate('/login');
  };

  return (
    <Box
      sx={{
        m: -3,
        height: '100vh',
        width: 'calc(100% + 48px)',
        bgcolor: COLOR_BG,
        backgroundImage: BACKGROUND_PAPER,
        color: COLOR_INK,
        fontFamily: FONT_BODY,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      {/* ── Masthead ── */}
      <Box
        sx={{
          flexShrink: 0,
          px: { xs: 4, md: 6 },
          py: 3,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${COLOR_INK_FAINT}55`,
          bgcolor: COLOR_BG_RAISED,
        }}
      >
        <Box>
          <MonoCaps size={9.5} color={COLOR_INK_MUTED} letterSpacing="0.32em">控制台 · admin console</MonoCaps>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mt: 0.6 }}>
            <Typography
              sx={{
                fontFamily: FONT_DISPLAY,
                fontStyle: 'italic',
                fontSize: { xs: 30, md: 38 },
                color: COLOR_INK,
                letterSpacing: '-0.025em',
                lineHeight: 1,
                fontVariationSettings: '"opsz" 144, "SOFT" 60',
              }}
            >
              管理面板
            </Typography>
            <ItalicSerif size={16} color={COLOR_INK_MUTED}>Admin</ItalicSerif>
          </Box>
          <Typography
            sx={{
              fontFamily: FONT_BODY,
              fontStyle: 'italic',
              fontSize: 12,
              color: COLOR_INK_MUTED,
              mt: 0.6,
            }}
          >
            系统配置与凭据管理 · keys, exchanges, health
          </Typography>
        </Box>
        <Pill onClick={() => setLogoutDialogOpen(true)} startIcon={<LogOutIcon size={11} />} tone="loss" variant="outline">
          登出
        </Pill>
      </Box>

      {/* ── Tabs ── */}
      <Box sx={{ flexShrink: 0, px: { xs: 4, md: 6 }, py: 2.5, borderBottom: `1px solid ${COLOR_INK_FAINT}33`, display: 'flex', gap: 3 }}>
        {[
          { key: 'overview', zh: '总览', en: 'Overview' },
          { key: 'exchanges', zh: '交易所', en: 'Exchanges' },
          { key: 'models', zh: '模型', en: 'Models' },
        ].map((t) => {
          const active = tab === t.key;
          return (
            <Box
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              sx={{
                cursor: 'pointer',
                position: 'relative',
                pb: 0.6,
                display: 'flex',
                alignItems: 'baseline',
                gap: 0.8,
                borderBottom: `2px solid ${active ? COLOR_INK : 'transparent'}`,
                transition: 'border-color 180ms',
                '&:hover .tab-zh': { color: COLOR_INK },
              }}
            >
              <Typography
                className="tab-zh"
                sx={{
                  fontFamily: FONT_DISPLAY,
                  fontStyle: 'italic',
                  fontSize: 18,
                  color: active ? COLOR_INK : COLOR_INK_MUTED,
                  letterSpacing: '-0.01em',
                  fontVariationSettings: '"opsz" 36',
                  transition: 'color 180ms',
                }}
              >
                {t.zh}
              </Typography>
              <MonoCaps size={9} color={active ? COLOR_INK_MUTED : COLOR_INK_FAINT} letterSpacing="0.28em">
                {t.en}
              </MonoCaps>
            </Box>
          );
        })}
      </Box>

      {/* ── Body ── */}
      <Box sx={{ flex: 1, px: { xs: 4, md: 6 }, py: 4, overflow: 'auto' }}>
        {tab === 'overview' && <OverviewTab />}
        {tab === 'exchanges' && <ExchangesTab />}
        {tab === 'models' && <ModelsTab />}
      </Box>

      {/* ── Logout Confirmation ── */}
      <EditorialDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        title="确认登出"
        kicker="sign out"
        body="确定要退出登录吗？当前会话凭证将被清除。"
        actions={
          <>
            <Pill onClick={() => setLogoutDialogOpen(false)} variant="ghost">取消</Pill>
            <Pill onClick={handleLogoutConfirm} tone="loss" variant="outline">登出</Pill>
          </>
        }
      />
    </Box>
  );
}

/* ─── Editorial dialog (no MUI rounded corners) ─── */

function EditorialDialog({
  open,
  onClose,
  title,
  kicker,
  body,
  children,
  actions,
  width = 480,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  kicker?: string;
  body?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  width?: number;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width,
          maxWidth: '92vw',
          bgcolor: COLOR_BG_RAISED,
          color: COLOR_INK,
          fontFamily: FONT_BODY,
          border: `1px solid ${COLOR_INK_FAINT}77`,
          borderRadius: 0,
          backgroundImage: 'none',
          boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
        },
      }}
      BackdropProps={{ sx: { bgcolor: 'rgba(0,0,0,0.65)' } }}
    >
      <Box sx={{ px: 3.5, pt: 3, pb: 1.5, borderBottom: `1px solid ${COLOR_INK_FAINT}33`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          {kicker && <MonoCaps size={9} color={COLOR_INK_MUTED} letterSpacing="0.32em">{kicker}</MonoCaps>}
          <Typography
            sx={{
              fontFamily: FONT_DISPLAY,
              fontStyle: 'italic',
              fontSize: 22,
              color: COLOR_INK,
              letterSpacing: '-0.015em',
              lineHeight: 1.1,
              mt: kicker ? 0.5 : 0,
              fontVariationSettings: '"opsz" 72, "SOFT" 60',
            }}
          >
            {title}
          </Typography>
        </Box>
        <Box
          onClick={onClose}
          sx={{
            color: COLOR_INK_FAINT,
            cursor: 'pointer',
            display: 'inline-flex',
            transition: 'color 160ms',
            '&:hover': { color: COLOR_INK },
          }}
        >
          <CloseIcon size={18} />
        </Box>
      </Box>
      <Box sx={{ px: 3.5, py: 2.5 }}>
        {body && (
          <Typography
            sx={{
              fontFamily: FONT_BODY,
              fontStyle: 'italic',
              fontSize: 14,
              color: COLOR_INK,
              lineHeight: 1.6,
            }}
          >
            {body}
          </Typography>
        )}
        {children}
      </Box>
      {actions && (
        <Box sx={{ px: 3.5, pb: 3, pt: 1, display: 'flex', gap: 1.5, justifyContent: 'flex-end', borderTop: `1px solid ${COLOR_INK_FAINT}33` }}>
          <Box sx={{ pt: 2, display: 'flex', gap: 1.5 }}>{actions}</Box>
        </Box>
      )}
    </Dialog>
  );
}

/* ═══════════════ Overview Tab ═══════════════ */

function OverviewTab() {
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  const [ipLoading, setIpLoading] = useState(false);
  const [ipCopied, setIpCopied] = useState(false);
  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useSystemHealth();

  const fetchIp = async () => {
    setIpLoading(true);
    try {
      const data = await get<{ ip: string | null }>('/api/admin/system/server-ip');
      setIpAddress(data.ip);
    } catch { setIpAddress(null); }
    finally { setIpLoading(false); }
  };

  const copyIp = async () => {
    if (!ipAddress) return;
    try {
      await navigator.clipboard.writeText(ipAddress);
      setIpCopied(true);
      toast.success('IP 已复制');
      setTimeout(() => setIpCopied(false), 2000);
    } catch { toast.error('复制失败'); }
  };

  useEffect(() => { fetchIp(); }, []);

  const statusTone = (s: string): { tone: 'gain' | 'loss' | 'neutral' | 'faint'; label: string } => {
    const cfg: Record<string, { tone: 'gain' | 'loss' | 'neutral' | 'faint'; label: string }> = {
      connected: { tone: 'gain', label: '已连接' },
      disconnected: { tone: 'loss', label: '断开' },
      degraded: { tone: 'neutral', label: '降级' },
      disabled: { tone: 'faint', label: '禁用' },
    };
    return cfg[s] || cfg.disconnected;
  };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '380px 1fr' }, gap: 3 }}>
      {/* IP card */}
      <Box
        sx={{
          border: `1px solid ${COLOR_INK_FAINT}55`,
          bgcolor: 'rgba(244,236,223,0.02)',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Box>
            <MonoCaps size={9.5}>服务器 IP · server</MonoCaps>
            <Typography
              sx={{
                fontFamily: FONT_DISPLAY,
                fontStyle: 'italic',
                fontSize: 18,
                color: COLOR_INK,
                mt: 0.4,
                letterSpacing: '-0.01em',
                fontVariationSettings: '"opsz" 36',
              }}
            >
              出口地址
            </Typography>
          </Box>
          <Box
            onClick={fetchIp}
            sx={{
              cursor: ipLoading ? 'not-allowed' : 'pointer',
              color: COLOR_INK_MUTED,
              opacity: ipLoading ? 0.4 : 1,
              transition: 'color 160ms',
              display: 'inline-flex',
              '&:hover': { color: COLOR_INK },
            }}
          >
            <RefreshIcon size={16} />
          </Box>
        </Box>

        {ipLoading ? (
          <LoadingDot text="获取中" />
        ) : ipAddress ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 1.4,
              px: 1.6,
              border: `1px solid ${COLOR_INK_FAINT}55`,
              bgcolor: 'rgba(0,0,0,0.18)',
            }}
          >
            <Typography
              sx={{
                flex: 1,
                fontFamily: FONT_MONO,
                fontSize: 18,
                color: COLOR_INK,
                fontFeatureSettings: '"tnum"',
                letterSpacing: '0.04em',
              }}
            >
              {ipAddress}
            </Typography>
            <Box
              onClick={copyIp}
              sx={{
                display: 'inline-flex',
                color: ipCopied ? COLOR_GAIN : COLOR_INK_MUTED,
                cursor: 'pointer',
                transition: 'color 160ms',
                '&:hover': { color: COLOR_INK },
              }}
            >
              {ipCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
            </Box>
          </Box>
        ) : (
          <Typography sx={{ fontFamily: FONT_MONO, fontSize: 11, color: COLOR_LOSS, letterSpacing: '0.18em' }}>
            ⚠ 无法获取 IP
          </Typography>
        )}
      </Box>

      {/* Health card */}
      <Box
        sx={{
          border: `1px solid ${COLOR_INK_FAINT}55`,
          bgcolor: 'rgba(244,236,223,0.02)',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Box>
            <MonoCaps size={9.5}>系统健康 · health</MonoCaps>
            <Typography
              sx={{
                fontFamily: FONT_DISPLAY,
                fontStyle: 'italic',
                fontSize: 18,
                color: COLOR_INK,
                mt: 0.4,
                letterSpacing: '-0.01em',
                fontVariationSettings: '"opsz" 36',
              }}
            >
              数据库状态
            </Typography>
          </Box>
          <Box
            onClick={() => refetchHealth()}
            sx={{
              cursor: 'pointer',
              color: COLOR_INK_MUTED,
              transition: 'color 160ms',
              display: 'inline-flex',
              '&:hover': { color: COLOR_INK },
            }}
          >
            <RefreshIcon size={16} />
          </Box>
        </Box>

        {healthLoading ? (
          <LoadingDot text="检查中" />
        ) : healthData ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 1.5 }}>
            {Object.entries(healthData.databases).map(([name, db]) => {
              const { tone, label } = statusTone((db as { status: string }).status);
              return (
                <Box
                  key={name}
                  sx={{
                    py: 1.4,
                    px: 1.4,
                    border: `1px solid ${COLOR_INK_FAINT}33`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.8,
                  }}
                >
                  <MonoCaps size={9} color={COLOR_INK_FAINT} letterSpacing="0.24em">{name}</MonoCaps>
                  <StatusBadge tone={tone} label={label} />
                </Box>
              );
            })}
          </Box>
        ) : (
          <Typography sx={{ fontFamily: FONT_MONO, fontSize: 11, color: COLOR_LOSS, letterSpacing: '0.18em' }}>
            ⚠ 无法获取状态
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/* ═══════════════ Exchanges Tab ═══════════════ */

function ExchangesTab() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [editExchange, setEditExchange] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.apiKeys.list();
      setApiKeys(res.items);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const getExchangeKey = (name: string) => apiKeys.find(k => k.provider === name && k.is_active);

  const handleSave = async (exchangeName: string) => {
    setSaving(true);
    try {
      const existing = getExchangeKey(exchangeName);
      const extraConfig: Record<string, string> = {};
      const ex = EXCHANGES.find(e => e.name === exchangeName)!;

      const apiKey = form.api_key || '';
      const apiSecret = form.api_secret || undefined;
      ex.fields.filter(f => f !== 'api_key' && f !== 'api_secret').forEach(f => {
        if (form[f]) extraConfig[f] = form[f];
      });

      if (existing) {
        await adminApi.apiKeys.update(existing.id, {
          ...(apiKey ? { api_key: apiKey } : {}),
          ...(apiSecret ? { api_secret: apiSecret } : {}),
          extra_config: Object.keys(extraConfig).length > 0 ? extraConfig : undefined,
        });
        toast.success('已更新');
      } else {
        if (!apiKey) { toast.error('请输入 API Key'); setSaving(false); return; }
        await adminApi.apiKeys.create({
          provider: exchangeName,
          display_name: ex.label,
          api_key: apiKey,
          api_secret: apiSecret,
          extra_config: Object.keys(extraConfig).length > 0 ? extraConfig : undefined,
          environment: 'production',
          is_active: true,
        });
        toast.success('已创建');
      }
      setEditExchange(null);
      setForm({});
      load();
    } catch (e: unknown) {
      toast.error((e as { message?: string })?.message || '保存失败');
    } finally { setSaving(false); }
  };

  const handleDelete = async (exchangeName: string) => {
    const key = getExchangeKey(exchangeName);
    if (!key) return;
    try {
      await adminApi.apiKeys.delete(key.id);
      toast.success('已删除');
      setDeleteConfirm(null);
      load();
    } catch (e: unknown) { toast.error((e as { message?: string })?.message || '删除失败'); }
  };

  if (loading) return <LoadingDot text="加载中" />;

  return (
    <Box>
      <SectionHead
        zh="交易所凭证"
        en="exchange credentials"
        meta={`${EXCHANGES.length} 家 · ${apiKeys.filter(k => EXCHANGES.some(e => e.name === k.provider)).length} 已配置`}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {EXCHANGES.map(ex => {
          const key = getExchangeKey(ex.name);
          const configured = !!key;
          const isEditing = editExchange === ex.name;

          return (
            <Box
              key={ex.name}
              sx={{
                border: `1px solid ${isEditing ? `${COLOR_INK}` : `${COLOR_INK_FAINT}55`}`,
                bgcolor: isEditing ? 'rgba(244,236,223,0.04)' : 'rgba(244,236,223,0.02)',
                transition: 'all 200ms',
              }}
            >
              {/* Row header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 1.8 }}>
                <Box sx={{ width: 3, alignSelf: 'stretch', bgcolor: configured ? COLOR_GAIN : COLOR_INK_FAINT, opacity: configured ? 1 : 0.4 }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.4, mb: 0.6 }}>
                    <Typography
                      sx={{
                        fontFamily: FONT_DISPLAY,
                        fontStyle: 'italic',
                        fontSize: 22,
                        color: COLOR_INK,
                        letterSpacing: '-0.015em',
                        lineHeight: 1,
                        fontVariationSettings: '"opsz" 72',
                      }}
                    >
                      {ex.label}
                    </Typography>
                    <ItalicSerif size={12} color={COLOR_INK_FAINT}>{ex.sub}</ItalicSerif>
                    <StatusBadge tone={configured ? 'gain' : 'faint'} label={configured ? '已配置' : '未配置'} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    {ex.features.map(f => (
                      <MonoCaps key={f} size={9} color={COLOR_INK_FAINT} letterSpacing="0.22em">· {f}</MonoCaps>
                    ))}
                    {configured && key && (
                      <Typography
                        sx={{
                          fontFamily: FONT_MONO,
                          fontSize: 11,
                          color: COLOR_INK_MUTED,
                          fontFeatureSettings: '"tnum"',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {key.api_key_masked}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Pill
                    onClick={() => { setEditExchange(isEditing ? null : ex.name); setForm({}); }}
                    startIcon={configured ? <EditIcon size={11} /> : <AddIcon size={11} />}
                    variant="outline"
                  >
                    {configured ? '编辑' : '配置'}
                  </Pill>
                  {configured && (
                    <Pill onClick={() => setDeleteConfirm(ex.name)} startIcon={<DeleteIcon size={11} />} tone="loss" variant="outline">
                      删除
                    </Pill>
                  )}
                </Box>
              </Box>

              {/* Edit form */}
              <Collapse in={isEditing}>
                <Box sx={{ px: 2.5, pb: 2.5, pt: 1.5, display: 'flex', flexDirection: 'column', gap: 2, borderTop: `1px solid ${COLOR_INK_FAINT}33` }}>
                  {ex.fields.map(field => (
                    <EditorialInput
                      key={field}
                      label={field.replace(/_/g, ' ')}
                      value={form[field] || ''}
                      onChange={(v) => setForm({ ...form, [field]: v })}
                      type={showSecret[field] ? 'text' : 'password'}
                      placeholder={configured ? '留空不修改' : ''}
                      endAdornment={
                        <Box
                          onClick={() => setShowSecret({ ...showSecret, [field]: !showSecret[field] })}
                          sx={{ cursor: 'pointer', color: COLOR_INK_FAINT, display: 'inline-flex', '&:hover': { color: COLOR_INK } }}
                        >
                          {showSecret[field] ? <VisibilityOffIcon size={14} /> : <VisibilityIcon size={14} />}
                        </Box>
                      }
                    />
                  ))}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 1 }}>
                    <Pill onClick={() => setEditExchange(null)} variant="ghost">取消</Pill>
                    <Pill
                      onClick={() => handleSave(ex.name)}
                      disabled={saving}
                      startIcon={<SaveIcon size={11} />}
                      variant="solid"
                    >
                      {saving ? '保存中…' : '保存'}
                    </Pill>
                  </Box>
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Box>

      <EditorialDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="确认删除"
        kicker="confirm delete"
        body="确定要删除此交易所的 API Key 配置吗？此操作不可撤销。"
        actions={
          <>
            <Pill onClick={() => setDeleteConfirm(null)} variant="ghost">取消</Pill>
            <Pill onClick={() => deleteConfirm && handleDelete(deleteConfirm)} tone="loss" variant="outline">删除</Pill>
          </>
        }
      />
    </Box>
  );
}

/* ═══════════════ Interface For LLMs (Aggregators) ═══════════════ */

const AGGREGATOR_META: Record<AggregatorProvider, { tagline: string }> = {
  aihubmix: { tagline: '国内友好 · 单一 Key 访问 GPT/Claude/Gemini/DeepSeek 等' },
  openrouter: { tagline: '全球开放 · 覆盖 300+ 模型，余额实时可查' },
};

function formatCredits(balance: AggregatorBalance | null | undefined): {
  text: string;
  tone: 'gain' | 'loss' | 'neutral';
} | null {
  if (!balance) return null;
  if (balance.credits == null) return null;
  const c = balance.credits;
  const text = `${balance.currency === 'USD' ? '$' : ''}${c.toFixed(2)}`;
  let tone: 'gain' | 'loss' | 'neutral' = 'gain';
  if (c < 1) tone = 'loss';
  else if (c < 5) tone = 'neutral';
  return { text, tone };
}

function toneToColor(tone: 'gain' | 'loss' | 'neutral'): string {
  if (tone === 'gain') return COLOR_GAIN;
  if (tone === 'loss') return COLOR_LOSS;
  return COLOR_NEUTRAL;
}

function InterfaceForLLMs() {
  const [configs, setConfigs] = useState<AggregatorConfig[]>([]);
  const [balances, setBalances] = useState<Record<string, AggregatorBalance | null>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [verifying, setVerifying] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<AggregatorProvider | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const items = await adminApi.aggregators.list();
      setConfigs(items);
      items.forEach(cfg => {
        if (cfg.configured && cfg.supports_balance) {
          adminApi.aggregators.balance(cfg.provider as AggregatorProvider)
            .then(r => setBalances(prev => ({ ...prev, [cfg.provider]: r.balance || null })))
            .catch(() => {});
        }
      });
    } catch {
      toast.error('加载聚合 Provider 失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleVerify = async (provider: AggregatorProvider) => {
    const key = inputs[provider]?.trim();
    if (!key) { toast.error('请先输入 API Key'); return; }
    setVerifying(prev => ({ ...prev, [provider]: true }));
    try {
      const r = await adminApi.aggregators.verify(provider, key);
      if (r.valid) {
        const balanceInfo = formatCredits(r.balance);
        toast.success(balanceInfo
          ? `Key 有效 · 余额 ${balanceInfo.text}`
          : 'Key 有效（余额查询不支持）');
      } else {
        toast.error(r.error || 'Key 无效');
      }
    } catch (e: unknown) {
      toast.error((e as { message?: string })?.message || '验证失败');
    } finally {
      setVerifying(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleSave = async (provider: AggregatorProvider) => {
    const key = inputs[provider]?.trim();
    if (!key) { toast.error('请先输入 API Key'); return; }
    setSaving(prev => ({ ...prev, [provider]: true }));
    try {
      await adminApi.aggregators.save(provider, key);
      toast.success('已保存');
      setInputs(prev => ({ ...prev, [provider]: '' }));
      setEditing(prev => ({ ...prev, [provider]: false }));
      await load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } }; message?: string };
      toast.error(err?.response?.data?.detail || err?.message || '保存失败');
    } finally {
      setSaving(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleRefreshBalance = async (provider: AggregatorProvider) => {
    setRefreshing(prev => ({ ...prev, [provider]: true }));
    try {
      const r = await adminApi.aggregators.balance(provider);
      setBalances(prev => ({ ...prev, [provider]: r.balance || null }));
      const balanceInfo = formatCredits(r.balance);
      if (balanceInfo) toast.success(`余额 ${balanceInfo.text}`);
      else toast.info('该 provider 暂不支持余额查询');
    } catch (e: unknown) {
      toast.error((e as { message?: string })?.message || '刷新失败');
    } finally {
      setRefreshing(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleDelete = async (provider: AggregatorProvider) => {
    try {
      await adminApi.aggregators.delete(provider);
      toast.success('已删除');
      setBalances(prev => { const next = { ...prev }; delete next[provider]; return next; });
      setDeleteConfirm(null);
      await load();
    } catch (e: unknown) {
      toast.error((e as { message?: string })?.message || '删除失败');
    }
  };

  return (
    <Box sx={{ mb: 5 }}>
      <SectionHead
        zh="LLM 聚合入口"
        en="interface for llms"
        meta={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ZapIcon size={10} style={{ color: COLOR_ACCENT }} />
            统一 KEY · 多家模型
          </span>
        }
      />

      <Typography
        sx={{
          fontFamily: FONT_BODY,
          fontStyle: 'italic',
          fontSize: 13,
          color: COLOR_INK_MUTED,
          mb: 2,
          lineHeight: 1.6,
        }}
      >
        单一 API Key 访问多家模型。密钥仅属于当前账号，已加密存储。
      </Typography>

      {loading ? (
        <LoadingDot text="加载中" />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {configs.map(cfg => {
            const provider = cfg.provider as AggregatorProvider;
            const meta = AGGREGATOR_META[provider];
            const balance = balances[provider];
            const balanceInfo = formatCredits(balance);
            const isEditing = editing[provider] || !cfg.configured;
            const inputVal = inputs[provider] ?? '';

            return (
              <Box
                key={provider}
                sx={{
                  position: 'relative',
                  border: `1px solid ${cfg.configured ? `${COLOR_INK_FAINT}66` : `${COLOR_INK_FAINT}33`}`,
                  bgcolor: 'rgba(244,236,223,0.02)',
                  px: 2.5,
                  py: 2.4,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.6,
                }}
              >
                <Box sx={{ position: 'absolute', left: 0, top: 12, bottom: 12, width: 2, bgcolor: cfg.configured ? COLOR_GAIN : COLOR_INK_FAINT, opacity: cfg.configured ? 1 : 0.4 }} />

                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: FONT_DISPLAY,
                        fontStyle: 'italic',
                        fontSize: 20,
                        color: COLOR_INK,
                        letterSpacing: '-0.015em',
                        lineHeight: 1.1,
                        fontVariationSettings: '"opsz" 72',
                      }}
                    >
                      {cfg.display_name}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: FONT_BODY,
                        fontStyle: 'italic',
                        fontSize: 12,
                        color: COLOR_INK_MUTED,
                        mt: 0.4,
                        lineHeight: 1.5,
                      }}
                    >
                      {meta.tagline}
                    </Typography>
                  </Box>
                  {cfg.configured && <StatusBadge tone="gain" label="已配置" />}
                </Box>

                {/* Configured read-only */}
                {cfg.configured && !isEditing && (
                  <>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        py: 1,
                        px: 1.4,
                        border: `1px solid ${COLOR_INK_FAINT}33`,
                        bgcolor: 'rgba(0,0,0,0.18)',
                      }}
                    >
                      <Typography
                        sx={{
                          flex: 1,
                          fontFamily: FONT_MONO,
                          fontSize: 12,
                          color: COLOR_INK_MUTED,
                          fontFeatureSettings: '"tnum"',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {cfg.api_key_masked || '****'}
                      </Typography>
                      {cfg.supports_balance && balanceInfo && (
                        <Typography
                          sx={{
                            fontFamily: FONT_MONO,
                            fontSize: 13,
                            fontWeight: 600,
                            color: toneToColor(balanceInfo.tone),
                            fontFeatureSettings: '"tnum"',
                          }}
                        >
                          {balanceInfo.text}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      {cfg.supports_balance && (
                        <Pill
                          onClick={() => handleRefreshBalance(provider)}
                          disabled={refreshing[provider]}
                          startIcon={<RefreshIcon size={11} />}
                          variant="outline"
                          size="sm"
                        >
                          {refreshing[provider] ? '刷新中…' : '刷新余额'}
                        </Pill>
                      )}
                      <Pill
                        onClick={() => setEditing(prev => ({ ...prev, [provider]: true }))}
                        startIcon={<EditIcon size={11} />}
                        variant="outline"
                        size="sm"
                      >
                        更换 Key
                      </Pill>
                      <Box sx={{ flex: 1 }} />
                      <Pill
                        onClick={() => setDeleteConfirm(provider)}
                        startIcon={<DeleteIcon size={11} />}
                        tone="loss"
                        variant="outline"
                        size="sm"
                      >
                        删除
                      </Pill>
                    </Box>

                    {!cfg.supports_balance && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: COLOR_INK_FAINT, fontFamily: FONT_BODY, fontStyle: 'italic', fontSize: 11 }}>
                        <AlertIcon size={11} />
                        该 provider 暂不支持通过 API 查询余额
                      </Box>
                    )}
                  </>
                )}

                {/* Edit / Add */}
                {isEditing && (
                  <>
                    <EditorialInput
                      label="api key"
                      type={showKey[provider] ? 'text' : 'password'}
                      placeholder={`sk-... (${cfg.display_name} API Key)`}
                      value={inputVal}
                      onChange={(v) => setInputs(prev => ({ ...prev, [provider]: v }))}
                      endAdornment={
                        <Box
                          onClick={() => setShowKey(prev => ({ ...prev, [provider]: !prev[provider] }))}
                          sx={{ cursor: 'pointer', color: COLOR_INK_FAINT, display: 'inline-flex', '&:hover': { color: COLOR_INK } }}
                        >
                          {showKey[provider] ? <VisibilityOffIcon size={14} /> : <VisibilityIcon size={14} />}
                        </Box>
                      }
                    />

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Pill
                        onClick={() => handleVerify(provider)}
                        disabled={!inputVal || verifying[provider] || saving[provider]}
                        startIcon={<ShieldCheckIcon size={11} />}
                        variant="outline"
                        size="sm"
                      >
                        {verifying[provider] ? '验证中…' : '验证'}
                      </Pill>
                      <Pill
                        onClick={() => handleSave(provider)}
                        disabled={!inputVal || saving[provider] || verifying[provider]}
                        startIcon={<SaveIcon size={11} />}
                        variant="solid"
                        size="sm"
                      >
                        {saving[provider] ? '保存中…' : '保存'}
                      </Pill>
                      <Box sx={{ flex: 1 }} />
                      {cfg.configured && (
                        <Pill
                          onClick={() => {
                            setEditing(prev => ({ ...prev, [provider]: false }));
                            setInputs(prev => ({ ...prev, [provider]: '' }));
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          取消
                        </Pill>
                      )}
                    </Box>
                  </>
                )}
              </Box>
            );
          })}
        </Box>
      )}

      <EditorialDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="确认删除"
        kicker="confirm delete"
        body={deleteConfirm ? `确定删除 ${deleteConfirm} 的 Key 配置？此操作不可撤销。` : ''}
        actions={
          <>
            <Pill onClick={() => setDeleteConfirm(null)} variant="ghost">取消</Pill>
            <Pill onClick={() => deleteConfirm && handleDelete(deleteConfirm)} tone="loss" variant="outline">删除</Pill>
          </>
        }
      />
    </Box>
  );
}

/* ═══════════════ Models Tab ═══════════════ */

function ModelsTab() {
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [editForm, setEditForm] = useState<Record<string, unknown>>({});
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const provRes = await adminApi.llmProviders.list();
      setProviders(provRes.items);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAddModel = async (providerName: string) => {
    setAddDialogOpen(false);
    const defaults = PROVIDER_DEFAULTS[providerName];
    setEditForm({
      _isNew: true,
      provider: providerName,
      model: defaults.model,
      display_name: getProviderDisplayName(providerName),
      api_key: '',
      base_url: defaults.base_url || '',
      temperature: 0,
      max_tokens: 4096,
      is_default: false,
    });
    setExpandedId('_new');
  };

  const handleSaveNew = async () => {
    if (!editForm.api_key) { toast.error('请输入 API Key'); return; }
    setSaving(true);
    try {
      await adminApi.llmProviders.createWithKey({
        provider: editForm.provider as string,
        model: editForm.model as string,
        display_name: editForm.display_name as string,
        api_key: editForm.api_key as string,
        base_url: (editForm.base_url as string) || undefined,
        temperature: editForm.temperature as number,
        max_tokens: editForm.max_tokens as number,
        is_default: editForm.is_default as boolean,
      });
      toast.success('模型已添加');
      setExpandedId(null);
      setEditForm({});
      load();
    } catch (e: unknown) { toast.error((e as { message?: string })?.message || '创建失败'); }
    finally { setSaving(false); }
  };

  const handleSaveEdit = async (id: string) => {
    setSaving(true);
    try {
      const update: Record<string, unknown> = {};
      if (editForm.model) update.model = editForm.model;
      if (editForm.display_name) update.display_name = editForm.display_name;
      if (editForm.api_key) update.api_key = editForm.api_key;
      if (editForm.is_default !== undefined) update.is_default = editForm.is_default;
      if (editForm.is_active !== undefined) update.is_active = editForm.is_active;
      const config: Record<string, unknown> = {};
      if (editForm.base_url !== undefined) config.base_url = editForm.base_url;
      if (editForm.temperature !== undefined) config.temperature = editForm.temperature;
      if (editForm.max_tokens !== undefined) config.max_tokens = editForm.max_tokens;
      if (Object.keys(config).length > 0) update.config = config;

      await adminApi.llmProviders.update(id, update);
      toast.success('已更新');
      setExpandedId(null);
      setEditForm({});
      load();
    } catch (e: unknown) { toast.error((e as { message?: string })?.message || '更新失败'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id: string, field: 'is_active' | 'is_default', value: boolean) => {
    try {
      await adminApi.llmProviders.update(id, { [field]: value });
      load();
    } catch { toast.error('操作失败'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.llmProviders.delete(id);
      toast.success('已删除');
      setDeleteConfirm(null);
      load();
    } catch (e: unknown) { toast.error((e as { message?: string })?.message || '删除失败'); }
  };

  const startEdit = (p: LLMProvider) => {
    setEditForm({
      provider: p.provider,
      model: p.model,
      display_name: p.display_name,
      api_key: '',
      base_url: p.config?.base_url || '',
      temperature: p.config?.temperature ?? 0,
      max_tokens: p.config?.max_tokens ?? 4096,
      is_default: p.is_default,
      is_active: p.is_active,
    });
    setShowKey(false);
    setExpandedId(expandedId === p.id ? null : p.id);
  };

  if (loading) return <LoadingDot text="加载中" />;

  return (
    <Box>
      {/* Aggregator block */}
      <InterfaceForLLMs />

      {/* Direct LLM models */}
      <SectionHead
        zh="LLM 模型"
        en="direct provider keys"
        meta={`${providers.length} 个模型`}
        right={
          <Pill onClick={() => setAddDialogOpen(true)} startIcon={<AddIcon size={11} />} variant="solid">
            添加模型
          </Pill>
        }
      />

      {providers.length === 0 && expandedId !== '_new' ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography
            sx={{
              fontFamily: FONT_DISPLAY,
              fontStyle: 'italic',
              fontSize: 24,
              color: COLOR_INK_FAINT,
              letterSpacing: '-0.015em',
              fontVariationSettings: '"opsz" 72',
              mb: 1,
            }}
          >
            尚未配置任何模型
          </Typography>
          <Typography
            sx={{
              fontFamily: FONT_BODY,
              fontStyle: 'italic',
              fontSize: 13,
              color: COLOR_INK_FAINT,
              mb: 3,
            }}
          >
            添加你的第一个模型以启用直连 LLM provider。
          </Typography>
          <Box sx={{ display: 'inline-flex' }}>
            <Pill onClick={() => setAddDialogOpen(true)} startIcon={<AddIcon size={11} />} variant="solid">
              添加第一个模型
            </Pill>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* New model form */}
          {expandedId === '_new' && editForm._isNew === true && (
            <ModelEditCard
              editForm={editForm} setEditForm={setEditForm}
              showKey={showKey} setShowKey={setShowKey}
              saving={saving}
              isNew
              onSave={handleSaveNew}
              onCancel={() => { setExpandedId(null); setEditForm({}); }}
            />
          )}

          {providers.map(p => (
            <Box
              key={p.id}
              sx={{
                border: `1px solid ${expandedId === p.id ? COLOR_INK : `${COLOR_INK_FAINT}55`}`,
                bgcolor: expandedId === p.id ? 'rgba(244,236,223,0.04)' : 'rgba(244,236,223,0.02)',
                transition: 'all 200ms',
              }}
            >
              {/* Row */}
              <Box
                onClick={() => startEdit(p)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.8,
                  px: 2.4,
                  py: 1.4,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(244,236,223,0.04)' },
                }}
              >
                <Box sx={{ width: 3, alignSelf: 'stretch', bgcolor: p.is_active ? COLOR_GAIN : COLOR_INK_FAINT, opacity: p.is_active ? 1 : 0.4 }} />
                <ModelLogo provider={p.provider} size={22} isDark={true} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.2, mb: 0.2 }}>
                    <Typography
                      sx={{
                        fontFamily: FONT_DISPLAY,
                        fontStyle: 'italic',
                        fontSize: 17,
                        color: COLOR_INK,
                        letterSpacing: '-0.01em',
                        fontVariationSettings: '"opsz" 36',
                      }}
                    >
                      {p.model}
                    </Typography>
                    {p.is_default && (
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.4,
                          fontFamily: FONT_MONO,
                          fontSize: 9,
                          letterSpacing: '0.22em',
                          textTransform: 'uppercase',
                          color: COLOR_NEUTRAL,
                          border: `1px solid ${COLOR_NEUTRAL}55`,
                          px: 0.7,
                          py: 0.2,
                        }}
                      >
                        <StarIcon size={9} /> 默认
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.2 }}>
                    <ItalicSerif size={12} color={COLOR_INK_MUTED}>{getProviderDisplayName(p.provider)}</ItalicSerif>
                    {p.config?.temperature != null && (
                      <Typography sx={{ fontFamily: FONT_MONO, fontSize: 10, color: COLOR_INK_FAINT, fontFeatureSettings: '"tnum"', letterSpacing: '0.18em' }}>
                        TEMP {Number(p.config.temperature).toFixed(1)}
                      </Typography>
                    )}
                    {p.config?.max_tokens != null && (
                      <Typography sx={{ fontFamily: FONT_MONO, fontSize: 10, color: COLOR_INK_FAINT, fontFeatureSettings: '"tnum"', letterSpacing: '0.18em' }}>
                        MAX {p.config.max_tokens}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Switch
                  checked={p.is_active}
                  onChange={(e) => { e.stopPropagation(); handleToggle(p.id, 'is_active', !p.is_active); }}
                  onClick={(e) => e.stopPropagation()}
                  size="small"
                  sx={{
                    p: 0.5,
                    '& .MuiSwitch-switchBase': { color: COLOR_INK_FAINT, p: 0.5 },
                    '& .MuiSwitch-track': { bgcolor: `${COLOR_INK_FAINT}66`, borderRadius: 1 },
                    '& .MuiSwitch-switchBase.Mui-checked': { color: COLOR_INK },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: `${COLOR_GAIN}99 !important`, opacity: 1 },
                    '& .MuiSwitch-thumb': { borderRadius: 0.5, width: 14, height: 14 },
                  }}
                />
                <MonoCaps size={9} color={COLOR_INK_FAINT} letterSpacing="0.24em">
                  {expandedId === p.id ? '收起 ▲' : '展开 ▼'}
                </MonoCaps>
              </Box>

              <Collapse in={expandedId === p.id}>
                <ModelEditCard
                  editForm={editForm} setEditForm={setEditForm}
                  showKey={showKey} setShowKey={setShowKey}
                  saving={saving}
                  isNew={false}
                  onSave={() => handleSaveEdit(p.id)}
                  onCancel={() => { setExpandedId(null); setEditForm({}); }}
                  onDelete={() => setDeleteConfirm(p.id)}
                  onToggleDefault={() => handleToggle(p.id, 'is_default', !p.is_default)}
                  isDefault={p.is_default}
                />
              </Collapse>
            </Box>
          ))}
        </Box>
      )}

      {/* Add Model picker dialog */}
      <EditorialDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        title="选择 LLM 厂商"
        kicker="add direct provider"
        width={420}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
          {PROVIDERS.map(p => (
            <Box
              key={p}
              onClick={() => handleAddModel(p)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 1.6,
                py: 1.4,
                border: `1px solid ${COLOR_INK_FAINT}33`,
                cursor: 'pointer',
                transition: 'all 180ms',
                '&:hover': { bgcolor: 'rgba(244,236,223,0.04)', borderColor: `${COLOR_INK_FAINT}99` },
              }}
            >
              <ModelLogo provider={p} size={24} isDark={true} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: FONT_DISPLAY,
                    fontStyle: 'italic',
                    fontSize: 15,
                    color: COLOR_INK,
                    letterSpacing: '-0.01em',
                    fontVariationSettings: '"opsz" 36',
                  }}
                >
                  {getProviderDisplayName(p)}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: FONT_MONO,
                    fontSize: 10.5,
                    color: COLOR_INK_FAINT,
                    fontFeatureSettings: '"tnum"',
                    letterSpacing: '0.04em',
                    mt: 0.2,
                  }}
                >
                  {PROVIDER_DEFAULTS[p].model}
                </Typography>
              </Box>
              <MonoCaps size={9} color={COLOR_INK_MUTED}>选择 →</MonoCaps>
            </Box>
          ))}
        </Box>
      </EditorialDialog>

      <EditorialDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="确认删除"
        kicker="confirm delete"
        body="确定要删除此模型配置吗？关联的 API Key 也会被一并删除。"
        actions={
          <>
            <Pill onClick={() => setDeleteConfirm(null)} variant="ghost">取消</Pill>
            <Pill onClick={() => deleteConfirm && handleDelete(deleteConfirm)} tone="loss" variant="outline">删除</Pill>
          </>
        }
      />
    </Box>
  );
}

/* ─── Shared Model Edit Card ─── */

function ModelEditCard({
  editForm, setEditForm,
  showKey, setShowKey,
  saving, isNew,
  onSave, onCancel,
  onDelete, onToggleDefault, isDefault,
}: {
  editForm: Record<string, unknown>;
  setEditForm: (f: Record<string, unknown>) => void;
  showKey: boolean;
  setShowKey: (v: boolean) => void;
  saving: boolean;
  isNew: boolean;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  onToggleDefault?: () => void;
  isDefault?: boolean;
}) {
  const provider = (editForm.provider as string) || '';
  const model = (editForm.model as string) || '';
  const apiKey = (editForm.api_key as string) || '';
  const baseUrl = (editForm.base_url as string) || '';
  const temperature = (editForm.temperature as number) ?? 0;
  const maxTokens = (editForm.max_tokens as number) ?? 4096;

  return (
    <Box
      sx={{
        px: 2.4,
        pt: isNew ? 2.4 : 2,
        pb: 2.2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        borderTop: isNew ? 'none' : `1px solid ${COLOR_INK_FAINT}33`,
        border: isNew ? `1px solid ${COLOR_INK}` : 'none',
        bgcolor: isNew ? 'rgba(244,236,223,0.05)' : undefined,
      }}
    >
      {isNew && (
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.2, mb: 0.5 }}>
          <Typography
            sx={{
              fontFamily: FONT_DISPLAY,
              fontStyle: 'italic',
              fontSize: 18,
              color: COLOR_INK,
              letterSpacing: '-0.015em',
              fontVariationSettings: '"opsz" 36',
            }}
          >
            添加新模型
          </Typography>
          <MonoCaps size={9}>new direct key</MonoCaps>
        </Box>
      )}

      {/* Row 1: Provider + Model */}
      <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <Box sx={{ minWidth: 160 }}>
          <MonoCaps size={9} color={COLOR_INK_FAINT} letterSpacing="0.22em">llm 厂商</MonoCaps>
          {isNew ? (
            <Box sx={{ borderBottom: `1px solid ${COLOR_INK_FAINT}88`, mt: 0.4, py: 0.6, '&:focus-within': { borderColor: COLOR_INK } }}>
              <select
                value={provider}
                onChange={(e) => {
                  const p = e.target.value;
                  const d = PROVIDER_DEFAULTS[p];
                  if (d) setEditForm({ ...editForm, provider: p, model: d.model, base_url: d.base_url || '' });
                }}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: COLOR_INK,
                  fontFamily: FONT_BODY,
                  fontStyle: 'italic',
                  fontSize: 14,
                  outline: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                {PROVIDERS.map((p) => (
                  <option key={p} value={p} style={{ background: COLOR_BG_RAISED, color: COLOR_INK, fontStyle: 'italic' }}>
                    {getProviderDisplayName(p)}
                  </option>
                ))}
              </select>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.4, py: 0.6, borderBottom: `1px solid ${COLOR_INK_FAINT}33` }}>
              <ModelLogo provider={provider} size={16} isDark={true} />
              <ItalicSerif size={14} color={COLOR_INK}>{getProviderDisplayName(provider)}</ItalicSerif>
            </Box>
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <EditorialInput
            label="模型 id"
            value={model}
            onChange={(v) => setEditForm({ ...editForm, model: v })}
          />
        </Box>
      </Box>

      {/* Row 2: API Key + Base URL */}
      <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 240 }}>
          <EditorialInput
            label={isNew ? 'api key' : 'api key (留空不修改)'}
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(v) => setEditForm({ ...editForm, api_key: v })}
            endAdornment={
              <Box
                onClick={() => setShowKey(!showKey)}
                sx={{ cursor: 'pointer', color: COLOR_INK_FAINT, display: 'inline-flex', '&:hover': { color: COLOR_INK } }}
              >
                {showKey ? <VisibilityOffIcon size={14} /> : <VisibilityIcon size={14} />}
              </Box>
            }
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 240 }}>
          <EditorialInput
            label="base url (可选)"
            value={baseUrl}
            onChange={(v) => setEditForm({ ...editForm, base_url: v })}
            placeholder="使用默认"
            fontFamily={FONT_BODY}
          />
        </Box>
      </Box>

      {/* Row 3: Temperature + Max Tokens + actions */}
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <EditorialSlider
          value={temperature}
          onChange={(v) => setEditForm({ ...editForm, temperature: v })}
          min={0}
          max={2}
          step={0.1}
          label="temperature"
        />
        <EditorialNumber
          value={maxTokens}
          onChange={(v) => setEditForm({ ...editForm, max_tokens: v })}
          label="max tokens"
          width={108}
        />
        <Box sx={{ flex: 1 }} />
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {onToggleDefault && (
            <Pill
              onClick={onToggleDefault}
              startIcon={<StarIcon size={11} />}
              tone={isDefault ? 'neutral' : 'default'}
              variant="outline"
              size="sm"
            >
              {isDefault ? '默认' : '设为默认'}
            </Pill>
          )}
          {onDelete && (
            <Pill onClick={onDelete} startIcon={<DeleteIcon size={11} />} tone="loss" variant="outline" size="sm">
              删除
            </Pill>
          )}
          <Pill onClick={onCancel} variant="ghost" size="sm">取消</Pill>
          <Pill
            onClick={onSave}
            disabled={saving}
            startIcon={<SaveIcon size={11} />}
            variant="solid"
            size="sm"
          >
            {saving ? '保存中…' : '保存'}
          </Pill>
        </Box>
      </Box>
    </Box>
  );
}
