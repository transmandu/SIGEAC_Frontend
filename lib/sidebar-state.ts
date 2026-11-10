/**
 * Estado visual del menú lateral que debe sobrevivir a que el componente se
 * desmonte y vuelva a montar (cambio de layout, recarga de la lista de
 * opciones, Fast Refresh). Vive en el módulo y se respalda en sessionStorage
 * para que una recarga completa tampoco lo pierda.
 */
const STORAGE_KEY = "sidebar-ui-state";

type SidebarUiState = {
  /** Scroll por instancia del menú (barra de escritorio y panel móvil). */
  scroll: Record<string, number>;
  openGroups: Record<string, boolean>;
};

let cache: SidebarUiState | null = null;

function read(): SidebarUiState {
  if (cache) return cache;

  let state: SidebarUiState = { scroll: {}, openGroups: {} };

  if (typeof window !== "undefined") {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) state = { ...state, ...JSON.parse(saved) };
    } catch {
      // sessionStorage puede estar bloqueado: el estado queda solo en memoria.
    }
  }

  cache = state;
  return state;
}

function write(state: SidebarUiState) {
  cache = state;

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ídem: sin respaldo, pero la memoria del módulo sigue sirviendo.
  }
}

export const getSidebarScroll = (key: string): number =>
  read().scroll[key] ?? 0;

export const setSidebarScroll = (key: string, scrollTop: number) => {
  const state = read();
  if (state.scroll[key] === scrollTop) return;
  write({ ...state, scroll: { ...state.scroll, [key]: scrollTop } });
};

export const getGroupOpen = (key: string): boolean | undefined =>
  read().openGroups[key];

export const setGroupOpen = (key: string, open: boolean) => {
  const state = read();
  if (state.openGroups[key] === open) return;
  write({ ...state, openGroups: { ...state.openGroups, [key]: open } });
};
