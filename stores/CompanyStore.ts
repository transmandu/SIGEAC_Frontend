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
        // Guardamos el objeto como JSON en localStorage
        localStorage.setItem('selectedCompany', JSON.stringify(company));
    },

    setSelectedStation: (station) => {
        set({ selectedStation: station });
        localStorage.setItem('selectedStation', station);
    },

    initFromLocalStorage: () => {
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
        localStorage.removeItem('selectedCompany');
        localStorage.removeItem('selectedStation');
    }
}));
