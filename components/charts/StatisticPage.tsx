import { useGetSurveyStats } from "@/hooks/sms/survey/useGetSurveyStatistics";
import { pieChartData } from "@/types";
import DynamicBarChart from "./DynamicBarChart";

// Componente principal
const SurveyStatisticsPage = ({ survey_number }: { survey_number: string }) => {
  const {
    data: dataStats,
    isLoading: isLoadingStats,
    isError: isErrorStats,
  } = useGetSurveyStats(survey_number);

  // Función para transformar los datos de una pregunta a pieChartData[]
  const transformQuestionToChartData = (questionData: {
    question: string;
    answers: Record<string, number>;
  }): pieChartData[] => {
    return Object.entries(questionData.answers).map(([answer, count]) => ({
      name: answer,
      value: count,
    }));
  };

  if (isLoadingStats) {
    return <div>Cargando estadísticas...</div>;
  }

  if (isErrorStats) {
    return <div>Error al cargar las estadísticas</div>;
  }

  if (!dataStats) {
    return <div>No hay datos disponibles</div>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{dataStats.survey}</h1>
        <p>Estadísticas de respuestas</p>
      </div>

      {/* Gráficos para cada pregunta */}
      {dataStats.statistics.map((questionStat, index) => {
        const chartData = transformQuestionToChartData(questionStat);

        return (
          <div key={index} className="p-6 rounded-lg shadow-md">
            <DynamicBarChart
              data={chartData}
              title={questionStat.question}
              height="300px"
              width="100%"
              aspect={2}
              activeDecimal={false}
              fontSize={12}
              isCustomizedAxis={true}
            />

            {/* Información adicional debajo del gráfico */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Total respuestas: </span>
                {chartData.reduce(
                  (total, item) => total + (item.value || 0),
                  0
                )}
              </div>
              <div>
                <span className="font-semibold">Opciones: </span>
                {chartData.length}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SurveyStatisticsPage;
