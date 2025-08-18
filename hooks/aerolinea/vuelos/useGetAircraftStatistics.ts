import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { CashMovement } from "@/types";

// Definir la estructura de datos que devuelve el endpoint
export interface AircraftStatistics {
  statistics: {
    total_annual_income: {
      [year: string]: number
    }
    total_annual_output: {
      [year: string]: number
    }
    monthly_income: {
      [year: string]: {
        [month: string]: number
      }
    }
    monthly_output: {
      [year: string]: {
        [month: string]: number
      }
    }
    total_flights: {
      [year: string]: number
    }
  }
  incomes: {
    [year: string]: {
      [month: string]: CashMovement[]
    }
  }
  outputs: {
    [year: string]: {
      [month: string]: CashMovement[]
    }
  }
}

const fetchFlightsByAircraft = async (aircraftAcronym: string, company?: string): Promise<AircraftStatistics> => {
  const { data } = await axiosInstance.get(`/${company}/aircraft-statistics/${aircraftAcronym}`);
  return data;
};

export const useGetAircraftStatistics = (aircraftAcronym: string, company?: string) => {
  return useQuery<AircraftStatistics>({
    queryKey: ["flights", aircraftAcronym, company],
    queryFn: () => fetchFlightsByAircraft(aircraftAcronym, company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!aircraftAcronym && !!company,
  });
};
