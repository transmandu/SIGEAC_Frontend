import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface useComprasPageSizeStore {
  pageSizes: Record<string, number>;
  setPageSize: (tableKey: string, pageSize: number) => void;
}

export const useComprasPageSize = create(
  persist<useComprasPageSizeStore>(
    (set, get) => ({
      pageSizes: {},
      setPageSize: (tableKey, pageSize) => {
        set({ pageSizes: { ...get().pageSizes, [tableKey]: pageSize } });
      },
    }),
    {
      name: 'comprasTablePageSizes',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
