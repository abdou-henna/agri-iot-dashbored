import { Menu } from 'lucide-react';
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

  const onHamburgerClick = () => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      setCollapsed((prev) => !prev);
      return;
    }
    setOpen(true);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside
        className={`fixed inset-y-0 start-0 z-30 flex ${collapsed ? 'w-20 md:overflow-hidden' : 'w-64'} flex-col border-e border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 transition-all transition-transform md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center border-b border-slate-200 px-4 dark:border-slate-800">
          {!collapsed ? (
            <Link to="/" className="truncate text-base font-semibold text-slate-900 dark:text-slate-100" onClick={() => setOpen(false)}>
              Smart Farm
            </Link>
          ) : null}
        </div>
        <nav
          className={`flex-1 space-y-4 p-3 text-sm ${
            collapsed
              ? 'overflow-hidden md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden'
              : 'overflow-y-auto md:[scrollbar-width:thin] md:[&::-webkit-scrollbar]:w-1.5 md:[&::-webkit-scrollbar-thumb]:rounded-full md:[&::-webkit-scrollbar-thumb]:bg-slate-300'
          }`}
        >
          {[...groupedRoutes.entries()].map(([group, items]) => (
            <div key={group}>
              {!collapsed && group !== 'main' ? <div className="px-3 pb-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{group}</div> : null}
              <div className="space-y-1.5">
                {items.map((route) => (
                  <NavLink
                    key={route.path}
                    to={route.path}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center ${collapsed ? 'justify-center' : ''} gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    <route.icon className="h-4 w-4 shrink-0" />
                    {!collapsed || open ? <span>{route.label}</span> : null}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {open ? <button aria-label="Close navigation" className="fixed inset-0 z-20 bg-slate-950/40 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)} /> : null}

      <div className={collapsed ? 'md:ps-20' : 'md:ps-64'}>
        <header className="fixed inset-x-0 top-0 z-10 border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur md:sticky md:inset-auto md:px-4 dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 sm:gap-3">
            <Button variant="secondary" size="sm" className="h-9 shrink-0 px-2.5" onClick={onHamburgerClick} aria-label="Toggle navigation">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle navigation</span>
            </Button>
            <h1 className="min-w-0 truncate text-base font-semibold text-slate-900 sm:text-lg dark:text-slate-100">{pageTitle(location.pathname)}</h1>
          </div>
          <div className="w-full text-xs text-slate-500 sm:w-auto sm:text-end dark:text-slate-400">All times shown in {timezone}</div>
        </header>
        <main className="px-3 pb-24 pt-20 sm:px-4 md:px-6 md:pb-6 md:pt-6">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
        {mobileRoutes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            className={({ isActive }) =>
              `flex min-w-0 flex-col items-center gap-1 px-1 py-2 text-[11px] ${isActive ? 'text-slate-950 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`
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
