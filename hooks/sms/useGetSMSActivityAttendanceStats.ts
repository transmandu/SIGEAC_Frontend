import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useQuery } from "@tanstack/react-query";

interface ActivityAttendanceStats {
  attended: number;
  not_attended: number;
  total: number;
  attended_percentage: number;
  not_attended_percentage: number;
}

const fetchActivityAttendanceStats = async (
  activity_id: string,
  company?: string
) => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/sms-activity/${activity_id}/attendance-stats  `
  );
  return data;
};

export const useGetSMSActivityAttendanceStats = (activity_id: string) => {
  const { selectedCompany } = useCompanyStore();
  return useQuery<ActivityAttendanceStats>({
    queryKey: ["sms-activity-attendance-stats"], // Incluye el ID en la clave de la query
    queryFn: () =>
      fetchActivityAttendanceStats(activity_id, selectedCompany?.slug), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!selectedCompany?.slug,
  });
};
