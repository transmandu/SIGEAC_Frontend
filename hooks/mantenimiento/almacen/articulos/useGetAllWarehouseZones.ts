import axiosInstance from '@/lib/axios';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useQuery } from '@tanstack/react-query';

const fetchAllWarehouseZones = async (
  location_id: string | null, 
  company?: string
): Promise<string[]> => {
  const { data } = await axiosInstance.get(`/${company}/${location_id}/article-zone`);
  return data;
};

export const useGetAllWarehouseZones = () => {
  const { selectedCompany, selectedStation } = useCompanyStore();
  return useQuery<string[], Error>({
    queryKey: ["warehouse-zones-all", selectedCompany?.slug, selectedStation],
    queryFn: () => fetchAllWarehouseZones(selectedStation, selectedCompany?.slug),
    enabled: !!selectedCompany && !!selectedStation,
  });
};
