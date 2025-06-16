import axios from '@/lib/axios';
import { Employee } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchEmployeesByDepartment = async (department_acronym: number | string, company: string | undefined): Promise<Employee[]> => {
  const {data} = await axios.get(`/${company}/employees-by-department/${department_acronym}`);
  return data;
};

export const useGetEmployeesByDepartment = (department_acronym: number | string, company: string | undefined) => {
  return useQuery<Employee[], Error>({
    queryKey: ['employees-by-department', department_acronym, company],
    queryFn: () => fetchEmployeesByDepartment(department_acronym, company),
    enabled: !!department_acronym && !!company,
  });
};
