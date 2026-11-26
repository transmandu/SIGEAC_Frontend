import { useQuery } from "@tanstack/react-query";

import axiosInstance from "@/lib/axios";
import type { EmployeeHistoryPeriod } from "@/types";

const fetchEmployeeHistory = async (
  company: string,
  id: number,
): Promise<EmployeeHistoryPeriod[]> => {
  const { data } = await axiosInstance.get(
    `/${encodeURIComponent(company)}/employees/${id}/history`,
  );

  return data;
};

/** Historial laboral: periodos del más reciente al más antiguo, con sus asignaciones. */
export const useGetEmployeeHistory = (
  company: string | undefined,
  id: number,
  enabled = true,
) =>
  useQuery<EmployeeHistoryPeriod[], Error>({
    queryKey: ["employee-history", company, id],
    queryFn: () => fetchEmployeeHistory(company!, id),
    enabled: enabled && !!company,
    refetchOnWindowFocus: false,
  });
