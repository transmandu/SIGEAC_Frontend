"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@/lib/zod-resolver";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import {
  useCreateRiskAssessment,
  useUpdateRiskAssessment,
} from "@/actions/mantenimiento/sms/evaluacion_mitigacion/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatDate, getResult } from "@/lib/utils";
import { useGetAssessmentQuestions } from "@/hooks/sms/mantenimiento/useGetAssessmentQuestions";
import {
  HazardNotification,
  RiskAssessment,
  RiskAssessmentAnswer,
  RiskAssessmentHistoryEntry,
  RiskAssessmentQuestion,
} from "@/types/sms/mantenimiento";

import { FormSection } from "@/components/forms/mantenimiento/sms/_components/form-parts";
import { useResettingState } from "@/hooks/useResettingState";

const FORM_SCHEMA = z.object({
  hazard_notification_id: z.coerce
    .number({ error: "Seleccione una notificación." })
    .int()
    .positive("Seleccione una notificación."),
  probability: z.coerce
    .number({ error: "Seleccione la probabilidad." })
    .int()
    .min(1, "La probabilidad debe estar entre 1 y 5.")
    .max(5, "La probabilidad debe estar entre 1 y 5."),
});

type FormValues = z.infer<typeof FORM_SCHEMA>;
type AnswerRecord = Record<string, string>;

type RiskAssessmentFormProps = {
  company: string;
  selectedNotification: HazardNotification;
  currentAssessment?: RiskAssessment | null;
  onSaved?: (assessment: RiskAssessment | null) => void;
};

const YES_VALUE = "si";
const NO_VALUE = "no";

const PROBABILITY_OPTIONS = [
  {
    value: "1",
    label: "EXTREMADAMENTE IMPROBABLE",
    description: "Casi inconcebible que el evento ocurra",
  },
  {
    value: "2",
    label: "IMPROBABLE",
    description: "Muy improbable que ocurra (no se conoce que haya ocurrido)",
  },
  {
    value: "3",
    label: "REMOTO",
    description: "Improbable, pero es posible que ocurra (ocurre raramente)",
  },
  {
    value: "4",
    label: "OCASIONAL",
    description:
      "Probable que ocurra algunas veces (ha ocurrido infrecuentemente)",
  },
  {
    value: "5",
    label: "FRECUENTE",
    description:
      "Probable que ocurra muchas veces (ha ocurrido frecuentemente)",
  },
];

const SEVERITY_LABELS: Record<string, string> = {
  A: "Catastrófico",
  B: "Peligroso",
  C: "Grave",
  D: "Leve",
  E: "Insignificante",
};

const getQuestionOrder = (question: RiskAssessmentQuestion) =>
  question.sort_order ?? question.id;

