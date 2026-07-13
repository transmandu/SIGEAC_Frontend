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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ComboboxField } from "@/components/ui/ComboboxField";
import { AgreementItem } from "@/components/forms/general/AgreementItem";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Trash2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetEmployeesByCompany } from "@/hooks/sistema/empleados/useGetEmployees";
import { useCreateMeetingMinute, useUpdateMeetingMinute } from "@/actions/general/minutas_reunion/actions";
import { MeetingMinutes } from "@/types";

interface FormProps {
  onClose: (open: boolean) => void;
  initialData?: MeetingMinutes;
  isEditing?: boolean;
}

const FormSchema = z.object({
  date: z.date({ required_error: "La fecha es obligatoria" }),
  place: z.string().min(1, "El lugar es obligatorio"),
  objective: z.string().optional(),
  topics: z.array(z.object({
    value: z.string().min(1, "El tema no puede estar vacío"),
  })).optional(),
  photo: z.any().optional(),
  document: z.any().optional(),
  chaired_by: z.string({ required_error: "Seleccione quien preside" }),
  filled_out_by: z.string({ required_error: "Seleccione quien diligencia" }),
  reviewed_by: z.string().optional(),
  approved_by: z.string().optional(),
  attendees: z.array(z.object({
    employee_id: z.string().optional(),
    attendee_name: z.string().optional(),
    job_title: z.string().optional(),
    has_attended: z.boolean().default(true),
    is_external: z.boolean().default(false),
  })).optional(),
  agreements: z.array(z.object({
    description: z.string().min(1, "La descripción es obligatoria"),
    responsible_employee_id: z.string().optional(),
    responsible_name: z.string().optional(),
    responsible_job_title: z.string().optional(),
    is_external: z.boolean().default(false),
  })).optional(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

function buildFormData(companySlug: string, locationId: number, data: FormSchemaType): FormData {
  const fd = new FormData();

  fd.append("date", data.date.toISOString().split("T")[0]);
  fd.append("place", data.place);
  fd.append("location_id", String(locationId));

  if (data.objective) fd.append("objective", data.objective);

  const topicValues = data.topics?.map((t) => t.value).filter(Boolean) ?? [];
  if (topicValues.length > 0) {
    fd.append("topics", JSON.stringify(topicValues));
  }

  if (data.photo) fd.append("photo", data.photo);
  if (data.document) fd.append("document", data.document);
  fd.append("chaired_by", String(data.chaired_by));
  fd.append("filled_out_by", String(data.filled_out_by));
  if (data.reviewed_by) fd.append("reviewed_by", String(data.reviewed_by));
  if (data.approved_by) fd.append("approved_by", String(data.approved_by));

  data.attendees?.filter((a) => a.employee_id || a.attendee_name).forEach((a, i) => {
    if (a.is_external) {
      if (a.attendee_name) fd.append(`attendees[${i}][attendee_name]`, a.attendee_name);
      if (a.job_title) fd.append(`attendees[${i}][job_title]`, a.job_title);
    } else {
      if (a.employee_id) fd.append(`attendees[${i}][employee_id]`, String(a.employee_id));
    }
    fd.append(`attendees[${i}][has_attended]`, a.has_attended ? "1" : "0");
  });

  data.agreements?.filter((a) => a.description).forEach((a, i) => {
    fd.append(`agreements[${i}][description]`, a.description);
    if (a.is_external) {
      if (a.responsible_name) fd.append(`agreements[${i}][responsible_name]`, a.responsible_name);
      if (a.responsible_job_title) fd.append(`agreements[${i}][responsible_job_title]`, a.responsible_job_title);
    } else {
      if (a.responsible_employee_id) fd.append(`agreements[${i}][responsible_employee_id]`, String(a.responsible_employee_id));
    }
  });

  return fd;
}

export function CreateMeetingMinuteForm({
  onClose,
  isEditing,
  initialData,
}: FormProps) {
  const { selectedCompany, selectedStation } = useCompanyStore();
  const companySlug = selectedCompany?.slug ?? "";
  const { data: employees, isLoading: employeesLoading } = useGetEmployeesByCompany(companySlug);
  const { createMeetingMinute } = useCreateMeetingMinute();
  const { updateMeetingMinute } = useUpdateMeetingMinute();

  const [step, setStep] = useState(1);

  const employeeOptions = (employees ?? []).map((e) => ({
    value: String(e.id),
    label: `${e.first_name} ${e.last_name}`.trim(),
  }));

  const parseStringArray = (val: string | undefined | null): { value: string }[] => {
    if (!val) return [];
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map((v: string) => ({ value: String(v) }));
    } catch { }
    return val.trim() ? [{ value: val }] : [];
  };

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      date: initialData?.date ? new Date(initialData.date) : undefined,
      place: initialData?.place ?? "",
      objective: typeof initialData?.objective === "string" ? initialData.objective : "",
      topics: parseStringArray(initialData?.topics as string | undefined),
      chaired_by: typeof initialData?.chaired_by === "object" ? String((initialData.chaired_by as any)?.id ?? "") : String(initialData?.chaired_by ?? ""),
      filled_out_by: typeof initialData?.filled_out_by === "object" ? String((initialData.filled_out_by as any)?.id ?? "") : String(initialData?.filled_out_by ?? ""),
      reviewed_by: typeof initialData?.reviewed_by === "object" ? String((initialData.reviewed_by as any)?.id ?? "") : String(initialData?.reviewed_by ?? ""),
      approved_by: typeof initialData?.approved_by === "object" ? String((initialData.approved_by as any)?.id ?? "") : String(initialData?.approved_by ?? ""),
      attendees: initialData?.attendees?.map((a) => ({
        employee_id: a.employee_id ? String(a.employee_id) : "",
        attendee_name: a.attendee_name ?? "",
        job_title: a.job_title ?? "",
        has_attended: a.has_attended,
        is_external: !a.employee_id,
      })) ?? [],
      agreements: initialData?.agreements?.map((a) => ({
        description: a.description,
        responsible_employee_id: a.responsible_employee_id ? String(a.responsible_employee_id) : "",
        responsible_name: a.responsible_name ?? "",
        responsible_job_title: (a as any).responsible_job_title ?? "",
        is_external: !a.responsible_employee_id && !!a.responsible_name,
      })) ?? [],
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

  const isPending = createMeetingMinute.isPending || updateMeetingMinute.isPending;

  const onSubmit = async (data: FormSchemaType) => {
    if (!companySlug || !selectedStation) return;

    const fd = buildFormData(companySlug, Number(selectedStation), data);

    if (isEditing && initialData) {
      await updateMeetingMinute.mutateAsync({ company: companySlug, id: initialData.id, data: fd });
    } else {
      await createMeetingMinute.mutateAsync({ company: companySlug, data: fd });
    }

    onClose(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-5"
      >
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-2">
          {[
            { num: 1, label: "Información" },
            { num: 2, label: "Participantes" },
            { num: 3, label: "Acuerdos" },
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              {i > 0 && (
                <div className={cn("w-12 h-px mx-2", step > i ? "bg-primary" : "bg-border")} />
              )}
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold border",
                    step >= s.num
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border"
                  )}
                >
                  {step > s.num ? (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    s.num
                  )}
                </div>
                <span className={cn("text-xs font-medium whitespace-nowrap", step >= s.num ? "text-foreground" : "text-muted-foreground")}>
                  {s.label}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <>
            {/* Fecha y Lugar */}
            <div className="space-y-3">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Información de la Reunión
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                        Fecha
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            fromYear={2020}
                            toYear={new Date().getFullYear() + 1}
                            captionLayout="dropdown-buttons"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="place"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                        Lugar
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Sala de reuniones" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="border-border/60" />

            {/* Motivo */}
            <div className="space-y-3">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Motivo
              </span>

              <FormField
                control={form.control}
                name="objective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Objetivo
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Objetivo de la reunión" className="min-h-[80px]" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="border-border/60" />

            {/* Quien Preside */}
            <div className="space-y-3">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Dirección
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ComboboxField
                  form={form}
                  name="chaired_by"
                  label="Presidida por"
                  placeholder="Seleccionar..."
                  options={employeeOptions}
                  disabled={employeesLoading}
                />
              </div>
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
                  attendee_name: "",
                  job_title: "",
                  has_attended: true,
                  is_external: false,
                })
              }
            >
              <Plus className="size-3.5 mr-1" />
              Agregar
            </Button>
          </div>

          {attendeeFields.length === 0 && (
            <p className="text-xs text-muted-foreground">No hay participantes agregados.</p>
          )}

          {attendeeFields.map((field, index) => {
            const isExternal = form.watch(`attendees.${index}.is_external`);
            return (
              <div
                key={field.id}
                className="flex flex-col gap-3 p-3 border border-border/30 rounded-md"
              >
                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name={`attendees.${index}.is_external`}
                    render={({ field: f }) => (
                      <FormItem className="flex flex-row items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={f.value}
                            onCheckedChange={f.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-xs font-medium text-muted-foreground cursor-pointer">
                          No es empleado
                        </FormLabel>
                      </FormItem>
                    )}
                  />
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

                {!isExternal && (
                  <ComboboxField
                    form={form}
                    name={`attendees.${index}.employee_id`}
                    label="Empleado"
                    placeholder="Seleccionar..."
                    options={employeeOptions}
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
                            Nombre
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

        {/* Puntos a Tratar */}
        <div className="space-y-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Puntos a Tratar
          </span>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Temas
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
              <p className="text-xs text-muted-foreground">No hay temas agregados.</p>
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
                  responsible_name: "",
                  responsible_job_title: "",
                  is_external: false,
                })
              }
            >
              <Plus className="size-3.5 mr-1" />
              Agregar
            </Button>
          </div>

          {agreementFields.length === 0 && (
            <p className="text-xs text-muted-foreground">No hay acuerdos agregados.</p>
          )}

          {agreementFields.map((field, index) => (
            <AgreementItem
              key={field.id}
              form={form}
              index={index}
              employees={employees ?? []}
              onRemove={() => removeAgreement(index)}
            />
          ))}
        </div>

        <Separator className="border-border/60" />

        {/* Realizado por, Revisado por, Aprobado por */}
        <div className="space-y-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Revisión y Aprobación
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ComboboxField
              form={form}
              name="filled_out_by"
              label="Realizado por"
              placeholder="Opcional"
              options={employeeOptions}
              disabled={employeesLoading}
            />
            <ComboboxField
              form={form}
              name="reviewed_by"
              label="Revisado por"
              placeholder="Opcional"
              options={employeeOptions}
              disabled={employeesLoading}
            />
            <ComboboxField
              form={form}
              name="approved_by"
              label="Aprobado por"
              placeholder="Opcional"
              options={employeeOptions}
              disabled={employeesLoading}
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
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="size-4 mr-1" />
              Anterior
            </Button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <Button type="button" onClick={() => setStep(step + 1)}>
              Siguiente
              <ChevronRight className="size-4 ml-1" />
            </Button>
          ) : (
            <div />
          )}
        </div>
      </form>
    </Form>
  );
}
