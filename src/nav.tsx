import { createContext, useContext } from 'react';

export type TabId = 'proyecciones' | 'inventario';

interface Nav {
  navigate: (tab: TabId) => void;
}

export const NavContext = createContext<Nav>({ navigate: () => {} });
export const useNav = () => useContext(NavContext);
