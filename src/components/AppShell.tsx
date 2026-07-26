import { useCallback, useEffect, useState, type FC } from 'react';
import { NavContext, type TabId } from '../nav';
import ProjectionsView from '../views/ProjectionsView';
import InventarioView from '../views/InventarioView';

const ICONS: Record<TabId, string> = {
  proyecciones: 'M4 19V5M4 19h16M8 16l3-4 3 3 4-6',
  inventario: 'M4 6h16M4 12h16M4 18h10',
};

const TABS: { id: TabId; label: string; view: FC }[] = [
  { id: 'proyecciones', label: 'Proyecciones', view: ProjectionsView },
  { id: 'inventario', label: 'Inventario', view: InventarioView },
];

type Theme = 'light' | 'dark';

function initialTheme(): Theme {
  const saved = localStorage.getItem('ganado.theme') as Theme | null;
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function AppShell() {
  const [tab, setTab] = useState<TabId>('proyecciones');
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ganado.theme', theme);
  }, [theme]);

  const navigate = useCallback((to: TabId) => {
    setTab(to);
    window.scrollTo(0, 0);
  }, []);

  const active = TABS.find((t) => t.id === tab)!;
  const ActiveView = active.view;

  return (
    <NavContext.Provider value={{ navigate }}>
      <div className="phone">
        <div className="appbar">
          <h1>{active.label}</h1>
          <button
            type="button"
            className="keybtn"
            title="Cambiar tema"
            aria-label="Cambiar tema claro/oscuro"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        <main>
          <ActiveView />
        </main>
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={t.id === tab ? 'on' : ''}
              aria-current={t.id === tab}
              onClick={() => navigate(t.id)}
            >
              <svg viewBox="0 0 24 24">
                <path d={ICONS[t.id]} />
              </svg>
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </NavContext.Provider>
  );
}
