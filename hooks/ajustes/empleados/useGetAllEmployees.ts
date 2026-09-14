import axiosInstance from '@/lib/axios';
import { Employee } from '@/types';
import { useQuery } from '@tanstack/react-query';

// Provisorio: trae todos los empleados (activos o inactivos). Se usa
// únicamente en el formulario de minutas de reunión.
const fetchAllEmployeesByCompany = async (
  company: string
): Promise<Employee[]> => {
  const { data } = await axiosInstance.get(`/${company}/employees/all`);

  return data;
};

export const useGetAllEmployeesByCompany = (
  company?: string
) => {
  return useQuery<Employee[], Error>({
    queryKey: ['employees', 'all', company],

    queryFn: () => fetchAllEmployeesByCompany(company!),

    enabled: !!company,

    refetchOnWindowFocus: false,
  });
};