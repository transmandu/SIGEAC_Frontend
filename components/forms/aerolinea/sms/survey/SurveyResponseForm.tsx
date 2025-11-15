"use client";

import { useCreateSurveyAnswers } from "@/actions/sms/survey/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useGetSurveyByNumber } from "@/hooks/sms/survey/useGetSurveyByNumber";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Función auxiliar para verificar si se proporcionó una respuesta
function isAnswerProvided(answer: any, questionType: string): boolean {
  if (!answer) return false;

  if (questionType === "OPEN") {
    return answer.text && answer.text.trim().length > 0;
  } else {
    return answer.option_ids && answer.option_ids.length > 0;
  }
}

// Esquemas de validación
const AnswerSchema = z.object({
  text: z.string().optional(),
  option_ids: z.array(z.number()).optional(),
});

const QuestionResponseSchema = z.object({
  question_id: z.number(),
  answer: AnswerSchema,
});

// Crear el esquema dinámicamente basado en el survey
const createSurveyResponseSchema = (survey: any) =>
  z
    .object({
      survey_number: z.string(),
      responses: z
        .array(QuestionResponseSchema)
        .min(1, "Debe responder al menos una pregunta"),
    })
    .refine(
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

type SurveyResponseType = {
  survey_number: string;
  responses: {
    question_id: number;
    answer: {
      text?: string;
      option_ids?: number[];
    };
  }[];
};

// Componente de pregunta individual
function QuestionItem({
  question,
  index,
  form,
}: {
  question: any;
  index: number;
  form: any;
}) {
  const { type, text, is_required, options, id } = question;

  // Verificar si esta pregunta tiene error de validación
  const formErrors = form.formState.errors.responses;
  const hasError =
    formErrors &&
    is_required &&
    !isAnswerProvided(form.watch(`responses.${index}.answer`), type);

  return (
    <div
      className={`p-4 border rounded-lg space-y-3 bg-white ${hasError ? "border-red-300 bg-red-50" : ""}`}
    >
      <div>
        <h3 className="font-medium">
          {index + 1}. {text}
          {is_required && <span className="text-red-500 ml-1">*</span>}
        </h3>
        {type !== "OPEN" && (
          <p className="text-sm text-gray-500 mt-1">
            {type === "SINGLE"
              ? "Selecciona una opción"
              : "Selecciona una o más opciones"}
          </p>
        )}

        {/* Mensaje de error específico para esta pregunta */}
        {hasError && (
          <p className="text-red-600 text-sm mt-1">
            Esta pregunta es obligatoria
          </p>
        )}
      </div>

      <FormField
        control={form.control}
        name={`responses.${index}.answer`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              {type === "OPEN" ? (
                <Textarea
                  placeholder="Tu respuesta..."
                  className={`min-h-[80px] ${hasError ? "border-red-300" : ""}`}
                  value={field.value?.text || ""}
                  onChange={(e) =>
                    field.onChange({ ...field.value, text: e.target.value })
                  }
                />
              ) : type === "SINGLE" ? (
                <RadioGroup
                  value={field.value?.option_ids?.[0]?.toString() || ""}
                  onValueChange={(value) =>
                    field.onChange({
                      ...field.value,
                      option_ids: [parseInt(value)],
                    })
                  }
                  className="space-y-2"
                >
                  {options.map((option: any) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={option.id.toString()} />
                      <FormLabel className="font-normal cursor-pointer">
                        {option.text}
                      </FormLabel>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  {options.map((option: any) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        checked={
                          field.value?.option_ids?.includes(option.id) || false
                        }
                        onCheckedChange={(checked) => {
                          const current = field.value?.option_ids || [];
                          const newOptionIds = checked
                            ? [...current, option.id]
                            : current.filter((id: number) => id !== option.id);

                          field.onChange({
                            ...field.value,
                            option_ids: newOptionIds,
                          });
                        }}
                      />
                      <FormLabel className="font-normal cursor-pointer">
                        {option.text}
                      </FormLabel>
                    </div>
                  ))}
                </div>
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

// Componente principal
export default function SurveyResponseForm() {
  const params = useParams();
  const company = params.company as string;
  const surveyNumber = params.survey_number as string;
  const { createSurveyAnswers } = useCreateSurveyAnswers();

  const {
    data: survey,
    isLoading,
    error,
  } = useGetSurveyByNumber({
    survey_number: surveyNumber,
    company,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Crear esquema de validación basado en el survey
  const surveyResponseSchema = survey
    ? createSurveyResponseSchema(survey)
    : z.object({
        survey_number: z.string(),
        responses: z.array(QuestionResponseSchema),
      });

  const form = useForm<SurveyResponseType>({
    resolver: zodResolver(surveyResponseSchema),
    defaultValues: {
      survey_number: surveyNumber,
      responses: [],
    },
    mode: "onChange",
  });

  // Inicializar formulario cuando survey esté listo
  useEffect(() => {
    if (survey?.questions) {
      const responses = survey.questions.map((question: any) => ({
        question_id: question.id,
        answer: question.type === "OPEN" ? { text: "" } : { option_ids: [] },
      }));

      form.reset({
        survey_number: surveyNumber,
        responses,
      });
    }
  }, [survey, surveyNumber, form]);

  const onSubmit = async (data: SurveyResponseType) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log("Respuestas:", data);

      // FORMATO CORRECTO - survey_number y responses DENTRO de answers
      const formattedData = {
        company: company,
        answers: {
          survey_number: data.survey_number,
          responses: data.responses,
        },
      };
      await createSurveyAnswers.mutateAsync(formattedData);

      console.log("Respuestas enviadas exitosamente");
    } catch (error: any) {
      console.error("Error al enviar respuestas:", error);
      setSubmitError(
        error.response?.data?.message ||
          error.message ||
          "Error al enviar las respuestas. Intenta nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Cargando encuesta...</p>
        </div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <p className="text-red-600">No se pudo cargar la encuesta</p>
          <p className="text-gray-600 text-sm mt-1">
            Verifica el enlace e intenta nuevamente
          </p>
        </div>
      </div>
    );
  }

  const requiredQuestions = survey.questions.filter((q: any) => q.is_required);
  const requiredCount = requiredQuestions.length;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold">{survey.title}</h1>
        <p className="text-gray-600">{survey.description}</p>
        <div className="text-sm text-gray-500">
          <span>{survey.survey_number}</span>
          <span className="mx-2">•</span>
          <span>{survey.type === "QUIZ" ? "Trivia" : "Encuesta"}</span>
        </div>

        {requiredCount > 0 && (
          <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
            {requiredCount} pregunta(s) obligatoria(s) - marcadas con{" "}
            <span className="text-red-500">*</span>
          </p>
        )}
      </div>

      {/* Mensaje de error general del formulario */}
      {form.formState.errors.responses && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm font-medium">
            {form.formState.errors.responses.message}
          </p>
        </div>
      )}

      {/* Mensaje de error del envío */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{submitError}</p>
        </div>
      )}

      {/* Formulario */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {survey.questions.map((question: any, index: number) => (
            <QuestionItem
              key={question.id}
              question={question}
              index={index}
              form={form}
            />
          ))}

          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || !form.formState.isValid}
              className="min-w-[160px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                "Enviar Respuestas"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
