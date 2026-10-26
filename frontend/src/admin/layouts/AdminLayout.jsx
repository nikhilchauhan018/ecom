import { useCallback, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import Sidebar from '../components/layout/Sidebar';
import { useTheme } from '../hooks/useTheme';
import { useHotkey } from '../hooks/useHotkey';

export default function AdminLayout() {
  const [navOpen, setNavOpen] = useState(true);
  const { theme, toggle } = useTheme();
  const searchRef = useRef(null);
  useHotkey('k', useCallback(() => searchRef.current?.focus(), []));

  return (
    <div className="tw-min-h-screen tw-bg-page tw-font-sans tw-text-sm tw-text-ink">
      <Topbar onToggleNav={() => setNavOpen((o) => !o)} theme={theme} onToggleTheme={toggle} searchRef={searchRef} />
      <div className={`tw-grid tw-min-h-[calc(100vh-64px)] tw-grid-cols-1 ${navOpen ? 'md:tw-grid-cols-[250px_1fr]' : ''}`}>
        {navOpen && <Sidebar />}
        <main className="tw-flex tw-min-w-0 tw-flex-col tw-gap-6 tw-p-4 md:tw-px-8 md:tw-pb-12 md:tw-pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
