import axiosInstance from '@/lib/axios';
import { Batch, Certificate, Company } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchCertificates = async (company?: string): Promise<Certificate[]> => {
  const  {data}  = await axiosInstance.get(`/${company}/certificate`);
  return data;
};

export const useGetCertificates = (company?: string) => {
  return useQuery<Certificate[]>({
    queryKey: ['certificates', company],
    queryFn: () => fetchCertificates(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
