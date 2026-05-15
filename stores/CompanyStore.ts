import { Company } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CompanyState {
  selectedCompany: Company | null;
  selectedStation: string;

  setSelectedCompany: (company: Company | null) => void;
  setSelectedStation: (station: string) => void;
  reset: () => void;
}

const initialState = {
  selectedCompany: null,
  selectedStation: "",
};

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * IMPORTANTE:
       * cambiar empresa invalida cualquier estación previa
       */
      setSelectedCompany: (company) =>
        set({
          selectedCompany: company,
          selectedStation: "",
        }),

      /**
       * estación independiente, pero normalmente viene del bootstrap
       */
      setSelectedStation: (station) =>
        set({
          selectedStation: station,
        }),

      /**
       * reset total consistente
       */
      reset: () =>
        set({
          selectedCompany: null,
          selectedStation: "",
        }),
    }),
    {
      name: "company-storage",

      /**
       * Persistimos solo lo necesario
       */
      partialize: (state) => ({
        selectedCompany: state.selectedCompany,
        selectedStation: state.selectedStation,
      }),
    }
  )
);