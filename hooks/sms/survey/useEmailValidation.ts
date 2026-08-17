import { useDebounce } from "@/hooks/helpers/useDebounce";
import { useGetEmailCompletedSurvey } from "./useGetEmailCompletedSurvey";
import { useState, useEffect } from "react";

// Impide responder dos veces la misma encuesta con el mismo correo. Se consulta
// mientras se escribe, de ahí el debounce.
export const useEmailValidation = (surveyId: string, company: string) => {
  const [email, setEmail] = useState("");
  const debouncedEmail = useDebounce(email, 500);

  const {
    data: hasCompleted,
    isLoading,
    error,
    refetch,
  } = useGetEmailCompletedSurvey({
    id: surveyId,
    email: debouncedEmail,
    company,
  });

  useEffect(() => {
    if (debouncedEmail && debouncedEmail.includes("@")) {
      refetch();
    }
  }, [debouncedEmail, refetch]);

  return {
    email,
    setEmail,
    debouncedEmail,
    hasCompleted: !!hasCompleted,
    isLoading,
    error,
  };
};
