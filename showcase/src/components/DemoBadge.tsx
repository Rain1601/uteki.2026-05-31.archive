import { useT } from '../i18n/I18nProvider';
import { STRINGS } from '../i18n/strings';

export default function DemoBadge() {
  const t = useT();
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-neutral animate-shimmer" />
      {t(STRINGS.demoBadge)}
    </span>
  );
}
