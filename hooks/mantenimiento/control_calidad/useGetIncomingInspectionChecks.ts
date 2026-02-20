import type { ChecklistGroup } from "@/app/[company]/control_calidad/incoming/IncomingTypes";
import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useQuery } from "@tanstack/react-query";
import { checksToGroups } from "./IncomingChecks.mapper";

export interface IncomingChecklistResponse {
  id: number;
  code: string;
  description: string;
  is_critical: boolean;
  regulation: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

const fetchIncomingChecks = async (company?: string): Promise<IncomingChecklistResponse[]> => {
  const { data } = await axiosInstance.get(`/${company}/incoming-inspection-checks`);
  return data;
};

export const useGetIncomingChecks = (hasDocumentation: boolean) => {
  const { selectedCompany } = useCompanyStore();

  return useQuery({
    queryKey: ["incoming-checks", selectedCompany?.slug],
    queryFn: () => fetchIncomingChecks(selectedCompany?.slug),
    enabled: !!selectedCompany?.slug,
    staleTime: 1000 * 60 * 5,
    select: (checks) => checksToGroups(checks, hasDocumentation) satisfies ChecklistGroup[],
  });
};
