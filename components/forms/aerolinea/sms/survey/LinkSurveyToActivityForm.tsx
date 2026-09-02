"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Survey } from "@/types";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useGetSurveysWithoutActivity } from "@/hooks/sms/survey/useGetSurveysWithoutActivity";

interface LinkSurveyToActivityFormProps {
  onStepSubmit: (survey: Survey) => void;
  onBack: () => void;
  loading?: boolean;
}

export const LinkSurveyToActivityForm = ({
  onStepSubmit,
  onBack,
  loading,
}: LinkSurveyToActivityFormProps) => {
  const { selectedCompany } = useCompanyStore();
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>("");

  const { data: surveys, isLoading } = useGetSurveysWithoutActivity(
    selectedCompany?.slug,
  );

  const handleSubmit = () => {
    const survey = surveys?.find((s) => s.id.toString() === selectedSurveyId);
    if (!survey) return;
    onStepSubmit(survey);
  };

  return (
    <div className="flex flex-col gap-4 p-6 max-w-2xl mx-auto w-full">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Vincular Encuesta Existente</h1>
        <p className="text-gray-600 mt-2">
          Seleccione una encuesta que aún no esté asociada a una actividad.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : surveys && surveys.length > 0 ? (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              Seleccionar Encuesta
            </label>
            <Select
              value={selectedSurveyId}
              onValueChange={setSelectedSurveyId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una encuesta" />
              </SelectTrigger>
              <SelectContent>
                {surveys.map((survey) => (
                  <SelectItem
                    key={survey.id}
                    value={survey.id.toString()}
                  >
                    {survey.title} ({survey.survey_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center items-center gap-x-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              size="sm"
              disabled={loading}
            >
              ← Atrás
            </Button>
            <Button
              type="button"
              disabled={!selectedSurveyId || loading}
              onClick={handleSubmit}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Crear Actividad y Vincular Encuesta"
              )}
            </Button>
          </div>
        </>
      ) : (
        <p className="text-center text-muted-foreground p-4">
          No hay encuestas disponibles para vincular.
        </p>
      )}
    </div>
  );
};
