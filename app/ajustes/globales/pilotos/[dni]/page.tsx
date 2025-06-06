"use client";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useGetPilotByDni } from "@/hooks/ajustes/globales/piloto/useGetPilotById";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

const ShowPilot = () => {
  const { dni } = useParams<{ dni: string }>();

  const { data: pilot, isLoading, isError } = useGetPilotByDni(dni);

  return (
    <ContentLayout title="Reportes Voluntarios">
      <div className="flex flex-col justify-center items-center border border-gray-300 rounded-lg p-6 gap-y-4 shadow-md">
        <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-white">
          Detalles del Piloto
        </h1>
        {isLoading && (
          <div className="flex w-full h-64 justify-center items-center">
            <Loader2 className="size-24 animate-spin text-blue-500" />
          </div>
        )}
        {pilot && (
          <div className="w-full max-w-2xl space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-lg text-gray-700 text-center font-semibold">
                Datos Personales
              </p>
              <p className="text-lg text-gray-700">
                <span className="font-semibold">Nombre:</span>{" "}
                {pilot.first_name}
              </p>
              <p className="text-lg text-gray-700">
                <span className="font-semibold">Apellido:</span>{" "}
                {pilot.last_name}
              </p>
              <p className="text-lg text-gray-700">
                <span className="font-semibold">Numero de Cedula:</span>{" "}
                {pilot.dni}
              </p>
              <p className="text-lg text-gray-700">
                <span className="font-semibold">Numero de Licencia:</span>{" "}
                {pilot.license_number}
              </p>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-lg text-gray-700 text-center font-semibold">
                Datos de Contacto
              </p>
              <p className="text-lg text-gray-700">
                <span className="font-semibold">Telefono:</span> {pilot.phone}
              </p>
              <p className="text-lg text-gray-700">
                <span className="font-semibold">Correo Eletronico:</span>{" "}
                {pilot.email}
              </p>
            </div>
          </div>
        )}
        {isError && (
          <p className="text-sm text-red-500 mt-4">
            Ha ocurrido un error al cargar los datos del piloto...
          </p>
        )}
      </div>
    </ContentLayout>
  );
};

export default ShowPilot;
