import axiosInstance from '@/lib/axios';
import { Employee } from '@/types';
import { useMutation } from '@tanstack/react-query';

const fetchEmployeesByCompany = async (company: string): Promise<Employee[]> => {
  const {data} = await axiosInstance.post('/employees-all', { company });
  return data;
};

export const useGetEmployeesByCompany = () => {
  return useMutation<Employee[], Error, string>({
    mutationFn: fetchEmployeesByCompany,
  })
}
