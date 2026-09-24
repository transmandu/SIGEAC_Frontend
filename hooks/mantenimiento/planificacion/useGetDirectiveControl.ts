import axios from "@/lib/axios";
import { DirectiveControl } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchDirectiveControl = async (
  company: string | undefined,
  id: string | number | undefined,
): Promise<DirectiveControl> => {
  const { data } = await axios.get(`/${company}/directive-controls/${id}`);
  return data;
};

export const useGetDirectiveControl = (
  company: string | undefined,
  id: string | number | undefined,
) => {
  return useQuery<DirectiveControl, Error>({
    queryKey: ["directive-control", company, id],
    queryFn: () => fetchDirectiveControl(company, id),
    enabled: !!company && !!id,
  });
};
