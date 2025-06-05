import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

export interface WarehouseReport {
  name: string,
  ata_code: string,
  articles_quantity: number,
  location: string,
  warehouse: string,
  description: string,
  articles: {
    part_number: string,
    part_number_quantity: number,
    aircraft: number,
    stored: number,
    dispatch:{
              quantity: 1,
              location: string
            }[]
    }[],
}[]


const fetchWarehouseReport = async (location_id: string | null): Promise<WarehouseReport[]> => {
  const {data} = await axios.get(`/hangar74/articles/${location_id}`);
  return data;
};

export const useGetWarehouseReport = (location_id: string | null) => {
  return useQuery<WarehouseReport[], Error>({
    queryKey: ["warehouse-report"],
    queryFn: () => fetchWarehouseReport(location_id),
    enabled: !!location_id,
  });
};
