"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Send, Loader2, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useUpdateChangeRequest } from "@/actions/sms/gestion_de_cambio/actions";
import { useGetDepartments } from "@/hooks/sistema/departamento/useGetDepartment";
import { useGetEmployeesByCompany } from "@/hooks/sistema/empleados/useGetEmployees";
import {
  ChangeRequest,
  ChangePhotographicRecord,
  StoreChangeRequestPayload,
} from "@/types";
import { StepGeneralAndClassification } from "./StepGeneralAndClassification";
import { StepPlanAndResources } from "./StepPlanAndResources";
import { StepRisksAndDetails } from "./StepRisksAndDetails";
import { PhotographicImage } from "./StepPhotographicRecords";
import { FileServer } from "@/components/misc/FileServer";
import Image from "next/image";

const STEPS = [
  { label: "General y Clasificación", step: 1 },
  { label: "Plan y Recursos", step: 2 },
  { label: "Riesgos y Detalles", step: 3 },
  { label: "Registro Fotográfico", step: 4 },
];

const TIME_UNIT_MULTIPLIER: Record<string, number> = {
  days: 1,
  weeks: 7,
  months: 30,
  years: 365,
};

const formSchema = z.object({
  request_date: z.string().min(1, "La fecha de solicitud es requerida"),
  department_id: z.number().min(1, "El departamento es requerido"),
  requested_by: z.number().min(1, "El solicitante es requerido"),
  is_temporary: z.boolean(),
  temporary_duration_value: z.number().optional(),
  temporary_duration_unit: z.enum(["days", "weeks", "months", "years"]).optional(),
  change_type: z.string().min(1, "El tipo de cambio es requerido"),
  other_type_description: z
    .string()
    .max(255, "Máximo 255 caracteres")
    .nullable()
    .optional(),
  description: z
    .string()
    .min(1, "La descripción es requerida")
    .max(2000, "Máximo 2000 caracteres"),
  scope: z
    .string()
    .min(1, "El alcance es requerido")
    .max(500, "Máximo 500 caracteres"),
  justification: z
    .string()
    .min(1, "La justificación es requerida")
    .max(2000, "Máximo 2000 caracteres"),
  estimated_change_date: z.string().nullable().optional(),
  mitigation_plan: z.string().nullable().optional(),
  planned_changes: z.string().nullable().optional(),
  cutoff_date: z.string().nullable().optional(),
  stabilization_period_value: z.number().optional(),
  stabilization_period_unit: z.enum(["days", "weeks", "months", "years"]).optional(),
  project_lead_by: z.number().nullable().optional(),
  reviewed_by: z.number().nullable().optional(),
  approved_by: z.number().nullable().optional(),
  required_items: z
    .array(
      z.object({
        item_description: z
          .string()
          .min(1, "La descripción del item es requerida")
          .max(255, "Máximo 255 caracteres"),
      })
    )
    .optional(),
  financial_resources: z
    .array(
      z.object({
        description: z.string().min(1, "La descripción es requerida"),
        estimated_value: z.number().min(0, "El monto debe ser positivo"),
        currency_unit: z.string().min(1, "La moneda es requerida"),
      })
    )
    .optional(),
  risk_assessments: z
    .array(
      z.object({
        hazard_description: z
          .string()
          .min(1, "La descripción del peligro es requerida"),
        probability_value: z
          .number()
          .min(1, "Mínimo 1")
          .max(5, "Máximo 5"),
        severity_value: z
          .string()
          .min(1, "La severidad es requerida"),
      })
    )
    .optional(),
  activities: z
    .array(
      z.object({
        activity_description: z
          .string()
          .min(1, "La descripción de la actividad es requerida"),
        assigned_employee_id: z
          .number()
          .min(1, "El responsable es requerido"),
      })
    )
    .optional(),
});

type EditFormValues = z.infer<typeof formSchema>;

