"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import CreateMaintenanceControlForm from "@/components/forms/mantenimiento/planificacion/CreateMaintenanceControlForm";

const CreateMaintenanceControlPage = () => {
  return (
    <ContentLayout title="Crear Control de Mantenimiento">
      <PageHeader className="mb-6" />

      <div className="space-y-2">
        <div className="space-y-1 mb-4">
          <h1 className="text-2xl font-bold text-center">Crear Control de Mantenimiento</h1>
          <p className="text-sm text-muted-foreground text-center">
            Registre los certificados, servicios y partes bajo control de una aeronave.
          </p>
        </div>

        <CreateMaintenanceControlForm />
      </div>
    </ContentLayout>
  );
};

export default CreateMaintenanceControlPage;
