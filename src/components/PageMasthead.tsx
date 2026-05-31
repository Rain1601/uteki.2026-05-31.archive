import type { ReactNode } from 'react';
import DemoBadge from './DemoBadge';

interface PageMastheadProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export default function PageMasthead({ eyebrow, title, subtitle, right }: PageMastheadProps) {
  return (
    <header className="px-5 md:px-12 pt-5 md:pt-8 pb-4 md:pb-6 border-b border-ink-faint/25 flex items-end justify-between gap-4 md:gap-6 flex-wrap">
      <div className="min-w-0">
        {eyebrow && (
          <div className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.24em] md:tracking-[0.28em] text-accent mb-1.5 md:mb-2">{eyebrow}</div>
        )}
        <h1 className="font-display italic-display text-[26px] sm:text-[30px] md:text-[42px] leading-tight text-ink tracking-[-0.01em]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 md:mt-2 font-body text-[13px] md:text-[14px] text-ink-muted">{subtitle}</p>
        )}
        <div className="mt-2 md:mt-3"><DemoBadge /></div>
      </div>
      {right && <div className="flex items-center gap-2 md:gap-3 flex-wrap">{right}</div>}
    </header>
  );
}
