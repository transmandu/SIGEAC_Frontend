// hooks/survey/useEmailValidation.ts
import { useDebounce } from "@/hooks/helpers/useDebounce";
import { useGetEmailCompletedSurvey } from "./useGetEmailCompletedSurvey";
import { useState, useEffect } from "react";

export const useEmailValidation = (surveyId: string, company: string) => {
  const [email, setEmail] = useState("");
  const debouncedEmail = useDebounce(email, 500); // Debounce de 500ms

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

  // Re-fetch cuando el email debounced cambia
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
