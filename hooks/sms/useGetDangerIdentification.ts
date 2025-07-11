import axiosInstance from "@/lib/axios";
import {
  DangerIdentification,
  InformationSource,
  VoluntaryReport,
} from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchDangerIdentifications = async (
  company: string | null
): Promise<DangerIdentification[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/danger-identifications`
  );
  return data;
};

export const useGetDangerIdentifications = (company: string | null) => {
  return useQuery<DangerIdentification[]>({
    queryKey: ["danger-identifications"],
    queryFn: () => fetchDangerIdentifications(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
