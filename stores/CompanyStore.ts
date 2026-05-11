import { Company } from "@/types";
import { create } from "zustand";

interface CompanyState {
  selectedCompany: Company | null;
  selectedStation: string;
}

interface CompanyActions {
  setSelectedCompany: (company: Company | null) => void;
  setSelectedStation: (station: string) => void;
  initFromLocalStorage: () => void;
  reset: () => void;
}

const initialState: CompanyState = {
  selectedCompany: null,
  selectedStation: "",
};

export const useCompanyStore = create<
  CompanyState & CompanyActions
>((set) => ({
  ...initialState,

  setSelectedCompany: (company) => {
    set({ selectedCompany: company });

    if (typeof window !== "undefined") {
      if (company) {
        localStorage.setItem(
          "selectedCompany",
          JSON.stringify(company)
        );
      } else {
        localStorage.removeItem("selectedCompany");
      }
    }
  },

  setSelectedStation: (station) => {
    set({ selectedStation: station });

    if (typeof window !== "undefined") {
      if (station) {
        localStorage.setItem(
          "selectedStation",
          station
        );
      } else {
        localStorage.removeItem(
          "selectedStation"
        );
      }
    }
  },

  initFromLocalStorage: () => {
    if (typeof window === "undefined") return;

    try {
      const savedCompany =
        localStorage.getItem("selectedCompany");

      const savedStation =
        localStorage.getItem("selectedStation");

      if (savedCompany) {
        set({
          selectedCompany: JSON.parse(savedCompany),
        });
      }

      if (savedStation) {
        set({
          selectedStation: savedStation,
        });
      }
    } catch (error) {
      console.error(
        "Error initializing company store",
        error
      );

      localStorage.removeItem("selectedCompany");
      localStorage.removeItem("selectedStation");

      set(initialState);
    }
  },

  reset: () => {
    set(initialState);

    if (typeof window !== "undefined") {
      localStorage.removeItem("selectedCompany");
      localStorage.removeItem("selectedStation");
    }
  },
}));