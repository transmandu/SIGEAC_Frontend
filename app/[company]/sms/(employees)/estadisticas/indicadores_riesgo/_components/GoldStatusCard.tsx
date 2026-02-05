import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  ArrowRight,
  Target,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface GoalStatusCardProps {
  achieved: boolean;
  result?: number;
  params: {
    from?: string;
    to?: string;
  };
  className?: string;
}

export const GoalStatusCard: React.FC<GoalStatusCardProps> = ({
  achieved,
  result = 0,
  params,
  className = "",
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const config = {
    achieved: {
      borderColor: "border-green-300",
      bgGradient: "",
      title: "¡Meta Alcanzada!",
      statusColor: "bg-green-100 border-green-200",
      textColor: "",
      progressColor: "bg-green-200",
      progressFill: "bg-green-500",
      icon: CheckCircle2,
      message: `Se ha alcanzado la meta del 90% de reportes gestionados.`,
      showResult: true,
    },
    notAchieved: {
      borderColor: "border-red-500",
      bgGradient: "",
      title: "Meta No Alcanzada",
      statusColor: "text-red-700 border-red-500",
      textColor: "",
      progressColor: "bg-red-200",
      progressFill: "bg-red-500",
      icon: XCircle,
      message:
        "Aún no se ha alcanzado la gestión del 90% de reportes identificados.",
      showResult: false,
    },
  };

  const currentConfig = achieved ? config.achieved : config.notAchieved;
  const IconComponent = currentConfig.icon;
  const displayPercentage = achieved ? result : Math.min(result, 89);

  return (
    <Card
      className={`border-2 ${currentConfig.borderColor} ${currentConfig.bgGradient} shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white rounded-full border border-gray-200">
            <IconComponent className={`h-5 w-5 text-black ${currentConfig.textColor}`} />
          </div>
          <div>
            <h3
              className={`font-bold text-lg flex items-center gap-2 ${currentConfig.textColor}`}
            >
              {currentConfig.title}
            </h3>
          </div>
        </div>

        {/* Contenido */}
        <div className="space-y-4">
          {/* Mensaje principal */}
          <p
            className={`leading-relaxed ${currentConfig.textColor.replace("900", "800")}`}
          >
            {currentConfig.message}
          </p>

          {/* Resultado (solo para meta alcanzada) */}
          {currentConfig.showResult && (
            <div className="bg-white border border-green-200 rounded-xl p-4 shadow-sm">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-black" />
                  <span className="font-medium text-sm text-black">
                    RESULTADO ALCANZADO
                  </span>
                </div>
                <div className="text-2xl font-bold text-black">
                  {Number(result).toFixed(2)}% de reportes gestionados
                </div>
              </div>
            </div>
          )}

          {/* Período de fechas */}
          <div className="bg-white border border-purple-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-black" />
              <span className="font-medium text-sm text-black">PERÍODO EVALUADO</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 ">
              <span className="font-semibold px-3 py-1 rounded-lg border border-purple-100 text-black">
                {formatDate(params.from || "")}
              </span>
              <ArrowRight className="h-4 w-4  hidden sm:block text-black" />
              <span className="text-xs  sm:hidden">hasta</span>
              <span className="font-semibold px-3 py-1 rounded-lg border border-purple-100 text-black">
                {formatDate(params.to || "")}
              </span>
            </div>
          </div>

          {/* Indicador de progreso */}
          <div className="pt-2">
            <div
              className="flex justify-between text-xs mb-1"
              style={{ color: currentConfig.textColor.replace("900", "700") }}
            >
              <span>Progreso hacia la meta</span>
              <span>90% requerido</span>
            </div>
            <div
              className={`w-full rounded-full h-2 ${currentConfig.progressColor}`}
            >
              <div
                className={`h-2 rounded-full transition-all duration-500 ease-out ${currentConfig.progressFill}`}
                style={{ width: `${displayPercentage}%` }}
              ></div>
            </div>
            <div
              className="flex justify-between text-xs mt-1"
              style={{ color: currentConfig.textColor.replace("900", "600") }}
            >
              <span>0%</span>
              <span className="font-bold">
                {displayPercentage.toFixed(2)}% {achieved ? "alcanzado" : "completado"}
              </span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
