"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type FieldErrors,
  type FieldPath,
} from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import { zodResolver } from "@/lib/zod-resolver";
import { cn } from "@/lib/utils";
import { parseCalendarDate, toCalendarPayload } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerField } from "@/components/ui/DatePickerField";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import {
  PersonSelect,
  emptyDrillPerson,
  hasDrillPerson,
  toPersonPayload,
  type DrillPersonFormValue,
} from "@/components/forms/aerolinea/sms/drill/PersonSelect";

import {
  useCreateDrillEvaluation,
  useUpdateDrillEvaluation,
  useUploadDrillEvaluationDocument,
} from "@/actions/sms/drill_evaluations/actions";
import FolderSelect from "@/components/library/FolderSelect";
import { useGetAllEmployeesByCompany } from "@/hooks/ajustes/empleados/useGetAllEmployees";
import { useGetExternalEmployees } from "@/hooks/ajustes/convenios/useGetExternalEmployees";
import { useGetDrillEventTemplates } from "@/hooks/sms/drill_evaluations/useGetDrillEventTemplates";
import { useGetDrillMatrixCriteria } from "@/hooks/sms/drill_evaluations/useGetDrillMatrixCriteria";
import { useGetDrillQuestionTemplates } from "@/hooks/sms/drill_evaluations/useGetDrillQuestionTemplates";
import { useGetNextDrillNumber } from "@/hooks/sms/drill_evaluations/useGetNextDrillNumber";
import { useCompanyStore } from "@/stores/CompanyStore";
import type {
  DrillEvaluation,
  DrillEvaluationType,
  StoreDrillEvaluationPayload,
  UpdateDrillEvaluationPayload,
} from "@/types/sms/drill-evaluation";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const DRILL_ANSWER_OPTIONS = [
  { value: "SI", label: "Sí" },
  { value: "NO", label: "No" },
  { value: "PARCIAL", label: "Parcial" },
  { value: "NA", label: "N/A" },
] as const;

const FINDING_GROUPS = [
  {
    kind: "POSITIVE",
    title: "Aspectos positivos",
    hint: "Lo que se observó bien durante el simulacro.",
    placeholder: "Describa un aspecto positivo",
  },
  {
    kind: "IMPROVEMENT",
    title: "Aspectos por mejorar",
    hint: "Fallas o puntos de mejora detectados.",
    placeholder: "Describa la falla o el aspecto por mejorar",
  },
] as const;

const requiredString = (message: string) => z.string().trim().min(1, message);

const personSchema = z.object({
  mode: z.enum(["INTERNO", "AUTORIZADO", "EXTERNO"]),
  employee_id: z.string().optional(),
  authorized_employee_id: z.string().optional(),
  name: z.string().optional(),
});

const FormSchema = z
  .object({
    type: z.enum(["PARCIAL", "MESA"]),
    // Editable para cargar registros históricos. Vacío = se genera solo.
    number: z.string().optional(),
    date: z.date({ error: "La fecha es obligatoria" }),
    start_time: requiredString("La hora de inicio es obligatoria").regex(
      TIME_PATTERN,
      "Use el formato HH:mm.",
    ),
    end_time: requiredString("La hora de finalización es obligatoria").regex(
      TIME_PATTERN,
      "Use el formato HH:mm.",
    ),
    emergency: requiredString("La emergencia planteada es obligatoria"),
    place: requiredString("El lugar del ejercicio es obligatorio"),
    hypothesis: z.string().optional(),
    objective: z.string().optional(),
    observations: z.string().optional(),

    // Acta de realización del simulacro. Se sube aparte a la Librería porque
    // lleva archivo; aplica a los dos tipos de simulacro.
    document: z.any().optional(),
    library_folder_paths: z.array(z.string()).optional().default([]),

    coordinator: personSchema,

    employee_participants_count: z.string().optional(),
    foreign_people_count: z.string().optional(),
    evacuated_count: z.string().optional(),

    evaluators: z
      .array(personSchema.extend({ is_lead: z.boolean().default(false) }))
      .min(1, "Agregue al menos un evaluador."),

    participants: z
      .array(z.object({ name: requiredString("El nombre es obligatorio") }))
      .optional()
      .default([]),
    extinguisher_personnel: z
      .array(z.object({ name: requiredString("El nombre es obligatorio") }))
      .optional()
      .default([]),
    firefighters: z
      .array(
        z.object({
          name: requiredString("El nombre es obligatorio"),
          job_title: z.string().optional(),
        }),
      )
      .optional()
      .default([]),
    mandatory_participants: z
      .array(z.object({ name: requiredString("El nombre es obligatorio") }))
      .optional()
      .default([]),

    // Eventos y preguntas del PARCIAL son listas independientes. La
    // descripción de cada una viene de la plantilla; aquí solo se capturan
    // hora/observaciones (eventos) y respuesta (preguntas).
    events: z
      .array(
        z.object({
          event_id: z.number().optional(),
          drill_event_template_id: z.number().nullable().optional(),
          name: z.string(),
          registered_time: z
            .string()
            .optional()
            .refine(
              (value) => !value || TIME_PATTERN.test(value),
              "Use el formato HH:mm.",
            ),
          observations: z.string().optional(),
        }),
      )
      .optional()
      .default([]),

    questions: z
      .array(
        z.object({
          question_id: z.number().optional(),
          drill_question_template_id: z.number().nullable().optional(),
          description: z.string(),
          answer: z.enum(["SI", "NO", "PARCIAL", "NA"]),
        }),
      )
      .optional()
      .default([]),

    findings: z
      .array(
        z.object({
          kind: z.enum(["POSITIVE", "IMPROVEMENT"]),
          description: requiredString("Describa el aspecto"),
        }),
      )
      .optional()
      .default([]),

    matrix_rows: z
      .array(
        z.object({
          matrix_row_id: z.number().optional(),
          drill_matrix_criterion_id: z.number().nullable().optional(),
          criterion: z.string(),
          performance_indicator: z.string(),
          compliance: z.enum(["SI", "NO", "PARCIAL"]),
          observations: z.string().optional(),
        }),
      )
      .optional()
      .default([]),

    improvement_actions: z
      .array(
        z.object({
          action: requiredString("La acción es obligatoria"),
          deadline: z.string().optional(),
          responsible: personSchema,
          company_responsible: personSchema,
        }),
      )
      .optional()
      .default([]),
  })
  .superRefine((data, ctx) => {
    if (data.end_time && data.start_time && data.end_time < data.start_time) {
      ctx.addIssue({
        code: "custom",
        path: ["end_time"],
        message:
          "La hora de finalización no puede ser anterior a la hora de inicio.",
      });
    }

    if (!hasDrillPerson(data.coordinator)) {
      ctx.addIssue({
        code: "custom",
        path: ["coordinator"],
        message: "Indique el coordinador del ejercicio.",
      });
    }

    const leads = data.evaluators.filter((evaluator) => evaluator.is_lead);
    if (leads.length !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["evaluators"],
        message: "Debe marcar exactamente un evaluador principal.",
      });
    }

    data.evaluators.forEach((evaluator, index) => {
      if (!hasDrillPerson(evaluator)) {
        ctx.addIssue({
          code: "custom",
          path: ["evaluators", index],
          message: "Indique la persona evaluadora.",
        });
      }
    });

    if (data.type === "PARCIAL") {
      (
        [
          [
            "employee_participants_count",
            "Indique el número de empleados participantes.",
          ],
          ["foreign_people_count", "Indique el número de personas foráneas."],
          ["evacuated_count", "Indique el total de personas evacuadas."],
        ] as const
      ).forEach(([field, message]) => {
        if (!data[field] || !/^\d+$/.test(data[field] as string)) {
          ctx.addIssue({ code: "custom", path: [field], message });
        }
      });

      if (data.events.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["events"],
          message:
            "No hay eventos configurados para el simulacro parcial. Contacte al administrador del sistema.",
        });
      }

      if (data.questions.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["questions"],
          message:
            "No hay preguntas configuradas para el simulacro parcial. Contacte al administrador del sistema.",
        });
      }

      data.improvement_actions.forEach((action, index) => {
        if (!action.deadline) {
          ctx.addIssue({
            code: "custom",
            path: ["improvement_actions", index, "deadline"],
            message: "Indique la fecha límite de la acción.",
          });
        }
      });
    } else {
      if (!data.objective?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["objective"],
          message: "El objetivo es obligatorio para el simulacro de mesa.",
        });
      }

      if (data.matrix_rows.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["matrix_rows"],
          message:
            "La matriz de evaluación no tiene criterios configurados. Contacte al administrador del sistema.",
        });
      }
    }

    data.improvement_actions.forEach((action, index) => {
      if (!hasDrillPerson(action.responsible)) {
        ctx.addIssue({
          code: "custom",
          path: ["improvement_actions", index, "responsible"],
          message: "Indique el responsable de la acción.",
        });
      }

      if (!hasDrillPerson(action.company_responsible)) {
        ctx.addIssue({
          code: "custom",
          path: ["improvement_actions", index, "company_responsible"],
          message: "Indique el responsable de la empresa.",
        });
      }
    });
  });

