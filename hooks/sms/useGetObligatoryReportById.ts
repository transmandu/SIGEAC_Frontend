import axiosInstance from "@/lib/axios";
import { ObligatoryReport } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetcObligatoryReportById = async ({
  company,
  id,
}: {
  company: string | null;
  id: string;
}) => {
  const { data } = await axiosInstance.get(
    `${company}/sms/obligatory-reports/${id}`
  );
  return data;
};

export const useGetObligatoryReportById = ({
  company,
  id,
}: {
  company: string | null;
  id: string;
}) => {
  return useQuery<ObligatoryReport>({
    queryKey: ["obligatory-reports", id],
    queryFn: () => fetcObligatoryReportById({ company, id }),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
