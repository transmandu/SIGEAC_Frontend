"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import CreateSMSActivityForm from "@/components/forms/aerolinea/sms/CreateSMSActivityForm";
import { CreateSafetyBulletinForm } from "@/components/forms/aerolinea/sms/CreateSafetyBulletinForm";
import { CreateSurveyForm } from "@/components/forms/aerolinea/sms/survey/CreateSurveyForm";
import { LinkSurveyToActivityForm } from "@/components/forms/aerolinea/sms/survey/LinkSurveyToActivityForm";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { StepIndicator } from "@/components/ui/step-indicator";
import { Button } from "@/components/ui/button";
import {
  ActivityContentKind,
  getActivityContentKinds,
} from "@/lib/sms/activity-categories";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useCreateSMSActivity } from "@/actions/sms/sms_actividades/actions";
import { useCreateBulletin } from "@/actions/sms/boletin/actions";
import {
  useCreateSurvey,
  useLinkSurveyToActivity,
} from "@/actions/sms/survey/actions";
import { Survey } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";

type Step = 1 | 2;
type SurveyMode = "create" | "link";

const CONTENT_LABELS: Record<ActivityContentKind, string> = {
  boletin: "Boletín",
  encuesta: "Encuesta",
};

const CreateSMSActivity = () => {
  const router = useRouter();
  const { selectedCompany, selectedStation } = useCompanyStore();

  const [step, setStep] = useState<Step>(1);
  const [activityData, setActivityData] = useState<any>(null);
  const [contentQueue, setContentQueue] = useState<ActivityContentKind[]>([]);
  const [contentIndex, setContentIndex] = useState(0);
  const [createdActivityId, setCreatedActivityId] = useState<number | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surveyMode, setSurveyMode] = useState<SurveyMode>("create");

  const { createSMSActivity } = useCreateSMSActivity();
  const { createBulletin } = useCreateBulletin();
  const { createSurvey } = useCreateSurvey();
  const { linkSurveyToActivity } = useLinkSurveyToActivity();

  const currentContent = contentQueue[contentIndex] ?? null;
  const showWizard = step === 2 && currentContent !== null;

  const goToActivities = () =>
    router.push(`/${selectedCompany?.slug}/sms/promocion/actividades`);

  const handleActivityContinue = async (
    data: any,
    selectedCategoryNames: string[],
  ) => {
    const kinds = getActivityContentKinds(selectedCategoryNames);

    if (kinds.length === 0) {
      setIsSubmitting(true);
      try {
        await createSMSActivity.mutateAsync({
          company: selectedCompany!.slug,
          data,
        });
        goToActivities();
      } catch (error) {
        console.error("Error al crear la actividad", error);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setActivityData(data);
    setContentQueue(kinds);
    setContentIndex(0);
    setCreatedActivityId(null);
    setSurveyMode("create");
    setStep(2);
  };

  /**
   * Crea la actividad una sola vez y devuelve su id. A partir de ahi cada
   * contenido del paso 2 se crea aparte y se asocia con `sms_activity_id`.
   */
  const ensureActivityCreated = async (
    extra?: Record<string, unknown>,
  ): Promise<number> => {
    if (createdActivityId) return createdActivityId;

    const result = await createSMSActivity.mutateAsync({
      company: selectedCompany!.slug,
      data: extra ? { ...activityData, ...extra } : { ...activityData },
    });

    const createdId = result?.data?.id;
    if (!createdId) {
      throw new Error("No se pudo obtener el id de la actividad creada");
    }

    setCreatedActivityId(createdId);
    return createdId;
  };

  const handleNextContentOrFinish = () => {
    if (contentIndex + 1 < contentQueue.length) {
      setContentIndex((prev) => prev + 1);
      setSurveyMode("create");
      return;
    }
    goToActivities();
  };

  const handleBulletinSubmit = async (childData: any) => {
    if (!activityData || !selectedCompany?.slug) return;
    setIsSubmitting(true);

    try {
      const activityId = await ensureActivityCreated();

      await createBulletin.mutateAsync({
        company: selectedCompany.slug,
        data: {
          title: childData.title,
          description: childData.description,
          date: childData.date,
          image: childData.image instanceof File ? childData.image : undefined,
          document:
            childData.document instanceof File ? childData.document : undefined,
          sms_activity_id: activityId.toString(),
        },
      });

      handleNextContentOrFinish();
    } catch (error) {
      console.error("Error al crear la actividad y su boletin", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSurveySubmit = async (childData: any) => {
    if (!activityData || !selectedCompany?.slug) return;
    setIsSubmitting(true);

    try {
      const surveyPayload = {
        title: childData.title,
        type: childData.type,
        location_id: selectedStation,
        description: childData.description,
        questions: childData.questions,
      };

      if (createdActivityId) {
        // La actividad ya existe (el boletin se creo antes): la encuesta se
        // crea aparte y se vincula.
        const survey = await createSurvey.mutateAsync(surveyPayload);
        await linkSurveyToActivity.mutateAsync({
          company: selectedCompany.slug,
          activity_id: createdActivityId,
          survey_id: survey?.data?.survey_id?.toString(),
        });
      } else {
        // Encuesta embebida en la misma transaccion que la actividad.
        await ensureActivityCreated({ survey: surveyPayload });
      }

      handleNextContentOrFinish();
    } catch (error) {
      console.error("Error al crear la actividad y su encuesta", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkSurveySubmit = async (survey: Survey) => {
    if (!activityData || !selectedCompany?.slug) return;
    setIsSubmitting(true);

    try {
      const activityId = await ensureActivityCreated();

      await linkSurveyToActivity.mutateAsync({
        company: selectedCompany.slug,
        activity_id: activityId,
        survey_id: survey.id.toString(),
      });

      handleNextContentOrFinish();
    } catch (error) {
      console.error(
        "Error al crear la actividad y vincular la encuesta",
        error,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (isSubmitting || createdActivityId) return;

    if (contentIndex > 0) {
      setContentIndex((prev) => prev - 1);
      return;
    }

    setStep(1);
  };

  return (
    <ContentLayout
      title={
        showWizard
          ? `Creación de ${CONTENT_LABELS[currentContent!]}`
          : "Creación de Actividad"
      }
    >
      <PageHeader className="mb-6" />

      {showWizard && <StepIndicator currentStep={step} />}

      {createdActivityId && (
        <p className="mb-4 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          La actividad ya fue creada. Completa el contenido restante para
          finalizar.
        </p>
      )}

      <div className={step !== 1 ? "hidden" : ""}>
        <CreateSMSActivityForm
          onClose={goToActivities}
          onContinue={handleActivityContinue}
        />
      </div>

      {currentContent === "boletin" && (
        <div className="space-y-4">
          <CreateSafetyBulletinForm
            onClose={goToActivities}
            selectedDate={
              activityData?.start_date
                ? format(
                    new Date(activityData.start_date),
                    "yyyy-MM-dd'T'00:00:00",
                  )
                : undefined
            }
            onStepSubmit={handleBulletinSubmit}
            isSubmitting={isSubmitting}
          />
          <div className="flex justify-start">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              size="sm"
              disabled={isSubmitting || !!createdActivityId}
            >
              ← Atrás
            </Button>
          </div>
        </div>
      )}

      {currentContent === "encuesta" && (
        <div className="space-y-4">
          <div className="flex justify-center gap-2">
            {[
              {
                label: "Crear nueva encuesta",
                value: "create" as SurveyMode,
              },
              {
                label: "Vincular encuesta existente",
                value: "link" as SurveyMode,
              },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSurveyMode(opt.value)}
                disabled={isSubmitting}
                className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                  surveyMode === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {surveyMode === "create" ? (
            <CreateSurveyForm
              onClose={goToActivities}
              onStepSubmit={handleSurveySubmit}
              isSubmitting={isSubmitting}
            />
          ) : (
            <LinkSurveyToActivityForm
              onStepSubmit={handleLinkSurveySubmit}
              onBack={handleBack}
              loading={isSubmitting}
            />
          )}
          <div className="flex justify-start">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              size="sm"
              disabled={isSubmitting || !!createdActivityId}
            >
              ← Atrás
            </Button>
          </div>
        </div>
      )}
    </ContentLayout>
  );
};

export default CreateSMSActivity;
