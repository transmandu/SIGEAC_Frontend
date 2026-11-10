"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ComboboxField } from "@/components/ui/ComboboxField";
import { AgreementItem } from "@/components/forms/general/AgreementItem";
import FolderSelect from "@/components/library/FolderSelect";

import { zodResolver } from "@/lib/zod-resolver";
import {
  useForm,
  useFieldArray,
  useWatch,
  type FieldErrors,
} from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Trash2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  useCreateAeronauticalMeetingMinute,
  useUpdateAeronauticalMeetingMinute,
} from "@/actions/sms/aeronautical/minutas_reunion/actions";
import type { AeronauticalMeetingMinute } from "@/types/sms/aeronautical/meeting-minute";
import { useGetAllEmployeesByCompany } from "@/hooks/ajustes/empleados/useGetAllEmployees";
import { useGetExternalEmployees } from "@/hooks/ajustes/convenios/useGetExternalEmployees";
import { toCalendarPayload } from "@/lib/date";

interface FormProps {
  onClose: (open: boolean) => void;
  initialData?: AeronauticalMeetingMinute;
  isEditing?: boolean;
}

const FormSchema = z
  .object({
    date: z.date({ error: "La fecha es obligatoria" }),
    place: z.string().min(1, "El lugar es obligatorio"),
    objective: z.string().optional(),
    topics: z
      .array(
        z.object({
          value: z.string().min(1, "El tema no puede estar vacío"),
        }),
      )
      .optional(),
    photo: z.any().optional(),
    document: z.any().optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    filled_out_by: z.string().min(1, "Seleccione quien diligencia"),
    attendees: z
      .array(
        z.object({
          employee_id: z.string().optional(),
          authorized_employee_id: z.string().optional(),
          attendee_name: z.string().optional(),
          job_title: z.string().optional(),
          has_attended: z.boolean().default(true),
          is_external: z.boolean().default(false),
          is_authorized: z.boolean().default(false),
        }),
      )
      .optional(),
    agreements: z
      .array(
        z.object({
          description: z.string().min(1, "La descripción es obligatoria"),
          estimated_date: z
            .union([z.literal(""), z.string().date("Fecha inválida")])
            .optional(),
          responsible_employee_id: z.string().optional(),
          responsible_authorized_employee_id: z.string().optional(),
          responsible_name: z.string().optional(),
          responsible_job_title: z.string().optional(),
          is_external: z.boolean().default(false),
          is_authorized: z.boolean().default(false),
        }),
      )
      .optional(),
    library_folder_paths: z.array(z.string()).optional().default([]),
  })
  .superRefine((data, ctx) => {
    if (data.start_time && data.end_time && data.end_time < data.start_time) {
      ctx.addIssue({
        code: "custom",
        path: ["end_time"],
        message:
          "La hora de finalización no puede ser anterior a la hora de inicio.",
      });
    }

    data.attendees?.forEach((attendee, index) => {
      // Solo se valida la opción activa. Los campos de las otras opciones
      // pueden conservar valores viejos aunque estén ocultos en la UI.
      const hasActiveValue = attendee.is_authorized
        ? !!attendee.authorized_employee_id
        : attendee.is_external
          ? !!attendee.attendee_name
          : !!attendee.employee_id;

      if (!hasActiveValue) {
        ctx.addIssue({
          code: "custom",
          path: ["attendees", index],
          message: attendee.is_authorized
            ? "Seleccione el empleado autorizado."
            : attendee.is_external
              ? "Indique el nombre del participante externo."
              : "Seleccione el empleado.",
        });
      }
    });

    data.agreements?.forEach((agreement, index) => {
      const hasActiveResponsible = agreement.is_authorized
        ? !!agreement.responsible_authorized_employee_id
        : agreement.is_external
          ? !!agreement.responsible_name
          : !!agreement.responsible_employee_id;

      if (!hasActiveResponsible) {
        ctx.addIssue({
          code: "custom",
          path: ["agreements", index, "responsible_employee_id"],
          message: agreement.is_authorized
            ? "Seleccione el responsable autorizado."
            : agreement.is_external
              ? "Indique el nombre del responsable externo."
              : "Seleccione el responsable.",
        });
      }
    });
  });

type FormSchemaType = z.infer<typeof FormSchema>;

/** "HH:MM:SS" (SQL Server) → "HH:MM" para <input type="time">. */
const toTimeInput = (value?: string | null) =>
  value ? String(value).slice(0, 5) : "";