function parseDurationDays(durationStr: string | null | undefined): {
  value: number | undefined;
  unit: "days" | "weeks" | "months" | "years" | undefined;
} {
  if (!durationStr) return { value: undefined, unit: undefined };
  const match = durationStr.match(/^(\d+)\s*días?$/);
  if (!match) return { value: undefined, unit: undefined };
  const totalDays = parseInt(match[1], 10);
  if (totalDays % 365 === 0) return { value: totalDays / 365, unit: "years" };
  if (totalDays % 30 === 0) return { value: totalDays / 30, unit: "months" };
  if (totalDays % 7 === 0) return { value: totalDays / 7, unit: "weeks" };
  return { value: totalDays, unit: "days" };
}

function convertToDays(value: number | undefined, unit: string | undefined): string {
  if (!value || !unit) return "";
  const days = value * (TIME_UNIT_MULTIPLIER[unit] ?? 1);
  return `${days} días`;
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function PhotographicRecordsEditStep({
  existingRecords,
  newBeforeImages,
  newAfterImages,
  onNewBeforeImagesChange,
  onNewAfterImagesChange,
  keptRecordIds,
  onKeptRecordIdsChange,
  company,
}: {
  existingRecords: ChangePhotographicRecord[];
  newBeforeImages: PhotographicImage[];
  newAfterImages: PhotographicImage[];
  onNewBeforeImagesChange: (images: PhotographicImage[]) => void;
  onNewAfterImagesChange: (images: PhotographicImage[]) => void;
  keptRecordIds: number[];
  onKeptRecordIdsChange: (ids: number[]) => void;
  company: string;
}) {
  const inputBeforeRef = useRef<HTMLInputElement | null>(null);
  const inputAfterRef = useRef<HTMLInputElement | null>(null);

  const existingBefore = existingRecords.filter((r) => r.stage === "before");
  const existingAfter = existingRecords.filter((r) => r.stage === "after");

  const handleFiles = (
    files: FileList | null,
    target: "before" | "after"
  ) => {
    if (!files) return;
    const newImages: PhotographicImage[] = [];
    for (const file of Array.from(files)) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) continue;
      if (file.size > MAX_IMAGE_SIZE_BYTES) continue;
      newImages.push({ file, preview: URL.createObjectURL(file) });
    }
    if (newImages.length === 0) return;
    if (target === "before") {
      onNewBeforeImagesChange([...newBeforeImages, ...newImages]);
    } else {
      onNewAfterImagesChange([...newAfterImages, ...newImages]);
    }
  };

  const removeNewImage = (target: "before" | "after", index: number) => {
    if (target === "before") {
      URL.revokeObjectURL(newBeforeImages[index].preview);
      onNewBeforeImagesChange(newBeforeImages.filter((_, i) => i !== index));
    } else {
      URL.revokeObjectURL(newAfterImages[index].preview);
      onNewAfterImagesChange(newAfterImages.filter((_, i) => i !== index));
    }
  };

  const toggleExistingRecord = (id: number) => {
    if (keptRecordIds.includes(id)) {
      onKeptRecordIdsChange(keptRecordIds.filter((i) => i !== id));
    } else {
      onKeptRecordIdsChange([...keptRecordIds, id]);
    }
  };

  const renderSection = (
    label: string,
    existing: ChangePhotographicRecord[],
    newImages: PhotographicImage[],
    target: "before" | "after",
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <Plus className="size-3 mr-1" />
          Agregar
        </Button>
      </div>

      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files, target)}
      />

      {existing.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {existing.map((record) => {
            const isKept = keptRecordIds.includes(record.id);
            return (
              <div
                key={record.id}
                className={`relative group aspect-square rounded-md overflow-hidden border transition-opacity ${
                  isKept ? "border-border/40" : "border-red-300 opacity-40"
                }`}
              >
                <FileServer path={record.image_url} company={company}>
                  {(url) =>
                    url ? (
                      <Image
                        src={url}
                        alt={`${label} existente`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-muted">
                        <ImageIcon className="size-6 text-muted-foreground/40" />
                      </div>
                    )
                  }
                </FileServer>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isKept
                      ? "bg-destructive/80 hover:bg-destructive text-white"
                      : "bg-green-500/80 hover:bg-green-500 text-white"
                  }`}
                  onClick={() => toggleExistingRecord(record.id)}
                >
                  <Trash2 className="size-3" />
                </Button>
                <span className="absolute bottom-1 left-1 text-[10px] font-medium bg-black/50 text-white px-1.5 py-0.5 rounded">
                  Existente
                </span>
              </div>
            );
          })}
        </div>
      )}

      {newImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {newImages.map((img, index) => (
            <div
              key={img.preview}
              className="relative group aspect-square rounded-md overflow-hidden border border-border/40"
            >
              <Image
                src={img.preview}
                alt={`${label} nueva ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/80 hover:bg-destructive text-white"
                onClick={() => removeNewImage(target, index)}
              >
                <Trash2 className="size-3" />
              </Button>
              <span className="absolute bottom-1 left-1 text-[10px] font-medium bg-black/50 text-white px-1.5 py-0.5 rounded">
                Nueva
              </span>
            </div>
          ))}
        </div>
      )}

      {existing.length === 0 && newImages.length === 0 && (
        <div
          className="flex flex-col items-center justify-center gap-2 py-8 border border-dashed border-border/60 rounded-md cursor-pointer hover:bg-muted/20 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <ImageIcon className="size-8 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">
            Arrastra imágenes o haz clic para agregar
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            JPG, PNG o WebP — Máx. 5MB por imagen
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {renderSection("ANTES del Cambio", existingBefore, newBeforeImages, "before", inputBeforeRef)}
      {renderSection("DESPUÉS del Cambio", existingAfter, newAfterImages, "after", inputAfterRef)}
    </div>
  );
}

