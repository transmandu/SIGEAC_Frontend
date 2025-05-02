import axiosInstance from "@/lib/axios";
import { DangerIdentification, User, VoluntaryReport } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetcVoluntaryReportById = async (id: string | number) => {
  const { data } = await axiosInstance.get(
    `transmandu/sms/voluntary-reports/${id}`
  );
  return data;
};

export type GetVoluntaryReport = {
  id: number;
  report_number: string;
  report_date: Date;
  identification_date: Date;
  danger_location: string;
  danger_area: string;
  description: string;
  airport_location: string;
  possible_consequences: string;
  danger_identification_id: number;
  danger_identification: DangerIdentification;
  status: string;
  reporter_name?: string;
  reporter_last_name?: string;
  reporter_phone?: string;
  reporter_email?: string;
  image?: string;
  document?: string;
};

export const useGetVoluntaryReportById = (id: string | number) => {
  return useQuery<GetVoluntaryReport>({
    queryKey: ["voluntary-report", id], // Incluye el ID en la clave de la query
    queryFn: () => fetcVoluntaryReportById(id), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
