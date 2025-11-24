import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

 interface SurveyOption {
  id: number;
  text: string;
  is_correct?: boolean; // Solo presente en QUIZ, pero oculto para usuarios
  question_id: string;
}

 interface SurveyQuestion {
  id: number;
  text: string;
  type: "SINGLE" | "MULTIPLE" | "OPEN";
  is_required: boolean;
  survey_id: string;
  options: SurveyOption[]; // Para preguntas OPEN, este array viene vacío
}

 interface Survey {
  id: number;
  title: string;
  type: "QUIZ" | "SURVEY";
  survey_number: string;
  description: string;
  is_active: boolean | string;
  registered_by: string;
  updated_by: string | null;
  location_id: string;
  questions: SurveyQuestion[];
}

// Tipo para la respuesta del hook useGetSurvey
export type SurveyResponse = Survey;
const fetchSurveyByNumber = async ({
  survey_number,
  company,
}: {
  survey_number: string;
  company?: string;
}) => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/survey/${survey_number}`
  );
  return data;
};

export const useGetSurveyByNumber = ({
  survey_number,
  company,
}: {
  survey_number: string;
  company?: string;
    }) => {
  return useQuery<Survey>({
    queryKey: ["survey-by-number", company, survey_number],
    queryFn: () => fetchSurveyByNumber({ survey_number, company }),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company && !!survey_number,
  });
};
