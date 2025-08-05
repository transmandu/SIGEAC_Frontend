import axiosInstance from '@/lib/axios';
import { Warehouse } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchWarehousesByLocation = async ({company, location_id}: {company: string | undefined, location_id: string | null}): Promise<Warehouse[]> => {
  const  {data}  = await axiosInstance.get(`/${company}/${location_id}/warehouses-by-location`);
  return data.warehouses;
};

export const useGetWarehousesByLocation = ({company, location_id}: {company: string | undefined, location_id: string | null}) => {
  return useQuery<Warehouse[]>({
    queryKey: ['warehousesByLocation'],
    queryFn: () => fetchWarehousesByLocation({company, location_id}),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company && !!location_id,
  });
};
