import axios from "@/lib/axios";
import { DepartmentMembership } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchMembers = async (
  company: string | undefined,
  departmentId: number | null,
): Promise<DepartmentMembership[]> => {
  const { data } = await axios.get(
    `/${company}/departments/${departmentId}/members`,
  );
  return data;
};

export const useGetDepartmentMembers = (
  company: string | undefined,
  departmentId: number | null,
) => {
  return useQuery<DepartmentMembership[], Error>({
    queryKey: ["departments", company, departmentId, "members"],
    queryFn: () => fetchMembers(company, departmentId),
    enabled: !!company && departmentId !== null,
  });
};
