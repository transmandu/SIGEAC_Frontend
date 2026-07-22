"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useCreateChangeRequest } from "@/actions/sms/gestion_de_cambio/actions";
import { useGetDepartments } from "@/hooks/sistema/departamento/useGetDepartment";
import { useGetEmployeesByCompany } from "@/hooks/sistema/empleados/useGetEmployees";
import { StoreChangeRequestPayload } from "@/types";
import { StepGeneral } from "./StepGeneral";
import { StepClassification } from "./StepClassification";
import { StepRisks } from "./StepRisks";
import { StepPlan } from "./StepPlan";

const STEPS = [
  { label: "General y Solicitante", step: 1 },
  { label: "Clasificación y Detalles", step: 2 },
  { label: "Riesgos y Mitigación", step: 3 },
  { label: "Plan e Implementación", step: 4 },
];

const SEVERITY_MAP: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
};

const formSchema = z.object({
  request_date: z.string().min(1, "La fecha de solicitud es requerida"),
  department_id: z.number().min(1, "El departamento es requerido"),
  requested_by: z.number().min(1, "El solicitante es requerido"),
  is_temporary: z.boolean(),
  temporary_duration: z
    .string()
    .max(100, "Máximo 100 caracteres")
    .nullable()
    .optional(),
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
  stabilization_period: z
    .string()
    .max(100, "Máximo 100 caracteres")
    .nullable()
    .optional(),
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
          .number()
          .min(1, "Mínimo 1")
          .max(5, "Máximo 5"),
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
  photographic_records: z
    .array(
      z.object({
        stage: z.enum(["before", "after"]),
        image_url: z.string().max(500, "Máximo 500 caracteres"),
      })
    )
    .optional(),
});

export { SEVERITY_MAP };

export function CreateChangeRequestForm() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const { createChangeRequest } = useCreateChangeRequest();
  const {
    data: departments,
    isLoading: isLoadingDepartments,
  } = useGetDepartments(selectedCompany?.slug);
  const {
    data: employees,
    isLoading: isLoadingEmployees,
  } = useGetEmployeesByCompany(selectedCompany?.slug);

  const form = useForm<StoreChangeRequestPayload>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      request_date: new Date().toISOString().split("T")[0],
      department_id: 0,
      requested_by: 0,
      is_temporary: false,
      temporary_duration: null,
      change_type: "" as StoreChangeRequestPayload["change_type"],
      other_type_description: null,
      description: "",
      scope: "",
      justification: "",
      estimated_change_date: null,
      mitigation_plan: null,
      planned_changes: null,
      cutoff_date: null,
      stabilization_period: null,
      project_lead_by: null,
      reviewed_by: null,
      approved_by: null,
      required_items: [],
      financial_resources: [],
      risk_assessments: [],
      activities: [],
      photographic_records: [],
    },
  });

  const onSubmit = (data: StoreChangeRequestPayload) => {
    if (!selectedCompany?.slug) return;
    createChangeRequest.mutate(
      { company: selectedCompany.slug, data },
      {
        onSuccess: () => {
          router.push(
            `/${selectedCompany.slug}/sms/aseguramiento_calidad/gestion_de_cambio`
          );
        },
      }
    );
  };

  const handleNext = async () => {
    let fieldsToValidate: (keyof StoreChangeRequestPayload)[] = [];

    if (step === 1) {
      fieldsToValidate = ["request_date", "department_id", "requested_by"];
    } else if (step === 2) {
      fieldsToValidate = [
        "change_type",
        "description",
        "scope",
        "justification",
      ];
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
            <StepGeneral
              form={form}
              departments={departments ?? []}
              employees={employees ?? []}
              isLoadingDepartments={isLoadingDepartments}
              isLoadingEmployees={isLoadingEmployees}
            />
          )}
          {step === 2 && <StepClassification form={form} />}
          {step === 3 && <StepRisks form={form} />}
          {step === 4 && (
            <StepPlan
              form={form}
              employees={employees ?? []}
              isLoadingEmployees={isLoadingEmployees}
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
              disabled={createChangeRequest.isPending}
            >
              {createChangeRequest.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Send className="size-4 mr-2" />
                  Enviar Solicitud
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Form>
  );
}
