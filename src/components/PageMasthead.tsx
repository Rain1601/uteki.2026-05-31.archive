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
    <header className="px-8 md:px-12 pt-8 pb-6 border-b border-ink-faint/25 flex items-end justify-between gap-6 flex-wrap">
      <div className="min-w-0">
        {eyebrow && (
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent mb-2">{eyebrow}</div>
        )}
        <h1 className="font-display italic-display text-[34px] md:text-[42px] leading-tight text-ink tracking-[-0.01em]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 font-body text-[14px] text-ink-muted">{subtitle}</p>
        )}
        <div className="mt-3"><DemoBadge /></div>
      </div>
      {right && <div className="flex items-center gap-3">{right}</div>}
    </header>
  );
}
