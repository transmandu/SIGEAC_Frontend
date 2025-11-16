"use client";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useGetSurveyByNumber } from "@/hooks/sms/survey/useGetSurveyByNumber";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  Calendar,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  BarChart3,
  ListChecks,
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
        color: "bg-blue-100 text-blue-800 border-blue-200",
      },
      MULTIPLE: {
        label: "Múltiple",
        color: "bg-green-100 text-green-800 border-green-200",
      },
      OPEN: {
        label: "Abierta",
        color: "bg-purple-100 text-purple-800 border-purple-200",
      },
    };
    return types[type as keyof typeof types] || types.SINGLE;
  };

  const getSurveyTypeBadge = (type: string) => {
    return type === "QUIZ"
      ? {
          label: "Quiz",
          color: "bg-orange-100 text-orange-800 border-orange-200",
        }
      : {
          label: "Encuesta",
          color: "bg-indigo-100 text-indigo-800 border-indigo-200",
        };
  };

  if (isLoading) {
    return (
      <ContentLayout title="Cargando encuesta...">
        <div className="flex justify-center items-center min-h-64">
          <Loader2 className="size-8 animate-spin text-blue-500" />
        </div>
      </ContentLayout>
    );
  }

  if (isError || !surveyData) {
    return (
      <ContentLayout title="Encuesta">
        <div className="border border-red-200 rounded-lg p-6 flex items-center gap-4 bg-red-50">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <p className="text-red-700">Error al cargar la encuesta</p>
        </div>
      </ContentLayout>
    );
  }

  const stats = {
    totalQuestions: surveyData.questions.length,
    requiredQuestions: surveyData.questions.filter((q) => q.is_required).length,
    questionsWithOptions: surveyData.questions.filter((q) => q.type !== "OPEN")
      .length,
    openQuestions: surveyData.questions.filter((q) => q.type === "OPEN").length,
  };

  return (
    <ContentLayout title={surveyData.title}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header compacto */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-7 h-7 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-900 line-clamp-2">
                      {surveyData.title}
                    </h1>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      className={getSurveyTypeBadge(surveyData.type).color}
                    >
                      {getSurveyTypeBadge(surveyData.type).label}
                    </Badge>
                    <Badge
                      variant={surveyData.is_active ? "default" : "secondary"}
                    >
                      {surveyData.is_active ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                </div>

                {surveyData.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {surveyData.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>#{surveyData.survey_number}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ListChecks className="w-4 h-4" />
                    <span>{stats.totalQuestions} preguntas</span>
                  </div>
                  {stats.requiredQuestions > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-red-500">•</span>
                      <span>{stats.requiredQuestions} obligatorias</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid principal con estadísticas y preguntas */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar con estadísticas */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Estadísticas</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total preguntas</span>
                  <Badge variant="secondary">{stats.totalQuestions}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Obligatorias</span>
                  <Badge variant="secondary">{stats.requiredQuestions}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Con opciones</span>
                  <Badge variant="secondary">
                    {stats.questionsWithOptions}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Abiertas</span>
                  <Badge variant="secondary">{stats.openQuestions}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Información general */}
            <Card>
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-gray-900">Información</h3>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo</span>
                  <span className="font-medium">
                    {surveyData.type === "QUIZ" ? "Quiz" : "Encuesta"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado</span>
                  <span
                    className={`font-medium ${surveyData.is_active ? "text-green-600" : "text-gray-500"}`}
                  >
                    {surveyData.is_active ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Número</span>
                  <span className="font-medium">
                    {surveyData.survey_number}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de preguntas - Ocupa más espacio */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Preguntas de la encuesta
                  </h2>
                  <Badge variant="outline">{stats.totalQuestions}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {surveyData.questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full text-sm flex items-center justify-center font-medium mt-1">
                          {index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                            <h3 className="font-medium text-gray-900 text-base leading-relaxed">
                              {question.text}
                            </h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge
                                className={
                                  getQuestionTypeBadge(question.type).color
                                }
                              >
                                {getQuestionTypeBadge(question.type).label}
                              </Badge>
                              {question.is_required && (
                                <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded">
                                  Requerida
                                </span>
                              )}
                            </div>
                          </div>

                          {question.type === "OPEN" ? (
                            <div className="bg-gray-50 rounded-lg px-4 py-3">
                              <span className="text-gray-500 text-sm italic">
                                Respuesta de texto abierta
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {question.options.map((option) => (
                                <div
                                  key={option.id}
                                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                                    surveyData.type === "QUIZ" &&
                                    option.is_correct
                                      ? "bg-green-50 border-green-200 ring-1 ring-green-100"
                                      : "bg-gray-50 border-gray-200"
                                  }`}
                                >
                                  <div
                                    className={`w-4 h-4 rounded border flex-shrink-0 ${
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
                                    className={`flex-1 text-sm ${
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
                                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};

export default ShowSurvey;
