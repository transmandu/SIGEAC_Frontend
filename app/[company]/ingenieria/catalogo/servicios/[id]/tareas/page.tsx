"use client";

import { useParams } from "next/navigation";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { Badge } from "@/components/ui/badge";
import { ServiceTaskList } from "@/components/forms/mantenimiento/catalogo/ServiceTaskList";
import { useGetCatalogService } from "@/hooks/mantenimiento/catalogo/useGetCatalogService";
import { useCompanyStore } from "@/stores/CompanyStore";
import { CATEGORY_LABELS } from "@/lib/maintenanceCatalogLabels";

/**
 * Las tareas del servicio en pantalla propia. Es la misma lista del detalle
 * (ServiceTaskList): esta ruta sobrevive porque el picker de Órdenes de
 * Trabajo y los enlaces guardados apuntan aquí.
 */
const ServiceTasksPage = () => {
  const { id } = useParams<{ id: string }>();
  const { selectedCompany } = useCompanyStore();
  const { data: service, isLoading } = useGetCatalogService(selectedCompany?.slug, id);

  if (isLoading || !service) return <LoadingPage />;

  return (
    <ContentLayout title={`Tareas — ${service.name}`}>
      <div className="flex flex-col gap-6">
        {/* El id intermedio se omite del rastro y la migaja final queda como
            "Tareas", que no dice de qué servicio: se renombra al servicio. */}
        <PageHeader
          currentLabel={`Tareas de ${service.name}`}
          backFallbackHref={`/${selectedCompany?.slug}/ingenieria/catalogo/servicios/${service.id}`}
        />

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-center gap-2">
            <Badge variant={service.category === "CERTIFICATE" ? "secondary" : "default"}>
              {CATEGORY_LABELS[service.category]}
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Tareas de {service.name}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Las tareas que se ejecutan cuando este servicio genera una orden de trabajo.
          </p>
        </div>

        <ServiceTaskList service={service} />
      </div>
    </ContentLayout>
  );
};

export default ServiceTasksPage;
