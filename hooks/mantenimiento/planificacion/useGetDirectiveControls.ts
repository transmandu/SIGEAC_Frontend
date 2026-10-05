import axios from "@/lib/axios";
import { DirectiveControl } from "@/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const fetchDirectiveControls = async (
  company: string | undefined,
  includeRetired: boolean,
): Promise<DirectiveControl[]> => {
  const { data } = await axios.get(`/${company}/directive-controls`, {
    params: { include_retired: includeRetired ? 1 : undefined },
  });
  return data;
};

/** Por defecto solo los vigentes: son los que alimentan alertas y calendario. */
export const useGetDirectiveControls = (
  company: string | undefined,
  includeRetired = false,
) => {
  return useQuery<DirectiveControl[], Error>({
    queryKey: ["directive-controls", company, { includeRetired }],
    queryFn: () => fetchDirectiveControls(company, includeRetired),
    placeholderData: keepPreviousData,
    enabled: !!company,
  });
};
