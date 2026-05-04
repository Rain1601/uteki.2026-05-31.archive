import { NavLink, useLocation } from 'react-router-dom';
import {
  Newspaper,
  LineChart,
  Bot,
  Building2,
  Activity,
  Home,
  ArrowLeft,
} from 'lucide-react';
import { useSidebar } from '../contexts/SidebarContext';
import { useT } from '../i18n/I18nProvider';
import { STRINGS } from '../i18n/strings';
import { COLOR_INK_FAINT } from '../theme/editorialTokens';

const COLLAPSED = 56;
const EXPANDED = 220;

const NAV_ITEMS = [
  { to: '/dashboard', icon: LineChart, label: STRINGS.nav.dashboard },
  { to: '/news-timeline', icon: Newspaper, label: STRINGS.nav.news },
  { to: '/agent', icon: Bot, label: STRINGS.nav.agent },
  { to: '/company-agent', icon: Building2, label: STRINGS.nav.companyAgent },
  { to: '/macro/market-dashboard', icon: Activity, label: STRINGS.nav.market },
];

export default function HoverSidebar() {
  const { expanded, setExpanded } = useSidebar();
  const t = useT();
  const loc = useLocation();
  const onLanding = loc.pathname === '/';

  if (onLanding) return null;

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{
        width: expanded ? EXPANDED : COLLAPSED,
        transition: 'width 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        borderRight: `1px solid ${COLOR_INK_FAINT}33`,
      }}
      className="h-screen flex-shrink-0 bg-[#161310] flex flex-col py-4 z-40 sticky top-0"
    >
      {/* Brand mark */}
      <div className="px-4 mb-6 h-7 flex items-center overflow-hidden whitespace-nowrap">
        <span className="font-display italic-display text-ink text-[20px] leading-none">u</span>
        <span
          className="font-display italic-display text-ink text-[20px] leading-none"
          style={{
            opacity: expanded ? 1 : 0,
            transition: 'opacity 180ms',
            marginLeft: 1,
          }}
        >
          teki
        </span>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors',
                isActive
                  ? 'bg-[#221d18] text-ink'
                  : 'text-ink-muted hover:text-ink hover:bg-[#1d1915]',
              ].join(' ')
            }
            title={t(label)}
          >
            <Icon size={16} strokeWidth={1.5} className="flex-shrink-0" />
            <span
              className="truncate font-body text-[13px]"
              style={{
                opacity: expanded ? 1 : 0,
                transition: 'opacity 180ms',
              }}
            >
              {t(label)}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="px-2 mt-2">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded text-sm text-ink-faint hover:text-ink-muted transition-colors"
          title={t(STRINGS.nav.home)}
        >
          {expanded ? <ArrowLeft size={14} strokeWidth={1.5} /> : <Home size={16} strokeWidth={1.5} />}
          <span
            className="truncate font-body text-[12px]"
            style={{ opacity: expanded ? 1 : 0, transition: 'opacity 180ms' }}
          >
            {t(STRINGS.nav.home)}
          </span>
        </NavLink>
      </div>
    </aside>
  );
}
