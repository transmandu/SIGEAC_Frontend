import axios from '@/lib/axios';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useQuery } from '@tanstack/react-query';
import type { GeneralArticleIntake, GeneralArticleIntakeStatus } from '@/types/purchase';

const fetchGeneralArticleIntakes = async (
  company: string,
  location_id: string,
  status?: GeneralArticleIntakeStatus
): Promise<GeneralArticleIntake[]> => {
  const { data } = await axios.get(`/${company}/${location_id}/general-article-intakes`, {
    params: status ? { status } : undefined,
  });
  return data;
};

export const useGetGeneralArticleIntakes = (status?: GeneralArticleIntakeStatus) => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  return useQuery<GeneralArticleIntake[], Error>({
    queryKey: ['general-article-intakes', selectedCompany?.slug, selectedStation, status],
    queryFn: () => fetchGeneralArticleIntakes(selectedCompany!.slug, selectedStation, status),
    enabled: !!selectedCompany && !!selectedStation,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
