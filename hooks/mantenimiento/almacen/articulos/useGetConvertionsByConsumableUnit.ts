import axios from "@/lib/axios";
import { Unit } from "@/types";
import { useQuery } from "@tanstack/react-query";


interface converionData {
  id: number;
  unit_primary: Unit;
  equivalence: number;
  unit_secondary: Unit;
}

const fetchConversionByConsumableUnit = async (
  consumable_unit_id: number,
  company?: string
): Promise<converionData[]> => {
  const { data } = await axios.get(
    `/${company}/get-conversion-by-consumable-unit`,
    {
      params: { consumable_unit_id }, // ✅ Correcto para GET
    }
  );
  return data;
};

export const useGetConversionByUnitConsmable = (
  consumable_unit_id: number,
  company?: string
) => {
  return useQuery<converionData[], Error>({
    queryKey: ["convertions-by-consumable", company, consumable_unit_id],
    queryFn: () =>
      fetchConversionByConsumableUnit(consumable_unit_id, company!),
    enabled: !!consumable_unit_id && !!company,
  });
};
