import axios from "@/lib/axios";
import { AvionicsControl } from "@/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const fetchAvionicsControls = async (
  company: string | undefined,
  includeRetired: boolean,
): Promise<AvionicsControl[]> => {
  const { data } = await axios.get(`/${company}/avionics-controls`, {
    params: { include_retired: includeRetired ? 1 : undefined },
  });
  return data;
};

/** Por defecto solo los vigentes: son los que alimentan alertas y calendario. */
export const useGetAvionicsControls = (
  company: string | undefined,
  includeRetired = false,
) => {
  return useQuery<AvionicsControl[], Error>({
    queryKey: ["avionics-controls", company, { includeRetired }],
    queryFn: () => fetchAvionicsControls(company, includeRetired),
    placeholderData: keepPreviousData,
    enabled: !!company,
  });
};
