import axios from '@/lib/axios';
import { AvionicsControl } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchAvionicsControl = async (company: string | undefined, id: string | number | undefined): Promise<AvionicsControl> => {
  const { data } = await axios.get(`/${company}/avionics-controls/${id}`);
  return data;
};

export const useGetAvionicsControl = (company: string | undefined, id: string | number | undefined) => {
  return useQuery<AvionicsControl, Error>({
    queryKey: ["avionics-control", company, id],
    queryFn: () => fetchAvionicsControl(company, id),
    enabled: !!company && !!id,
  });
};
