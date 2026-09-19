import axios from '@/lib/axios';
import { AvionicsControl } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchAvionicsControls = async (company: string | undefined): Promise<AvionicsControl[]> => {
  const { data } = await axios.get(`/${company}/avionics-controls`);
  return data;
};

export const useGetAvionicsControls = (company: string | undefined) => {
  return useQuery<AvionicsControl[], Error>({
    queryKey: ["avionics-controls", company],
    queryFn: () => fetchAvionicsControls(company),
    enabled: !!company,
  });
};
