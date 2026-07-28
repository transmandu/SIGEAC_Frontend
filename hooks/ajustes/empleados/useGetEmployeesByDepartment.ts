import axiosInstance from "@/lib/axios";
import { Employee } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchEmployesByDepartment = async (acronym: string, location_id: string,company?: string) => {
  const { data } = await axiosInstance.get(
    `/${company}/${location_id}/employees-by-department/${acronym}`
  );
  return data;
};

export const useGetEmployesByDepartment = (acronym: string, location_id: string, company?: string) => {
  return useQuery<Employee[]>({
    queryKey: ["employees-by-department", acronym, location_id, company],
    queryFn: () => fetchEmployesByDepartment(acronym, location_id, company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!acronym && !!company,
  });
};
