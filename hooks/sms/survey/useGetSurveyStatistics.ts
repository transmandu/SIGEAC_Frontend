import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useQuery } from "@tanstack/react-query";

interface data {
  company?: string;
  survey_number: string;
}

export interface SurveyStatistics {
  survey: string;
  statistics: QuestionStatistic[];
}

// CORREGIDO: answers es un objeto, no un array
export interface QuestionStatistic {
  question: string;
  answers: Record<string, number>; // Objeto, no array
}

const fetchSurveyStats = async ({
  company,
  survey_number,
}: data): Promise<SurveyStatistics> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/survey-statistics/${survey_number}`
  );
  return data;
};

export const useGetSurveyStats = (survey_number: string) => {
  const { selectedCompany } = useCompanyStore();
  return useQuery<SurveyStatistics>({
    queryKey: ["survey-responses", selectedCompany?.slug, survey_number], // Agrega survey_number al queryKey
    queryFn: () =>
      fetchSurveyStats({ company: selectedCompany?.slug, survey_number }),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!selectedCompany?.slug && !!survey_number,
  });
};
