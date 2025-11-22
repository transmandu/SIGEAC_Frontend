"use client";
import SurveyStatisticsPage from "@/components/charts/StatisticQuestionPage";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useGetSurveyByNumber } from "@/hooks/sms/survey/useGetSurveyByNumber";
import { useGetSurveyStats } from "@/hooks/sms/survey/useGetSurveyStatistics";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  Target,
  Square,
  Type,
  CopyCheck,
} from "lucide-react";
import { useParams } from "next/navigation";

const ShowSurvey = () => {
  const { survey_number } = useParams<{ survey_number: string }>();
  const { selectedCompany } = useCompanyStore();
  const {
    data: surveyData,
    isLoading,
    isError,
  } = useGetSurveyByNumber({
    survey_number: survey_number,
    company: selectedCompany?.slug,
  });

  const getQuestionTypeBadge = (type: string) => {
    const types = {
      SINGLE: {
        label: "Única",
        icon: Target,
      },
      MULTIPLE: {
        label: "Múltiple",
        icon: CopyCheck,
      },
      OPEN: {
        label: "Abierta",
        icon: Type,
      },
    };
    return types[type as keyof typeof types] || types.SINGLE;
  };

  if (isLoading) {
    return (
      <ContentLayout title="Cargando encuesta...">
        <div className="flex justify-center items-center min-h-64">
          <Loader2 className="size-8 animate-spin text-gray-500" />
        </div>
      </ContentLayout>
    );
  }

  if (isError || !surveyData) {
    return (
      <ContentLayout title="Encuesta">
        <div className="border border-gray-200 rounded-lg p-6 flex items-center gap-4 bg-gray-50">
          <AlertCircle className="w-6 h-6 text-gray-500" />
          <p className="text-gray-700">Error al cargar la encuesta</p>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title={surveyData.title}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header minimalista */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 " />
            <h1 className="text-xl font-semibold ">
              {surveyData.title}
            </h1>
          </div>

          {surveyData.description && (
            <p className="text-sm">{surveyData.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-sm ">
            <span>#{surveyData.survey_number}</span>
            <span>•</span>
            <span>{surveyData.questions.length} preguntas</span>
            <span>•</span>
            <Badge variant="outline" className="text-xs">
              {surveyData.type === "QUIZ" ? "Quiz" : "Encuesta"}
            </Badge>
            <span>•</span>
            <span
              className={
                surveyData.is_active ? "text-green-600" : "text-gray-500"
              }
            >
              {surveyData.is_active ? "Activa" : "Inactiva"}
            </span>
          </div>
        </div>

        {/* Lista de preguntas */}
        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-lg font-medium">Preguntas</h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {surveyData.questions.map((question, index) => {
                const typeBadge = getQuestionTypeBadge(question.type);
                const TypeIcon = typeBadge.icon;

                return (
                  <div
                    key={question.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6rounded text-xs flex items-center justify-center font-medium mt-0.5">
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                          <h3 className="font-medium text-sm leading-relaxed">
                            {question.text}
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant="outline" className="text-xs">
                              <TypeIcon className="w-3 h-3 mr-1" />
                              {typeBadge.label}
                            </Badge>
                            {question.is_required && (
                              <span className="text-xs text-red-500 font-medium">
                                Requerida
                              </span>
                            )}
                          </div>
                        </div>

                        {question.type === "OPEN" ? (
                          <div className="bg-gray-50 rounded px-3 py-2">
                            <span className="text-gray-500 text-xs italic">
                              Respuesta de texto abierta
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {question.options.map((option) => (
                              <div
                                key={option.id}
                                className={`flex items-center gap-2 p-2 rounded border text-xs ${
                                  surveyData.type === "QUIZ" &&
                                  option.is_correct
                                    ? "bg-green-50 border-green-200"
                                    : "bg-white border-gray-200"
                                }`}
                              >
                                <div
                                  className={`w-3 h-3 rounded border flex-shrink-0 ${
                                    question.type === "SINGLE"
                                      ? "rounded-full"
                                      : "rounded"
                                  } ${
                                    surveyData.type === "QUIZ" &&
                                    option.is_correct
                                      ? "bg-green-500 border-green-500"
                                      : "bg-white border-gray-400"
                                  }`}
                                />
                                <span
                                  className={`flex-1 ${
                                    surveyData.type === "QUIZ" &&
                                    option.is_correct
                                      ? "text-green-800 font-medium"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {option.text}
                                </span>
                                {surveyData.type === "QUIZ" &&
                                  option.is_correct && (
                                    <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                  )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Estadísticas */}
            <div className="p-4 border-t">
              <SurveyStatisticsPage survey_number={survey_number} />
            </div>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
};

export default ShowSurvey;
