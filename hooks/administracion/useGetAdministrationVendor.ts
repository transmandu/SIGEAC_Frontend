"use client"

import { AdministrationVendor } from '@/types';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

const fetchAdministrationVendor = async (): Promise<AdministrationVendor[]> => {
  const  {data}  = await axiosInstance.get('/transmandu/administration-vendors');
  return data;
}; 

export const useGetAdministrationVendor = () => {
  return useQuery<AdministrationVendor[]>({
    queryKey: ['vendor'],
    queryFn: fetchAdministrationVendor,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};  