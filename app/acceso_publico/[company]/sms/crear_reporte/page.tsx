"use client";

import { GuestContentLayout } from "@/components/layout/GuestContentLayout";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, AlertTriangle, HelpCircle, ArrowRight } from "lucide-react";

const SelectReportType = () => {
  const router = useRouter();
  const params = useParams();
  const company = params.company as string;

  const reportTypes = [
    {
      type: "voluntario",
      title: "Reporte Voluntario",
      description:
        "Comparte observaciones, sugerencias o buenas prácticas de manera voluntaria para mejorar la seguridad en el trabajo",
      icon: FileText,
      features: [
        "Completamente voluntario",
        "Prevención de incidentes o accidentes",
        "Feedback constructivo",
      ],
      buttonText: "Crear Reporte Voluntario",
      color: "border-green-500 hover:border-green-600",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      dotColor: "bg-green-500",
    },
    {
      type: "obligatorio",
      title: "Reporte Obligatorio",
      description:
        "Reporta incidentes, accidentes o situaciones de riesgo que requieren atención inmediata según normativa",
      icon: AlertTriangle,
      features: [
        "Requerido por normativa",
        "Incidentes y accidentes",
        "Seguimiento obligatorio",
      ],
      buttonText: "Crear Reporte Obligatorio",
      color: "border-red-500 hover:border-red-600",
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      dotColor: "bg-red-500",
    },
  ];

  return (
    <GuestContentLayout title="Tipo de reporte">
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-8">
        {/* Header con información */}
        <div className="text-center space-y-3 lg:space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Crear Nuevo Reporte
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Selecciona el tipo de reporte que mejor se adapte a la situación que
            deseas reportar. Tu contribución ayuda a mantener un ambiente de
            trabajo más seguro.
          </p>
        </div>

        {/* Cards de selección */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {reportTypes.map((report) => {
            const IconComponent = report.icon;
            return (
              <Card
                key={report.type}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg border ${report.color} h-full flex flex-col`}
              >
                <CardHeader className="text-center pb-3 lg:pb-4">
                  <div className="flex justify-center mb-3 lg:mb-4">
                    <div
                      className={`p-2 sm:p-3 rounded-full ${report.bgColor} ${report.textColor}`}
                    >
                      <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                  </div>
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl">
                    {report.title}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base mt-1 lg:mt-2 leading-relaxed">
                    {report.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 lg:space-y-4 flex-1 flex flex-col">
                  {/* Lista de características */}
                  <ul className="space-y-1 lg:space-y-2 flex-1">
                    {report.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start text-xs sm:text-sm text-gray-600 leading-tight"
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full mr-2 mt-1.5 flex-shrink-0 ${report.dotColor}`}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Botón de acción */}
                  <Button
                    variant={
                      report.type === "voluntario" ? "default" : "destructive"
                    }
                    className="w-full mt-3 lg:mt-4 group text-xs sm:text-sm"
                    onClick={() =>
                      router.push(
                        `/acceso_publico/${company}/sms/crear_reporte/${report.type}`
                      )
                    }
                  >
                    <span className="truncate">{report.buttonText}</span>
                    <ArrowRight className="ml-1 lg:ml-2 h-3 w-3 lg:h-4 lg:w-4 transition-transform group-hover:translate-x-1 flex-shrink-0" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Información adicional */}
        <Card className="border-black">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">
                  ¿No estás seguro qué tipo de reporte usar?
                </h3>
                <div className="flex items-center">
                  <Button
                    variant="link"
                    className="p-0 h-auto text-xs sm:text-sm hover:no-underline"
                    onClick={() =>
                      router.push(`/acceso_publico/${company}/sms`)
                    }
                  >
                    Ver más información
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </GuestContentLayout>
  );
};

export default SelectReportType;
