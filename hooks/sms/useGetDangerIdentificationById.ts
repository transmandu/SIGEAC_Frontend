import axiosInstance from "@/lib/axios";
import { DangerIdentification, User, VoluntaryReport } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetDangerIdentificationById = async ({
  company,
  id,
}: {
  company?: string;
  id: string;
}) => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/danger-identifications/${id}`
  );
  return data;
};

export const useGetDangerIdentificationById = ({
  company,
  id,
}: {
  company?: string;
  id: string;
}) => {
  return useQuery<DangerIdentification>({
    queryKey: ["danger-identification", id], // Incluye el ID en la clave de la query
    queryFn: () => fetDangerIdentificationById({ company, id }), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
