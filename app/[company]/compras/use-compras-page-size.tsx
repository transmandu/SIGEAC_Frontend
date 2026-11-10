import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SortingState } from '@tanstack/react-table';

interface useComprasPageSizeStore {
  pageSizes: Record<string, number>;
  setPageSize: (tableKey: string, pageSize: number) => void;
  /**
   * Orden elegido en el encabezado, por tabla. Se recuerda igual que el tamaño
   * de página: así la lista sale en el mismo orden al cambiar de pantalla, al
   * recargar o al volver, y no depende de quién tenga a la vista el encabezado
   * (en móvil no existe).
   */
  sortings: Record<string, SortingState>;
  setSorting: (tableKey: string, sorting: SortingState) => void;
}

export const useComprasPageSize = create(
  persist<useComprasPageSizeStore>(
    (set, get) => ({
      pageSizes: {},
      setPageSize: (tableKey, pageSize) => {
        set({ pageSizes: { ...get().pageSizes, [tableKey]: pageSize } });
      },
      sortings: {},
      setSorting: (tableKey, sorting) => {
        set({ sortings: { ...get().sortings, [tableKey]: sorting } });
      },
    }),
    {
      name: 'comprasTablePageSizes',
      storage: createJSONStorage(() => localStorage),
    }
  )
);