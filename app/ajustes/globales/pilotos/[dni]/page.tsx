"use client";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useGetPilotByDni } from "@/hooks/ajustes/globales/piloto/useGetPilotById";
import {
  Loader2,
  User,
  Phone,
  Mail,
  CreditCard,
  Fingerprint,
  AlertCircle,
} from "lucide-react";
import { useParams } from "next/navigation";

const ShowPilot = () => {
  const { dni } = useParams<{ dni: string }>();

  const { data: pilot, isLoading, isError } = useGetPilotByDni(dni);

  return (
    <ContentLayout title="Detalles del Piloto">
      <div className="flex flex-col justify-center items-center border border-gray-300 rounded-lg p-6 gap-y-4 shadow-md dark:border-gray-700">
        <div className="flex items-center gap-3">
          <User className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
            Información del Piloto
          </h1>
        </div>

        {isLoading && (
          <div className="flex w-full h-64 justify-center items-center">
            <Loader2 className="size-24 animate-spin text-blue-500" />
          </div>
        )}

        {pilot && (
          <div className="w-full max-w-2xl space-y-4">
            {/* Sección de Datos Personales */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Datos Personales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4" /> Nombre:{" "}
                    {pilot.employee.first_name}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4" /> Apellido:{" "}
                    {pilot.employee.last_name}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Fingerprint className="w-4 h-4" /> Número de Cédula:{" "}
                    {pilot.employee_dni}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Número de Licencia:{" "}
                    {pilot.license_number}
                  </p>
                </div>
              </div>
            </div>

            {/* Sección de Datos de Contacto */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-600" />
                Datos de Contacto
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Teléfono:
                  </p>
                  {/* <p>{pilot.phone}</p> */}
                </div>
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Correo Electrónico:
                  </p>
                  {/* <p>{pilot.email}</p> */}
                </div>
              </div>
            </div>
          </div>
        )}

        {isError && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 dark:text-red-300">
              Ha ocurrido un error al cargar los datos del piloto. Por favor,
              intente de nuevo más tarde.
            </p>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default ShowPilot;
