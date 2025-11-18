"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useGetSurveyResponsesByUser } from "@/hooks/sms/survey/useGetResponsesByUser";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useParams } from "next/navigation";

const SurveyResponsePage = () => {
  const { selectedCompany } = useCompanyStore();
  const { survey_number, user, company } = useParams<{
    company: string;
    survey_number: string;
    user: string;
  }>();
  console.log("company", company);

  console.log("survey", survey_number);
  console.log("user original", user);

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
  console.log("THIS IS COMPANY", selectedCompany?.slug);

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
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-2">
            {surveyResponse.survey_title}
          </h1>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 text-sm text-gray-600">
            <div>
              <span className="font-semibold">Tipo:</span>{" "}
              {surveyResponse.survey_type}
            </div>
            <div>
              <span className="font-semibold">Usuario:</span>{" "}
              {surveyResponse.user_identifier}
            </div>
            <div>
              <span className="font-semibold">
                Total de preguntas respondidas:
              </span>{" "}
              {surveyResponse.total_questions_answered}
            </div>
          </div>
        </div>

        {/* Lista de respuestas */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
            Respuestas ({surveyResponse.responses.length})
          </h2>

          {surveyResponse.responses.map((response, index) => (
            <div
              key={response.question_id}
              className="bg-white rounded-lg shadow-md p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex-1">
                  <span className="text-sm text-gray-500 block sm:inline">
                    Pregunta {index + 1}:
                  </span>{" "}
                  {response.question_text}
                </h3>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full whitespace-nowrap self-start sm:self-auto">
                  {getQuestionTypeText(response.question_type)}
                </span>
              </div>

              {/* Respuesta del usuario */}
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-3">Respuesta:</h4>

                {response.question_type === "OPEN" &&
                  response.user_answer.text && (
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border">
                      <p className="text-gray-800 text-sm sm:text-base">
                        {response.user_answer.text}
                      </p>
                    </div>
                  )}

                {(response.question_type === "SINGLE" ||
                  response.question_type === "MULTIPLE") &&
                  response.user_answer.selected_options.length > 0 && (
                    <div className="space-y-2">
                      {response.user_answer.selected_options.map((option) => (
                        <div
                          key={option.option_id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-3 rounded-lg border gap-2 sm:gap-0"
                        >
                          <div className="flex-1">
                            <span className="text-gray-800 text-sm sm:text-base">
                              {option.option_text}
                            </span>
                          </div>
                          {option.is_correct !== null && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full whitespace-nowrap self-start sm:self-auto ${
                                option.is_correct
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {option.is_correct ? "Correcta" : "Incorrecta"}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                {response.user_answer.selected_options.length === 0 &&
                  !response.user_answer.text && (
                    <p className="text-gray-500 italic text-sm sm:text-base">
                      Sin respuesta
                    </p>
                  )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center text-gray-500 text-xs sm:text-sm">
          <p>Encuesta completada por: {surveyResponse.user_identifier}</p>
        </div>
      </div>
    </ContentLayout>
  );
};

export default SurveyResponsePage;
