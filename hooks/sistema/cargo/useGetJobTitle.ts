import axios from '@/lib/axios';
import { JobTitle } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchJobTitle = async (company: string | undefined): Promise<JobTitle[]> => {
  const {data} = await axios.get(`/${company}/job_titles`);
  return data;
};

export const useGetJobTitle = (company: string | undefined) => {
  return useQuery<JobTitle[], Error>({
    queryKey: ['job_titles', company],
    queryFn: () => fetchJobTitle(company),
    enabled: !!company,
  });
};
