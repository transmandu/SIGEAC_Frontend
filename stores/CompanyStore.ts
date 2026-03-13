import { Company } from "@/types";
import { create } from "zustand";

// Definimos la interfaz para los módulos
interface Module {
    id: number;
    label: string;
    value: string;
}

// Actualizamos el estado para usar el objeto Company
interface CompanyState {
    selectedCompany: Company | null;
    selectedStation: string | null;
}

interface CompanyActions {
    setSelectedCompany: (company: Company) => void;
    setSelectedStation: (station: string | null) => void;
    initFromLocalStorage: () => void;
    reset: () => void;
}

const initialState: CompanyState = {
    selectedCompany: null,
    selectedStation: null,
};

const isBrowser = typeof window !== "undefined";

export const useCompanyStore = create<CompanyState & CompanyActions>((set) => ({
    ...initialState,

    setSelectedCompany: (company) => {
        set({ selectedCompany: company });
        if (isBrowser) {
            localStorage.setItem('selectedCompany', JSON.stringify(company));
        }
    },

    setSelectedStation: (station) => {
        set({ selectedStation: station });
        if (!isBrowser) {
            return;
        }

        if (station) {
            localStorage.setItem('selectedStation', station);
            return;
        }

        localStorage.removeItem('selectedStation');
    },

    initFromLocalStorage: () => {
        if (!isBrowser) {
            return;
        }

        const savedSelectedCompany = localStorage.getItem('selectedCompany');
        if (savedSelectedCompany) {
            try {
                // Parseamos el JSON guardado
                const companyObj: Company = JSON.parse(savedSelectedCompany);
                set({ selectedCompany: companyObj });
            } catch (error) {
                console.error("Error parsing saved company", error);
                // Si hay error, limpiamos el valor inválido
                localStorage.removeItem('selectedCompany');
            }
        }

        const savedSelectedStation = localStorage.getItem('selectedStation');
        if (savedSelectedStation) {
            set({ selectedStation: savedSelectedStation });
        }
    },

    reset: () => {
        set(initialState);
        if (isBrowser) {
            localStorage.removeItem('selectedCompany');
            localStorage.removeItem('selectedStation');
        }
    }
}));
