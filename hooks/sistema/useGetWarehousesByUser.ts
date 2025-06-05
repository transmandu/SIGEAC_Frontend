import axiosInstance from '@/lib/axios';
import { Warehouse } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchWarehousesByUser = async (): Promise<Warehouse[]> => {
  const  {data}  = await axiosInstance.get('/warehouses');
  return data.warehouses;
};

export const useGetWarehousesByUser = () => {
  return useQuery<Warehouse[]>({
    queryKey: ['warehousesByUser'],
    queryFn: fetchWarehousesByUser,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
