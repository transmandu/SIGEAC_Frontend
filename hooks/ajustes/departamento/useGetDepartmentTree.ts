import axios from "@/lib/axios";
import { Department } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchDepartmentTree = async (
  company: string | undefined,
): Promise<Department[]> => {
  const { data } = await axios.get(`/${company}/departments/tree`);
  return data;
};

export const useGetDepartmentTree = (company: string | undefined) => {
  return useQuery<Department[], Error>({
    queryKey: ["departments", company, "tree"],
    queryFn: () => fetchDepartmentTree(company),
    enabled: !!company,
  });
};
