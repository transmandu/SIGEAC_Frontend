import { useGetSurveyStats } from "@/hooks/sms/survey/useGetSurveyStatistics";
import { pieChartData } from "@/types";
import DynamicBarChart from "./DynamicBarChart";
import MultipleBarChartComponent from "./MultipleBarChartComponent";
import { PieChartComponent } from "./PieChartComponent";

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
      <div className="grid grid-cols-1 gap-2 line-clamp-2 overflow-x-auto text-center">
        {dataStats.statistics.map((questionStat, index) => {
        const chartData = transformQuestionToChartData(questionStat);
        return (
          <div key={index} className="p-6 rounded-lg">
             <div className="min-w-[600px]"> {/* ¡Añade este contenedor! */}
            <MultipleBarChartComponent
              data={chartData}
              title={questionStat.question.toLocaleUpperCase()}
              />
              <PieChartComponent
                data={chartData}
                title={questionStat.question.toLocaleUpperCase()}
              />
             </div>
            {/* Información adicional debajo del gráfico */}
            <div className="mt-4 flex justify-center gap-8 text-sm text-gray-600">
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
    </div>
  );
};

export default SurveyStatisticsPage;
