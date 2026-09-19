import axios from '@/lib/axios';
import { DirectiveControl } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchDirectiveControls = async (company: string | undefined): Promise<DirectiveControl[]> => {
  const { data } = await axios.get(`/${company}/directive-controls`);
  return data;
};

export const useGetDirectiveControls = (company: string | undefined) => {
  return useQuery<DirectiveControl[], Error>({
    queryKey: ["directive-controls", company],
    queryFn: () => fetchDirectiveControls(company),
    enabled: !!company,
  });
};
