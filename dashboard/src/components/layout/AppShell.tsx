import { Menu } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { mobileRoutes, routes } from '../../config/routes';
import { useTimeZone } from '../../hooks/useTimeZone';

function pageTitle(pathname: string) {
  return routes.find((route) => route.path === pathname)?.label ?? 'Smart Farm';
}

export function AppShell() {
  const [open, setOpen] = useState(false);
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

  return (
    <div className="min-h-screen bg-slate-50">
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-slate-200 bg-white transition-transform md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center gap-2 border-b border-slate-200 px-4">
          <Menu className="h-5 w-5" />
          <Link to="/" className="font-semibold text-slate-900" onClick={() => setOpen(false)}>
            Smart Farm
          </Link>
        </div>
        <nav className="space-y-5 p-3 text-sm">
          {[...groupedRoutes.entries()].map(([group, items]) => (
            <div key={group}>
              {group !== 'main' ? <div className="px-3 pb-2 text-xs font-semibold uppercase text-slate-400">{group}</div> : null}
              <div className="space-y-1">
                {items.map((route) => (
                  <NavLink
                    key={route.path}
                    to={route.path}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-3 py-2 ${
                        isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                      }`
                    }
                  >
                    <route.icon className="h-4 w-4" />
                    <span>{route.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {open ? <button aria-label="Close navigation" className="fixed inset-0 z-20 bg-black/20 md:hidden" onClick={() => setOpen(false)} /> : null}

      <div className="md:pl-64">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
          <div className="flex items-center gap-3">
            <button className="rounded-md border border-slate-200 p-2 md:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900">{pageTitle(location.pathname)}</h1>
          </div>
          <div className="text-xs text-slate-500">All times shown in {timezone}</div>
        </header>
        <main className="p-4 pb-24 md:p-6">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-slate-200 bg-white md:hidden">
        {mobileRoutes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-1 py-2 text-[11px] ${isActive ? 'text-slate-950' : 'text-slate-500'}`
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

