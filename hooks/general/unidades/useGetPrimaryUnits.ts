import axios from "@/lib/axios";
import { Unit } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchUnits = async (company?: string): Promise<Unit[]> => {
  const { data } = await axios.get(`/${company}/unit`);
  return data;
};

export const useGetUnits = (company?: string) => {
  return useQuery<Unit[]>({
    queryKey: ["units"],
    queryFn: () => fetchUnits(company),
    enabled: !!company,
  });
};
