import { useState } from 'react';
import { Mail, Check, Copy } from 'lucide-react';
import { useT } from '../../i18n/I18nProvider';
import { STRINGS } from '../../i18n/strings';

interface Props {
  email: string;
}

export default function CopyableEmail({ email }: Props) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // fallback: select via temporary textarea
      const ta = document.createElement('textarea');
      ta.value = email;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="group w-full text-left rounded border border-ink-faint/30 bg-[#1a1612]/60 p-5 hover:border-accent/60 hover:bg-[#1f1a16] transition-colors flex items-start gap-4"
      aria-label={`copy email ${email}`}
    >
      <Mail size={22} strokeWidth={1.4} className="text-ink-muted group-hover:text-ink transition-colors mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-faint mb-1 flex items-center gap-2">
          {t(STRINGS.contact.emailLabel)}
          <span className={`font-mono text-[9px] tracking-wider ${copied ? 'text-gain' : 'text-accent'}`}>
            · {copied ? t(STRINGS.contact.emailCopied) : t(STRINGS.contact.emailHint)}
          </span>
        </div>
        <div className="font-body text-[15px] text-ink truncate">{email}</div>
      </div>
      {copied ? (
        <Check size={16} strokeWidth={1.6} className="text-gain mt-1" />
      ) : (
        <Copy size={14} strokeWidth={1.5} className="text-ink-faint group-hover:text-ink transition-colors mt-1" />
      )}
    </button>
  );
}
