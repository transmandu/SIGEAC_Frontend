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
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["surveys", data.company, data.location_id] });
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

interface UpdateSurveyData {
  company: string;
  location_id: string;
  survey_number: string;
  data: surveyData;
}

export const useUpdateSurvey = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      company,
      location_id,
      survey_number,
      data,
    }: UpdateSurveyData) => {
      const response = await axiosInstance.put(
        `/${company}/${location_id}/sms/survey/${survey_number}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["surveys", variables.company, variables.location_id],
      });
      toast.success("¡Actualizada!", {
        description: "Encuesta actualizada exitosamente",
      });
    },
    onError: (error: any) => {
      // Extraer mensaje y error del backend
      const backendMessage = error?.response?.data?.message || "";
      const backendError = error?.response?.data?.error || "";

      // Determinar el título y descripción según el tipo de error
      const isAnsweredSurvey = backendMessage?.toLowerCase().includes("no se puede editar");

      if (isAnsweredSurvey) {
        toast.error("No se puede editar", {
          description: backendError || "Esta encuesta ya ha sido respondida y no se puede modificar",
        });
      } else {
        toast.error("Error al actualizar", {
          description: backendMessage || "No se pudo actualizar la encuesta",
        });
      }

      console.log(error);
    },
  });

  return {
    updateSurvey: updateMutation,
  };
};

// ============================================
// QUESTION-LEVEL CRUD HOOKS
// ============================================

interface UpdateQuestionData {
  company: string;
  location_id: string;
  survey_number: string;
  question_id: number;
  data: {
    text: string;
    type: "SINGLE" | "MULTIPLE" | "OPEN";
    is_required: boolean;
    options?: Array<{
      text: string;
      is_correct?: boolean;
    }>;
  };
}

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      company,
      location_id,
      survey_number,
      question_id,
      data,
    }: UpdateQuestionData) => {
      const response = await axiosInstance.put(
        `/${company}/${location_id}/sms/survey/${survey_number}/question/${question_id}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["surveys", variables.company, variables.location_id],
      });
      toast.success("¡Actualizada!", {
        description: "Pregunta actualizada exitosamente",
      });
    },
    onError: (error: any) => {
      const backendMessage = error?.response?.data?.message || "";
      const backendError = error?.response?.data?.error || "";

      const isAnsweredSurvey = backendMessage?.toLowerCase().includes("no se puede editar");

      if (isAnsweredSurvey) {
        toast.error("No se puede editar", {
          description: backendError || "Esta encuesta ya ha sido respondida",
        });
      } else {
        toast.error("Error al actualizar", {
          description: backendMessage || "No se pudo actualizar la pregunta",
        });
      }

      console.log(error);
    },
  });

  return {
    updateQuestion: updateMutation,
  };
};

interface DeleteQuestionData {
  company: string;
  location_id: string;
  survey_number: string;
  question_id: number;
}

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({
      company,
      location_id,
      survey_number,
      question_id,
    }: DeleteQuestionData) => {
      const response = await axiosInstance.delete(
        `/${company}/${location_id}/sms/survey/${survey_number}/question/${question_id}`
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["surveys", variables.company, variables.location_id],
      });
      toast.success("¡Eliminada!", {
        description: "Pregunta eliminada exitosamente",
      });
    },
    onError: (error: any) => {
      const backendMessage = error?.response?.data?.message || "";
      const backendError = error?.response?.data?.error || "";

      if (backendError.includes("al menos una pregunta")) {
        toast.error("No se puede eliminar", {
          description: "Una encuesta debe tener al menos una pregunta",
        });
      } else if (backendMessage?.toLowerCase().includes("no se puede eliminar")) {
        toast.error("No se puede eliminar", {
          description: backendError || "Esta encuesta ya ha sido respondida",
        });
      } else {
        toast.error("Error al eliminar", {
          description: backendMessage || "No se pudo eliminar la pregunta",
        });
      }

      console.log(error);
    },
  });

  return {
    deleteQuestion: deleteMutation,
  };
};

interface CreateQuestionData {
  company: string;
  location_id: string;
  survey_number: string;
  data: {
    text: string;
    type: "SINGLE" | "MULTIPLE" | "OPEN";
    is_required: boolean;
    options?: Array<{
      text: string;
      is_correct?: boolean;
    }>;
  };
}

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      company,
      location_id,
      survey_number,
      data,
    }: CreateQuestionData) => {
      const response = await axiosInstance.post(
        `/${company}/${location_id}/sms/survey/${survey_number}/question`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["surveys", variables.company, variables.location_id],
      });
      toast.success("¡Creada!", {
        description: "Pregunta agregada exitosamente",
      });
    },
    onError: (error: any) => {
      const backendMessage = error?.response?.data?.message || "";
      const backendError = error?.response?.data?.error || "";

      const isAnsweredSurvey = backendMessage?.toLowerCase().includes("no se puede agregar");

      if (isAnsweredSurvey) {
        toast.error("No se puede agregar", {
          description: backendError || "Esta encuesta ya ha sido respondida",
        });
      } else {
        toast.error("Error al crear", {
          description: backendMessage || "No se pudo crear la pregunta",
        });
      }

      console.log(error);
    },
  });

  return {
    createQuestion: createMutation,
  };
};

interface UpdateSurveyInfoData {
  company: string;
  location_id: string;
  survey_number: string;
  data: {
    title: string;
    description: string;
    type?: "QUIZ" | "SURVEY";
  };
}

export const useUpdateSurveyInfo = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      company,
      location_id,
      survey_number,
      data,
    }: UpdateSurveyInfoData) => {
      const response = await axiosInstance.patch(
        `/${company}/${location_id}/sms/survey/${survey_number}/info`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["surveys", variables.company, variables.location_id],
      });
      toast.success("¡Actualizada!", {
        description: "Información actualizada exitosamente",
      });
    },
    onError: (error: any) => {
      const backendMessage = error?.response?.data?.message || "";
      const backendError = error?.response?.data?.error || "";

      const isAnsweredSurvey = backendMessage?.toLowerCase().includes("no se puede editar");

      if (isAnsweredSurvey) {
        toast.error("No se puede editar", {
          description: backendError || "Esta encuesta ya ha sido respondida",
        });
      } else {
        toast.error("Error al actualizar", {
          description: backendMessage || "No se pudo actualizar la información",
        });
      }

      console.log(error);
    },
  });

  return {
    updateSurveyInfo: updateMutation,
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