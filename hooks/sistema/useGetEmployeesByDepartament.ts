import axios from "@/lib/axios";
import { Employee } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchEmployeesByDepartment = async (
  department_acronym: string,
  location?: string | null,
  company?: string
): Promise<Employee[]> => {
  const { data } = await axios.get(
    `/${company}/${location}/employees-by-department/${department_acronym}`
  );
  return data;
};

export const useGetEmployeesByDepartment = (
  department_acronym: string,
  location?: string | null,
  company?: string
) => {
  return useQuery<Employee[], Error>({
    queryKey: ["employees-by-department", department_acronym, company],
    queryFn: () =>
      fetchEmployeesByDepartment(department_acronym, location, company),
    enabled: !!department_acronym && !!company && !!location,
  });
};
