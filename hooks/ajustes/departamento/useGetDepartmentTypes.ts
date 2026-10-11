import axios from "@/lib/axios";
import { DepartmentType } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchDepartmentTypes = async (
  company: string | undefined,
  includeInactive: boolean,
): Promise<DepartmentType[]> => {
  const { data } = await axios.get(`/${company}/department-types`, {
    params: includeInactive ? { include_inactive: 1 } : undefined,
  });
  return data;
};

export const useGetDepartmentTypes = (
  company: string | undefined,
  options?: { includeInactive?: boolean },
) => {
  const includeInactive = options?.includeInactive ?? false;

  return useQuery<DepartmentType[], Error>({
    queryKey: ["department-types", company, { includeInactive }],
    queryFn: () => fetchDepartmentTypes(company, includeInactive),
    enabled: !!company,
  });
};
