import axiosInstance from "@/lib/axios";
import { Employee } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchWorkOrderEmployees = async ({
  company,
  location_id,
  acronyms,
}: {
  company: string;
  location_id: string;
  acronyms: string;
}): Promise<Employee[]> => {
  if (!company) {
    throw new Error("Company is required");
  }

  const { data } = await axiosInstance.get(
    `/${company}/${location_id}/employees-by-department/${acronyms}`
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
  acronym: string | string[];
}) => {
  const acronyms = (Array.isArray(acronym) ? acronym : [acronym])
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);

  const uniqueAcronyms = Array.from(new Set(acronyms)).sort();
  const acronymsParam = uniqueAcronyms.join(",");

  const isEnabled = !!company && !!location_id && uniqueAcronyms.length > 0;

  return useQuery<Employee[]>({
    // Los acrónimos y la sede son parte de la key: sin ellos, dos formularios
    // con departamentos distintos se sirven la lista cacheada del otro.
    queryKey: ["employees", company, location_id, acronymsParam],
    queryFn: () =>
      fetchWorkOrderEmployees({
        company: company!,
        location_id: location_id!,
        acronyms: acronymsParam,
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
