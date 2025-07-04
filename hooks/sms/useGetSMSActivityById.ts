import axiosInstance from "@/lib/axios";
import { SMSActivity } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchSMSActivityById = async (id: string | number) => {
  const { data } = await axiosInstance.get(
    `transmandu/sms/sms-activities/${id}`
  );
  return data;
};  

export const useGetSMSActivityById = (id: string | number) => {
  return useQuery<SMSActivity>({
    queryKey: ["sms-activity", id], // Incluye el ID en la clave de la query
    queryFn: () => fetchSMSActivityById(id), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
