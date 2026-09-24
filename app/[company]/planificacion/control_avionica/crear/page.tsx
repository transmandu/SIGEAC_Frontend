"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import CreateAvionicsControlForm from "@/components/forms/mantenimiento/planificacion/CreateAvionicsControlForm";

const CreateAvionicsControlPage = () => {
  return (
    <ContentLayout title="Crear Control de Aviónica">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold tracking-tight">
                Crear Control de Aviónica
              </h1>
              <p className="text-sm text-muted-foreground">
                Registre los equipos de aviónica instalados en una aeronave y,
                para los que tienen plazo, sus tareas recurrentes.
              </p>
            </div>
          </div>
        </div>

        <CreateAvionicsControlForm />
      </div>
    </ContentLayout>
  );
};

export default CreateAvionicsControlPage;
