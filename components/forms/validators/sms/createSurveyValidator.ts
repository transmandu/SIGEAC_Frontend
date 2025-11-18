// validators/surveyValidator.ts
import { z } from "zod";

export const createSurveyValidator = (
  survey: any,
  user: any,
  emailValidation: {
    hasCompleted: boolean;
    isLoading: boolean;
  }
) => {
  const baseSchema = z.object({
    survey_number: z.string(),
    email: user
      ? z.string().optional()
      : z
          .string()
          .email("Email inválido")
          .min(1, "El email es obligatorio")
          .refine(() => !emailValidation.isLoading, "Verificando email...")
          .refine(
            () => !emailValidation.hasCompleted,
            "Este email ya ha respondido esta encuesta"
          ),
    responses: z
      .array(
        z.object({
          question_id: z.number(),
          answer: z.object({
            text: z.string().optional(),
            option_ids: z.array(z.number()).optional(),
          }),
        })
      )
      .min(1, "Debe responder al menos una pregunta"),
  });

  // Refinamiento para preguntas obligatorias
  return baseSchema.refine(
    (data) => {
      if (!survey) return true;

      const requiredQuestions = survey.questions.filter(
        (q: any) => q.is_required
      );

      return requiredQuestions.every((requiredQuestion: any) => {
        const response = data.responses.find(
          (r: any) => r.question_id === requiredQuestion.id
        );

        if (!response) return false;

        return isAnswerProvided(response.answer, requiredQuestion.type);
      });
    },
    {
      message: "Debe responder todas las preguntas obligatorias",
      path: ["responses"],
    }
  );
};

// Función auxiliar
export function isAnswerProvided(answer: any, questionType: string): boolean {
  if (!answer) return false;
  if (questionType === "OPEN") {
    return answer.text && answer.text.trim().length > 0;
  } else {
    return answer.option_ids && answer.option_ids.length > 0;
  }
}
