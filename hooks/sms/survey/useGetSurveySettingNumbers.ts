import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

 interface SurveyNumbers {
  OMA_QUIZ: string;
  SMS_QUIZ: string;
  SMS_SURVEY: string;
}

export type SurveyResponse = SurveyNumbers;

const fetchSurveySettingNumbers = async (
  company: string) => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/survey-setting`
  );
  return data;
};

export const useGetSurveySettingNumbers = (
  company: string) => {
  return useQuery<SurveyNumbers>({
    queryKey: ["survey-setting", company],
    queryFn: () => fetchSurveySettingNumbers(company),
    staleTime: 1000 * 60 * 5,
    enabled: !!company 
  });
};
