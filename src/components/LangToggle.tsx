import { useI18n } from '../i18n/I18nProvider';

export default function LangToggle() {
  const { lang, setLang } = useI18n();
  const next = lang === 'zh' ? 'en' : 'zh';
  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      className="font-mono text-[11px] tracking-wide px-2 py-1 rounded border border-ink-faint/40 text-ink-muted hover:text-ink hover:border-accent/60 transition-colors"
      aria-label={`Switch to ${next === 'zh' ? '中文' : 'English'}`}
      title={next === 'zh' ? '中文' : 'English'}
    >
      {lang === 'zh' ? 'EN' : '中'}
    </button>
  );
}
