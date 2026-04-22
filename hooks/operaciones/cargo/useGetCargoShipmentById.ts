import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { CargoShipment } from "@/types";

const fetchShipmentById = async (
  company: string,
  id: string,
): Promise<CargoShipment> => {
  const { data } = await axiosInstance.get(`/${company}/cargo-shipments/${id}`);
  return data;
};

export const useGetCargoShipmentById = (
  company: string | undefined,
  id: string | undefined,
) => {
  return useQuery({
    queryKey: ["cargo-shipment", company, id],
    queryFn: () => fetchShipmentById(company!, id!),
    enabled: !!company && !!id,
    staleTime: 1000 * 60 * 5,
  });
};
