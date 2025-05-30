'use client'

import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import { Article, ToolArticle } from '@/types'

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


const fetchEditToolBoxTools = async (location_id: string | null, id: number | null): Promise<ToolBoxTools[]> => {
  const {data} = await axiosInstance.get(`/hangar74/tools-in-box/${location_id}/${id}`)
  return data
}

export const useGetEditToolBoxTools = (location_id: string | null, id: number | null) => {
  return useQuery<ToolBoxTools[], Error>({
    queryKey: ['tool-box-tools'],
    queryFn: () => fetchEditToolBoxTools(location_id, id),
    enabled: !!location_id
  })
}
