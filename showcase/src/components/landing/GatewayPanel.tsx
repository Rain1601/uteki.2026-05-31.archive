import { ArrowUpRight, Boxes, Globe2 } from 'lucide-react';
import { useT } from '../../i18n/I18nProvider';
import { STRINGS } from '../../i18n/strings';

const GATEWAYS = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    url: 'https://openrouter.ai',
    blurbZh: '300+ 模型 · 统一计费 · 自动 fallback',
    blurbEn: '300+ models · unified billing · automatic fallback',
    icon: Globe2,
  },
  {
    id: 'aihubmix',
    name: 'AIHubMix',
    url: 'https://aihubmix.com',
    blurbZh: '国内可达 · 兼容 OpenAI / Anthropic 协议',
    blurbEn: 'CN-friendly · OpenAI / Anthropic protocol compatible',
    icon: Boxes,
  },
];

export default function GatewayPanel() {
  const t = useT();
  return (
    <div className="rounded border border-accent/40 bg-gradient-to-br from-[#1f1812] to-[#1a1612] p-5 mb-6">
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
        <div>
          <h3 className="font-display italic-display text-[20px] text-ink leading-tight">
            {t(STRINGS.models.gatewayTitle)}
          </h3>
          <p className="font-body text-[13px] text-ink-muted leading-relaxed mt-1 max-w-2xl">
            {t(STRINGS.models.gatewaySub)}
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">recommended</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GATEWAYS.map((g) => {
          const Icon = g.icon;
          return (
            <a
              key={g.id}
              href={g.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded border border-ink-faint/30 bg-[#15130F]/50 p-4 hover:border-accent/70 hover:bg-[#1f1a16] transition-colors flex items-center gap-4"
            >
              <Icon size={26} strokeWidth={1.4} className="text-accent flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-display italic-display text-[18px] text-ink">{g.name}</span>
                  <span className="font-mono text-[10px] text-ink-faint truncate">{g.url.replace('https://', '')}</span>
                </div>
                <p className="font-body text-[12px] text-ink-muted leading-snug mt-0.5">
                  {t({ zh: g.blurbZh, en: g.blurbEn })}
                </p>
              </div>
              <ArrowUpRight size={14} strokeWidth={1.5} className="text-ink-faint group-hover:text-ink transition-colors" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
