import { create } from "zustand";

interface CompanyState {
    selectedCompany: string | null;
    selectedStation: string | null;
}

interface CompanyActions {
    setSelectedCompany: (company: string) => void;
    setSelectedStation: (station: string) => void;
    initFromLocalStorage: () => void;
    reset: () => void;
}

const initialState: CompanyState = {
    selectedCompany: null,
    selectedStation: null,
};

export const useCompanyStore = create<CompanyState & CompanyActions>((set) => ({
    ...initialState,

    setSelectedCompany: (company) => {
        set({ selectedCompany: company });
        localStorage.setItem('selectedCompany', company);
    },

    setSelectedStation: (station) => {
        set({ selectedStation: station });
        localStorage.setItem('selectedStation', station);
    },

    initFromLocalStorage: () => {
        const savedSelectedCompany = localStorage.getItem('selectedCompany');
        if (savedSelectedCompany) {
            set({ selectedCompany: savedSelectedCompany });
        }

        const savedSelectedStation = localStorage.getItem('selectedStation');
        if (savedSelectedStation) {
            set({ selectedStation: savedSelectedStation });
        }
    },

    reset: () => {
        set(initialState);
        localStorage.removeItem('selectedCompany');
        localStorage.removeItem('selectedStation');
    }
}));
