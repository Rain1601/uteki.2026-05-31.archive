import { Outlet } from 'react-router-dom';
import HoverSidebar from './HoverSidebar';
import LangToggle from './LangToggle';
import { BACKGROUND_PAPER, COLOR_BG, COLOR_INK } from '../theme/editorialTokens';
import { useEmbed } from '../hooks/useEmbed';

export default function Layout() {
  const embed = useEmbed();
  return (
    <div
      className="min-h-screen flex"
      style={{
        backgroundColor: COLOR_BG,
        color: COLOR_INK,
        backgroundImage: BACKGROUND_PAPER,
      }}
    >
      {!embed && <HoverSidebar />}
      <main className="flex-1 min-w-0 relative">
        {!embed && (
          <div className="absolute top-4 right-5 z-50">
            <LangToggle />
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
