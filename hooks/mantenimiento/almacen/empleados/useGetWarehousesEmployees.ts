import axios from "@/lib/axios";
import { Employee } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchWarehousesEmployees = async (
  location_id?: string,
  company?: string
): Promise<Employee[]> => {
  const { data } = await axios.get(
    `/${company}/employee-warehouse?location_id=${location_id}`
  );
  return data;
};

export const useGetWarehousesEmployees = (
  location_id?: string,
  company?: string
) => {
  return useQuery<Employee[], Error>({
    queryKey: ["warehouses-employees", company, location_id],
    queryFn: () => fetchWarehousesEmployees(location_id, company!),
    enabled: !!company && !!location_id, // Solo se ejecuta si hay company y location_id
  });
};
