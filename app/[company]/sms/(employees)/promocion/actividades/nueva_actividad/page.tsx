"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CreateSMSActivityForm from "@/components/forms/aerolinea/sms/CreateSMSActivityForm";
import { CreateSafetyBulletinForm } from "@/components/forms/aerolinea/sms/CreateSafetyBulletinForm";
import { CreateSurveyForm } from "@/components/forms/aerolinea/sms/survey/CreateSurveyForm";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { StepIndicator } from "@/components/ui/step-indicator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useCreateSMSActivity } from "@/actions/sms/sms_actividades/actions";

type Step = 1 | 2;

const CreateSMSActivity = () => {
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const [step, setStep] = useState<Step>(1);
  const [activityData, setActivityData] = useState<any>(null);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createSMSActivity } = useCreateSMSActivity();

  const hasBoletin = categoryNames.some((name) =>
    name.toUpperCase().includes("BOLETIN")
  );
  const hasEncuesta = categoryNames.some((name) =>
    name.toUpperCase().includes("ENCUESTA")
  );
  const showWizard = hasBoletin || hasEncuesta;

  const handleActivityContinue = async (
    data: any,
    selectedCategoryNames: string[]
  ) => {
    const needsStep2 = selectedCategoryNames.some((name) =>
      name.toUpperCase().includes("BOLETIN")
    ) || selectedCategoryNames.some((name) =>
      name.toUpperCase().includes("ENCUESTA")
    );

    if (!needsStep2) {
      setIsSubmitting(true);
      try {
        await createSMSActivity.mutateAsync({
          company: selectedCompany!.slug,
          data,
        });
        router.push(`/${selectedCompany?.slug}/sms/promocion/actividades`);
      } catch (error) {
        console.error("Error al crear la actividad", error);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setActivityData(data);
    setCategoryNames(selectedCategoryNames);
    setStep(2);
  };

  const handleClose = () => {
    router.push(`/${selectedCompany?.slug}/sms/promocion/actividades`);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleCombinedSubmit = async (childData: any) => {
    if (!activityData || !selectedCompany?.slug) return;
    setIsSubmitting(true);

    try {
      const payload: any = { ...activityData };

      if (hasBoletin) {
        payload.bulletin = {
          title: childData.title,
          description: childData.description,
          date: childData.date
            ? typeof childData.date === "string"
              ? childData.date
              : childData.date.toISOString?.()
            : undefined,
          image: childData.image instanceof File ? childData.image : undefined,
          document: childData.document instanceof File ? childData.document : undefined,
        };
      }

      if (hasEncuesta) {
        payload.survey = {
          title: childData.title,
          type: childData.type,
          description: childData.description,
          questions: childData.questions,
        };
      }

      await createSMSActivity.mutateAsync({
        company: selectedCompany.slug,
        data: payload,
      });

      router.push(`/${selectedCompany.slug}/sms/promocion/actividades`);
    } catch (error) {
      console.error("Error al crear actividad con contenido asociado", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ContentLayout
      title={
        step === 1 || !showWizard
          ? "Creación de Actividad"
          : hasBoletin
            ? "Creación Boletín"
            : "Creación <D-d>Encuesta"
      }
    >
      {showWizard && <StepIndicator currentStep={step} />}

      <div className={step !== 1 ? "hidden" : ""}>
        <CreateSMSActivityForm
          onClose={() => false}
          onContinue={handleActivityContinue}
        />
      </div>

      <div className={cn("space-y-4", step !== 2 || !hasBoletin ? "hidden" : "")}>
        <CreateSafetyBulletinForm
          onClose={handleClose}
          onStepSubmit={handleCombinedSubmit}
          isSubmitting={isSubmitting}
        />
        <div className="flex justify-start">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            size="sm"
            disabled={isSubmitting}
          >
            ← Atrás
          </Button>
        </div>
      </div>

      <div className={cn("space-y-4", step !== 2 || !hasEncuesta ? "hidden" : "")}>
        <CreateSurveyForm
          onClose={handleClose}
          onStepSubmit={handleCombinedSubmit}
          isSubmitting={isSubmitting}
        />
        <div className="flex justify-start">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            size="sm"
            disabled={isSubmitting}
          >
            ← Atrás
          </Button>
        </div>
      </div>
    </ContentLayout>
  );
};

export default CreateSMSActivity;
