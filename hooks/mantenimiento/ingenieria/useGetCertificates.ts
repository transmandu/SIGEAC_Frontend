import axiosInstance from '@/lib/axios';
import { Batch, Certificate, Company } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchCertificates = async (): Promise<Certificate[]> => {
  const  {data}  = await axiosInstance.get('/hangar74/certificate');
  return data;
};

export const useGetCertificates = () => {
  return useQuery<Certificate[]>({
    queryKey: ['certificates'],
    queryFn: fetchCertificates,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
