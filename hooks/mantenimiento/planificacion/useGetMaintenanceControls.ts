import axios from "@/lib/axios";
import { MaintenanceControl } from "@/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const fetchMaintenanceControls = async (
  company: string | undefined,
  includeRetired: boolean,
): Promise<MaintenanceControl[]> => {
  const { data } = await axios.get(`/${company}/maintenance-controls`, {
    params: { include_retired: includeRetired ? 1 : undefined },
  });
  return data;
};

/** Por defecto solo los vigentes: son los que alimentan alertas y calendario. */
export const useGetMaintenanceControls = (
  company: string | undefined,
  includeRetired = false,
) => {
  return useQuery<MaintenanceControl[], Error>({
    queryKey: ["maintenance-controls", company, { includeRetired }],
    queryFn: () => fetchMaintenanceControls(company, includeRetired),
    placeholderData: keepPreviousData,
    enabled: !!company,
  });
};
