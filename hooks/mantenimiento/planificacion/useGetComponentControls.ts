import axios from "@/lib/axios";
import { ComponentControl } from "@/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const fetchComponentControls = async (
  company: string | undefined,
  includeRetired: boolean,
): Promise<ComponentControl[]> => {
  const { data } = await axios.get(`/${company}/component-controls`, {
    params: { include_retired: includeRetired ? 1 : undefined },
  });
  return data;
};

/** Por defecto solo los vigentes: son los que alimentan alertas y calendario. */
export const useGetComponentControls = (
  company: string | undefined,
  includeRetired = false,
) => {
  return useQuery<ComponentControl[], Error>({
    queryKey: ["component-controls", company, { includeRetired }],
    queryFn: () => fetchComponentControls(company, includeRetired),
    placeholderData: keepPreviousData,
    enabled: !!company,
  });
};
