import axiosInstance from "@/lib/axios";
import { Employee } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchWorkOrderEmployees = async ({
  company,
  location_id,
  acronym,
}: {
  company: string;
  location_id: string;
  acronym: string;
}): Promise<Employee[]> => {
  if (!company) {
    throw new Error("Company is required");
  }

  console.log(`Fetching employees for company: ${company}`);
  const { data } = await axiosInstance.get(
    `/${company}/${location_id}/employees-by-department/${acronym}`
  );
  return data;
};

export const useGetWorkOrderEmployees = ({
  company,
  location_id,
  acronym,
}: {
  company?: string;
  location_id?: string;
  acronym: string;
}) => {
  const isEnabled = !!company && !!location_id;

  // console.log(
  //   `useGetWorkOrderEmployees - company: ${company}, enabled: ${isEnabled}`
  // );

  return useQuery<Employee[]>({
    queryKey: ["employees", company], // Cambiado para usar la misma key que otros hooks de empleados
    queryFn: () =>
      fetchWorkOrderEmployees({
        company: company!,
        location_id: location_id!,
        acronym,
      }),
    enabled: isEnabled, // Solo se ejecuta cuando company esté definido
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: (failureCount, error) => {
      // No reintentar si es un error de validación
      if (error.message === "Company is required") {
        return false;
      }
      return failureCount < 3;
    },
  });
};
