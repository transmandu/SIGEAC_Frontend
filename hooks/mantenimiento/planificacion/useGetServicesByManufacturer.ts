import axiosInstance from '@/lib/axios';
import { MaintenanceService } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchServicesByManufacturer = async (manufacturer_id: string | null): Promise<MaintenanceService[]> => {
  const {data} = await axiosInstance.get(`/hangar74/show-services-by-manufacturer/${manufacturer_id}`);
  return data;
};

export const useGetServicesByManufacturer = (manufacturer_id: string | null) => {
  return useQuery<MaintenanceService[], Error>({
    queryKey: ["manufacturer-services"],
    queryFn: () => fetchServicesByManufacturer(manufacturer_id),
    enabled: !!manufacturer_id,
  });
};
