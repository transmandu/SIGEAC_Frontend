"use client";

import { useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Info,
  Loader2,
  Paperclip,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";

import { zodResolver } from "@/lib/zod-resolver";
import { cn } from "@/lib/utils";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import {
  useCreateChangeRequest,
  useUpdateChangeRequest,
} from "@/actions/sms/aeronautical/gestion_de_cambio/actions";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetDepartments } from "@/hooks/ajustes/departamento/useGetDepartment";
import { useGetEmployeesByCompany } from "@/hooks/ajustes/empleados/useGetEmployees";
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany";
import { useGetChangeReasons } from "@/hooks/sms/aeronautical/gestion_de_cambio/useGetChangeReasons";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChangeHazardPayload,
  ChangeReason,
  ChangeReasonPayload,
  ChangeRequest,
  ChangeType,
} from "@/types/sms/aeronautical/change-request";
import { Department, Location } from "@/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ComboboxField } from "@/components/ui/ComboboxField";
import { DatePickerField } from "@/components/ui/DatePickerField";
import FolderSelect from "@/components/library/FolderSelect";

const SEVERITIES = ["A", "B", "C", "D", "E"];

const DANGER_TYPES = ["ORGANIZACIONAL", "TECNICO", "HUMANO", "NATURAL"];

const MITIGATION_RESPONSIBLES = [
  "GERENCIA DE SMS",
  "DIRECCION DE MANTENIMIENTO Y PLANIFICACION",
  "GERENCIA DE CONTROL DE CALIDAD",
  "JEFATURA DE ALMACEN",
  "GERENCIA DE ADMINISTRACION",
];

const CHANGE_TYPE_OPTIONS: {
  value: ChangeType;
  label: string;
  description: string;
}[] = [
  {
    value: "INTERNO",
    label: "Interno",
    description: "Cambios propios de la organización, sus procesos o recursos.",
  },
  {
    value: "EXTERNO",
    label: "Externo",
    description:
      "Cambios por leyes, entorno o factores fuera de la organización.",
  },
];

const STEPS = [
  { title: "Descripción del cambio", icon: FileText },
  { title: "Peligros y riesgos", icon: ShieldAlert },
  { title: "Documento y evidencia", icon: Paperclip },
] as const;

const hazardSchema = z.object({
  id: z.number().optional(),
  danger_type: z.string().min(1, "El tipo de peligro es requerido"),
  description: z.string().min(1, "La descripción del peligro es requerida"),
  possible_consequences: z.string().min(1, "Indique al menos una consecuencia"),
  area_responsible: z.string().min(1, "Indique el área responsable"),
  probability: z.coerce.number().min(1).max(5),
  severity: z.string().min(1).max(1),
});

