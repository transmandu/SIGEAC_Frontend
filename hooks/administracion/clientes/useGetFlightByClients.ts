import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export interface Flight {
    id: number;
    date: string;
    details: string;
    fee: string;
    total_amount: string;
    payed_amount: string;
    type: string;
    debt_status: string;
    flight_number: string;
    debt: number;
    client: {
        id: number;
        name: string;
        dni: string;
        email: string;
        phone: string;
        address: string;
        balance: string;
        pay_credit_days: number;
    };
    route: {
        id: number;
        from: string;
        to: string;
    };
    aircraft: {
        id: number;
        model: string;
        fabricant: string;
        serial: string;
        acronym: string;
        fabricant_date: string;
        owner: string;
        comments: string;
        brand: string;
        status: string;
    };
}

// Definir la estructura de datos que devuelve el endpoint
export interface ClientStatistics {
    statistics: {
        total_payed_annual: {
          [year: number]: number;
        };
        annual_amount: {
          [year: number]: number;
        };
        annual_debt: {
          [year: number]: number;
        };
        monthly_amount: {
          [year: number]: {
            [month: string]: number;
          };
        };
        monthly_payed: {
          [year: number]: {
            [month: string]: number;
          };
        };
        total_flights: {
          [year: number]: number;
        };
        total_debt: number;
      };
    flights: {
      [year: number]: {
        [month: string]: Flight[]
      }
    }
    total_debt_flights: Flight[];
}

const fetchFlightsByClient = async (client_dni: string | null): Promise<ClientStatistics> => {
  const { data } = await axiosInstance.get(`/transmandu/clients-administration/${client_dni}/flights`);
  return data;
};

export const useGetFlightsByClient = (client_dni: string | null) => {
  return useQuery<ClientStatistics>({
    queryKey: ["flights", client_dni],
    queryFn: () => fetchFlightsByClient(client_dni),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!client_dni,
  });
};