type FormSchemaType = z.infer<typeof FormSchema>;

interface DrillEvaluationFormProps {
  activityNumber: string;
  /** Tipo planificado en la actividad; NULL en actividades antiguas. */
  activityDrillType?: DrillEvaluationType | null;
  initialData?: DrillEvaluation | null;
  isEditing?: boolean;
  onSaved?: (evaluation: DrillEvaluation) => void;
  onCancel?: () => void;
}

const toTimeInput = (value?: string | null) => {
  if (!value) return "";

  const match = String(value).match(/^(\d{1,2}):(\d{2})/);

  if (!match) return "";

  return `${match[1].padStart(2, "0")}:${match[2]}`;
};

const personFromServer = (
  employeeId: number | null,
  authorizedId: number | null,
  name: string | null,
): DrillPersonFormValue => {
  if (authorizedId) {
    return {
      mode: "AUTORIZADO",
      employee_id: "",
      authorized_employee_id: String(authorizedId),
      name: "",
    };
  }

  if (name) {
    return {
      mode: "EXTERNO",
      employee_id: "",
      authorized_employee_id: "",
      name,
    };
  }

  return {
    mode: "INTERNO",
    employee_id: employeeId ? String(employeeId) : "",
    authorized_employee_id: "",
    name: "",
  };
};

function firstFormError(
  errors: FieldErrors<FormSchemaType>,
): { path: string; message: string } | null {
  for (const key of Object.keys(errors)) {
    const value = errors[key as keyof FormSchemaType];
    if (!value) continue;

    if (typeof value === "object" && "message" in value && value.message) {
      return { path: key, message: String(value.message) };
    }

    if (typeof value === "object") {
      const nested = firstFormError(value as FieldErrors<FormSchemaType>);
      if (nested)
        return { path: `${key}.${nested.path}`, message: nested.message };
    }
  }

  return null;
}

function stepForErrorPath(path: string): number {
  if (
    path.startsWith("participants") ||
    path.startsWith("extinguisher_personnel") ||
    path.startsWith("firefighters") ||
    path.startsWith("mandatory_participants") ||
    path.endsWith("_count") ||
    path === "foreign_people_count" ||
    path === "evacuated_count"
  ) {
    return 2;
  }

  if (
    path.startsWith("events") ||
    path.startsWith("questions") ||
    path.startsWith("matrix_rows")
  ) {
    return 3;
  }

  if (
    path.startsWith("findings") ||
    path.startsWith("improvement_actions") ||
    path === "observations" ||
    path === "document"
  ) {
    return 4;
  }

  return 1;
}

