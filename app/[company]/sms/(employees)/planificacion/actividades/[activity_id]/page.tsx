"use client";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Badge } from "@/components/ui/badge";
import { useGetSMSActivityById } from "@/hooks/sms/useGetSMSActivityById";
import { useCompanyStore } from "@/stores/CompanyStore";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  FileText,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useGetSMSActivityEnrolledEmployees } from "@/hooks/sms/useGetSMSActivityEnrolledEmployees";

const ShowSMSActivity = () => {
  const { selectedCompany } = useCompanyStore();
  const { activity_id } = useParams<{ activity_id: string }>();

  const {
    data: activity,
    isLoading: isActivityLoading,
    isError: activityError,
  } = useGetSMSActivityById({
    company: selectedCompany?.slug,
    id: activity_id,
  });

  const {
    data: employees,
    isLoading: isEmployeesLoading,
    isError: employeeError,
  } = useGetSMSActivityEnrolledEmployees({
    company: selectedCompany?.slug,
    activity_id: activity_id.toString(),
  });

  return (
    <ContentLayout title="Actividad de SMS">
      {/* Contenido principal */}
      <div className="w-full border border-gray-300 rounded-lg p-6 shadow-md dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Detalles de la Actividad SMS
          </h1>
        </div>

        {isActivityLoading && (
          <div className="flex w-full h-64 justify-center items-center">
            <Loader2 className="size-24 animate-spin text-blue-500" />
          </div>
        )}

        {activity && (
          <>
            {/* Sección de información de la actividad */}
            <div className="space-y-6">
              {/* Sección superior con información básica */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tarjeta de información básica */}
                <div className="border border-gray-300 dark:bg-gray-800 p-5 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      {activity.activity_number
                        ? `Actividad ${activity.activity_number}`
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <p className="text-gray-700 dark:text-gray-300">
                      {format(activity.start_date, "PPP", { locale: es })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <p className="text-gray-700 dark:text-gray-300">
                      {activity.place || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Tarjeta de estado */}
                <div className="border border-gray-300 dark:bg-gray-800 p-5 rounded-lg flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Estado:
                      </span>
                    </div>
                    <Badge
                      className={`font-bold ${
                        activity.status === "ABIERTO"
                          ? "bg-green-400"
                          : activity.status === "PROCESO"
                            ? "bg-yellow-400"
                            : activity.status === "CERRADO"
                              ? "bg-red-400"
                              : "bg-gray-500"
                      }`}
                    >
                      {activity.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-auto">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Autorizado por:
                      </p>
                      <p className="font-medium">
                        {activity.authorized_by || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Planificado por:
                      </p>
                      <p className="font-medium">
                        {activity.planned_by || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ejecutado por:
                      </p>
                      <p className="font-medium">
                        {activity.executed_by || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección de detalles */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna 1 */}
                <div className="space-y-6">
                  <div className="border border-gray-300 dark:bg-gray-800 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Horario
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Hora de Inicio:
                        </p>
                        <p>{activity.start_time}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Hora Final:
                        </p>
                        <p>{activity.end_time || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Fecha fin:
                        </p>
                        <p>
                          {format(activity.end_date, "PPP", { locale: es })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-300 dark:bg-gray-800 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Temas
                    </h3>
                    <p className="whitespace-pre-line">
                      {activity.topics || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Columna 2 */}
                <div className="space-y-6">
                  <div className="border border-gray-300 dark:bg-gray-800 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Objetivo
                    </h3>
                    <p className="whitespace-pre-line">
                      {activity.objetive || "N/A"}
                    </p>
                  </div>

                  <div className="border border-gray-300 dark:bg-gray-800 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Descripción
                    </h3>
                    <p className="whitespace-pre-line">
                      {activity.description || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de empleados al final */}
            <div className="mt-8">
              <div className="border border-gray-300 dark:bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-600" />
                    Empleados Inscritos
                  </h2>
                  <Badge>{employees?.length || 0} participantes</Badge>
                </div>

                {isEmployeesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="size-8 animate-spin text-blue-500" />
                  </div>
                ) : employeeError ? (
                  <div className="border dark:bg-red-900/20 border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-700 dark:text-gray-300">
                      Error al cargar la lista de empleados
                    </p>
                  </div>
                ) : employees && employees.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Nombre Completo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            DNI
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {employees.map((employee) => (
                          <tr key={employee.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {employee.first_name} {employee.last_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {employee.dni}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No hay empleados inscritos en esta actividad
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activityError && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 dark:text-gray-300">
              Error al cargar la actividad
            </p>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default ShowSMSActivity;
