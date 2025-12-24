import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface BatchArticle {
  id: number;
  part_number: string;
  alternative_part_number?: string[];
  serial?: string;
  lot_number?: string;
  description?: string;
  zone: string;
  quantity: number;
  status: string;
  condition: string;
  unit_secondary?: string;
  cost?: number;
  certificates?: string[];
  article_type?: string;
  component?: {
    shell_time?: {
      caducate_date?: string | null;
      fabrication_date?: string | null;
    };
  };
  consumable?: {
    caducate_date?: string | null;
    fabrication_date?: string | null;
  };
  tool?: {
    status?: string;
    needs_calibration?: boolean | string;
    calibration_date?: string;
    next_calibration_date?: string;
    next_calibration?: number | string;
  };
}

export interface BatchData {
  batch: {
    id: number;
    name: string;
    slug: string;
    category: string;
    medition_unit: string;
    is_hazardous?: boolean;
  };
  articles: BatchArticle[];
}

const fetchBatchById = async (
  company: string,
  locationId: string,
  batchId: string
): Promise<BatchData> => {
  const { data } = await axiosInstance.get(
    `/${company}/${locationId}/batches/${batchId}`
  );
  return data;
};

export const useGetBatchById = (
  company?: string,
  locationId?: string,
  batchId?: string
) => {
  return useQuery<BatchData>({
    queryKey: ["batch-by-id", company, locationId, batchId],
    queryFn: () => fetchBatchById(company!, locationId!, batchId!),
    enabled: !!company && !!locationId && !!batchId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
