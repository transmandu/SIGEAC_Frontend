// components/survey/SurveyResponseForm.tsx
"use client";

import { useCreateSurveyAnswers } from "@/actions/sms/survey/actions";
import {
  QuizResults,
  QuizResultsDialog,
} from "@/components/dialogs/aerolinea/sms/QuizResultDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useGetSurveyByNumber } from "@/hooks/sms/survey/useGetSurveyByNumber";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2, AlertCircle, Check } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { QuestionItem } from "./QuestionItem";
import { createSurveyValidator } from "@/components/forms/validators/sms/createSurveyValidator";
import { useEmailValidation } from "@/hooks/sms/survey/useEmailValidation";

type SurveyResponseType = {
  survey_number: string;
  email?: string;
  responses: {
    question_id: number;
    answer: {
      text?: string;
      option_ids?: number[];
    };
  }[];
};

// Componente principal
export default function SurveyResponseForm() {
  const params = useParams();
  const company = params.company as string;
  const surveyNumber = params.survey_number as string;
  const { createSurveyAnswers } = useCreateSurveyAnswers();
  const { user } = useAuth();
  const router = useRouter();

  const {
    data: survey,
    isLoading,
    error,
  } = useGetSurveyByNumber({
    survey_number: surveyNumber,
    company,
  });

  // Hook para validación de email
  const emailValidation = useEmailValidation(
    survey?.id?.toString() || "",
    company
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Crear esquema de validación
  const surveyResponseSchema = survey
    ? createSurveyValidator(survey, user, emailValidation)
    : z.object({
        survey_number: z.string(),
        email: user
          ? z.string().optional()
          : z
              .string()
              .email("Email inválido")
              .min(1, "El email es obligatorio"),
        responses: z.array(
          z.object({
            question_id: z.number(),
            answer: z.object({
              text: z.string().optional(),
              option_ids: z.array(z.number()).optional(),
            }),
          })
        ),
      });

  const form = useForm<SurveyResponseType>({
    resolver: zodResolver(surveyResponseSchema),
    defaultValues: {
      survey_number: surveyNumber,
      email: "",
      responses: [],
    },
    mode: "onChange",
  });

  // Sincronizar el email del formulario con el hook de validación
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "email" && value.email) {
        emailValidation.setEmail(value.email);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, emailValidation]);

  // Inicializar formulario cuando survey esté listo
  useEffect(() => {
    if (survey?.questions && !isSubmitted) {
      const responses = survey.questions.map((question: any) => ({
        question_id: question.id,
        answer: question.type === "OPEN" ? { text: "" } : { option_ids: [] },
      }));

      form.reset({
        survey_number: surveyNumber,
        email: "",
        responses,
      });
    }
  }, [survey, surveyNumber, form, isSubmitted]);

  const onSubmit = async (data: SurveyResponseType) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formattedData = {
        company: company,
        answers: {
          survey_number: data.survey_number,
          email: data.email,
          responses: data.responses,
        },
      };

      const response = await createSurveyAnswers.mutateAsync(formattedData);

      if (response.survey_type === "QUIZ" && response.quiz_results) {
        setQuizResults(response.quiz_results);
        setShowResults(true);
        setIsSubmitted(true);
      } else {
        setIsSubmitted(true);
      }
    } catch (error: any) {
      setSubmitError(
        error.response?.data?.message ||
          error.message ||
          "Error al enviar las respuestas. Intenta nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewAttempt = () => {
    router.refresh();
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !survey) {
    return <ErrorState />;
  }

  if (isSubmitted) {
    return (
      <SuccessState
        surveyType={survey.type}
        quizResults={quizResults}
        showResults={showResults}
        onShowResultsChange={setShowResults}
        onNewAttempt={handleNewAttempt}
      />
    );
  }

  const requiredQuestions = survey.questions.filter((q: any) => q.is_required);
  const requiredCount = requiredQuestions.length;
  const showEmailField = !user;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <SurveyHeader
        survey={survey}
        requiredCount={requiredCount}
        showEmailField={showEmailField}
      />

      {submitError && <ValidationError message={submitError} />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Campo de email con validación en tiempo real */}
          {showEmailField && (
            <EmailField form={form} emailValidation={emailValidation} />
          )}

          {/* Preguntas del survey */}
          {survey.questions.map((question: any, index: number) => (
            <QuestionItem
              key={question.id}
              question={question}
              index={index}
              form={form}
            />
          ))}

          <SubmitButton
            isSubmitting={isSubmitting}
            isValid={form.formState.isValid}
            emailValidation={emailValidation}
          />
        </form>
      </Form>
    </div>
  );
}

