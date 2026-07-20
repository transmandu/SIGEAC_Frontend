import axiosInstance from "@/lib/axios";
import { HazardNotification } from "@/types/sms/mantenimiento";
import { useQuery } from "@tanstack/react-query";

const fetchHazardNotificationByReportNumber = async (
  company: string,
  reportNumber: string
): Promise<HazardNotification> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/aeronautical/hazard-notifications/by-report/${encodeURIComponent(reportNumber)}`
  );

  return data;
};

export const useGetHazardNotificationByReportNumber = (
  company?: string,
  reportNumber?: string | null
) => {
  return useQuery<HazardNotification>({
    queryKey: ["hazard-notification-by-report", company, reportNumber],
    queryFn: () => fetchHazardNotificationByReportNumber(company!, reportNumber!),
    staleTime: 1000 * 60 * 5,
    enabled: !!company && !!reportNumber,
  });
};
