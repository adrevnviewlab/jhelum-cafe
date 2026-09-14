import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { captureAttribution } from './lib/attribution';
import { fetchMenuSnapshot } from './lib/menuApi';
import { subscribeStore } from './lib/localStore';
import { flattenItems, seedCatalog } from './lib/catalog';

const MenuContext = createContext({
  source: 'fallback',
  sections: seedCatalog(),
  items: flattenItems(seedCatalog()),
  settings: {},
  rules: [],
  refresh: () => {},
});

export function MenuProvider({ children }) {
  const [snapshot, setSnapshot] = useState(() => ({
    source: 'fallback',
    sections: seedCatalog(),
    items: flattenItems(seedCatalog()),
    settings: {},
    rules: [],
  }));

  const refresh = () => {
    fetchMenuSnapshot().then(setSnapshot);
  };

  useEffect(() => {
    captureAttribution(window.location.search);
    refresh();
    return subscribeStore(refresh);
  }, []);

  const value = useMemo(() => ({ ...snapshot, refresh }), [snapshot]);
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  return useContext(MenuContext);
}
