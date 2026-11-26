import { useMemo } from "react";

import { useGetJobTitles } from "@/hooks/ajustes/cargo/useGetJobTitles";
import { useGetDepartments } from "@/hooks/ajustes/departamento/useGetDepartment";
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany";
import { flattenDepartments } from "@/lib/departments";
import { locationLabel } from "@/lib/locations";

export interface AssignmentOption {
  id: string;
  label: string;
}

/**
 * Las tres listas de donde sale la asignación de un empleado (cargo,
 * departamento y sede), listas para un selector con búsqueda.
 */
export function useAssignmentOptions(company: string | undefined) {
  const { data: jobTitles, isLoading: loadingJobTitles } =
    useGetJobTitles(company);
  const { data: departments, isLoading: loadingDepartments } =
    useGetDepartments(company);
  const { data: locations, isLoading: loadingLocations } =
    useGetLocationsByCompany(company);

  const options = useMemo(
    () => ({
      jobTitles: (jobTitles ?? []).map((title): AssignmentOption => ({
        id: String(title.id),
        label: title.name,
      })),
      departments: flattenDepartments(departments ?? []).map(
        (department): AssignmentOption => ({
          id: String(department.id),
          label: department.name,
        }),
      ),
      locations: (locations ?? []).map((location): AssignmentOption => ({
        id: String(location.id),
        label: locationLabel(location),
      })),
    }),
    [jobTitles, departments, locations],
  );

  return {
    ...options,
    loading: {
      jobTitles: loadingJobTitles,
      departments: loadingDepartments,
      locations: loadingLocations,
    },
  };
}