// Componentes auxiliares pequeños
function LoadingState() {
  return (
    <div className="flex justify-center items-center min-h-[300px]">
      <div className="text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-gray-600">Cargando encuesta...</p>
      </div>
    </div>
  );
}

function ErrorState() {
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

function SuccessState({
  surveyType,
  quizResults,
  showResults,
  onShowResultsChange,
  onNewAttempt,
}: any) {
  if (surveyType !== "QUIZ") {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-green-800 mb-2">
            ¡Encuesta Completada!
          </h2>
          <p className="text-green-700">
            Gracias por participar en nuestra encuesta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {quizResults && (
        <QuizResultsDialog
          results={quizResults}
          open={showResults}
          onOpenChange={onShowResultsChange}
        />
      )}

      <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-green-800 mb-2">
          ¡Quiz Completado!
        </h2>
        <p className="text-green-700 mb-4">
          Revisa tus resultados en el diálogo de arriba.
        </p>
        <div className="flex gap-4 sm:flex-col items-center justify-center">
          <Button
            onClick={onNewAttempt}
            variant="outline"
            className="border-green-600 text-green-700 hover:bg-green-100"
          >
            Nuevo Intento
          </Button>
        </div>
      </div>
    </div>
  );
}

function SurveyHeader({ survey, requiredCount, showEmailField }: any) {
  return (
    <div className="text-center space-y-3">
      <h1 className="text-2xl font-bold">{survey.title}</h1>
      <div className="text-sm text-gray-500">
        <span>{survey.survey_number}</span>
        <span className="mx-2">•</span>
        <span>{survey.type === "QUIZ" ? "Trivia" : "Encuesta"}</span>
      </div>
    </div>
  );
}

function ValidationError({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-800 text-sm">{message}</p>
    </div>
  );
}

function EmailField({
  form,
  emailValidation,
}: {
  form: any;
  emailValidation: any;
}) {
  const { hasCompleted, isLoading } = emailValidation;

  return (
    <div className="p-4 border rounded-lg bg-white">
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">
              Correo Electrónico <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="example@email.com"
                  {...field}
                  className={`mt-1 pr-10 ${
                    hasCompleted ? "border-red-300 bg-red-50" : ""
                  } ${isLoading ? "border-blue-300 bg-blue-50" : ""}`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                  {!isLoading && hasCompleted && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  {!isLoading &&
                    !hasCompleted &&
                    field.value &&
                    field.value.includes("@") && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                </div>
              </div>
            </FormControl>
            <FormMessage />
            {!isLoading && hasCompleted && (
              <p className="text-red-600 text-sm mt-1">
                Este email ya ha respondido esta encuesta
              </p>
            )}
            {!isLoading &&
              !hasCompleted &&
              field.value &&
              field.value.includes("@") && (
                <p className="text-green-600 text-sm mt-1">
                  Email válido y disponible
                </p>
              )}
          </FormItem>
        )}
      />
    </div>
  );
}

function SubmitButton({
  isSubmitting,
  isValid,
  emailValidation,
}: {
  isSubmitting: boolean;
  isValid: boolean;
  emailValidation: any;
}) {
  const { hasCompleted, isLoading } = emailValidation;

  const isDisabled = isSubmitting || !isValid || hasCompleted || isLoading;

  return (
    <div className="flex justify-center pt-4">
      <Button
        type="submit"
        size="lg"
        disabled={isDisabled}
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
  );
}
