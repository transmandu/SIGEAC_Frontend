import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Survey } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type Option = {
  text: string;
  is_correct?: boolean;
};

interface Question {
  text: string;
  type: "SINGLE" | "MULTIPLE" | "OPEN";
  is_required: boolean;
  options?: Option[];
}

interface surveyData {
  title: string;
  type: string;
  description: string;
  questions: Question[];
}

interface AnswerData {
  option_ids?: number[];
  text?: string;
}

interface SurveyResponse {
  question_id: number;
  answer: AnswerData;
}

interface surveyAnswerData {
  company: string;
  answers: {
    survey_number: string;
    responses: SurveyResponse[];
  };
}

export const useCreateSurvey = () => {
  const queryClient = useQueryClient();
  const { selectedCompany, selectedStation } = useCompanyStore();

  const createMutation = useMutation({
    mutationFn: async (surveyData: surveyData) => {
      const response = await axiosInstance.post(
        `/${selectedCompany?.slug}/${selectedStation}/sms/survey`,
        surveyData
      );
      return response.data;
    },
    onSuccess: (_, data) => {
      toast.success("Creado!", {
        description: `Encuesta creada exitosamente`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo crear la encuesta",
      });
      console.log(error);
    },
  });
  return {
    createSurvey: createMutation,
  };
};

export const useCreateSurveyAnswers = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async ({ answers, company }: surveyAnswerData) => {
      console.log("FROM ACTION", answers);
      const response = await axiosInstance.post(
        `/${company}/sms/survey-answer`,
        answers
      );
      return response.data;
    },
    onSuccess: (_, data) => {
      toast.success("Creado!", {
        description: `Respuestas enviadas exitosamente`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo enviar las respuestas",
      });
      console.log(error);
    },
  });
  return {
    createSurveyAnswers: createMutation,
  };
};
