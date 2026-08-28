"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import CreateMaintenanceControlForm from "@/components/forms/mantenimiento/planificacion/CreateMaintenanceControlForm";

const CreateMaintenanceControlPage = () => {
  return (
    <ContentLayout title="Crear Control de Mantenimiento">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold tracking-tight">Crear Control de Mantenimiento</h1>
              <p className="text-sm text-muted-foreground">
                Registre los certificados, servicios y partes bajo control de una aeronave.
              </p>
            </div>
          </div>
        </div>

        <CreateMaintenanceControlForm />
      </div>
    </ContentLayout>
  );
};

export default CreateMaintenanceControlPage;
