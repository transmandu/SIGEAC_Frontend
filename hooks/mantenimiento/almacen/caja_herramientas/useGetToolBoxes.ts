import axios from '@/lib/axios';
import { ToolBox } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchToolBoxes = async (
  location_id: string | null,
  company?: string
): Promise<ToolBox[]> => {
  const { data } = await axios.get(`/${company}/index-tool-box/${location_id}`);
  return data;
};

export const useGetToolBoxes = (
  location_id: string | null,
  company?: string
) => {
  return useQuery<ToolBox[]>({
    queryKey: ['tool-boxes', company, location_id],
    queryFn: () => fetchToolBoxes(location_id, company!),
    enabled: !!location_id && !!company,
  });
};
