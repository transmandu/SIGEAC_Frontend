// hooks/survey/useGetEmailCompletedSurvey.ts
import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

const fetchCompletedSurvey = async ({
  id,
  email,
  company,
}: {
  id: string;
  email: string;
  company?: string;
}) => {
  // Validar que los parámetros requeridos estén presentes
  if (!id || !email || !company) {
    throw new Error("Parámetros incompletos para la consulta");
  }

  // Validar que el ID no sea "temp" (nuestro valor temporal)
  if (id === "temp") {
    return false; // Retornar false mientras no tengamos el ID real
  }

  const { data } = await axiosInstance.get(
    `/${company}/sms/email-completed-survey/${id}/${email}`
  );
  return data;
};

export const useGetEmailCompletedSurvey = ({
  id,
  email,
  company,
}: {
  id: string;
  email: string;
  company?: string;
}) => {
  // Solo habilitar la consulta si tenemos todos los datos necesarios
  const isEnabled =
    !!company && !!id && id !== "temp" && !!email && email.includes("@");

  return useQuery<boolean>({
    queryKey: ["survey-is-completed", company, id, email],
    queryFn: () => fetchCompletedSurvey({ id, email, company }),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: isEnabled,
    retry: false, // Evitar reintentos si hay error de CORS
  });
};
