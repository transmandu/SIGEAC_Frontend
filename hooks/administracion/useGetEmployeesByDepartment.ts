import axiosInstance from "@/lib/axios";
import { Employee } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchEmployesByDepartmentId = async (id: number) => {
  const { data } = await axiosInstance.get(
    `transmandu/employees-by-department/${id}`
  );
  return data;
};

export const useGetEmployesByDepartmentId = (id: number) => {
  return useQuery<Employee[]>({
    queryKey: ["employees-by-department", id], // Incluye el ID en la clave de la query
    queryFn: () => fetchEmployesByDepartmentId(id), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
