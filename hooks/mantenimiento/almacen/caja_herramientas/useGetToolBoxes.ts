import axios from '@/lib/axios';
import { ToolBox } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchToolBoxes = async (location_id: string | null): Promise<ToolBox[]> => {
  const  {data}  = await axios.get(`/hangar74/index-tool-box/${location_id}`);
  return data;
};

export const useGetToolBoxes = (location_id: string | null) => {
  return useQuery<ToolBox[]>({
    queryKey: ['tool-boxes'],
    queryFn: () => fetchToolBoxes(location_id),
    enabled: !!location_id
  });
};