/** Primer error de Zod/RHF, con su ruta, para saltar al paso correcto. */
function firstFormError(
  errors: FieldErrors<FormSchemaType>,
): { path: string; message: string } | null {
  for (const key of Object.keys(errors)) {
    const value = errors[key as keyof FormSchemaType];
    if (!value) continue;

    if (
      typeof value === "object" &&
      "message" in value &&
      value.message
    ) {
      return { path: key, message: String(value.message) };
    }

    if (typeof value === "object") {
      const nested = firstFormError(value as FieldErrors<FormSchemaType>);
      if (nested) {
        return { path: `${key}.${nested.path}`, message: nested.message };
      }
    }
  }

  return null;
}

function stepForErrorPath(path: string): number {
  if (path.startsWith("attendees")) return 2;
  if (
    path.startsWith("agreements") ||
    path.startsWith("topics") ||
    path === "filled_out_by"
  ) {
    return 3;
  }
  return 1;
}

function buildFormData(
  companySlug: string,
  locationId: number,
  data: FormSchemaType,
): FormData {
  const fd = new FormData();

  fd.append("date", toCalendarPayload(data.date) ?? "");
  fd.append("place", data.place);
  fd.append("location_id", String(locationId));

  if (data.objective) fd.append("objective", data.objective);

  const topicValues = data.topics?.map((t) => t.value).filter(Boolean) ?? [];
  if (topicValues.length > 0) {
    fd.append("topics", JSON.stringify(topicValues));
  }

  if (data.photo) fd.append("photo", data.photo);
  if (data.document) fd.append("document", data.document);
  fd.append("filled_out_by", String(data.filled_out_by));

  if (data.start_time) fd.append("start_time", data.start_time);
  if (data.end_time) fd.append("end_time", data.end_time);

  (data.library_folder_paths ?? []).forEach((p) =>
    fd.append("library_folder_paths[]", p),
  );

  data.attendees
    ?.filter(
      (a) => a.employee_id || a.authorized_employee_id || a.attendee_name,
    )
    .forEach((a, i) => {
      if (a.is_authorized) {
        if (a.authorized_employee_id)
          fd.append(
            `attendees[${i}][authorized_employee_id]`,
            String(a.authorized_employee_id),
          );
      } else if (a.is_external) {
        if (a.attendee_name)
          fd.append(`attendees[${i}][attendee_name]`, a.attendee_name);
        if (a.job_title) fd.append(`attendees[${i}][job_title]`, a.job_title);
      } else {
        if (a.employee_id)
          fd.append(`attendees[${i}][employee_id]`, String(a.employee_id));
      }
      fd.append(`attendees[${i}][has_attended]`, a.has_attended ? "1" : "0");
    });

  data.agreements
    ?.filter((a) => a.description)
    .forEach((a, i) => {
      fd.append(`agreements[${i}][description]`, a.description);
      if (a.estimated_date)
        fd.append(`agreements[${i}][estimated_date]`, a.estimated_date);
      if (a.is_authorized) {
        if (a.responsible_authorized_employee_id)
          fd.append(
            `agreements[${i}][responsible_authorized_employee_id]`,
            String(a.responsible_authorized_employee_id),
          );
      } else if (a.is_external) {
        if (a.responsible_name)
          fd.append(`agreements[${i}][responsible_name]`, a.responsible_name);
        if (a.responsible_job_title)
          fd.append(
            `agreements[${i}][responsible_job_title]`,
            a.responsible_job_title,
          );
      } else {
        if (a.responsible_employee_id)
          fd.append(
            `agreements[${i}][responsible_employee_id]`,
            String(a.responsible_employee_id),
          );
      }
    });

  return fd;
}