export default function DrillEvaluationForm({
  activityNumber,
  activityDrillType,
  initialData,
  isEditing = false,
  onSaved,
  onCancel,
}: DrillEvaluationFormProps) {
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany?.slug ?? "";
  const [step, setStep] = useState(1);

  const { data: employees = [] } = useGetAllEmployeesByCompany(company);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      type: initialData?.type ?? activityDrillType ?? "PARCIAL",
      number: initialData?.number ?? "",
      date: initialData?.date
        ? parseCalendarDate(initialData.date)
        : new Date(),
      start_time: toTimeInput(initialData?.start_time),
      end_time: toTimeInput(initialData?.end_time),
      emergency: initialData?.emergency ?? "",
      place: initialData?.place ?? "",
      hypothesis: initialData?.hypothesis ?? "",
      objective: initialData?.objective ?? "",
      observations: initialData?.observations ?? "",
      document: undefined,
      library_folder_paths: initialData?.library_folder_paths ?? [],
      coordinator: personFromServer(
        initialData?.coordinator_employee_id ?? null,
        initialData?.coordinator_authorized_employee_id ?? null,
        initialData?.coordinator_name ?? null,
      ),
      employee_participants_count:
        initialData?.employee_participants_count != null
          ? String(initialData.employee_participants_count)
          : "",
      foreign_people_count:
        initialData?.foreign_people_count != null
          ? String(initialData.foreign_people_count)
          : "",
      evacuated_count:
        initialData?.evacuated_count != null
          ? String(initialData.evacuated_count)
          : "",
      evaluators: initialData?.evaluators?.map((evaluator) => ({
        ...personFromServer(
          evaluator.employee_id,
          evaluator.authorized_employee_id,
          evaluator.name,
        ),
        is_lead: evaluator.is_lead,
      })) ?? [{ ...emptyDrillPerson(), is_lead: true }],
      participants:
        initialData?.participants
          ?.filter((participant) => participant.kind === "PARTICIPANT")
          .map((participant) => ({ name: participant.name })) ?? [],
      extinguisher_personnel:
        initialData?.participants
          ?.filter(
            (participant) => participant.kind === "EXTINGUISHER_EXPERIENCED",
          )
          .map((participant) => ({ name: participant.name })) ?? [],
      firefighters:
        initialData?.participants
          ?.filter(
            (participant) => participant.kind === "AERONAUTICAL_FIREFIGHTER",
          )
          .map((participant) => ({
            name: participant.name,
            job_title: participant.job_title ?? "",
          })) ?? [],
      mandatory_participants:
        initialData?.participants
          ?.filter((participant) => participant.kind === "MANDATORY")
          .map((participant) => ({ name: participant.name })) ?? [],
      events:
        initialData?.events?.map((event) => ({
          event_id: Number(event.id),
          drill_event_template_id:
            event.drill_event_template_id != null
              ? Number(event.drill_event_template_id)
              : null,
          name: event.name,
          registered_time: toTimeInput(event.registered_time),
          observations: event.observations ?? "",
        })) ?? [],
      questions:
        initialData?.questions?.map((question) => ({
          question_id: Number(question.id),
          drill_question_template_id:
            question.drill_question_template_id != null
              ? Number(question.drill_question_template_id)
              : null,
          description: question.description,
          answer: question.answer,
        })) ?? [],
      findings:
        initialData?.findings?.map((finding) => ({
          kind: finding.kind ?? "IMPROVEMENT",
          description: finding.description,
        })) ?? [],
      matrix_rows:
        initialData?.matrix_rows?.map((row) => ({
          matrix_row_id: Number(row.id),
          drill_matrix_criterion_id:
            row.drill_matrix_criterion_id != null
              ? Number(row.drill_matrix_criterion_id)
              : null,
          criterion: row.criterion,
          performance_indicator: row.performance_indicator,
          compliance: row.compliance,
          observations: row.observations ?? "",
        })) ?? [],
      improvement_actions:
        initialData?.improvement_actions?.map((action) => ({
          action: action.action,
          deadline: action.deadline ? String(action.deadline).slice(0, 10) : "",
          responsible: personFromServer(
            action.responsible_employee_id,
            action.responsible_authorized_employee_id,
            action.responsible_name,
          ),
          company_responsible: personFromServer(
            action.company_responsible_employee_id,
            action.company_responsible_authorized_employee_id,
            action.company_responsible_name,
          ),
        })) ?? [],
    },
  });

  const type = useWatch({
    control: form.control,
    name: "type",
  }) as DrillEvaluationType;
  const watchedDate = useWatch({ control: form.control, name: "date" });
  const watchedEvaluators = useWatch({
    control: form.control,
    name: "evaluators",
  });
  const watchedMatrixRows = useWatch({
    control: form.control,
    name: "matrix_rows",
  });
  const watchedEvents = useWatch({
    control: form.control,
    name: "events",
  });
  const watchedQuestions = useWatch({
    control: form.control,
    name: "questions",
  });
  const watchedFindings = useWatch({
    control: form.control,
    name: "findings",
  });
  const dateIso = toCalendarPayload(watchedDate ?? undefined);

  const { data: authorizedEmployees = [] } = useGetExternalEmployees(
    company,
    "sms.activities",
    dateIso,
  );

  const { data: matrixCriteria = [], isLoading: isLoadingMatrixCriteria } =
    useGetDrillMatrixCriteria({
      company,
      enabled: type === "MESA",
    });

  // La matriz sale de la plantilla fija, no se captura. En una evaluación
  // nueva se cargan los criterios una sola vez y se conservan las respuestas
  // si el formulario se revalida o se cambia de paso.
  const appliedTemplate = useRef<string | null>(null);
  useEffect(() => {
    if (isEditing || type !== "MESA" || matrixCriteria.length === 0) return;

    const signature = matrixCriteria.map((criterion) => criterion.id).join(",");
    if (appliedTemplate.current === signature) return;
    appliedTemplate.current = signature;

    const currentRows = form.getValues("matrix_rows") ?? [];
    const templateRows = matrixCriteria.map((criterion, index) => {
      const current = currentRows[index];

      return {
        matrix_row_id: undefined,
        drill_matrix_criterion_id: Number(criterion.id),
        criterion: criterion.criterion,
        performance_indicator: criterion.performance_indicator,
        compliance: current?.compliance ?? "SI",
        observations: current?.observations ?? "",
      };
    });

    form.setValue("matrix_rows", templateRows, {
      shouldDirty: false,
      shouldValidate: false,
    });
  }, [form, isEditing, matrixCriteria, type]);

  const { data: eventTemplates = [], isLoading: isLoadingEventTemplates } =
    useGetDrillEventTemplates({
      company,
      enabled: type === "PARCIAL",
    });

  const {
    data: questionTemplates = [],
    isLoading: isLoadingQuestionTemplates,
  } = useGetDrillQuestionTemplates({
    company,
    enabled: type === "PARCIAL",
  });

  // Eventos y preguntas salen de sus plantillas, no se capturan. Se cargan
  // una sola vez y se conservan los datos ya escritos si el formulario se
  // revalida o se cambia de paso.
  const appliedEventsTemplate = useRef<string | null>(null);
  useEffect(() => {
    if (isEditing || type !== "PARCIAL" || eventTemplates.length === 0) return;

    const signature = eventTemplates.map((template) => template.id).join(",");
    if (appliedEventsTemplate.current === signature) return;
    appliedEventsTemplate.current = signature;

    const currentRows = form.getValues("events") ?? [];
    form.setValue(
      "events",
      eventTemplates.map((template, index) => {
        const current = currentRows[index];

        return {
          event_id: undefined,
          drill_event_template_id: Number(template.id),
          name: template.description,
          registered_time: current?.registered_time ?? "",
          observations: current?.observations ?? "",
        };
      }),
      { shouldDirty: false, shouldValidate: false },
    );
  }, [eventTemplates, form, isEditing, type]);

  const appliedQuestionsTemplate = useRef<string | null>(null);
  useEffect(() => {
    if (isEditing || type !== "PARCIAL" || questionTemplates.length === 0) {
      return;
    }

    const signature = questionTemplates
      .map((template) => template.id)
      .join(",");
    if (appliedQuestionsTemplate.current === signature) return;
    appliedQuestionsTemplate.current = signature;

    const currentRows = form.getValues("questions") ?? [];
    form.setValue(
      "questions",
      questionTemplates.map((template, index) => {
        const current = currentRows[index];

        return {
          question_id: undefined,
          drill_question_template_id: Number(template.id),
          description: template.description,
          answer: current?.answer ?? "SI",
        };
      }),
      { shouldDirty: false, shouldValidate: false },
    );
  }, [form, isEditing, questionTemplates, type]);

  const { data: nextNumberData, isLoading: isLoadingNextNumber } =
    useGetNextDrillNumber({
      company,
      activityNumber,
      type,
      date: dateIso,
      enabled: !isEditing,
    });

  // El correlativo sugerido se precarga para que pueda corregirse. Si el
  // usuario ya escribió uno, no se pisa al cambiar fecha o tipo.
  useEffect(() => {
    if (isEditing) return;

    const suggested = nextNumberData?.next_number;
    if (!suggested || form.formState.dirtyFields.number) return;

    form.setValue("number", suggested, {
      shouldDirty: false,
      shouldValidate: false,
    });
  }, [form, isEditing, nextNumberData]);

  const { createDrillEvaluation } = useCreateDrillEvaluation();
  const { updateDrillEvaluation } = useUpdateDrillEvaluation();
  const { uploadDrillEvaluationDocument } = useUploadDrillEvaluationDocument();
  const isPending =
    createDrillEvaluation.isPending ||
    updateDrillEvaluation.isPending ||
    uploadDrillEvaluationDocument.isPending;

  const evaluatorsArray = useFieldArray({
    control: form.control,
    name: "evaluators",
  });
  const participantsArray = useFieldArray({
    control: form.control,
    name: "participants",
  });
  const extinguisherArray = useFieldArray({
    control: form.control,
    name: "extinguisher_personnel",
  });
  const firefightersArray = useFieldArray({
    control: form.control,
    name: "firefighters",
  });
  const mandatoryArray = useFieldArray({
    control: form.control,
    name: "mandatory_participants",
  });

  const findingsArray = useFieldArray({
    control: form.control,
    name: "findings",
  });
  const matrixArray = useFieldArray({
    control: form.control,
    name: "matrix_rows",
  });
  const actionsArray = useFieldArray({
    control: form.control,
    name: "improvement_actions",
  });

  const makeLead = (index: number) => {
    form.getValues("evaluators").forEach((_, i) => {
      form.setValue(`evaluators.${i}.is_lead`, i === index);
    });
  };

  const errorMessage = (path: string): string | undefined => {
    let current: unknown = form.formState.errors;

    for (const key of path.split(".")) {
      if (current === null || typeof current !== "object") return undefined;
      current = (current as Record<string, unknown>)[key];
    }

    if (typeof current === "string") return current;

    if (current !== null && typeof current === "object") {
      const message = (current as { message?: unknown }).message;

      return typeof message === "string" ? message : undefined;
    }

    return undefined;
  };

  const removeEvaluator = (index: number) => {
    const wasLead = form.getValues(`evaluators.${index}.is_lead`);
    evaluatorsArray.remove(index);

    if (wasLead) {
      const remaining = form.getValues("evaluators");
      if (remaining.length > 0) {
        form.setValue("evaluators.0.is_lead", true);
      }
    }
  };

  const buildPayload = (
    data: FormSchemaType,
  ): StoreDrillEvaluationPayload | UpdateDrillEvaluationPayload => {
    // Se lee del estado actual del formulario: si el paso 1 ya se desmontó,
    // este es el valor que realmente quedó registrado en el selector.
    const coordinator = toPersonPayload(
      form.getValues("coordinator") ?? data.coordinator,
    );
    // Al editar, el tipo manda desde el registro guardado: el backend lo
    // ignora en el payload, y usarlo aquí evita que un estado desincronizado
    // borre la matriz (MESA) o los eventos (PARCIAL) que ya existen.
    const effectiveType = isEditing
      ? (initialData?.type ?? data.type)
      : data.type;
    const isParcial = effectiveType === "PARCIAL";

    const participants = isParcial
      ? [
          ...(data.participants ?? [])
            .filter((participant) => participant.name.trim())
            .map((participant) => ({
              kind: "PARTICIPANT" as const,
              name: participant.name.trim(),
            })),
          ...(data.extinguisher_personnel ?? [])
            .filter((participant) => participant.name.trim())
            .map((participant) => ({
              kind: "EXTINGUISHER_EXPERIENCED" as const,
              name: participant.name.trim(),
            })),
          ...(data.firefighters ?? [])
            .filter((participant) => participant.name.trim())
            .map((participant) => ({
              kind: "AERONAUTICAL_FIREFIGHTER" as const,
              name: participant.name.trim(),
              job_title: participant.job_title?.trim() || null,
            })),
        ]
      : (data.mandatory_participants ?? [])
          .filter((participant) => participant.name.trim())
          .map((participant) => ({
            kind: "MANDATORY" as const,
            name: participant.name.trim(),
          }));

    const improvementActions = (data.improvement_actions ?? []).map(
      (action) => {
        const responsible = toPersonPayload(action.responsible);
        const companyResponsible = toPersonPayload(action.company_responsible);

        return {
          action: action.action.trim(),
          deadline: isParcial ? action.deadline || null : null,
          responsible_employee_id: responsible.employee_id,
          responsible_authorized_employee_id:
            responsible.authorized_employee_id,
          responsible_name: responsible.name,
          company_responsible_employee_id: companyResponsible.employee_id,
          company_responsible_authorized_employee_id:
            companyResponsible.authorized_employee_id,
          company_responsible_name: companyResponsible.name,
        };
      },
    );

    const payload = {
      // Solo se envía si el usuario lo editó; si no, el servidor genera el
      // siguiente y se evita consumir por error el número de la vista previa.
      number: form.formState.dirtyFields.number
        ? data.number?.trim() || null
        : null,
      date: toCalendarPayload(data.date) ?? "",
      start_time: data.start_time,
      end_time: data.end_time,
      emergency: data.emergency.trim(),
      place: data.place.trim(),
      hypothesis: isParcial ? data.hypothesis?.trim() || null : null,
      objective: isParcial ? null : data.objective?.trim() || null,
      observations: isParcial ? null : data.observations?.trim() || null,
      coordinator_employee_id: coordinator.employee_id,
      coordinator_authorized_employee_id: coordinator.authorized_employee_id,
      coordinator_name: coordinator.name,
      employee_participants_count: isParcial
        ? Number(data.employee_participants_count || 0)
        : null,
      foreign_people_count: isParcial
        ? Number(data.foreign_people_count || 0)
        : null,
      evacuated_count: isParcial ? Number(data.evacuated_count || 0) : null,
      evaluators: data.evaluators.map((evaluator) => ({
        ...toPersonPayload(evaluator),
        is_lead: evaluator.is_lead,
      })),
      participants,
      events: isParcial
        ? (data.events ?? []).map((event) => ({
            event_id: event.event_id,
            drill_event_template_id: event.drill_event_template_id ?? null,
            registered_time: event.registered_time?.trim() || null,
            observations: event.observations?.trim() || null,
          }))
        : [],
      questions: isParcial
        ? (data.questions ?? []).map((question) => ({
            question_id: question.question_id,
            drill_question_template_id:
              question.drill_question_template_id ?? null,
            answer: question.answer,
          }))
        : [],
      findings: isParcial
        ? (data.findings ?? []).map((finding) => ({
            kind: finding.kind ?? "IMPROVEMENT",
            description: finding.description.trim(),
          }))
        : [],
      matrix_rows: isParcial
        ? []
        : (data.matrix_rows ?? []).map((row) => ({
            matrix_row_id: row.matrix_row_id,
            drill_matrix_criterion_id: row.drill_matrix_criterion_id ?? null,
            compliance: row.compliance,
            observations: row.observations?.trim() || null,
          })),
      improvement_actions: improvementActions,
    };

    return isEditing ? payload : { ...payload, type: data.type };
  };

  const onSubmit = async (data: FormSchemaType) => {
    if (!company) return;

    try {
      const payload = buildPayload(data);

      if (
        !payload.coordinator_employee_id &&
        !payload.coordinator_authorized_employee_id &&
        !payload.coordinator_name
      ) {
        setStep(1);
        form.setError("coordinator", {
          type: "manual",
          message: "Vuelva a seleccionar el coordinador del ejercicio.",
        });
        toast.error("Falta el coordinador", {
          description:
            "El coordinador seleccionado no llegó al formulario. Vuelva a elegirlo en el paso 1.",
        });
        return;
      }

      let saved: DrillEvaluation;

      if (isEditing && initialData) {
        saved = await updateDrillEvaluation.mutateAsync({
          company,
          activityNumber,
          id: initialData.id,
          data: payload as UpdateDrillEvaluationPayload,
        });
      } else {
        saved = await createDrillEvaluation.mutateAsync({
          company,
          activityNumber,
          data: payload as StoreDrillEvaluationPayload,
        });
      }

      // El acta se sube después porque lleva un archivo. También permite
      // cambiar las carpetas de la Librería sin volver a subir el PDF. Aplica
      // a los dos tipos de simulacro.
      const file = data.document instanceof File ? data.document : null;
      const folderPaths = data.library_folder_paths ?? [];
      const foldersChanged =
        JSON.stringify(folderPaths) !==
        JSON.stringify(initialData?.library_folder_paths ?? []);

      if (file || (saved?.library_document_id && foldersChanged)) {
        try {
          saved = await uploadDrillEvaluationDocument.mutateAsync({
            company,
            activityNumber,
            id: saved.id,
            file,
            folderPaths,
          });
        } catch {
          // La evaluación ya quedó guardada; el error del acta se notifica
          // desde la acción y se puede reintentar desde la edición.
        }
      }

      onSaved?.(saved);
    } catch (error) {
      console.error("Error al guardar la evaluación del simulacro", error);
    }
  };

  const onInvalid = (errors: FieldErrors<FormSchemaType>) => {
    const validationError = firstFormError(errors);
    if (!validationError) return;

    setStep(stepForErrorPath(validationError.path));
    toast.error("Faltan datos obligatorios", {
      description: validationError.message,
    });
  };

  const handleNext = async () => {
    const fieldsByStep: Record<number, FieldPath<FormSchemaType>[]> = {
      1: [
        "type",
        "date",
        "start_time",
        "end_time",
        "emergency",
        "place",
        "hypothesis",
        "objective",
        "coordinator",
        "evaluators",
      ],
      2: [
        "employee_participants_count",
        "foreign_people_count",
        "evacuated_count",
        "participants",
        "extinguisher_personnel",
        "firefighters",
        "mandatory_participants",
      ],
      3: ["events", "questions", "matrix_rows"],
    };

    const stepFields = fieldsByStep[step] ?? [];
    form.clearErrors(stepFields);

    // `trigger` con un resolver a veces devuelve válido un paso cuyos errores
    // vienen de `superRefine` (coordinador, evaluadores, conteos, matriz...).
    // Se valida el esquema completo y se bloquea si hay un error del paso.
    const parsed = FormSchema.safeParse(form.getValues());

    if (!parsed.success) {
      const blockingIssue = parsed.error.issues.find(
        (issue) => stepForErrorPath(String(issue.path[0] ?? "")) === step,
      );

      if (blockingIssue) {
        const path = blockingIssue.path.join(".");

        if (path) {
          form.setError(path as FieldPath<FormSchemaType>, {
            type: "manual",
            message: blockingIssue.message,
          });
        }

        toast.error("Completa los campos obligatorios del paso actual.", {
          description: blockingIssue.message,
        });
        return;
      }
    }

    const valid = await form.trigger(stepFields, {
      shouldFocus: true,
    });

    if (!valid) {
      const validationError = firstFormError(form.formState.errors);
      toast.error("Completa los campos obligatorios del paso actual.", {
        description: validationError?.message,
      });
      return;
    }

    setStep((current) => current + 1);
  };

  const steps = [
    { num: 1, label: "Datos generales" },
    { num: 2, label: "Participantes" },
    { num: 3, label: type === "MESA" ? "Matriz" : "Eventos" },
    { num: 4, label: "Cierre" },
  ];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="flex flex-col space-y-5"
      >
        <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
          {steps.map((item, index) => (
            <React.Fragment key={item.num}>
              {index > 0 && (
                <div
                  className={cn(
                    "hidden h-px w-6 sm:block sm:w-10",
                    step > index ? "bg-primary" : "bg-border",
                  )}
                />
              )}
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold",
                    step >= item.num
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {step > item.num ? "✓" : item.num}
                </div>
                <span
                  className={cn(
                    "whitespace-nowrap text-[11px] font-medium sm:text-xs",
                    step >= item.num
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tipo de simulacro <RequiredIndicator />
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isEditing || Boolean(activityDrillType)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PARCIAL">
                          Simulacro parcial
                        </SelectItem>
                        <SelectItem value="MESA">Simulacro de mesa</SelectItem>
                      </SelectContent>
                    </Select>
                    {isEditing ? (
                      <p className="text-[11px] text-muted-foreground">
                        El tipo no se puede cambiar una vez registrada la
                        evaluación.
                      </p>
                    ) : activityDrillType ? (
                      <p className="text-[11px] text-muted-foreground">
                        Definido en la actividad.
                      </p>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correlativo</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder={
                          isEditing
                            ? (initialData?.number ?? "")
                            : isLoadingNextNumber
                              ? "Calculando..."
                              : (nextNumberData?.next_number ??
                                "Se generará al guardar")
                        }
                        className="font-mono"
                      />
                    </FormControl>
                    <p className="text-[11px] text-muted-foreground">
                      {isEditing
                        ? "Puedes corregirlo para cargar registros históricos."
                        : `Se genera solo al guardar${
                            nextNumberData?.next_number
                              ? ` (sugerido: ${nextNumberData.next_number})`
                              : ""
                          }.`}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <DatePickerField
                      label="Fecha"
                      value={field.value}
                      setValue={(date) => field.onChange(date)}
                      required
                    />
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Hora de inicio <RequiredIndicator />
                    </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Hora de culminación <RequiredIndicator />
                    </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="place"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>
                      Lugar del ejercicio <RequiredIndicator />
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej. Terminal principal" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="emergency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Emergencia planteada <RequiredIndicator />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={2}
                      placeholder="Ej. Conato de incendio en sala de espera"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === "PARCIAL" && (
              <FormField
                control={form.control}
                name="hypothesis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hipótesis planteada</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {type === "MESA" && (
              <FormField
                control={form.control}
                name="objective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Objetivo <RequiredIndicator />
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <PersonSelect
              form={form}
              basePath="coordinator"
              label="Coordinador del ejercicio"
              employees={employees}
              authorizedEmployees={authorizedEmployees}
            />
            {form.formState.errors.coordinator?.message ? (
              <p className="text-[0.8rem] font-medium text-destructive">
                {form.formState.errors.coordinator.message}
              </p>
            ) : null}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Evaluadores
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    evaluatorsArray.append({
                      ...emptyDrillPerson(),
                      is_lead: evaluatorsArray.fields.length === 0,
                    })
                  }
                >
                  <Plus className="mr-1 size-3.5" /> Agregar evaluador
                </Button>
              </div>

              {evaluatorsArray.fields.map((field, index) => (
                <div key={field.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Checkbox
                      checked={watchedEvaluators?.[index]?.is_lead ?? false}
                      onCheckedChange={() => makeLead(index)}
                    />
                    <span className="text-xs text-muted-foreground">
                      Evaluador principal
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEvaluator(index)}
                      disabled={evaluatorsArray.fields.length === 1}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                  <PersonSelect
                    form={form}
                    basePath={`evaluators.${index}`}
                    label={`Evaluador ${index + 1}`}
                    employees={employees}
                    authorizedEmployees={authorizedEmployees}
                  />
                  {errorMessage(`evaluators.${index}`) ? (
                    <p className="text-[0.8rem] font-medium text-destructive">
                      {errorMessage(`evaluators.${index}`)}
                    </p>
                  ) : null}
                </div>
              ))}

              {form.formState.errors.evaluators?.message ||
              form.formState.errors.evaluators?.root?.message ? (
                <p className="text-[0.8rem] font-medium text-destructive">
                  {form.formState.errors.evaluators?.message ??
                    form.formState.errors.evaluators?.root?.message}
                </p>
              ) : null}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            {type === "PARCIAL" ? (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {(
                    [
                      [
                        "employee_participants_count",
                        "Empleados participantes",
                      ],
                      ["foreign_people_count", "Personas foráneas"],
                      ["evacuated_count", "Total de personas evacuadas"],
                    ] as const
                  ).map(([name, label]) => (
                    <FormField
                      key={name}
                      control={form.control}
                      name={name}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {label} <RequiredIndicator />
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                <NameList
                  title="Participantes"
                  hint="Solo el nombre. Un equipo puede ocupar una sola fila."
                  fields={participantsArray.fields}
                  onAdd={() => participantsArray.append({ name: "" })}
                  onRemove={participantsArray.remove}
                  render={(index) => (
                    <FormField
                      control={form.control}
                      name={`participants.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} placeholder="Nombre" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                />

                <NameList
                  title="Personal con experiencia en extintores"
                  fields={extinguisherArray.fields}
                  onAdd={() => extinguisherArray.append({ name: "" })}
                  onRemove={extinguisherArray.remove}
                  render={(index) => (
                    <FormField
                      control={form.control}
                      name={`extinguisher_personnel.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} placeholder="Nombre" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                />

                <NameList
                  title="Bomberos aeronáuticos participantes"
                  hint="El cargo es opcional."
                  fields={firefightersArray.fields}
                  onAdd={() =>
                    firefightersArray.append({ name: "", job_title: "" })
                  }
                  onRemove={firefightersArray.remove}
                  render={(index) => (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`firefighters.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} placeholder="Nombre" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`firefighters.${index}.job_title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Cargo (opcional)"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                />
              </>
            ) : (
              <NameList
                title="Participantes obligatorios"
                fields={mandatoryArray.fields}
                onAdd={() => mandatoryArray.append({ name: "" })}
                onRemove={mandatoryArray.remove}
                render={(index) => (
                  <FormField
                    control={form.control}
                    name={`mandatory_participants.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder="Nombre" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              />
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {type === "PARCIAL" ? (
              <>
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Eventos del simulacro
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Los eventos provienen de la plantilla del sistema. Registre
                    la hora y, si aplica, una observación.
                  </p>
                </div>

                {isLoadingEventTemplates &&
                  (watchedEvents ?? []).length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Cargando eventos...
                    </p>
                  )}

                {(watchedEvents ?? []).map((event, index) => {
                  return (
                    <div
                      key={
                        event.drill_event_template_id ?? event.event_id ?? index
                      }
                      className="space-y-3 rounded-md border border-border/40 p-3"
                    >
                      <p className="text-sm font-medium">{event.name}</p>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px]">
                        <FormField
                          control={form.control}
                          name={`events.${index}.registered_time`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hora del evento</FormLabel>
                              <FormControl>
                                <Input {...field} type="time" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`events.${index}.observations`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Observaciones</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={2} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  );
                })}

                {form.formState.errors.events?.message ||
                form.formState.errors.events?.root?.message ? (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {form.formState.errors.events?.message ??
                      form.formState.errors.events?.root?.message}
                  </p>
                ) : null}

                <div className="space-y-1 pt-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Evaluación del simulacro
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Las preguntas provienen de la plantilla. Seleccione la
                    respuesta de cada una.
                  </p>
                </div>

                {isLoadingQuestionTemplates &&
                  (watchedQuestions ?? []).length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Cargando preguntas...
                    </p>
                  )}

                {(watchedQuestions ?? []).map((question, index) => {
                  return (
                    <div
                      key={
                        question.drill_question_template_id ??
                        question.question_id ??
                        index
                      }
                      className="grid grid-cols-1 gap-3 rounded-md border border-border/40 p-3 sm:grid-cols-[1fr_180px] sm:items-start"
                    >
                      <p className="text-sm">
                        <span className="mr-1 font-medium">{index + 1}.</span>
                        {question.description}
                      </p>
                      <FormField
                        control={form.control}
                        name={`questions.${index}.answer`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Respuesta <RequiredIndicator />
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="flex flex-wrap gap-x-4 gap-y-2"
                              >
                                {DRILL_ANSWER_OPTIONS.map((option) => (
                                  <div
                                    key={option.value}
                                    className="flex items-center gap-2"
                                  >
                                    <RadioGroupItem
                                      id={`question-${index}-${option.value}`}
                                      value={option.value}
                                    />
                                    <label
                                      htmlFor={`question-${index}-${option.value}`}
                                      className="cursor-pointer text-sm"
                                    >
                                      {option.label}
                                    </label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  );
                })}

                {form.formState.errors.questions?.message ||
                form.formState.errors.questions?.root?.message ? (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {form.formState.errors.questions?.message ??
                      form.formState.errors.questions?.root?.message}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Matriz de evaluación: simulacro de sismo de mesa
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Los criterios y sus indicadores provienen de la plantilla
                    del sistema. Registre el cumplimiento y, si aplica, una
                    observación.
                  </p>
                </div>

                {isLoadingMatrixCriteria && matrixArray.fields.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Cargando la matriz de evaluación...
                  </p>
                )}

                {matrixArray.fields.map((field, index) => {
                  const row = watchedMatrixRows?.[index];

                  return (
                    <div
                      key={field.id}
                      className="space-y-3 rounded-md border border-border/40 p-3"
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Criterio {index + 1}
                        </p>
                        <p className="text-sm font-medium">
                          {row?.criterion ?? field.criterion}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {row?.performance_indicator ??
                            field.performance_indicator}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[180px_1fr]">
                        <FormField
                          control={form.control}
                          name={`matrix_rows.${index}.compliance`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Cumplimiento <RequiredIndicator />
                              </FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="SI">Sí</SelectItem>
                                  <SelectItem value="NO">No</SelectItem>
                                  <SelectItem value="PARCIAL">
                                    Parcial
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`matrix_rows.${index}.observations`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Observaciones</FormLabel>
                              <FormControl>
                                <Textarea {...field} rows={2} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  );
                })}

                {form.formState.errors.matrix_rows?.message ||
                form.formState.errors.matrix_rows?.root?.message ? (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {form.formState.errors.matrix_rows?.message ??
                      form.formState.errors.matrix_rows?.root?.message}
                  </p>
                ) : null}
              </>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            {type === "PARCIAL" && (
              <div className="space-y-4">
                {FINDING_GROUPS.map((group) => {
                  const items = findingsArray.fields
                    .map((field, index) => ({ field, index }))
                    .filter(
                      ({ index }) =>
                        (watchedFindings?.[index]?.kind ?? "IMPROVEMENT") ===
                        group.kind,
                    );

                  return (
                    <NameList
                      key={group.kind}
                      title={group.title}
                      hint={group.hint}
                      fields={items.map(({ field }) => field)}
                      onAdd={() =>
                        findingsArray.append({
                          kind: group.kind,
                          description: "",
                        })
                      }
                      onRemove={(position) =>
                        findingsArray.remove(items[position].index)
                      }
                      render={(position) => {
                        const index = items[position].index;

                        return (
                          <FormField
                            control={form.control}
                            name={`findings.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    rows={2}
                                    placeholder={group.placeholder}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        );
                      }}
                    />
                  );
                })}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Acciones de mejora
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    actionsArray.append({
                      action: "",
                      deadline: "",
                      responsible: emptyDrillPerson(),
                      company_responsible: emptyDrillPerson(),
                    })
                  }
                >
                  <Plus className="mr-1 size-3.5" /> Agregar acción
                </Button>
              </div>

              {actionsArray.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-3 rounded-md border border-border/40 p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Acción {index + 1}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => actionsArray.remove(index)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name={`improvement_actions.${index}.action`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Acción <RequiredIndicator />
                        </FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {type === "PARCIAL" && (
                    <FormField
                      control={form.control}
                      name={`improvement_actions.${index}.deadline`}
                      render={({ field }) => (
                        <FormItem>
                          <DatePickerField
                            label="Fecha límite"
                            value={parseCalendarDate(field.value)}
                            setValue={(date) =>
                              field.onChange(toCalendarPayload(date) ?? "")
                            }
                            required
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <PersonSelect
                    form={form}
                    basePath={`improvement_actions.${index}.responsible`}
                    label="Responsable de la acción"
                    employees={employees}
                    authorizedEmployees={authorizedEmployees}
                  />
                  {errorMessage(`improvement_actions.${index}.responsible`) ? (
                    <p className="text-[0.8rem] font-medium text-destructive">
                      {errorMessage(`improvement_actions.${index}.responsible`)}
                    </p>
                  ) : null}

                  {type === "MESA" && (
                    <div className="rounded-md border border-dashed border-border/60 px-4 pb-1 pt-6">
                      <div className="border-t border-border/60 pt-1 text-center text-[10px] uppercase tracking-wide text-muted-foreground">
                        Firma física del responsable
                      </div>
                    </div>
                  )}

                  <PersonSelect
                    form={form}
                    basePath={`improvement_actions.${index}.company_responsible`}
                    label="Responsable de la empresa"
                    employees={employees}
                    authorizedEmployees={authorizedEmployees}
                  />
                  {errorMessage(
                    `improvement_actions.${index}.company_responsible`,
                  ) ? (
                    <p className="text-[0.8rem] font-medium text-destructive">
                      {errorMessage(
                        `improvement_actions.${index}.company_responsible`,
                      )}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            {type === "MESA" && (
              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones finales</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="space-y-3 rounded-md border border-border/40 p-3">
              <div className="space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Acta de realización
                </h3>
                <p className="text-xs text-muted-foreground">
                  Adjunte el acta o documento del simulacro (PDF, hasta 20 MB).
                  Se guardará en la Librería y quedará vinculado a esta
                  evaluación.
                </p>
              </div>

              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Documento PDF</FormLabel>
                    <div className="flex flex-col gap-2">
                      {field.value instanceof File && (
                        <p className="text-sm font-medium">
                          Archivo seleccionado: {field.value.name}
                        </p>
                      )}
                      {!(field.value instanceof File) &&
                        initialData?.document && (
                          <p className="text-sm text-muted-foreground">
                            ✓ Acta existente cargada en la Librería
                          </p>
                        )}
                      <FormControl>
                        <Input
                          type="file"
                          accept="application/pdf"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) field.onChange(file);
                          }}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="library_folder_paths"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Carpetas en la Librería</FormLabel>
                    <FormControl>
                      <FolderSelect
                        company={company}
                        value={field.value ?? []}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <p className="text-xs text-muted-foreground">
                Puede elegir una o varias carpetas; use la estrella para fijar
                la carpeta principal. Las demás son réplicas.
              </p>
            </div>

            <Button type="submit" disabled={isPending} className="h-10 w-full">
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <FileText className="mr-2 size-4" />
                  {isEditing ? "Actualizar evaluación" : "Registrar evaluación"}
                </>
              )}
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => setStep((current) => current - 1)}
            >
              <ChevronLeft className="mr-1 size-4" />
              Anterior
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="flex-1 sm:flex-none"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}

          {step < 4 ? (
            <Button
              type="button"
              className="flex-1 sm:flex-none"
              onClick={handleNext}
              disabled={form.formState.isValidating}
            >
              Siguiente
              <ChevronRight className="ml-1 size-4" />
            </Button>
          ) : (
            <div className="hidden sm:block" />
          )}
        </div>
      </form>
    </Form>
  );
}

interface NameListProps {
  title: string;
  hint?: string;
  fields: { id: string }[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  render: (index: number) => React.ReactNode;
}

function NameList({
  title,
  hint,
  fields,
  onAdd,
  onRemove,
  render,
}: NameListProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </h3>
          {hint ? (
            <p className="text-[11px] text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="mr-1 size-3.5" /> Agregar
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/50 px-3 py-4 text-center text-xs text-muted-foreground">
          Sin registros.
        </p>
      ) : (
        fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2">
            <div className="flex-1">{render(index)}</div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(index)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
