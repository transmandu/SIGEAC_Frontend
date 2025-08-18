import axiosInstance from "@/lib/axios";
import { MitigationTable } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetDangerIdentificationWithAllById = async ({
  company,
  id,
}: {
  company?: string;
  id: string;
}) => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/danger-identification/with-all-by/${id}`
  );
  return data;
};

export const useGetDangerIdentificationWithAllById = ({
  company,
  id,
}: {
  company?: string;
  id: string;
}) => {
  return useQuery<MitigationTable>({
    queryKey: ["danger-identification/with-all-by", id], // Incluye el ID en la clave de la query
    queryFn: () => fetDangerIdentificationWithAllById({ company, id }), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id && !!company,
  });
};
