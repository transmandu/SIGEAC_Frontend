"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { CreateChangeRequestForm } from "@/components/forms/change-request/CreateChangeRequestForm";

const CrearSolicitudCambioPage = () => {
  return (
    <ContentLayout title="Nueva Solicitud de Cambio">
      <CreateChangeRequestForm />
    </ContentLayout>
  );
};

export default CrearSolicitudCambioPage;
