import axiosInstance from '@/lib/axios';
import { useCompanyStore } from '@/stores/CompanyStore';
import { Warehouse } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchWarehouses = async (company: string): Promise<Warehouse[]> => {
  const  {data}  = await axiosInstance.get(`/${company}/warehouses`);
  return data.warehouses;
};

export const useGetWarehouses = () => {
  const {selectedCompany} = useCompanyStore()
  return useQuery<Warehouse[]>({
    queryKey: ['warehouses'],
    queryFn: ()=> fetchWarehouses(selectedCompany!.slug),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!selectedCompany
  });
};
