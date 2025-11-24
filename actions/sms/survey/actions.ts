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
    email?: string;
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["surveys", selectedCompany?.slug, selectedStation],
      });
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

export const useDeleteSurvey = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({
      company,
      location_id,
      survey_number,
    }: {
      company: string | null;
      location_id: string | null;
      survey_number: string;
    }) => {
      await axiosInstance.delete(
        `/${company}/${location_id}/sms/survey/${survey_number}`
      );
    },
    onSuccess: (_,data) => {
      queryClient.invalidateQueries({ queryKey: ["surveys",data.company,data.location_id] });
      toast.success("¡Eliminado!", {
        description: `¡La encuesta ha sido eliminada correctamente!`,
      });
    },
    onError: (e) => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar la encuesta!",
      });
    },
  });

  return {
    deleteSurvey: deleteMutation,
  };
};

interface SettingData {
  id: string;
  company?: string;
  setting: string;
}

export const useUpdateSurveySetting = () => {
  const queryClient = useQueryClient();

  const updateSettingSurveyMutation = useMutation({
    mutationFn: async ({ company, id, setting }: SettingData) => {
      const response = await axiosInstance.patch(
        `/${company}/sms/survey/${id}/${setting}`,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      toast.success("¡Actualizada!", {
        description: `La encuesta fue configurada`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo configurar la encuesta...",
      });
      console.log(error);
    },
  });
  return {
    updateSurveySetting: updateSettingSurveyMutation,
  };
};