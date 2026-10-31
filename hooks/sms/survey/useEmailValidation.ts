import { useDebounce } from "@/hooks/helpers/useDebounce";
import { useGetEmailCompletedSurvey } from "./useGetEmailCompletedSurvey";
import { useState } from "react";

const looksLikeEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Impide responder dos veces la misma encuesta con el mismo correo. Se consulta
// mientras se escribe, de ahí el debounce, pero solo con un correo completo:
// "juan.pe" no identifica a nadie y cada consulta cuenta contra el límite de
// peticiones de la ruta pública. El resultado se invalida al enviar las
// respuestas (useCreateSurveyAnswers).
export const useEmailValidation = (surveyId: string, company: string) => {
  const [email, setEmail] = useState("");
  const debouncedEmail = useDebounce(email, 500);

  const {
    data: hasCompleted,
    isLoading,
    error,
  } = useGetEmailCompletedSurvey({
    id: surveyId,
    email: looksLikeEmail(debouncedEmail) ? debouncedEmail : "",
    company,
  });

  return {
    email,
    setEmail,
    debouncedEmail,
    hasCompleted: !!hasCompleted,
    isLoading,
    error,
  };
};
