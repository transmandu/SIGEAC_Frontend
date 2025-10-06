import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type Option = {
  option: string;
};

interface Question {
  question: string;
  type: string;
  is_required: boolean;
  options?: Option[];
}

interface surveyData {
  name: string;
  description: string;
  location_id: string;
  questions: Question[];
}

export const useCreateSurvey = () => {
  const queryClient = useQueryClient();
  const { selectedCompany } = useCompanyStore();

  const createMutation = useMutation({
    mutationFn: async (surveyData: surveyData) => {
      const response = await axiosInstance.post(
        `/${selectedCompany?.slug}/sms/forms`,
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
