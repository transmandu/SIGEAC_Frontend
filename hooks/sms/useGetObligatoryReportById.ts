import axiosInstance from "@/lib/axios";
import { ObligatoryReport, Pilot } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetcObligatoryReportById = async (id: string | number) => {
  const { data } = await axiosInstance.get(
    `transmandu/sms/obligatory-reports/${id}`
  );
  return data;
};

export type getObligatoryReport = {
  id: number;
  report_number: string;
  incident_location: string;
  description: string;
  report_date: Date;
  incident_date: Date;
  incident_time: Date;
  flight_time: Date;
  pilot_id: number;
  copilot_id: number;
  pilot: Pilot;
  copilot: Pilot;
  aircraft_acronym: string;
  aircraft_model: string;
  flight_number: string;
  flight_origin: string;
  flight_destiny: string;
  flight_alt_destiny: string;
  incidents: string;
  other_incidents: string;
  status: string;
  danger_identification_id: number;
  image?: string,
  document?:  string;
};

export const useGetObligatoryReportById = (id: string | number) => {
  return useQuery<getObligatoryReport>({
    queryKey: ["obligatory-reports", id], // Incluye el ID en la clave de la query
    queryFn: () => fetcObligatoryReportById(id), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
