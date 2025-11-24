import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { dateFormat } from "@/lib/utils"; // Asegúrate de tener esta utilidad

export type IncidentAlertType = "increase" | "decrease" | "stable";

export interface IncidentAlertData {
  newest_range: {
    from: string | Date;
    to: string | Date;
    percentage_change: number;
  };
  oldest_range: {
    from: string | Date;
    to: string | Date;
  };
}

interface IncidentAlertCardProps {
  type: IncidentAlertType;
  data: IncidentAlertData;
  className?: string;
}

export const IncidentAlertCard: React.FC<IncidentAlertCardProps> = ({
  type,
  data,
  className = "",
}) => {
  const config = {
    increase: {
      title: "¡Aumento de los Incidentes!",
      icon: TrendingUp,
      borderColor: "border-red-400",
      bgColor: "",
      textColor: "text-red-700",
      iconColor: "text-red-600",
      message:
        data.newest_range.percentage_change !== 0
          ? `¡Aumento de un ${(data.newest_range.percentage_change || 100).toFixed(2)}% de incidentes!`
          : "",
    },
    decrease: {
      title: "¡Reducción de los Incidentes!",
      icon: TrendingDown,
      borderColor: "border-green-400",
      bgColor: "",
      textColor: "text-green-700",
      iconColor: "text-green-600",
      message: `¡Reducción de un ${Math.abs(data.newest_range.percentage_change || 0).toFixed(2)}% de incidentes!`,
    },
    stable: {
      title: "¡Sin Fluctuación!",
      icon: Minus,
      borderColor: "border-blue-400",
      bgColor: "",
      textColor: "text-blue-700",
      iconColor: "text-blue-600",
      message: "¡Se ha mantenido el número de incidentes promedio!",
    },
  };

  const {
    title,
    icon: Icon,
    borderColor,
    bgColor,
    textColor,
    iconColor,
    message,
  } = config[type];

  return (
    <Card className={`border-2 ${borderColor} ${bgColor} ${className}`}>
      <CardContent className="p-6">
        {/* Header con icono y título */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <div className={`p-1 rounded-full bg-white border ${borderColor}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <h3 className={`font-bold text-lg text-center ${textColor}`}>
            {title}
          </h3>
        </div>

        {/* Contenido principal */}
        <div className="space-y-4">
          {/* Mensaje principal */}
          <div className="text-center">
            <p
              className={`font-bold text-base ${type === "increase" ? "text-red-800" : type === "decrease" ? "text-green-800" : "text-blue-800"}`}
            >
              {message}
            </p>
          </div>

          {/* Detalles de fechas */}
          <div className="space-y-3">
            {type === "increase" && (
              <p className="text-sm text-gray-700 text-center">
                El número de incidentes fue mayor durante las fechas:
              </p>
            )}
            {type === "decrease" && (
              <p className="text-sm text-gray-700 text-center">
                El número de incidentes fue menor durante las fechas:
              </p>
            )}
            {type === "stable" && (
              <p className="text-sm text-gray-700 text-center">
                El número de incidentes no tuvo variaciones significativas
                durante las fechas:
              </p>
            )}

            {/* Rango mas antiguo */}
            <div className="text-center">
              <p className="font-semibold text-sm text-gray-900">
                {dateFormat(data.oldest_range.from, "PPP")} al{" "}
                {dateFormat(data.oldest_range.to, "PPP")}
              </p>
            </div>

            {/* Texto comparativo */}
            <p className="text-sm text-gray-700 text-center">
              {type === "stable"
                ? "en comparación a las fechas del:"
                : "en comparación a las fechas desde:"}
            </p>

            {/* Rango Siguiente */}
            <div className="text-center">
              <p className="font-semibold text-sm text-gray-900">
                {dateFormat(data.newest_range.from, "PPP")} al{" "}
                {dateFormat(data.newest_range.to, "PPP")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente adicional para mostrar múltiples alertas en grid
interface IncidentAlertGridProps {
  alerts: Array<{
    type: IncidentAlertType;
    data: IncidentAlertData;
    className?: string;
  }>;
}

export const IncidentAlertGrid: React.FC<IncidentAlertGridProps> = ({
  alerts,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {alerts.map((alert, index) => (
        <IncidentAlertCard
          key={index}
          type={alert.type}
          data={alert.data}
          className={alert.className}
        />
      ))}
    </div>
  );
};