const formSchema = z
  .object({
    request_date: z.string().min(1, "La fecha es requerida"),
    department_id: z.coerce.number().min(1, "Seleccione un departamento"),
    requested_by: z.coerce.number().min(1, "Seleccione al solicitante"),
    approved_by: z.coerce.number().nullable().optional(),
    change_type: z.enum(["INTERNO", "EXTERNO"]),
    description: z.string().min(1, "La descripción es requerida"),
    affects_other_departments: z.boolean(),
    affects_other_processes: z.boolean(),
    locations: z.array(z.number()).min(1, "Seleccione al menos una ubicación"),
    affected_departments: z.array(z.number()).optional(),
    reason_ids: z.array(z.number()).min(1, "Seleccione al menos un motivo"),
    other_reason_description: z.string().max(255).optional(),
    hazards: z.array(hazardSchema).min(1, "Agregue al menos un peligro"),
  })
  .superRefine((data, context) => {
    if (
      data.affects_other_departments &&
      (data.affected_departments?.length ?? 0) === 0
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["affected_departments"],
        message: "Seleccione al menos un departamento afectado",
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

const STEP_FIELDS: (keyof FormValues)[][] = [
  [
    "request_date",
    "department_id",
    "requested_by",
    "change_type",
    "description",
    "locations",
    "reason_ids",
    "affected_departments",
  ],
  ["hazards"],
  [],
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function toggleValue(values: number[], value: number): number[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function sameType(left: unknown, right: unknown): boolean {
  return (
    String(left ?? "")
      .trim()
      .toUpperCase() ===
    String(right ?? "")
      .trim()
      .toUpperCase()
  );
}

function RequiredLabel({
  children,
  required = true,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <FormLabel className="flex items-center gap-0.5">
      {children}
      <RequiredIndicator show={required} />
    </FormLabel>
  );
}

function FormSection({
  icon: Icon,
  title,
  hint,
  action,
  children,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
            <div className="space-y-1">
              <CardTitle className="text-base leading-tight">{title}</CardTitle>
              {hint ? (
                <p className="text-xs text-muted-foreground">{hint}</p>
              ) : null}
            </div>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </CardHeader>
      <CardContent className="pt-5">{children}</CardContent>
    </Card>
  );
}

function FormStepper({
  currentStep,
  onStepClick,
}: {
  currentStep: number;
  onStepClick: (index: number) => void;
}) {
  return (
    <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isCurrent = index === currentStep;
        const isDone = index < currentStep;
        const isLocked = index > currentStep;

        return (
          <li key={step.title}>
            <button
              type="button"
              onClick={() => onStepClick(index)}
              disabled={isLocked}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                isCurrent
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border/60 bg-background",
                isDone && "hover:bg-muted/40",
                isLocked
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:border-primary/40",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  isDone
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                      ? "border border-primary bg-background text-primary"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {isDone ? (
                  <Check className="size-3.5" />
                ) : (
                  <Icon className="size-3.5" />
                )}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block truncate text-xs font-semibold",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {index + 1}. {step.title}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function BooleanChoice({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border/60 bg-muted/40 p-1">
      {[true, false].map((option) => (
        <button
          key={String(option)}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "min-w-14 rounded-md px-3 py-1 text-sm font-medium transition-colors",
            value === option
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option ? "Sí" : "No"}
        </button>
      ))}
    </div>
  );
}

function MultiSelectList<T extends { id: number }>({
  items,
  selected,
  onToggle,
  onClear,
  label,
  searchPlaceholder = "Buscar...",
  emptyText = "Sin opciones disponibles.",
}: {
  items: T[];
  selected: number[];
  onToggle: (id: number) => void;
  onClear: () => void;
  label: (item: T) => string;
  searchPlaceholder?: string;
  emptyText?: string;
}) {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const filtered = term
    ? items.filter((item) => label(item).toLowerCase().includes(term))
    : items;

  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-background">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          {selected.length} seleccionado{selected.length === 1 ? "" : "s"}
        </span>
        {selected.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={onClear}
          >
            Limpiar
          </Button>
        ) : null}
      </div>

      {items.length > 6 ? (
        <div className="relative border-b border-border/60 p-2">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 pl-8 text-sm"
          />
        </div>
      ) : null}

      <div className="max-h-56 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            {emptyText}
          </p>
        ) : (
          filtered.map((item) => {
            const checked = selected.includes(item.id);
            return (
              <label
                key={item.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted/60",
                  checked && "bg-primary/5",
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => onToggle(item.id)}
                  className="mt-0.5"
                />
                <span className="leading-snug">{label(item)}</span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

function FilePicker({
  label,
  hint,
  accept,
  multiple = false,
  files,
  onFiles,
}: {
  label: string;
  hint: string;
  accept: string;
  multiple?: boolean;
  files: File[];
  onFiles: (files: File[]) => void;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Paperclip className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{hint}</p>
          </div>
        </div>

        <label className="cursor-pointer rounded-md border bg-background px-3 py-1.5 text-xs font-medium shadow-xs transition-colors hover:bg-muted">
          Seleccionar
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            className="sr-only"
            onChange={(event) => {
              const selected = Array.from(event.target.files ?? []);
              onFiles(multiple ? selected : selected.slice(0, 1));
              event.target.value = "";
            }}
          />
        </label>
      </div>

      {files.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-2 py-1.5 text-xs"
            >
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                onClick={() =>
                  onFiles(files.filter((_, fileIndex) => fileIndex !== index))
                }
                className="text-muted-foreground transition-colors hover:text-red-600"
                aria-label={`Quitar ${file.name}`}
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function CreateChangeRequestForm({
  initialData,
}: {
  initialData?: ChangeRequest;
}) {
  const router = useRouter();
  const params = useParams<{ company: string }>();
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany?.slug ?? params.company;
  const { isAuthenticated } = useAuth();
  const isEditing = !!initialData;

  const { createChangeRequest } = useCreateChangeRequest();
  const { updateChangeRequest } = useUpdateChangeRequest();
  const { data: departments = [], isLoading: loadingDepartments } =
    useGetDepartments(company);
  const { data: employees = [], isLoading: loadingEmployees } =
    useGetEmployeesByCompany(company);
  const { data: locations = [], isLoading: loadingLocations } =
    useGetLocationsByCompany(company);
  const { data: reasons = [], isLoading: loadingReasons } =
    useGetChangeReasons(company);

  const [currentStep, setCurrentStep] = useState(0);
  const formTopRef = useRef<HTMLDivElement>(null);
  const [document, setDocument] = useState<File | null>(null);
  const [libraryFolders, setLibraryFolders] = useState<string[]>(
    initialData?.library_folder_paths ?? [],
  );
  const [beforeImages, setBeforeImages] = useState<File[]>([]);
  const [afterImages, setAfterImages] = useState<File[]>([]);
  const [deleteRecordIds, setDeleteRecordIds] = useState<number[]>([]);

  const initialHazards = initialData?.hazards?.length
    ? initialData.hazards.map((hazard) => ({
        id: hazard.id,
        danger_type: hazard.danger_type,
        description: hazard.description,
        possible_consequences:
          hazard.mitigation_plan?.possible_consequences ?? "",
        area_responsible: hazard.mitigation_plan?.area_responsible ?? "",
        probability: Number(hazard.analysis?.probability ?? 1) || 1,
        severity: hazard.analysis?.severity ?? "A",
      }))
    : [
        {
          danger_type: "",
          description: "",
          possible_consequences: "",
          area_responsible: "",
          probability: 1,
          severity: "A",
        },
      ];

  const initialReasonIds =
    initialData?.reasons?.map(
      (reason) => reason.id ?? reason.change_reason_id,
    ) ?? [];
  const initialOtherReason =
    initialData?.reasons?.find(
      (reason) => reason.name?.trim().toUpperCase() === "OTROS",
    )?.pivot?.other_description ?? "";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      request_date: initialData?.request_date?.split("T")[0] ?? todayIso(),
      department_id: initialData?.department?.id ?? 0,
      requested_by: initialData?.requested_by?.id ?? 0,
      approved_by: initialData?.approved_by?.id ?? null,
      change_type: initialData?.change_type ?? "INTERNO",
      description: initialData?.description ?? "",
      affects_other_departments:
        initialData?.affects_other_departments ?? false,
      affects_other_processes: initialData?.affects_other_processes ?? false,
      locations: initialData?.locations?.map((location) => location.id) ?? [],
      affected_departments:
        initialData?.affected_departments?.map((department) => department.id) ??
        [],
      reason_ids: initialReasonIds,
      other_reason_description: initialOtherReason,
      hazards: initialHazards,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "hazards",
  });

  const changeType = useWatch({ control: form.control, name: "change_type" });
  const affectsOtherDepartments = useWatch({
    control: form.control,
    name: "affects_other_departments",
  });
  const selectedReasons = useWatch({
    control: form.control,
    name: "reason_ids",
  });
  const watchedHazards = useWatch({
    control: form.control,
    name: "hazards",
  });

  const availableReasons = useMemo(
    () => reasons.filter((reason) => sameType(reason.type, changeType)),
    [reasons, changeType],
  );

  const otherReason = availableReasons.find(
    (reason) => reason.name.trim().toUpperCase() === "OTROS",
  );
  const otherReasonSelected =
    !!otherReason && (selectedReasons ?? []).includes(otherReason.id);

  const departmentOptions = departments.map((department) => ({
    value: department.id,
    label: `${department.name} (${department.acronym})`,
  }));

  const employeeOptions = employees.map((employee) => ({
    value: employee.id,
    label: `${employee.first_name} ${employee.last_name}`,
    badge: employee.dni,
  }));

  const scrollToTop = () => {
    requestAnimationFrame(() =>
      formTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      }),
    );
  };

  const goToStep = (index: number) => {
    if (index > currentStep) return;
    setCurrentStep(index);
    scrollToTop();
  };

  const handleNext = async () => {
    const valid = await form.trigger(STEP_FIELDS[currentStep], {
      shouldFocus: true,
    });

    if (!valid) return;

    setCurrentStep((step) => Math.min(step + 1, STEPS.length - 1));
    scrollToTop();
  };

  const onSubmit = async (data: FormValues) => {
    const reasonPayload: ChangeReasonPayload[] = data.reason_ids
      .map((id) => reasons.find((reason) => reason.id === id))
      .filter((reason): reason is ChangeReason => !!reason)
      .map((reason) => ({
        change_reason_id: reason.id,
        other_description:
          reason.name.trim().toUpperCase() === "OTROS"
            ? data.other_reason_description?.trim() || null
            : null,
      }));

    const hazardPayload: ChangeHazardPayload[] = data.hazards.map((hazard) => ({
      id: hazard.id,
      danger_type: hazard.danger_type,
      description: hazard.description,
      possible_consequences: hazard.possible_consequences,
      area_responsible: hazard.area_responsible,
      probability: Number(hazard.probability),
      severity: hazard.severity,
      result: `${Number(hazard.probability)}${hazard.severity}`,
    }));

    const payload = {
      request_date: data.request_date,
      department_id: data.department_id,
      requested_by: data.requested_by,
      approved_by: data.approved_by ?? null,
      change_type: data.change_type,
      description: data.description,
      affects_other_departments: data.affects_other_departments,
      affects_other_processes: data.affects_other_processes,
      locations: data.locations,
      affected_departments: data.affects_other_departments
        ? (data.affected_departments ?? [])
        : [],
      reasons: reasonPayload,
      hazards: hazardPayload,
    };

    if (isEditing && initialData) {
      await updateChangeRequest.mutateAsync({
        company,
        id: initialData.id,
        data: payload,
        beforeImages,
        afterImages,
        deleteRecordIds,
        document: document ?? undefined,
        libraryFolderPaths: libraryFolders,
      });
    } else {
      await createChangeRequest.mutateAsync({
        company,
        data: payload,
        beforeImages,
        afterImages,
        document: document ?? undefined,
        libraryFolderPaths: libraryFolders,
      });
    }

    router.push(`/${company}/sms/aseguramiento_calidad/gestion_de_cambio`);
  };

  const isPending = isEditing
    ? updateChangeRequest.isPending
    : createChangeRequest.isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto flex w-full max-w-6xl flex-col gap-5 pb-10"
      >
        <div ref={formTopRef} className="scroll-mt-24" />

        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-5" />
            </span>
            <h2 className="text-lg font-semibold leading-tight">
              {isEditing
                ? `Editar solicitud ${initialData?.request_number ?? ""}`
                : "Nueva solicitud de cambio"}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {changeType === "INTERNO" ? "Cambio interno" : "Cambio externo"}
            </Badge>
            <Badge variant="outline" className="tabular-nums">
              {fields.length} peligro{fields.length === 1 ? "" : "s"}
            </Badge>
          </div>
        </div>

        <FormStepper currentStep={currentStep} onStepClick={goToStep} />

        {currentStep === 0 ? (
          <FormSection
            icon={FileText}
            title="Sección 1 — Descripción del cambio"
          >
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="request_date"
                  render={({ field }) => (
                    <FormItem>
                      <DatePickerField
                        label="Fecha de la solicitud"
                        markRequired
                        value={
                          field.value
                            ? new Date(`${field.value}T00:00:00`)
                            : undefined
                        }
                        setValue={(date) =>
                          field.onChange(
                            date ? date.toISOString().slice(0, 10) : "",
                          )
                        }
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <ComboboxField
                  form={form}
                  name="department_id"
                  label="Nombre de la dependencia que solicita el cambio"
                  placeholder="Seleccionar dependencia"
                  options={departmentOptions}
                  disabled={loadingDepartments}
                  required
                />
              </div>

              <FormField
                control={form.control}
                name="change_type"
                render={({ field }) => (
                  <FormItem>
                    <RequiredLabel>Cambio interno / externo</RequiredLabel>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {CHANGE_TYPE_OPTIONS.map((option) => {
                        const selected = field.value === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              field.onChange(option.value);
                              form.setValue("reason_ids", []);
                              form.setValue("other_reason_description", "");
                            }}
                            className={cn(
                              "rounded-xl border p-4 text-left transition-all",
                              selected
                                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                                : "border-border/60 hover:border-primary/40 hover:bg-muted/30",
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium">
                                {option.label}
                              </span>
                              <span
                                className={cn(
                                  "flex size-4 items-center justify-center rounded-full border",
                                  selected
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-muted-foreground/40",
                                )}
                              >
                                {selected ? <Check className="size-3" /> : null}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {option.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason_ids"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <RequiredLabel>Motivos del cambio</RequiredLabel>
                      <Badge variant="outline" className="text-[11px]">
                        {changeType === "INTERNO" ? "Internos" : "Externos"}
                      </Badge>
                    </div>
                    {loadingReasons ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" /> Cargando...
                      </div>
                    ) : (
                      <MultiSelectList
                        key={changeType}
                        items={availableReasons}
                        selected={field.value ?? []}
                        onToggle={(id) =>
                          field.onChange(toggleValue(field.value ?? [], id))
                        }
                        onClear={() => field.onChange([])}
                        searchPlaceholder="Buscar motivo..."
                        emptyText={`No hay motivos ${
                          changeType === "INTERNO" ? "internos" : "externos"
                        } disponibles.`}
                        label={(reason: ChangeReason) => reason.name}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {otherReasonSelected ? (
                <FormField
                  control={form.control}
                  name="other_reason_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción del motivo Otros</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Especifique el motivo"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              <FormField
                control={form.control}
                name="locations"
                render={({ field }) => (
                  <FormItem>
                    <RequiredLabel>
                      Ubicación donde se implementará el cambio
                    </RequiredLabel>
                    {loadingLocations ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" /> Cargando...
                      </div>
                    ) : (
                      <MultiSelectList
                        items={locations}
                        selected={field.value ?? []}
                        onToggle={(id) =>
                          field.onChange(toggleValue(field.value ?? [], id))
                        }
                        onClear={() => field.onChange([])}
                        searchPlaceholder="Buscar ubicación..."
                        label={(location: Location) =>
                          location.name ??
                          location.cod_iata ??
                          String(location.id)
                        }
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <RequiredLabel>
                      Breve descripción del cambio propuesto
                    </RequiredLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-24"
                        placeholder="Describa el cambio solicitado..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Info className="size-4" />
                  </span>
                  <p className="text-sm font-medium">Alcance del cambio</p>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="affects_other_departments"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background p-3">
                        <FormLabel className="m-0 text-sm font-normal">
                          ¿Afecta a otras unidades o departamentos?
                        </FormLabel>
                        <FormControl>
                          <div>
                            <BooleanChoice
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                                if (!value) {
                                  form.setValue("affected_departments", []);
                                }
                              }}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="affects_other_processes"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background p-3">
                        <FormLabel className="m-0 text-sm font-normal">
                          ¿Afecta procesos, procedimientos o manuales aprobados?
                        </FormLabel>
                        <FormControl>
                          <div>
                            <BooleanChoice
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {affectsOtherDepartments ? (
                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="affected_departments"
                      render={({ field }) => (
                        <FormItem>
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <RequiredLabel>
                              Departamentos afectados
                            </RequiredLabel>
                            <Badge variant="outline" className="text-[11px]">
                              {field.value?.length ?? 0} seleccionado
                              {(field.value?.length ?? 0) === 1 ? "" : "s"}
                            </Badge>
                          </div>
                          <MultiSelectList
                            items={departments}
                            selected={field.value ?? []}
                            onToggle={(id) =>
                              field.onChange(toggleValue(field.value ?? [], id))
                            }
                            onClear={() => field.onChange([])}
                            searchPlaceholder="Buscar departamento..."
                            label={(department: Department) =>
                              `${department.name} (${department.acronym})`
                            }
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ComboboxField
                  form={form}
                  name="requested_by"
                  label="Solicitante"
                  placeholder="Seleccionar empleado"
                  options={employeeOptions}
                  disabled={loadingEmployees}
                  required
                />

                <FormField
                  control={form.control}
                  name="approved_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aprobado por</FormLabel>
                      <Select
                        value={field.value ? String(field.value) : "none"}
                        onValueChange={(value) =>
                          field.onChange(
                            value === "none" ? null : Number(value),
                          )
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sin aprobador" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Sin aprobador</SelectItem>
                          {employees.map((employee) => (
                            <SelectItem
                              key={employee.id}
                              value={String(employee.id)}
                            >
                              {employee.first_name} {employee.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </FormSection>
        ) : null}

        {currentStep === 1 ? (
          <FormSection
            icon={ShieldAlert}
            title="SECCION 2 (DESCRIPCION DE LOS POSIBLES PELIGROS EMERGENTES DEL CAMBIO Y GESTION DE RIESGOS ASOCIADOS)"
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() =>
                  append({
                    danger_type: "",
                    description: "",
                    possible_consequences: "",
                    area_responsible: "",
                    probability: 1,
                    severity: "A",
                  })
                }
              >
                <Plus className="mr-2 size-4" /> Agregar peligro
              </Button>
            }
          >
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <Info className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="text-sm">
                  <p className="font-medium">
                    PARA SER DILIGENCIADO POR LA GERENCIA DE SMS, EL DUENO DEL
                    PROCESO, EL COMITE DE SMS Y EL GRUPO SAG (SI APLICA).
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {fields.map((field, index) => {
                  const current = watchedHazards?.[index];
                  return (
                    <div
                      key={field.id}
                      className="rounded-xl border border-border/60 bg-background p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {index + 1}
                          </span>
                          <p className="text-sm font-medium">
                            Peligro {index + 1}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="tabular-nums text-[11px]"
                          >
                            Riesgo {current?.probability ?? 1}
                            {current?.severity ?? "A"}
                          </Badge>
                          {fields.length > 1 ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => remove(index)}
                              aria-label={`Eliminar peligro ${index + 1}`}
                            >
                              <Trash2 className="size-4 text-red-500" />
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`hazards.${index}.danger_type`}
                          render={({ field: hazardField }) => {
                            const options =
                              hazardField.value &&
                              !DANGER_TYPES.includes(hazardField.value)
                                ? [hazardField.value, ...DANGER_TYPES]
                                : DANGER_TYPES;

                            return (
                              <FormItem>
                                <RequiredLabel>TIPO DE PELIGRO</RequiredLabel>
                                <Select
                                  value={hazardField.value || undefined}
                                  onValueChange={hazardField.onChange}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="_" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {options.map((dangerType) => (
                                      <SelectItem
                                        key={dangerType}
                                        value={dangerType}
                                      >
                                        {dangerType}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />

                        <FormField
                          control={form.control}
                          name={`hazards.${index}.area_responsible`}
                          render={({ field: hazardField }) => {
                            const options =
                              hazardField.value &&
                              !MITIGATION_RESPONSIBLES.includes(
                                hazardField.value,
                              )
                                ? [
                                    hazardField.value,
                                    ...MITIGATION_RESPONSIBLES,
                                  ]
                                : MITIGATION_RESPONSIBLES;

                            return (
                              <FormItem>
                                <RequiredLabel>
                                  RESPONSABLE DE LA MITIGACION
                                </RequiredLabel>
                                <Select
                                  value={hazardField.value || undefined}
                                  onValueChange={hazardField.onChange}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="_" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {options.map((responsible) => (
                                      <SelectItem
                                        key={responsible}
                                        value={responsible}
                                      >
                                        {responsible}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />

                        <FormField
                          control={form.control}
                          name={`hazards.${index}.description`}
                          render={({ field: hazardField }) => (
                            <FormItem className="md:col-span-2">
                              <RequiredLabel>
                                Descripción del peligro
                              </RequiredLabel>
                              <FormControl>
                                <Textarea
                                  className="min-h-20"
                                  {...hazardField}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`hazards.${index}.possible_consequences`}
                          render={({ field: hazardField }) => (
                            <FormItem className="md:col-span-2">
                              <RequiredLabel>
                                Posibles consecuencias
                              </RequiredLabel>
                              <FormControl>
                                <Textarea
                                  className="min-h-20"
                                  {...hazardField}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`hazards.${index}.probability`}
                          render={({ field: hazardField }) => (
                            <FormItem>
                              <RequiredLabel>Probabilidad</RequiredLabel>
                              <Select
                                value={String(hazardField.value)}
                                onValueChange={(value) =>
                                  hazardField.onChange(Number(value))
                                }
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5].map((value) => (
                                    <SelectItem
                                      key={value}
                                      value={String(value)}
                                    >
                                      {value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`hazards.${index}.severity`}
                          render={({ field: hazardField }) => (
                            <FormItem>
                              <RequiredLabel>Severidad</RequiredLabel>
                              <Select
                                value={hazardField.value}
                                onValueChange={hazardField.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {SEVERITIES.map((value) => (
                                    <SelectItem key={value} value={value}>
                                      {value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
                <FormMessage>
                  {form.formState.errors.hazards?.message as string | undefined}
                </FormMessage>
              </div>
            </div>
          </FormSection>
        ) : null}

        {currentStep === 2 ? (
          <FormSection icon={Paperclip} title="Documento y evidencia">
            <div className="flex flex-col gap-4">
              {isEditing &&
              initialData?.photographic_records &&
              initialData.photographic_records.filter(
                (record) => !deleteRecordIds.includes(record.id),
              ).length > 0 ? (
                <div className="flex flex-col gap-2">
                  <Label>Fotos registradas</Label>
                  <div className="flex flex-col gap-2 rounded-md border border-border/60 p-3">
                    {initialData.photographic_records
                      .filter((record) => !deleteRecordIds.includes(record.id))
                      .map((record) => (
                        <div
                          key={record.id}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <span className="truncate">
                            {record.stage === "before" ? "Antes" : "Después"} —{" "}
                            {record.image_url.split("/").pop()}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() =>
                              setDeleteRecordIds((current) => [
                                ...current,
                                record.id,
                              ])
                            }
                          >
                            <Trash2 className="size-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <FilePicker
                  label="Documento de la solicitud"
                  hint="PDF"
                  accept="application/pdf"
                  files={document ? [document] : []}
                  onFiles={(files) => setDocument(files[0] ?? null)}
                />

                <FilePicker
                  label="Fotos antes del cambio"
                  hint="Imágenes"
                  accept="image/*"
                  multiple
                  files={beforeImages}
                  onFiles={setBeforeImages}
                />

                <FilePicker
                  label="Fotos después del cambio"
                  hint="Imágenes"
                  accept="image/*"
                  multiple
                  files={afterImages}
                  onFiles={setAfterImages}
                />
              </div>

              {document && isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  <Label>Carpetas en Librería</Label>
                  <FolderSelect
                    company={company}
                    value={libraryFolders}
                    onChange={setLibraryFolders}
                  />
                </div>
              ) : null}
            </div>
          </FormSection>
        ) : null}

        <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-2 rounded-xl border border-border/60 bg-background/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Paso {currentStep + 1} de {STEPS.length} ·{" "}
            <span className="font-semibold text-destructive">*</span>{" "}
            obligatorio
          </p>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancelar
            </Button>

            {currentStep > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => goToStep(currentStep - 1)}
                disabled={isPending}
              >
                <ArrowLeft className="mr-2 size-4" />
                Anterior
              </Button>
            ) : null}

            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={handleNext}>
                Siguiente
                <ArrowRight className="ml-2 size-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Check className="mr-2 size-4" />
                )}
                {isEditing ? "Guardar cambios" : "Crear solicitud"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
