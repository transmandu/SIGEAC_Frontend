import axios from '@/lib/axios';
import { ComponentControl } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchComponentControls = async (company: string | undefined): Promise<ComponentControl[]> => {
  const { data } = await axios.get(`/${company}/component-controls`);
  return data;
};

export const useGetComponentControls = (company: string | undefined) => {
  return useQuery<ComponentControl[], Error>({
    queryKey: ["component-controls", company],
    queryFn: () => fetchComponentControls(company),
    enabled: !!company,
  });
};
