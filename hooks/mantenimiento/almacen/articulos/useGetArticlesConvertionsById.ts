import axios from "@/lib/axios";
import { Unit } from "@/types";
import { useQuery } from "@tanstack/react-query";


export interface ConsumablePivot {
  convertion_id: string; 
  consumable_id: string; 
}

export interface ConsumableItem {
  id: number;
  is_managed: boolean; 
  quantity: number;
  article_id: string;
  caducate_date: Date;
  fabrication_date: Date; 
  lot_number: string;
  min_quantity: number; 
  pivot: ConsumablePivot;
}


export interface ConsumableConvertionData {
  secondary_unit: Unit | null; 
  primary_unit: Unit;
  equivalence: number; 
  consumable: ConsumableItem[];
}

const fetchConsumableConvertionById = async (
  article_id: string | null,
  company?: string
): Promise<ConsumableConvertionData> => {
  const { data } = await axios.get(`/${company}/batches/${article_id}`);
  return data;
};

export const useGetBatchById = (
  article_id: string | null,
  company?: string
) => {
  return useQuery<ConsumableConvertionData, Error>({
    queryKey: ["article-convertion", article_id, company],
    queryFn: () => fetchConsumableConvertionById(article_id, company!),
    enabled: !!article_id && !!company,
  });
};
