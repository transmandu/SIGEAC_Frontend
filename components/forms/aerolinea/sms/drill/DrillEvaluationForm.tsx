"use client";

import React, { useState } from "react";
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
} from "@/actions/sms/drill_evaluations/actions";
import { useGetAllEmployeesByCompany } from "@/hooks/ajustes/empleados/useGetAllEmployees";
import { useGetExternalEmployees } from "@/hooks/ajustes/convenios/useGetExternalEmployees";
import { useGetNextDrillNumber } from "@/hooks/sms/drill_evaluations/useGetNextDrillNumber";
import { useCompanyStore } from "@/stores/CompanyStore";
import type {
  DrillEvaluation,
  DrillEvaluationType,
  StoreDrillEvaluationPayload,
  UpdateDrillEvaluationPayload,
} from "@/types/sms/drill-evaluation";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

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

    events: z
      .array(
        z.object({
          name: requiredString("El nombre del evento es obligatorio"),
          registered_time: z.string().optional(),
          observations: z.string().optional(),
          question: requiredString("La pregunta de evaluación es obligatoria"),
          answer: z.enum(["SI", "NO", "PARCIAL", "NA"]),
        }),
      )
      .optional()
      .default([]),

    findings: z
      .array(
        z.object({
          description: requiredString("Describa la falla detectada"),
        }),
      )
      .optional()
      .default([]),

    matrix_rows: z
      .array(
        z.object({
          criterion: requiredString("El criterio evaluado es obligatorio"),
          performance_indicator: requiredString(
            "El indicador de desempeño es obligatorio",
          ),
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
          message: "Agregue al menos un evento del simulacro.",
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
          message: "Agregue al menos una fila a la matriz de evaluación.",
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

const toTimeInput = (value?: string | null) =>
  value ? String(value).slice(0, 5) : "";

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

  if (path.startsWith("events") || path.startsWith("matrix_rows")) {
    return 3;
  }

  if (
    path.startsWith("findings") ||
    path.startsWith("improvement_actions") ||
    path === "observations"
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
          name: event.name,
          registered_time: event.registered_time ?? "",
          observations: event.observations ?? "",
          question: event.question,
          answer: event.answer,
        })) ?? [],
      findings:
        initialData?.findings?.map((finding) => ({
          description: finding.description,
        })) ?? [],
      matrix_rows:
        initialData?.matrix_rows?.map((row) => ({
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
  const dateIso = toCalendarPayload(watchedDate ?? undefined);

  const { data: authorizedEmployees = [] } = useGetExternalEmployees(
    company,
    "sms.activities",
    dateIso,
  );

  const { data: nextNumberData, isLoading: isLoadingNextNumber } =
    useGetNextDrillNumber({
      company,
      activityNumber,
      type,
      date: dateIso,
      enabled: !isEditing,
    });

  const { createDrillEvaluation } = useCreateDrillEvaluation();
  const { updateDrillEvaluation } = useUpdateDrillEvaluation();
  const isPending =
    createDrillEvaluation.isPending || updateDrillEvaluation.isPending;

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
  const eventsArray = useFieldArray({ control: form.control, name: "events" });
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
    const coordinator = toPersonPayload(data.coordinator);
    // Al editar, el tipo manda desde el registro guardado: el backend lo
    // ignora en el payload, y usarlo aquí evita que un estado desincronizado
    // borre la matriz (MESA) o los eventos (PARCIAL) que ya existen.
    const effectiveType = isEditing
      ? (initialData?.type ?? data.type)
      : data.type;
    const isParcial = effectiveType === "PARCIAL";

    const participants = [
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
      ...(data.mandatory_participants ?? [])
        .filter((participant) => participant.name.trim())
        .map((participant) => ({
          kind: "MANDATORY" as const,
          name: participant.name.trim(),
        })),
    ];

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
            name: event.name.trim(),
            registered_time: event.registered_time?.trim() || null,
            observations: event.observations?.trim() || null,
            question: event.question.trim(),
            answer: event.answer,
          }))
        : [],
      findings: isParcial
        ? (data.findings ?? []).map((finding) => ({
            description: finding.description.trim(),
          }))
        : [],
      matrix_rows: isParcial
        ? []
        : (data.matrix_rows ?? []).map((row) => ({
            criterion: row.criterion.trim(),
            performance_indicator: row.performance_indicator.trim(),
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

      if (isEditing && initialData) {
        const response = await updateDrillEvaluation.mutateAsync({
          company,
          activityNumber,
          id: initialData.id,
          data: payload as UpdateDrillEvaluationPayload,
        });
        onSaved?.(response);
      } else {
        const response = await createDrillEvaluation.mutateAsync({
          company,
          activityNumber,
          data: payload as StoreDrillEvaluationPayload,
        });
        onSaved?.(response);
      }
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
      3: ["events", "matrix_rows"],
    };

    const valid = await form.trigger(fieldsByStep[step] ?? [], {
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

              <FormItem>
                <FormLabel>Correlativo</FormLabel>
                <Input
                  readOnly
                  value={
                    isEditing
                      ? (initialData?.number ?? "")
                      : isLoadingNextNumber
                        ? "Calculando..."
                        : (nextNumberData?.next_number ?? "—")
                  }
                  className="font-mono"
                />
                <p className="text-[11px] text-muted-foreground">
                  {isEditing
                    ? "Asignado al registrar la evaluación."
                    : "Vista previa: se asigna al guardar."}
                </p>
              </FormItem>

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
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Eventos del simulacro
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      eventsArray.append({
                        name: "",
                        registered_time: "",
                        observations: "",
                        question: "",
                        answer: "SI",
                      })
                    }
                  >
                    <Plus className="mr-1 size-3.5" /> Agregar evento
                  </Button>
                </div>

                {eventsArray.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-3 rounded-md border border-border/40 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Evento {index + 1}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => eventsArray.remove(index)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px]">
                      <FormField
                        control={form.control}
                        name={`events.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Evento <RequiredIndicator />
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ej. Activación de alarma / aviso"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`events.${index}.registered_time`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hora registrada</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="10:18 A.M." />
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

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px]">
                      <FormField
                        control={form.control}
                        name={`events.${index}.question`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Pregunta de evaluación <RequiredIndicator />
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={2}
                                placeholder="Ej. ¿Se escuchó la alarma en toda el área afectada?"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`events.${index}.answer`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Respuesta <RequiredIndicator />
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
                                <SelectItem value="PARCIAL">Parcial</SelectItem>
                                <SelectItem value="NA">N/A</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}

                {form.formState.errors.events?.message ||
                form.formState.errors.events?.root?.message ? (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {form.formState.errors.events?.message ??
                      form.formState.errors.events?.root?.message}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Matriz de evaluación
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      matrixArray.append({
                        criterion: "",
                        performance_indicator: "",
                        compliance: "SI",
                        observations: "",
                      })
                    }
                  >
                    <Plus className="mr-1 size-3.5" /> Agregar criterio
                  </Button>
                </div>

                {matrixArray.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-3 rounded-md border border-border/40 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Criterio {index + 1}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => matrixArray.remove(index)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name={`matrix_rows.${index}.criterion`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Criterio evaluado <RequiredIndicator />
                          </FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`matrix_rows.${index}.performance_indicator`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Indicador de desempeño / técnica{" "}
                            <RequiredIndicator />
                          </FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                                <SelectItem value="PARCIAL">Parcial</SelectItem>
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
                ))}

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
              <NameList
                title="Aspectos de mejora / fallas detectadas"
                fields={findingsArray.fields}
                onAdd={() => findingsArray.append({ description: "" })}
                onRemove={findingsArray.remove}
                render={(index) => (
                  <FormField
                    control={form.control}
                    name={`findings.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={2}
                            placeholder="Descripción de la falla"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              />
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
                          <FormLabel>
                            Fecha límite <RequiredIndicator />
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
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
