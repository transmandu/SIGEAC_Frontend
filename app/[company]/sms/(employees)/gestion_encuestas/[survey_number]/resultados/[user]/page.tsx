"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useGetSurveyResponsesByUser } from "@/hooks/sms/survey/useGetResponsesByUser";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SurveyResponsePage = () => {
  const { selectedCompany } = useCompanyStore();
  const { survey_number, user, company } = useParams<{
    company: string;
    survey_number: string;
    user: string;
  }>();

  // Solo decodificar si contiene %40 (es un email codificado)
  const getDecodedUser = (userParam: string) => {
    if (userParam?.includes("%40")) {
      return decodeURIComponent(userParam);
    }
    return userParam;
  };

  const decodedUser = getDecodedUser(user || "");
  console.log("user procesado", decodedUser);

  // Determinar si el user es un email o user_id
  const isEmail = decodedUser?.includes("@");

  const {
    data: surveyResponse,
    isLoading,
    error,
  } = useGetSurveyResponsesByUser({
    company: company,
    survey_number: survey_number || "",
    data: isEmail ? { email: decodedUser } : { user_id: decodedUser },
  });

  // Función para traducir el tipo de pregunta
  const getQuestionTypeText = (type: string) => {
    switch (type) {
      case "SINGLE":
        return "Simple";
      case "MULTIPLE":
        return "Múltiple";
      case "OPEN":
        return "Abierta";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Cargando respuestas de la encuesta...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-lg">
          Error al cargar las respuestas: {(error as Error).message}
        </div>
      </div>
    );
  }

  if (!surveyResponse) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">
          No se encontraron respuestas para esta encuesta
        </div>
      </div>
    );
  }

  return (
    <ContentLayout title="Respuestas a la encuesta">
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
        {/* Header de la encuesta */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">
              {surveyResponse.survey_title}
            </CardTitle>
            <CardDescription className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 text-sm">
              <div>
                <span className="font-semibold">Tipo:</span>{" "}
                {surveyResponse.survey_type === "SURVEY" ? (
                  <span>ENCUESTA</span>
                ) : surveyResponse.survey_type === "QUIZ" ? (
                  <span>TRIVIA</span>
                ) : (
                  <span>OTRO</span>
                )}
              </div>
              <div>
                <span className="font-semibold">Usuario:</span>{" "}
                {surveyResponse.user_identifier}
              </div>
              <div>
                <span className="font-semibold">
                  Total de preguntas respondidas:{" "}
                </span>
                <Badge className=" whitespace-nowrap self-start sm:self-auto">
                  {surveyResponse.total_questions_answered}
                </Badge>
              </div>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Lista de respuestas */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Respuestas ({surveyResponse.responses.length})
          </h2>

          {surveyResponse.responses.map((response, index) => (
            <Card key={response.question_id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
                  <div className="flex-1">
                    <CardTitle className="text-base sm:text-lg">
                      <span className="text-sm text-muted-foreground block sm:inline">
                        Pregunta {index + 1}:
                      </span>{" "}
                      {response.question_text}
                    </CardTitle>
                  </div>
                  <Badge
                    variant="secondary"
                    className="whitespace-nowrap self-start sm:self-auto"
                  >
                    {getQuestionTypeText(response.question_type)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {/* Respuesta del usuario */}
                <div className="mt-2">
                  <h4 className="font-medium text-foreground mb-3">
                    Respuesta:
                  </h4>

                  {response.question_type === "OPEN" &&
                    response.user_answer.text && (
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <p className="text-sm sm:text-base">
                            {response.user_answer.text}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                  {(response.question_type === "SINGLE" ||
                    response.question_type === "MULTIPLE") &&
                    response.user_answer.selected_options.length > 0 && (
                      <div className="space-y-2">
                        {response.user_answer.selected_options.map((option) => (
                          <Card key={option.option_id} className="bg-muted/50">
                            <CardContent className="p-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                                <div className="flex-1">
                                  <span className="text-sm sm:text-base">
                                    {option.option_text}
                                  </span>
                                </div>
                                {option.is_correct !== null && (
                                  <Badge
                                    className={`whitespace-nowrap self-start sm:self-auto ${
                                      option.is_correct
                                        ? "bg-green-500 hover:bg-green-600 text-white"
                                        : "bg-red-500 hover:bg-red-600 text-white"
                                    }`}
                                  >
                                    {option.is_correct
                                      ? "Correcta"
                                      : "Incorrecta"}
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                  {response.user_answer.selected_options.length === 0 &&
                    !response.user_answer.text && (
                      <p className="text-muted-foreground italic text-sm sm:text-base">
                        Sin respuesta
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <Card className="mt-6 sm:mt-8">
          <CardContent className="p-4 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Encuesta completada por: {surveyResponse.user_identifier}
            </p>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
};

export default SurveyResponsePage;
