"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EvaluationWorkflowPanel } from "@/app/[company]/sms/aeronautical/gestion_de_riesgos/evaluacion_mitigacion/_components/evaluation-workflow-panel";
import { useGetChangeRequestByNumber } from "@/hooks/sms/aeronautical/gestion_de_cambio/useGetChangeRequestByNumber";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  Analysis,
  HazardNotification,
  MitigationMeasure,
  MitigationPlan,
} from "@/types/sms/mantenimiento";

export default function ChangeRequestEvaluationPage() {
  const params = useParams<{ company: string; requestNumber: string }>();
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany?.slug ?? params.company;
  const { data: changeRequest, isLoading } = useGetChangeRequestByNumber(
    company,
    params.requestNumber,
  );

  const [selectedHazardId, setSelectedHazardId] = useState<number | null>(null);

  const hazards = useMemo(
    () => changeRequest?.hazards ?? [],
    [changeRequest?.hazards],
  );

  const effectiveSelectedHazardId = selectedHazardId ?? hazards[0]?.id ?? null;
  const hazard =
    hazards.find((item) => item.id === effectiveSelectedHazardId) ?? null;

  if (isLoading) {
    return (
      <ContentLayout title="Evaluación de peligros del cambio">
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="animate-spin size-12 text-primary" />
        </div>
      </ContentLayout>
    );
  }

  if (!changeRequest || hazards.length === 0) {
    return (
      <ContentLayout title="Evaluación de peligros del cambio">
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              La solicitud no tiene peligros registrados.
            </p>
            <Button variant="outline" onClick={() => router.back()}>
              Volver
            </Button>
          </CardContent>
        </Card>
      </ContentLayout>
    );
  }

  const selectedNotification = hazard as unknown as HazardNotification;
  const mitigationPlan =
    (hazard?.mitigation_plan as unknown as MitigationPlan | null) ?? null;
  const planAnalysis = (hazard?.analysis as unknown as Analysis | null) ?? null;
  const postMitigationAnalysis =
    (mitigationPlan?.analysis as unknown as Analysis | null) ?? null;
  const measures =
    (mitigationPlan?.measures as unknown as MitigationMeasure[] | undefined) ??
    [];

  return (
    <ContentLayout title="Evaluación de peligros del cambio">
      <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full pb-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">
                Evaluación de peligros del cambio
              </h1>
              <p className="text-xs text-muted-foreground">
                {changeRequest.request_number}
              </p>
            </div>
          </div>

          <Select
            value={
              effectiveSelectedHazardId
                ? String(effectiveSelectedHazardId)
                : undefined
            }
            onValueChange={(value) => setSelectedHazardId(Number(value))}
          >
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Seleccionar peligro" />
            </SelectTrigger>
            <SelectContent>
              {hazards.map((item) => (
                <SelectItem key={item.id} value={String(item.id)}>
                  {item.danger_type} — {item.report_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <EvaluationWorkflowPanel
          key={selectedNotification.id}
          company={company}
          selectedNotification={selectedNotification}
          currentMitigationPlan={mitigationPlan}
          currentPlanAnalysis={planAnalysis}
          currentPostMitigationAnalysis={postMitigationAnalysis}
          currentMeasures={measures}
          onChangeNotification={() => undefined}
        />
      </div>
    </ContentLayout>
  );
}
