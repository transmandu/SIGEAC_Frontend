import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export interface UniformItem {
  id: number;
  uniform_type: string;
  size: string;
  company: string;
  min_stock: number;
  active: boolean;
  current_stock: number;
  is_low_stock: boolean;
  type_label: string;
  company_label: string;
  movements_sum_quantity?: number | null;
  registered_by?: string | null;
  updated_by?: string | null;
}

export interface UniformMovement {
  id: number;
  uniform_item_id: number;
  movement_type: string;
  movement_type_label: string;
  quantity: number;
  recipient_name: string | null;
  date: string;
  notes: string | null;
  registered_by?: string | null;
  created_at?: string;
  item?: UniformItem;
}

export interface UniformOption {
  value: string;
  label: string;
}

export interface UniformTypeOption extends UniformOption {
  sizes: string[];
}

export interface UniformOptions {
  types: UniformTypeOption[];
  companies: UniformOption[];
  movement_types: UniformOption[];
}

export const useGetUniformItems = (
  company: string | undefined,
  onlyActive = false
) => {
  return useQuery<UniformItem[]>({
    queryKey: ["uniform-items", company, onlyActive],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/${company}/sms/uniforms/items`, {
        params: { only_active: onlyActive ? 1 : 0 },
      });
      return data;
    },
    enabled: !!company,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetUniformMovements = (
  company: string | undefined,
  filters?: { uniform_item_id?: number; from?: string; to?: string }
) => {
  return useQuery<UniformMovement[]>({
    queryKey: ["uniform-movements", company, filters],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/${company}/sms/uniforms/movements`,
        { params: filters }
      );
      return data;
    },
    enabled: !!company,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetUniformOptions = (company: string | undefined) => {
  return useQuery<UniformOptions>({
    queryKey: ["uniform-options", company],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/${company}/sms/uniforms/options`
      );
      return data;
    },
    enabled: !!company,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 30,
  });
};
