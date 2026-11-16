import axiosInstance from "@/lib/axios";
import { Employee } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchEmployeesByDepartment = async (
  acronym: string,
  location_id: string,
  company: string,
): Promise<Employee[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/${location_id}/employees-by-department/${acronym}`,
  );
  return data;
};

// Un solo departamento. Para varios a la vez (ej. órdenes de trabajo) está
// useGetWorkOrderEmployees, que normaliza y ordena los acrónimos.
export const useGetEmployeesByDepartment = (
  acronym?: string,
  location_id?: string | null,
  company?: string,
) => {
  return useQuery<Employee[], Error>({
    // La sede va en la clave: sin ella, al cambiar de estación se sirve la
    // lista cacheada de la anterior.
    queryKey: ["employees-by-department", company, location_id, acronym],
    queryFn: () => fetchEmployeesByDepartment(acronym!, location_id!, company!),
    staleTime: 1000 * 60 * 5,
    enabled: !!acronym && !!location_id && !!company,
  });
};
