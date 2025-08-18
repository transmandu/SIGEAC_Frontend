import axiosInstance from "@/lib/axios";
import { SMSActivity } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchSMSActivityById = async ({
  company,
  id,
}: {
  company: string | null;
  id: string;
}) => {
  const { data } = await axiosInstance.get(`/${company}/sms/activities/${id}`);
  return data;
};

export const useGetSMSActivityById = ({
  company,
  id,
}: {
  company: string | null;
  id: string;
}) => {
  return useQuery<SMSActivity>({
    queryKey: ["sms-activity", id], // Incluye el ID en la clave de la query
    queryFn: () => fetchSMSActivityById({ company, id }), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
