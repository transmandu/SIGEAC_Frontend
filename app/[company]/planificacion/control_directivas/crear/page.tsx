"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import CreateDirectiveControlForm from "@/components/forms/mantenimiento/planificacion/CreateDirectiveControlForm";

const CreateDirectiveControlPage = () => {
  return (
    <ContentLayout title="Crear Control de Directivas">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold tracking-tight">
                Crear Control de Directivas
              </h1>
              <p className="text-sm text-muted-foreground">
                Registre las AD evaluadas para una aeronave y sus conjuntos:
                aplicabilidad, método y estado de cumplimiento.
              </p>
            </div>
          </div>
        </div>

        <CreateDirectiveControlForm />
      </div>
    </ContentLayout>
  );
};

export default CreateDirectiveControlPage;