const normalizeQuestionOptions = (
  options: RiskAssessmentQuestion["options"],
) => {
  if (Array.isArray(options)) {
    return options;
  }

  if (typeof options === "string") {
    try {
      const parsed = JSON.parse(options);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

const formatOptionLabel = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const getProbabilityLabel = (value?: string | number | null) => {
  const option = PROBABILITY_OPTIONS.find(
    (option) => option.value === String(value || ""),
  );
  return option ? `${option.label} (${String(value)})` : null;
};

const renderRiskLevelBadge = (label?: string | null) => {
  if (!label) return null;

  const normalized = String(label).toLowerCase();

  if (normalized.includes("intoler")) {
    return <Badge variant="destructive">{label}</Badge>;
  }

  if (normalized.includes("toler")) {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
        {label}
      </Badge>
    );
  }

  if (normalized.includes("acept")) {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        {label}
      </Badge>
    );
  }

  return <Badge variant="outline">{label}</Badge>;
};

const normalizeAssessmentAnswers = (
  assessment?: RiskAssessment | null,
): AnswerRecord => {
  const source = assessment?.answers || [];

  return source.reduce<AnswerRecord>((accumulator, answer) => {
    if (answer.question_code && typeof answer.answer !== "undefined") {
      accumulator[answer.question_code] = String(answer.answer);
    }

    return accumulator;
  }, {});
};

const normalizeAssessmentHistory = (
  assessment?: RiskAssessment | null,
): RiskAssessmentHistoryEntry[] => {
  if (!assessment) {
    return [];
  }

  const source = assessment.history || [];
  return Array.isArray(source) ? source : [];
};

const deriveSeverityFromAnswers = (answers: AnswerRecord) => {
  if (answers.SEV_A === YES_VALUE || answers.SEV_B === YES_VALUE) {
    return "A";
  }

  if (
    answers.SEV_A === NO_VALUE &&
    answers.SEV_B === NO_VALUE &&
    (answers.SEV_C === YES_VALUE ||
      answers.SEV_D === YES_VALUE ||
      answers.SEV_E === YES_VALUE)
  ) {
    return "B";
  }

  if (
    answers.SEV_A === NO_VALUE &&
    answers.SEV_B === NO_VALUE &&
    answers.SEV_C === NO_VALUE &&
    answers.SEV_D === NO_VALUE &&
    answers.SEV_E === NO_VALUE &&
    (answers.SEV_F === YES_VALUE ||
      answers.SEV_G === YES_VALUE ||
      answers.SEV_H === YES_VALUE)
  ) {
    return "C";
  }

  if (
    answers.SEV_A === NO_VALUE &&
    answers.SEV_B === NO_VALUE &&
    answers.SEV_C === NO_VALUE &&
    answers.SEV_D === NO_VALUE &&
    answers.SEV_E === NO_VALUE &&
    answers.SEV_F === NO_VALUE &&
    answers.SEV_G === NO_VALUE &&
    answers.SEV_H === NO_VALUE &&
    answers.SEV_I === YES_VALUE
  ) {
    return "D";
  }

  if (
    answers.SEV_A === NO_VALUE &&
    answers.SEV_B === NO_VALUE &&
    answers.SEV_C === NO_VALUE &&
    answers.SEV_D === NO_VALUE &&
    answers.SEV_E === NO_VALUE &&
    answers.SEV_F === NO_VALUE &&
    answers.SEV_G === NO_VALUE &&
    answers.SEV_H === NO_VALUE &&
    answers.SEV_I === NO_VALUE &&
    answers.SEV_J === YES_VALUE
  ) {
    return "E";
  }

  return null;
};

const deriveProbabilityFromAnswers = (answers: AnswerRecord) => {
  if (answers.PROB_A === NO_VALUE) {
    return 1;
  }

  if (answers.PROB_A !== YES_VALUE) {
    return null;
  }

  if (answers.PROB_B === NO_VALUE) {
    return 2;
  }

  if (answers.PROB_B !== YES_VALUE) {
    return null;
  }

  if (answers.PROB_C === "una_vez_al_anio") {
    return 3;
  }

  if (answers.PROB_C !== "dos_o_mas_veces_al_anio") {
    return null;
  }

  if (answers.PROB_D === "una_vez_al_mes") {
    return 4;
  }

  if (answers.PROB_D === "mas_de_una_vez_al_mes") {
    return 5;
  }

  return null;
};

const getVisibleSeverityQuestions = (
  severityQuestions: RiskAssessmentQuestion[],
  answers: AnswerRecord,
) => {
  const visible: RiskAssessmentQuestion[] = [];

  for (const question of severityQuestions) {
    visible.push(question);
    const answer = answers[question.code];

    if (!answer || answer === YES_VALUE) {
      break;
    }
  }

  return visible;
};

const getVisibleProbabilityQuestions = (
  probabilityQuestions: RiskAssessmentQuestion[],
  answers: AnswerRecord,
) => {
  const visible: RiskAssessmentQuestion[] = [];

  for (const question of probabilityQuestions) {
    visible.push(question);
    const answer = answers[question.code];

    if (!answer) {
      break;
    }

    if (question.code === "PROB_A" && answer === NO_VALUE) {
      break;
    }

    if (question.code === "PROB_B" && answer === NO_VALUE) {
      break;
    }

    if (question.code === "PROB_C" && answer === "una_vez_al_anio") {
      break;
    }

    if (question.code === "PROB_D") {
      break;
    }
  }

  return visible;
};

const pruneAnswersForVisibleQuestions = (
  nextAnswers: AnswerRecord,
  severityQuestions: RiskAssessmentQuestion[],
  probabilityQuestions: RiskAssessmentQuestion[],
) => {
  const visibleCodes = new Set([
    ...getVisibleSeverityQuestions(severityQuestions, nextAnswers).map(
      (question) => question.code,
    ),
    ...getVisibleProbabilityQuestions(probabilityQuestions, nextAnswers).map(
      (question) => question.code,
    ),
  ]);

  return Object.fromEntries(
    Object.entries(nextAnswers).filter(([questionCode]) =>
      visibleCodes.has(questionCode),
    ),
  );
};

const normalizeRiskAssessmentPayload = (
  payload: unknown,
): RiskAssessment | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("data" in (payload as Record<string, unknown>)) {
    const nested = (payload as Record<string, unknown>).data;
    return normalizeRiskAssessmentPayload(nested);
  }

  if ("id" in (payload as Record<string, unknown>)) {
    return payload as RiskAssessment;
  }

  return null;
};