interface EditChangeRequestFormProps {
  changeRequest: ChangeRequest;
}

export function EditChangeRequestForm({ changeRequest }: EditChangeRequestFormProps) {
  const [step, setStep] = useState(1);
  const [newBeforeImages, setNewBeforeImages] = useState<PhotographicImage[]>([]);
  const [newAfterImages, setNewAfterImages] = useState<PhotographicImage[]>([]);
  const [keptRecordIds, setKeptRecordIds] = useState<number[]>(
    changeRequest.photographic_records.map((r) => r.id)
  );
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const { updateChangeRequest } = useUpdateChangeRequest();
  const {
    data: departments,
    isLoading: isLoadingDepartments,
  } = useGetDepartments(selectedCompany?.slug);
  const {
    data: employees,
    isLoading: isLoadingEmployees,
  } = useGetEmployeesByCompany(selectedCompany?.slug);

  const durationParsed = parseDurationDays(changeRequest.temporary_duration);
  const stabParsed = parseDurationDays(changeRequest.stabilization_period);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      request_date: changeRequest.request_date?.split("T")[0] ?? "",
      department_id: Number(changeRequest.department_id) || 0,
      requested_by: changeRequest.requested_by?.id ?? 0,
      is_temporary: changeRequest.is_temporary,
      temporary_duration_value: durationParsed.value,
      temporary_duration_unit: durationParsed.unit,
      change_type: changeRequest.change_type,
      other_type_description: changeRequest.other_type_description,
      description: changeRequest.description,
      scope: changeRequest.scope,
      justification: changeRequest.justification,
      estimated_change_date: changeRequest.estimated_change_date?.split("T")[0] ?? null,
      mitigation_plan: changeRequest.mitigation_plan,
      planned_changes: changeRequest.planned_changes,
      cutoff_date: changeRequest.cutoff_date?.split("T")[0] ?? null,
      stabilization_period_value: stabParsed.value,
      stabilization_period_unit: stabParsed.unit,
      project_lead_by: changeRequest.project_lead_by?.id ?? null,
      reviewed_by: changeRequest.reviewed_by?.id ?? null,
      approved_by: changeRequest.approved_by?.id ?? null,
      required_items: changeRequest.required_items.map((i) => ({
        item_description: i.item_description,
      })),
      financial_resources: changeRequest.financial_resources.map((r) => ({
        description: r.description,
        estimated_value: Number(r.estimated_value),
        currency_unit: r.currency_unit,
      })),
      risk_assessments: changeRequest.risk_assessments.map((r) => ({
        hazard_description: r.hazard_description,
        probability_value: Number(r.probability_value),
        severity_value: r.severity_value,
      })),
      activities: changeRequest.activities.map((a) => ({
        activity_description: a.activity_description,
        assigned_employee_id: a.assigned_employee?.id ?? 0,
      })),
    },
  });

  const onSubmit = (data: EditFormValues) => {
    if (!selectedCompany?.slug) return;

    const {
      temporary_duration_value,
      temporary_duration_unit,
      stabilization_period_value,
      stabilization_period_unit,
      ...rest
    } = data;

    const payload = {
      ...rest,
      temporary_duration: convertToDays(temporary_duration_value, temporary_duration_unit),
      stabilization_period: convertToDays(stabilization_period_value, stabilization_period_unit),
    } as StoreChangeRequestPayload;

    const existingBeforeIds = keptRecordIds.filter((id) =>
      changeRequest.photographic_records.some((r) => r.id === id && r.stage === "before")
    );
    const existingAfterIds = keptRecordIds.filter((id) =>
      changeRequest.photographic_records.some((r) => r.id === id && r.stage === "after")
    );

    updateChangeRequest.mutate(
      {
        company: selectedCompany.slug,
        id: changeRequest.id,
        data: payload,
        beforeImages: newBeforeImages.map((img) => img.file),
        afterImages: newAfterImages.map((img) => img.file),
        existingBeforeRecordIds: existingBeforeIds,
        existingAfterRecordIds: existingAfterIds,
      },
      {
        onSuccess: () => {
          router.push(
            `/${selectedCompany.slug}/sms/aseguramiento_calidad/gestion_de_cambio/${changeRequest.id}`
          );
        },
      }
    );
  };

  const handleNext = async () => {
    let fieldsToValidate: (keyof EditFormValues)[] = [];

    if (step === 1) {
      fieldsToValidate = [
        "request_date",
        "department_id",
        "requested_by",
        "change_type",
        "description",
        "scope",
        "justification",
      ];
    } else if (step === 2) {
      fieldsToValidate = ["planned_changes"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <Form {...form}>
      <div className="flex flex-col gap-5">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.step} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium border ${
                    step > s.step
                      ? "bg-primary text-primary-foreground border-primary"
                      : step === s.step
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {step > s.step ? "✓" : s.step}
                </div>
                <span
                  className={`text-[10px] font-medium uppercase tracking-wide whitespace-nowrap ${
                    step >= s.step
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-12 h-px mx-2 mb-4 ${
                    step > s.step ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="border border-border/60 rounded-md p-4">
          {step === 1 && (
            <StepGeneralAndClassification
              form={form as never}
              departments={departments ?? []}
              employees={employees ?? []}
              isLoadingDepartments={isLoadingDepartments}
              isLoadingEmployees={isLoadingEmployees}
            />
          )}
          {step === 2 && (
            <StepPlanAndResources
              form={form as never}
              employees={employees ?? []}
              isLoadingEmployees={isLoadingEmployees}
            />
          )}
          {step === 3 && (
            <StepRisksAndDetails
              form={form as never}
              employees={employees ?? []}
              isLoadingEmployees={isLoadingEmployees}
            />
          )}
          {step === 4 && (
            <PhotographicRecordsEditStep
              existingRecords={changeRequest.photographic_records}
              newBeforeImages={newBeforeImages}
              newAfterImages={newAfterImages}
              onNewBeforeImagesChange={setNewBeforeImages}
              onNewAfterImagesChange={setNewAfterImages}
              keptRecordIds={keptRecordIds}
              onKeptRecordIdsChange={setKeptRecordIds}
              company={selectedCompany?.slug ?? ""}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            disabled={step === 1}
          >
            <ChevronLeft className="size-4 mr-1" />
            Anterior
          </Button>
          {step < 4 ? (
            <Button type="button" onClick={handleNext}>
              Siguiente
              <ChevronRight className="size-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={updateChangeRequest.isPending}
            >
              {updateChangeRequest.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Send className="size-4 mr-2" />
                  Actualizar Solicitud
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Form>
  );
}
