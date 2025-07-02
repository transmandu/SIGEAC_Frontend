import axiosInstance from "@/lib/axios";
import { Employee } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchEmployesByDepartment = async (acronym: string) => {
  const { data } = await axiosInstance.get(
    `/transmandu/employees-by-department/${acronym}`
  );
  return data;
};

export const useGetEmployesByDepartment = (acronym: string) => {
  return useQuery<Employee[]>({
    queryKey: ["employees-by-department"], // Incluye el ID en la clave de la query
    queryFn: () => fetchEmployesByDepartment(acronym), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
