import axiosInstance from "@/lib/axios";
import { HazardNotification } from "@/types/sms/mantenimiento";
import { useQuery } from "@tanstack/react-query";

const fetchHazardNotifications = async (
    company?: string
): Promise<HazardNotification[]> => {
    const { data } = await axiosInstance.get(
        `/${company}/sms/aeronautical/hazard-notifications`
    );

    return data;
};

export const useGetHazardNotifications = (company?: string) => {
    return useQuery<HazardNotification[]>({
        queryKey: ["hazard-notifications", company],
        queryFn: () => fetchHazardNotifications(company),
        staleTime: 1000 * 60 * 5,
        enabled: !!company,
    });
};