function QuestionField({
  question,
  value,
  error,
  onChange,
}: {
  question: RiskAssessmentQuestion;
  value?: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const selectOptions = normalizeQuestionOptions(question.options);

  return (
    <div
      className={cn(
        "space-y-3 border-b pb-4 last:border-b-0 last:pb-0",
        error && "border-destructive/50",
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-sm font-medium">{question.question}</p>
        <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
          {question.code}
        </span>
      </div>

      {question.answer_type === "yes_no" ? (
        <RadioGroup
          value={value || ""}
          onValueChange={onChange}
          className="flex flex-wrap gap-6"
        >
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <RadioGroupItem value={YES_VALUE} aria-invalid={Boolean(error)} />
            <span>Sí</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <RadioGroupItem value={NO_VALUE} aria-invalid={Boolean(error)} />
            <span>No</span>
          </label>
        </RadioGroup>
      ) : (
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger aria-invalid={Boolean(error)} className="sm:max-w-xs">
            <SelectValue placeholder="Seleccione una opción" />
          </SelectTrigger>
          <SelectContent>
            {selectOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {formatOptionLabel(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

export function RiskAssessmentForm({
  company,
  selectedNotification,
  currentAssessment,
  onSaved,
}: RiskAssessmentFormProps) {
  const { createRiskAssessment } = useCreateRiskAssessment();
  const { updateRiskAssessment } = useUpdateRiskAssessment();
  const {
    data: fetchedQuestions,
    isLoading,
    isError,
    refetch,
  } = useGetAssessmentQuestions(company);
  const [answers, setAnswers] = useResettingState<AnswerRecord>(
    () => normalizeAssessmentAnswers(currentAssessment),
    [currentAssessment, selectedNotification.id],
  );
  const [questionErrors, setQuestionErrors] = useResettingState<
    Record<string, string>
  >({}, [currentAssessment, selectedNotification.id]);

  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(FORM_SCHEMA),
    defaultValues: {
      hazard_notification_id: selectedNotification.id,
      probability: currentAssessment?.probability
        ? Number(currentAssessment.probability)
        : undefined,
    },
  });

  const orderedQuestions = useMemo(
    () =>
      [...(fetchedQuestions || [])].sort(
        (left, right) => getQuestionOrder(left) - getQuestionOrder(right),
      ),
    [fetchedQuestions],
  );

  const severityQuestions = useMemo(
    () =>
      orderedQuestions.filter((question) => question.category === "SEVERITY"),
    [orderedQuestions],
  );
  const probabilityQuestions = useMemo(
    () =>
      orderedQuestions.filter(
        (question) => question.category === "PROBABILITY",
      ),
    [orderedQuestions],
  );

  const visibleSeverityQuestions = useMemo(
    () => getVisibleSeverityQuestions(severityQuestions, answers),
    [answers, severityQuestions],
  );
  const visibleProbabilityQuestions = useMemo(
    () => getVisibleProbabilityQuestions(probabilityQuestions, answers),
    [answers, probabilityQuestions],
  );

  const derivedSeverity = useMemo(
    () => deriveSeverityFromAnswers(answers),
    [answers],
  );
  const derivedProbability = useMemo(
    () => deriveProbabilityFromAnswers(answers),
    [answers],
  );
  const watchedProbability = useWatch({
    control: form.control,
    name: "probability",
  });
  const previewResult =
    watchedProbability && derivedSeverity
      ? `${watchedProbability}${derivedSeverity}`
      : null;
  const previewRiskLevel = previewResult ? getResult(previewResult) : null;
  const historyEntries = useMemo(
    () => normalizeAssessmentHistory(currentAssessment),
    [currentAssessment],
  );

  useEffect(() => {
    form.reset({
      hazard_notification_id: selectedNotification.id,
      probability: currentAssessment?.probability
        ? Number(currentAssessment.probability)
        : undefined,
    });
  }, [currentAssessment, form, selectedNotification.id]);

  useEffect(() => {
    if (!derivedProbability || form.formState.dirtyFields.probability) {
      return;
    }

    form.setValue("probability", derivedProbability, {
      shouldValidate: true,
    });
  }, [derivedProbability, form]);

  const handleAnswerChange = (questionCode: string, value: string) => {
    setQuestionErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors[questionCode];
      return nextErrors;
    });

    setAnswers((current) =>
      pruneAnswersForVisibleQuestions(
        {
          ...current,
          [questionCode]: value,
        },
        severityQuestions,
        probabilityQuestions,
      ),
    );
  };

  const handleApplyDerivedProbability = () => {
    if (!derivedProbability) {
      return;
    }

    form.setValue("probability", derivedProbability, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSubmit = async (values: FormValues) => {
    setQuestionErrors({});

    const payloadAnswers = orderedQuestions.reduce<RiskAssessmentAnswer[]>(
      (accumulator, question) => {
        const answer = answers[question.code];

        if (!answer) {
          return accumulator;
        }

        accumulator.push({
          question_code: question.code,
          answer,
        });

        return accumulator;
      },
      [],
    );

    try {
      const payload = {
        hazard_notification_id: values.hazard_notification_id,
        probability: values.probability,
        answers: payloadAnswers,
      };

      const response = currentAssessment?.id
        ? await updateRiskAssessment.mutateAsync({
            company,
            id: currentAssessment.id,
            data: payload,
          })
        : await createRiskAssessment.mutateAsync({
            company,
            data: payload,
          });

      onSaved?.(normalizeRiskAssessmentPayload(response));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
          router.replace("/login?session=expired");
          return;
        }

        if (status === 422) {
          const apiErrors = (
            error.response?.data as { errors?: Record<string, string[]> }
          )?.errors;

          if (apiErrors) {
            Object.entries(apiErrors).forEach(([field, messages]) => {
              const message = messages[0];

              if (
                field === "hazard_notification_id" ||
                field === "probability"
              ) {
                form.setError(field, {
                  type: "server",
                  message,
                });
                return;
              }

              const match = field.match(/^answers\.(\d+)\./);
              if (!match) {
                return;
              }

              const answerIndex = Number(match[1]);
              const relatedAnswer = payloadAnswers[answerIndex];

              if (relatedAnswer?.question_code) {
                setQuestionErrors((current) => ({
                  ...current,
                  [relatedAnswer.question_code]: message,
                }));
              }
            });
          }
        }
      }
    }
  };

  const isSaving =
    createRiskAssessment.isPending || updateRiskAssessment.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        {form.formState.errors.hazard_notification_id?.message && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.hazard_notification_id.message}
          </p>
        )}

        <FormSection
          title="Cuestionario de evaluación"
          hint="Responda en orden; el flujo se detiene cuando la respuesta ya permite determinar el valor."
        >
          <div className="grid gap-8 xl:grid-cols-2">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-sm font-semibold">
                  Estimación de severidad
                </h4>
                {derivedSeverity && (
                  <Badge>
                    {derivedSeverity} — {SEVERITY_LABELS[derivedSeverity]}
                  </Badge>
                )}
              </div>

              {isLoading ? (
                <p className="text-sm text-muted-foreground">
                  Cargando preguntas de severidad…
                </p>
              ) : isError ? (
                <p className="text-sm text-muted-foreground">
                  No fue posible cargar las preguntas.{" "}
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="font-medium text-primary underline underline-offset-4"
                  >
                    Reintentar
                  </button>
                </p>
              ) : (
                visibleSeverityQuestions.map((question) => (
                  <QuestionField
                    key={question.code}
                    question={question}
                    value={answers[question.code]}
                    error={questionErrors[question.code]}
                    onChange={(value) =>
                      handleAnswerChange(question.code, value)
                    }
                  />
                ))
              )}
            </div>

            <div className="space-y-4 xl:border-l xl:border-border xl:pl-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-sm font-semibold">
                  Estimación de probabilidad
                </h4>
                {derivedProbability && (
                  <Badge variant="secondary">
                    Sugerida: {getProbabilityLabel(derivedProbability)}
                  </Badge>
                )}
              </div>

              {isLoading ? (
                <p className="text-sm text-muted-foreground">
                  Cargando preguntas de probabilidad…
                </p>
              ) : isError ? (
                <p className="text-sm text-muted-foreground">
                  No fue posible cargar las preguntas.{" "}
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="font-medium text-primary underline underline-offset-4"
                  >
                    Reintentar
                  </button>
                </p>
              ) : (
                visibleProbabilityQuestions.map((question) => (
                  <QuestionField
                    key={question.code}
                    question={question}
                    value={answers[question.code]}
                    error={questionErrors[question.code]}
                    onChange={(value) =>
                      handleAnswerChange(question.code, value)
                    }
                  />
                ))
              )}

              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Probabilidad seleccionada:{" "}
                  <span className="font-medium text-foreground">
                    {watchedProbability
                      ? getProbabilityLabel(watchedProbability)
                      : "Sin definir"}
                  </span>
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleApplyDerivedProbability}
                  disabled={!derivedProbability}
                >
                  Usar probabilidad estimada
                </Button>
              </div>
            </div>
          </div>
        </FormSection>

        <div className="flex flex-col gap-3 border-t pt-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Vista previa calculada</p>
            <div className="flex flex-wrap gap-2 text-sm">
              {derivedProbability && (
                <Badge variant="secondary">
                  Prob. estimada: {getProbabilityLabel(derivedProbability)}
                </Badge>
              )}
              {watchedProbability ? (
                <Badge variant="secondary">
                  Prob. enviada: {getProbabilityLabel(watchedProbability)}
                </Badge>
              ) : null}
              {derivedSeverity && (
                <Badge variant="secondary">
                  Severidad: {derivedSeverity} —{" "}
                  {SEVERITY_LABELS[derivedSeverity]}
                </Badge>
              )}
              {previewResult && <Badge>{previewResult}</Badge>}
              {previewRiskLevel && renderRiskLevelBadge(previewRiskLevel)}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full sm:w-auto lg:min-w-52"
            disabled={
              !selectedNotification.id || !watchedProbability || isSaving
            }
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {currentAssessment ? "Actualizar evaluación" : "Guardar evaluación"}
          </Button>
        </div>

        {historyEntries.length > 0 && (
          <FormSection
            title="Historial"
            hint="Evaluaciones registradas previamente para esta notificación."
          >
            <div className="divide-y divide-border">
              {historyEntries.map((entry, index) => (
                <div
                  key={`${entry.id || index}-${entry.updated_at || entry.created_at || index}`}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-wrap gap-2">
                    {entry.probability && (
                      <Badge variant="secondary">
                        Probabilidad:{" "}
                        {getProbabilityLabel(entry.probability) ||
                          entry.probability}
                      </Badge>
                    )}
                    {entry.severity && (
                      <Badge variant="secondary">
                        Severidad: {entry.severity} —{" "}
                        {SEVERITY_LABELS[entry.severity]}
                      </Badge>
                    )}
                    {entry.result && <Badge>{entry.result}</Badge>}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {entry.updated_at || entry.created_at
                      ? formatDate(entry.updated_at || entry.created_at || "")
                      : "Sin fecha registrada"}
                  </p>
                </div>
              ))}
            </div>
          </FormSection>
        )}
      </form>
    </Form>
  );
}
