// hooks/sms/survey/useGetResponsesByUser.ts
import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface FetchSurveyParams {
  company?: string; // Ahora es requerido
  survey_number: string;
  data?: {
    user_id?: string;
    email?: string;
  };
}

export interface SurveyResponseByUser {
  survey_id: number;
  survey_title: string;
  survey_type: string;
  user_identifier: string;
  responses: QuestionResponse[];
  total_questions_answered: number;
}

export interface QuestionResponse {
  question_id: number;
  question_text: string;
  question_type: "SINGLE" | "MULTIPLE" | "OPEN";
  user_answer: UserAnswer;
}

export interface UserAnswer {
  text: string | null;
  selected_options: SelectedOption[];
}

export interface SelectedOption {
  option_id: number;
  option_text: string;
  is_correct: boolean | null;
}

const fetchSurveyResponsesByUser = async ({
  company,
  survey_number,
  data,
}: FetchSurveyParams): Promise<SurveyResponseByUser> => {
  console.log("fetchSurveyResponsesByUser llamado con:", {
    company,
    survey_number,
    data,
  });

  const queryParams = new URLSearchParams();

  if (data?.email) queryParams.append("email", data.email);
  if (data?.user_id) queryParams.append("user", data.user_id);

  const queryString = queryParams.toString();
  const url = `/${company}/sms/user-survey-responses/${survey_number}${queryString ? `?${queryString}` : ""}`;

  console.log("🔗 URL de la API:", url);

  try {
    const { data: responseData } = await axiosInstance.get(url);
    console.log(" Respuesta de la API:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error en la petición:", error);
    throw error;
  }
};

interface Props {
  company?: string; // Ahora es requerido
  survey_number: string;
  data?: {
    user_id?: string;
    email?: string;
  };
}

export const useGetSurveyResponsesByUser = ({
  company,
  survey_number,
  data,
}: Props) => {
  console.log("useGetSurveyResponsesByUser - company recibido:", company);

  return useQuery<SurveyResponseByUser>({
    queryKey: ["survey-responses-by-user", company, survey_number, data],
    queryFn: () =>
      fetchSurveyResponsesByUser({
        company,
        survey_number,
        data,
      }),
    staleTime: 1000 * 60 * 5,
    enabled: !!company && !!survey_number, // Solo necesita company y survey_number
  });
};
