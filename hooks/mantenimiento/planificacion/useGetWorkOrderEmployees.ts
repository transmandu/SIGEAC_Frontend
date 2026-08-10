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

  return useQuery<Employee[]>({
    // Comparte key con el resto de hooks de empleados para reaprovechar caché.
    queryKey: ["employees", company],
    queryFn: () =>
      fetchWorkOrderEmployees({
        company: company!,
        location_id: location_id!,
        acronym,
      }),
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      // Falta un parámetro, no falló la red: reintentar daría el mismo error.
      if (error.message === "Company is required") {
        return false;
      }
      return failureCount < 3;
    },
  });
};
