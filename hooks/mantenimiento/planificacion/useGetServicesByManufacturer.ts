import axiosInstance from '@/lib/axios';
import { MaintenanceService } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchServicesByManufacturer = async (manufacturer_id: string | null, company?: string): Promise<MaintenanceService[]> => {
  const {data} = await axiosInstance.get(`/${company}/show-services-by-manufacturer/${manufacturer_id}`);
  return data;
};

export const useGetServicesByManufacturer = (manufacturer_id: string | null, company?: string) => {
  return useQuery<MaintenanceService[], Error>({
    queryKey: ["manufacturer-services", manufacturer_id, company],
    queryFn: () => fetchServicesByManufacturer(manufacturer_id, company),
    enabled: !!manufacturer_id && !!company,
  });
};
