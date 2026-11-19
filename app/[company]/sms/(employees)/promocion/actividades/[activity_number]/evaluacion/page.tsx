"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ClipboardCheck, Loader2 } from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import DrillEvaluationForm from "@/components/forms/aerolinea/sms/drill/DrillEvaluationForm";
import { useGetDrillEvaluation } from "@/hooks/sms/drill_evaluations/useGetDrillEvaluation";
import { useGetSMSActivityByNumber } from "@/hooks/sms/useGetSMSActivityByNumber";
import { hasDrillActivityCategory } from "@/lib/sms/activity-categories";
import { useCompanyStore } from "@/stores/CompanyStore";

const DrillEvaluationPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { activity_number } = useParams<{ activity_number: string }>();
  const router = useRouter();
  const company = selectedCompany?.slug;

  const {
    data: activity,
    isPending: isActivityPending,
    isError: isActivityError,
  } = useGetSMSActivityByNumber({
    company,
    activityNumber: activity_number,
  });

  // `isPending`, no `isLoading`: una query deshabilitada (empresa aún sin
  // hidratar) tiene isLoading en false, y el formulario se montaba con el tipo
  // por defecto antes de que llegara la evaluación guardada.
  const {
    data: evaluation,
    isPending: isEvaluationPending,
    isError: isEvaluationError,
  } = useGetDrillEvaluation({
    company,
    activityNumber: activity_number,
  });

  const backHref = `/${company}/sms/promocion/actividades/${activity_number}`;
  const hasDrillCategory = hasDrillActivityCategory(activity?.categories);
  const hasEvaluation = Boolean(evaluation?.id);

  const isLoading = !company || isActivityPending || isEvaluationPending;

  return (
    <ContentLayout title="Evaluación de simulacro">
      <PageHeader className="mb-6" />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-500">
            <ClipboardCheck className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight">
              {hasEvaluation ? "Editar evaluación" : "Registrar evaluación"}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Actividad {activity_number}
              {hasEvaluation && evaluation ? ` · ${evaluation.number}` : ""}
            </p>
          </div>
        </div>

        <Button asChild variant="outline">
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la actividad
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border/60 p-4 sm:p-6">
        {isLoading ? (
          <div className="flex h-52 items-center justify-center">
            <Loader2 className="size-10 animate-spin text-muted-foreground" />
          </div>
        ) : isActivityError || isEvaluationError ? (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-100 p-4 dark:border-red-800 dark:bg-red-950/20">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-300">
              No se pudo cargar la actividad o su evaluación.
            </p>
          </div>
        ) : !hasDrillCategory && !hasEvaluation ? (
          <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-100 p-4 dark:border-amber-800 dark:bg-amber-950/20">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Esta actividad no tiene la categoría SIMULACRO, por lo que no
              admite una evaluación.
            </p>
          </div>
        ) : (
          <DrillEvaluationForm
            key={evaluation?.id ?? "new"}
            activityNumber={activity_number}
            activityDrillType={
              activity?.drill_type ?? activity?.drill_evaluation?.type ?? null
            }
            initialData={hasEvaluation ? evaluation : null}
            isEditing={hasEvaluation}
            onSaved={() => router.push(backHref)}
            onCancel={() => router.push(backHref)}
          />
        )}
      </div>
    </ContentLayout>
  );
};

export default DrillEvaluationPage;
