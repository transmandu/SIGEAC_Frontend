import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useQuery } from "@tanstack/react-query";


interface data {
  company?: string;
  survey_number: string;
}

export interface ResponsesBySurvey {
  survey_number: string;
  survey_type: string;
  email: string | null;
  user_id: string | null;
  response_date: string; // o Date si planeas convertirlo
  questions_answered: number;
}

const fetchSurveyResponses = async ({
  company,
  survey_number,
}: data): Promise<ResponsesBySurvey[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/survey-responses/${survey_number}`
  );
  return data;
};

export const useGetSurveyResponses = (survey_number:string) => {
  const { selectedCompany } = useCompanyStore();
  return useQuery<ResponsesBySurvey[]>({
    queryKey: ["survey-responses", selectedCompany?.slug],
    queryFn: () =>
      fetchSurveyResponses({ company: selectedCompany?.slug, survey_number }),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!selectedCompany?.slug  && !!survey_number,
  });
};
