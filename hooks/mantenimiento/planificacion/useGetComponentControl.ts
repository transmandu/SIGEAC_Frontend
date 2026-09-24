import axios from "@/lib/axios";
import { ComponentControl } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchComponentControl = async (
  company: string | undefined,
  id: string | number | undefined,
): Promise<ComponentControl> => {
  const { data } = await axios.get(`/${company}/component-controls/${id}`);
  return data;
};

export const useGetComponentControl = (
  company: string | undefined,
  id: string | number | undefined,
) => {
  return useQuery<ComponentControl, Error>({
    queryKey: ["component-control", company, id],
    queryFn: () => fetchComponentControl(company, id),
    enabled: !!company && !!id,
  });
};
