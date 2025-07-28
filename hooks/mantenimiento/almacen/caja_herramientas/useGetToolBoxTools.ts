'use client'

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Article } from '@/types';

interface IToolArticle extends Article {
  tool: {
    id: number,
    serial: string,
    is_special: boolean,
    article_id: number,
    tool_box_id: number,
  }
}

export interface ToolBoxTools {
  id: number,
  name: string,
  description: string,
  article: IToolArticle[]
}

const fetchEditToolBoxTools = async (
  location_id: string | null,
  id: number | null,
  company?: string
): Promise<ToolBoxTools[]> => {
  const { data } = await axiosInstance.get(`/${company}/tools-in-box/${location_id}/${id}`);
  return data;
};

export const useGetEditToolBoxTools = (
  location_id: string | null,
  id: number | null,
  company?: string
) => {
  return useQuery<ToolBoxTools[], Error>({
    queryKey: ['tool-box-tools', company],
    queryFn: () => fetchEditToolBoxTools(location_id, id, company!),
    enabled: !!location_id && !!company,
  });
};
