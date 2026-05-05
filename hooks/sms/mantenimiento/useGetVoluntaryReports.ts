import axiosInstance from "@/lib/axios";
import { VoluntaryReport } from "@/types/sms/mantenimiento";
import { useQuery } from "@tanstack/react-query";

const fetchVoluntaryReports = async (
    company?: string
): Promise<VoluntaryReport[]> => {
    const { data } = await axiosInstance.get(`/${company}/sms/aeronautical/voluntary-reports`);
    return data;
};

export const useGetVoluntaryReports = (company?: string) => {
    return useQuery<VoluntaryReport[]>({
        queryKey: ["voluntary-reports"],
        queryFn: () => fetchVoluntaryReports(company),
        staleTime: 1000 * 60 * 5, // 5 minutos
        enabled: !!company,
    });
};