export function CreateAeronauticalMeetingMinuteForm({
  onClose,
  isEditing,
  initialData,
}: FormProps) {
  const { selectedCompany, selectedStation } = useCompanyStore();
  const companySlug = selectedCompany?.slug ?? "";
  const { data: allEmployees, isLoading: allEmployeesLoading } =
    useGetAllEmployeesByCompany(companySlug);
  const { data: authorizedEmployees, isLoading: authorizedEmployeesLoading } =
    useGetExternalEmployees(
      companySlug,
      "meetings.minutes",
      // Al editar, quien entonces estaba autorizado, no solo quien lo está hoy.
      initialData?.date ? String(initialData.date).slice(0, 10) : undefined,
    );
  const { createMeetingMinute } = useCreateAeronauticalMeetingMinute();
  const { updateMeetingMinute } = useUpdateAeronauticalMeetingMinute();

  const [step, setStep] = useState(1);

  const allEmployeeOptions = (allEmployees ?? []).map((e) => ({
    value: String(e.id),
    label: `${e.first_name} ${e.last_name}`.trim(),
  }));

  const authorizedEmployeeOptions = (authorizedEmployees ?? []).map((a) => ({
    value: String(a.id),
    label: a.employee_name || a.dni_employee,
    badge: a.from_company_db,
  }));

  const parseStringArray = (
    val: string | string[] | undefined | null,
  ): { value: string }[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map((v) => ({ value: String(v) }));
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed))
        return parsed.map((v: string) => ({ value: String(v) }));
    } catch {}
    return val.trim() ? [{ value: val }] : [];
  };

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      date: initialData?.date ? new Date(initialData.date) : undefined,
      place: initialData?.place ?? "",
      objective:
        typeof initialData?.objective === "string" ? initialData.objective : "",
      topics: parseStringArray(initialData?.topics),
      start_time: toTimeInput(initialData?.start_time),
      end_time: toTimeInput(initialData?.end_time),
      filled_out_by:
        typeof initialData?.filled_out_by === "object"
          ? String((initialData.filled_out_by as any)?.id ?? "")
          : String(initialData?.filled_out_by ?? ""),
      attendees:
        initialData?.attendees?.map((a) => ({
          employee_id: a.employee_id ? String(a.employee_id) : "",
          authorized_employee_id: a.authorized_employee_id
            ? String(a.authorized_employee_id)
            : "",
          attendee_name: a.attendee_name ?? "",
          job_title: a.job_title ?? "",
          has_attended: a.has_attended,
          is_external:
            !a.employee_id && !a.authorized_employee_id && !!a.attendee_name,
          is_authorized: !!a.authorized_employee_id,
        })) ?? [],
      agreements:
        initialData?.agreements?.map((a) => ({
          description: a.description,
          estimated_date: a.estimated_date ?? "",
          responsible_employee_id: a.responsible_employee_id
            ? String(a.responsible_employee_id)
            : "",
          responsible_authorized_employee_id:
            a.responsible_authorized_employee_id
              ? String(a.responsible_authorized_employee_id)
              : "",
          responsible_name: a.responsible_name ?? "",
          responsible_job_title: a.responsible_job_title ?? "",
          is_external:
            !a.responsible_employee_id &&
            !a.responsible_authorized_employee_id &&
            !!a.responsible_name,
          is_authorized: !!a.responsible_authorized_employee_id,
        })) ?? [],
      library_folder_paths: initialData?.library_folder_paths ?? [],
    },
  });

  const {
    fields: topicFields,
    append: appendTopic,
    remove: removeTopic,
  } = useFieldArray({ control: form.control, name: "topics" });

  const {
    fields: attendeeFields,
    append: appendAttendee,
    remove: removeAttendee,
  } = useFieldArray({ control: form.control, name: "attendees" });

  const {
    fields: agreementFields,
    append: appendAgreement,
    remove: removeAgreement,
  } = useFieldArray({ control: form.control, name: "agreements" });

  const watchedAttendees = useWatch({
    control: form.control,
    name: "attendees",
  });

  const isPending =
    createMeetingMinute.isPending || updateMeetingMinute.isPending;

  const onSubmit = async (data: FormSchemaType) => {
    if (!companySlug || !selectedStation) return;

    const fd = buildFormData(companySlug, Number(selectedStation), data);

    if (isEditing && initialData) {
      await updateMeetingMinute.mutateAsync({
        company: companySlug,
        id: initialData.id,
        data: fd,
      });
    } else {
      await createMeetingMinute.mutateAsync({ company: companySlug, data: fd });
    }

    onClose(false);
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
    const fields =
      step === 1
        ? (["date", "place", "start_time", "end_time"] as const)
        : step === 2
          ? (["attendees"] as const)
          : null;

    if (fields) {
      const valid = await form.trigger([...fields], { shouldFocus: true });

      if (!valid) {
        const validationError = firstFormError(form.formState.errors);
        toast.error("Completa los campos obligatorios del paso actual.", {
          description: validationError?.message,
        });
        return;
      }
    }

    setStep(step + 1);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="flex flex-col space-y-5"
      >
        {/* Step indicator */}
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2 sm:mb-2">
          {[
            { num: 1, label: "Información" },
            { num: 2, label: "Participantes" },
            { num: 3, label: "Agenda y Acuerdos" },
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              {i > 0 && (
                <div
                  className={cn(
                    "hidden h-px w-6 sm:block sm:w-12",
                    step > i ? "bg-primary" : "bg-border",
                  )}
                />
              )}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold sm:h-7 sm:w-7 sm:text-xs",
                    step >= s.num
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border",
                  )}
                >
                  {step > s.num ? (
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  ) : (
                    s.num
                  )}
                </div>
                <span
                  className={cn(
                    "whitespace-nowrap text-[11px] font-medium sm:text-xs",
                    step >= s.num ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <>
            {/* Lugar y Fecha */}
            <div className="space-y-3">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Información de la Reunión
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="place"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                        Lugar <RequiredIndicator />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Sala de reuniones" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
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
                        setValue={(d) => field.onChange(d)}
                        required
                      />
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="border-border/60" />

            {/* Hora de inicio y finalización */}
            <div className="space-y-3">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Horario de la Reunión
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                        Hora de inicio
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                        Hora de finalización
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="border-border/60" />

            {/* Motivo de la reunión */}
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="objective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Motivo de la reunión
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Motivo de la reunión"
                        className="min-h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {/* Participantes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Participantes
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendAttendee({
                      employee_id: "",
                      authorized_employee_id: "",
                      attendee_name: "",
                      job_title: "",
                      has_attended: true,
                      is_external: false,
                      is_authorized: false,
                    })
                  }
                >
                  <Plus className="size-3.5 mr-1" />
                  Agregar
                </Button>
              </div>

              {attendeeFields.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No hay participantes agregados.
                </p>
              )}

              {attendeeFields.map((field, index) => {
                const isExternal = watchedAttendees?.[index]?.is_external;
                const isAuthorized = watchedAttendees?.[index]?.is_authorized;
                return (
                  <div
                    key={field.id}
                    className="flex flex-col gap-3 p-3 border border-border/30 rounded-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <FormField
                          control={form.control}
                          name={`attendees.${index}.is_authorized`}
                          render={({ field: f }) => (
                            <FormItem className="flex flex-row items-center gap-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={f.value}
                                  onCheckedChange={(checked) => {
                                    f.onChange(checked);
                                    if (checked) {
                                      form.setValue(
                                        `attendees.${index}.is_external`,
                                        false,
                                      );
                                      form.setValue(
                                        `attendees.${index}.employee_id`,
                                        "",
                                      );
                                      form.setValue(
                                        `attendees.${index}.attendee_name`,
                                        "",
                                      );
                                      form.setValue(
                                        `attendees.${index}.job_title`,
                                        "",
                                      );
                                    } else {
                                      form.setValue(
                                        `attendees.${index}.authorized_employee_id`,
                                        "",
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-xs font-medium text-muted-foreground cursor-pointer">
                                Empresa asociada
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`attendees.${index}.is_external`}
                          render={({ field: f }) => (
                            <FormItem className="flex flex-row items-center gap-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={f.value}
                                  onCheckedChange={(checked) => {
                                    f.onChange(checked);
                                    if (checked) {
                                      form.setValue(
                                        `attendees.${index}.is_authorized`,
                                        false,
                                      );
                                      form.setValue(
                                        `attendees.${index}.employee_id`,
                                        "",
                                      );
                                      form.setValue(
                                        `attendees.${index}.authorized_employee_id`,
                                        "",
                                      );
                                    } else {
                                      form.setValue(
                                        `attendees.${index}.attendee_name`,
                                        "",
                                      );
                                      form.setValue(
                                        `attendees.${index}.job_title`,
                                        "",
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-xs font-medium text-muted-foreground cursor-pointer">
                                No es empleado
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => removeAttendee(index)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>

                    {!isExternal && !isAuthorized && (
                      <ComboboxField
                        form={form}
                        name={`attendees.${index}.employee_id`}
                        label="Empleado"
                        placeholder={
                          allEmployeesLoading ? "Cargando..." : "Seleccionar..."
                        }
                        options={allEmployeeOptions}
                        disabled={allEmployeesLoading}
                        required
                      />
                    )}

                    {isAuthorized && (
                      <ComboboxField
                        form={form}
                        name={`attendees.${index}.authorized_employee_id`}
                        label="Empleado autorizado"
                        placeholder={
                          authorizedEmployeesLoading
                            ? "Cargando..."
                            : "Seleccionar..."
                        }
                        searchPlaceholder="Buscar empleado autorizado..."
                        emptyText="No hay empleados autorizados."
                        options={authorizedEmployeeOptions}
                        disabled={authorizedEmployeesLoading}
                        required
                      />
                    )}

                    {isExternal && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`attendees.${index}.attendee_name`}
                          render={({ field: f }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-1">
                                Nombre <RequiredIndicator />
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Nombre completo" {...f} />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`attendees.${index}.job_title`}
                          render={({ field: f }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-1">
                                Cargo
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Cargo" {...f} />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name={`attendees.${index}.has_attended`}
                      render={({ field: f }) => (
                        <FormItem className="flex flex-row items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={f.value}
                              onCheckedChange={f.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-xs font-medium text-muted-foreground cursor-pointer">
                            Asistió
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <Separator className="border-border/60" />

            {/* Agenda */}
            <div className="space-y-3">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Agenda
              </span>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Puntos de la agenda
                  </FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendTopic({ value: "" })}
                  >
                    <Plus className="size-3.5 mr-1" />
                    Agregar
                  </Button>
                </div>
                {topicFields.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No hay temas agregados.
                  </p>
                )}
                {topicFields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <FormField
                      control={form.control}
                      name={`topics.${index}.value`}
                      render={({ field: f }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder={`Tema ${index + 1}`} {...f} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-0.5 shrink-0"
                      onClick={() => removeTopic(index)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="border-border/60" />

            {/* Acuerdos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Acuerdos
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendAgreement({
                      description: "",
                      responsible_employee_id: "",
                      responsible_authorized_employee_id: "",
                      responsible_name: "",
                      responsible_job_title: "",
                      is_external: false,
                      is_authorized: false,
                    })
                  }
                >
                  <Plus className="size-3.5 mr-1" />
                  Agregar
                </Button>
              </div>

              {agreementFields.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No hay acuerdos agregados.
                </p>
              )}

              {agreementFields.map((field, index) => (
                <AgreementItem
                  key={field.id}
                  form={form}
                  index={index}
                  employees={allEmployees ?? []}
                  authorizedEmployees={authorizedEmployees ?? []}
                  isAuthorizedEmployeesLoading={authorizedEmployeesLoading}
                  onRemove={() => removeAgreement(index)}
                  showEstimatedDate
                />
              ))}
            </div>

            <Separator className="border-border/60" />

            {/* Elaborada por */}
            <div className="space-y-3">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Elaboración
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ComboboxField
                  form={form}
                  name="filled_out_by"
                  label="Elaborada por"
                  placeholder={
                    allEmployeesLoading ? "Cargando..." : "Seleccionar..."
                  }
                  options={allEmployeeOptions}
                  disabled={allEmployeesLoading}
                  required
                />
              </div>
            </div>

            {/* Foto y Documento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="photo"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                      Foto
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={(e) => onChange(e.target.files?.[0])}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="document"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                      Documento
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => onChange(e.target.files?.[0])}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Carpeta en la Librería */}
            <div className="space-y-3 rounded-lg border border-border/60 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Carpetas en la Librería
              </p>

              <FormField
                control={form.control}
                name="library_folder_paths"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                      Carpeta destino
                    </FormLabel>
                    <FormControl>
                      <FolderSelect
                        company={companySlug}
                        value={field.value ?? []}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <p className="text-xs text-muted-foreground">
                El documento adjunto se subirá una sola vez a la Librería.
                Puedes elegir una o varias carpetas; usa la estrella para fijar
                la carpeta principal, las demás son réplicas en otras carpetas.
              </p>
            </div>

            <Separator className="border-border/60" />

            <div className="flex justify-between items-center gap-x-4">
              <Separator className="flex-1" />
              <p className="text-muted-foreground text-xs">SIGEAC</p>
              <Separator className="flex-1" />
            </div>

            <Button disabled={isPending} type="submit" className="w-full h-10">
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <FileText className="size-4 mr-2" />
                  {isEditing ? "Actualizar Minuta" : "Crear Minuta"}
                </>
              )}
            </Button>
          </>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => setStep(step - 1)}
            >
              <ChevronLeft className="size-4 mr-1" />
              Anterior
            </Button>
          ) : (
            <div className="hidden sm:block" />
          )}
          {step < 3 ? (
            <Button
              type="button"
              className="flex-1 sm:flex-none"
              onClick={handleNext}
              disabled={form.formState.isValidating}
            >
              Siguiente
              <ChevronRight className="size-4 ml-1" />
            </Button>
          ) : (
            <div className="hidden sm:block" />
          )}
        </div>
      </form>
    </Form>
  );
}
