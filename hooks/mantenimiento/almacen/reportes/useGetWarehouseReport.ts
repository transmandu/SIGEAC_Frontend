import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

export interface WarehouseReport {
  name: string;
  ata_code: string;
  articles_quantity: number;
  location: string;
  warehouse: string;
  description: string;
  articles: {
    part_number: string;
    part_number_quantity: number;
    aircraft: number;
    stored: number;
    dispatch: {
      quantity: number;
      location: string;
    }[];
  }[];
}

const fetchWarehouseReport = async ({
  company,
  location_id,
}: {
  location_id: string;
  company?: string;
}): Promise<WarehouseReport[]> => {
  const { data } = await axios.get(`/${company}/${location_id}/warehouse-report`);
  return data;
};

export const useGetWarehouseReport = ({
  company,
  location_id,
}: {
  company?: string;
  location_id: string | null;
}) => {
  return useQuery<WarehouseReport[], Error>({
    queryKey: ['warehouse-report', company, location_id],
    queryFn: () =>
      fetchWarehouseReport({company: company!, location_id: location_id!}),
    enabled: !!company && !!location_id,
  });
};
