"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import CreateComponentControlForm from "@/components/forms/mantenimiento/planificacion/CreateComponentControlForm";

const CreateComponentControlPage = () => {
  return (
    <ContentLayout title="Crear Control de Componentes">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold tracking-tight">Crear Control de Componentes</h1>
              <p className="text-sm text-muted-foreground">
                Registre los componentes con vida limitada u overhaul de una aeronave, colgados del fuselaje o de cada motor/hélice.
              </p>
            </div>
          </div>
        </div>

        <CreateComponentControlForm />
      </div>
    </ContentLayout>
  );
};

export default CreateComponentControlPage;
