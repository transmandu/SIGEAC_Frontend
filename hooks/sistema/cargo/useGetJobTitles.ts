import axios from '@/lib/axios';
import { JobTitle } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchJobTitles = async (company: string | undefined): Promise<JobTitle[]> => {
  const {data} = await axios.get(`/${company}/job-titles`);
  return data;
};

export const useGetJobTitles = (company: string | undefined) => {
  return useQuery<JobTitle[], Error>({
    queryKey: ['job_titles', company],
    queryFn: () => fetchJobTitles(company),
    enabled: !!company,
  });
};
