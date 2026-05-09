import { Menu, Sprout } from 'lucide-react';
import { Button } from '../ui';
import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { mobileRoutes, routes } from '../../config/routes';
import { useTimeZone } from '../../hooks/useTimeZone';

function pageTitle(pathname: string) {
  return routes.find((route) => route.path === pathname)?.label ?? 'Smart Farm';
}

export function AppShell() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { timezone } = useTimeZone();
  const location = useLocation();
  const groupedRoutes = useMemo(() => {
    const groups = new Map<string, typeof routes>();
    routes.forEach((route) => {
      const key = route.group ?? 'main';
      groups.set(key, [...(groups.get(key) ?? []), route]);
    });
    return groups;
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem('dashboard.sidebar.collapsed');
    setCollapsed(saved === 'true');
  }, []);

  useEffect(() => {
    window.localStorage.setItem('dashboard.sidebar.collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const stored = window.localStorage.getItem('smartFarm.chartTheme');
    document.documentElement.classList.toggle('dark', stored === 'dark');
  }, []);

  const onHamburgerClick = () => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      setCollapsed((prev) => !prev);
      return;
    }
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 md:p-3">
      {/* Mobile overlay backdrop */}
      {open ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-20 bg-zinc-950/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      {/* App frame: full-bleed on mobile, max-width container on desktop */}
      <div className="flex min-h-screen md:max-w-[1440px] md:mx-auto">

        {/* Sidebar: fixed overlay on mobile, inline flex on desktop */}
        <aside
          className={[
            'fixed inset-y-0 start-0 z-30 flex flex-col',
            'border-e border-zinc-200 bg-white/95 backdrop-blur',
            'dark:border-zinc-800 dark:bg-zinc-900/95',
            'transition-all duration-200',
            collapsed ? 'w-20 overflow-hidden' : 'w-[220px]',
            open ? 'translate-x-0' : '-translate-x-full',
            'md:sticky md:top-0 md:h-screen md:inset-auto md:translate-x-0 md:z-20 md:shrink-0 md:backdrop-blur-none md:rounded-2xl md:overflow-hidden',
          ].join(' ')}
        >
          {/* Logo / brand */}
          <div className={`flex h-14 shrink-0 items-center border-b border-zinc-200 dark:border-zinc-800 ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
            <Link
              to="/"
              className="flex min-w-0 items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              onClick={() => setOpen(false)}
            >
              <Sprout className="h-4 w-4 shrink-0 text-emerald-600" />
              {!collapsed ? <span className="truncate">Smart Farm</span> : null}
            </Link>
          </div>

          {/* Nav groups */}
          <nav
            className={`flex-1 space-y-4 p-3 text-sm ${
              collapsed
                ? 'overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
                : 'overflow-y-auto md:[scrollbar-width:thin] md:[&::-webkit-scrollbar]:w-1.5 md:[&::-webkit-scrollbar-thumb]:rounded-full md:[&::-webkit-scrollbar-thumb]:bg-zinc-300'
            }`}
          >
            {[...groupedRoutes.entries()].map(([group, items]) => (
              <div key={group}>
                {!collapsed && group !== 'main' ? (
                  <div className="px-3 pb-2 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                    {group}
                  </div>
                ) : null}
                <div className="space-y-1">
                  {items.map((route) => (
                    <NavLink
                      key={route.path}
                      to={route.path}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `group flex items-center transition-colors ${collapsed ? 'justify-center rounded-xl p-2.5' : 'gap-2.5 rounded-xl px-3 py-2'} ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                        }`
                      }
                    >
                      <route.icon className="h-4 w-4 shrink-0" />
                      {!collapsed || open ? <span className="truncate">{route.label}</span> : null}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar: fixed on mobile, inline on desktop */}
          <header className="fixed inset-x-0 top-0 z-10 border-b border-zinc-200 bg-white/95 px-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95 md:sticky md:inset-auto md:rounded-2xl md:border md:px-4 md:shadow-sm">
            <div className="flex h-12 min-w-0 items-center gap-3 md:h-14">
              <Button
                variant="secondary"
                size="sm"
                className="h-8 shrink-0 px-2"
                onClick={onHamburgerClick}
                aria-label="Toggle navigation"
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle navigation</span>
              </Button>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2 overflow-hidden">
                <h1 className="min-w-0 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100 md:text-base">
                  {pageTitle(location.pathname)}
                </h1>
                <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">{timezone}</span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="px-3 pb-24 pt-20 sm:px-4 md:px-6 md:pb-10 md:pt-6">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95 md:hidden">
        {mobileRoutes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            className={({ isActive }) =>
              `flex min-w-0 flex-col items-center gap-1 px-1 py-2 text-[11px] ${
                isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'
              }`
            }
          >
            <route.icon className="h-5 w-5" />
            {route.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
