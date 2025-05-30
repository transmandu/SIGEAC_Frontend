import axiosInstance from '@/lib/axios';
import { Warehouse } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchWarehouses = async (): Promise<Warehouse[]> => {
  const  {data}  = await axiosInstance.get('/warehouses');
  return data.warehouses;
};

export const useGetWarehouses = () => {
  return useQuery<Warehouse[]>({
    queryKey: ['warehouses'],
    queryFn: fetchWarehouses,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
