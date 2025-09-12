import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useQuery } from "@tanstack/react-query";

interface SMSActivities {
  id: number;
  title: string;
  start: string;
  end: string;
  description: string;
  calendarId: string;
  status: "ABIERTO" | "CERRADO" | "PENDIENTE"; // Asegúrate de que esta propiedad existe
}

const fetchSMSActivitiesForCalendar = async (
  company?: string
): Promise<SMSActivities[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/calendar-activities`
  );
  return data;
};

export const useGetSMSActivitiesForCalendar = () => {
  const { selectedCompany } = useCompanyStore();
  return useQuery<SMSActivities[]>({
    queryKey: ["sms-calendar-activities"],
    queryFn: () => fetchSMSActivitiesForCalendar(selectedCompany?.slug),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!selectedCompany?.slug,
  });
};
