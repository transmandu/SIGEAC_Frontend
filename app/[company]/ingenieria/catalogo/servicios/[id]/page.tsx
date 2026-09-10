"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Plane, Trash2, Wrench } from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { FormSection } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { ServiceDialog } from "@/components/dialogs/mantenimiento/catalogo/ServiceDialog";
import { ServiceTaskList } from "@/components/forms/mantenimiento/catalogo/ServiceTaskList";
import { useGetCatalogService } from "@/hooks/mantenimiento/catalogo/useGetCatalogService";
import { useDeleteCatalogService } from "@/actions/mantenimiento/catalogo/servicios/actions";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  CATEGORY_LABELS,
  COUNTING_METHOD_LABELS,
  STATUS_LABELS,
} from "@/lib/maintenanceCatalogLabels";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
    <div className="text-sm">{children}</div>
  </div>
);

const Empty = () => <span className="text-muted-foreground">—</span>;

const ServiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { selectedCompany } = useCompanyStore();
  const { data: service, isLoading } = useGetCatalogService(selectedCompany?.slug, id);
  const { deleteCatalogService } = useDeleteCatalogService();
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  // Eliminar es sanear un dato que nunca debió existir: un servicio que solo
  // dejó de aplicar se retira con SUPERSEDED, y eso sí lo hace Ingeniería.
  const isSuperUser = user?.roles?.some((role) => role.name === "SUPERUSER");

  if (isLoading || !service) return <LoadingPage />;

  return (
    <ContentLayout title={service.name}>
      <div className="flex flex-col gap-6">
        <PageHeader currentLabel={service.name} />

        <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={service.category === "CERTIFICATE" ? "secondary" : "default"}>
                {CATEGORY_LABELS[service.category]}
              </Badge>
              <Badge variant={service.status === "ACTIVE" ? "default" : "secondary"}>
                {STATUS_LABELS[service.status]}
              </Badge>
              <h1 className="text-3xl font-semibold tracking-tight">{service.name}</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {service.manual ? `Declarado en ${service.manual.name}` : "Sin manual de referencia declarado."}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ActionTriggerButton type="button" onClick={() => setOpenEdit(true)}>
              <Pencil className="mr-2 size-4" />
              Editar
            </ActionTriggerButton>
            {isSuperUser && (
              <ActionTriggerButton type="button" onClick={() => setOpenDelete(true)}>
                <Trash2 className="mr-2 size-4" />
                Eliminar
              </ActionTriggerButton>
            )}
          </div>
        </div>

        <FormSection icon={Wrench} title="Datos del Servicio/Certificado">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Categoría">{CATEGORY_LABELS[service.category]}</Field>
            <Field label="Estado">{STATUS_LABELS[service.status]}</Field>
            <Field label="Código">{service.code || <Empty />}</Field>
            <Field label="Manual de referencia">
              {service.manual ? (
                `${service.manual.name}${service.manual.revision ? ` (${service.manual.revision})` : ""}`
              ) : (
                <Empty />
              )}
            </Field>
            <Field label="Intervalo">
              {service.intervals.length > 0 ? (
                service.intervals
                  .map((i) => `${i.interval_value} ${COUNTING_METHOD_LABELS[i.counting_method]}`)
                  .join(" Ó ")
              ) : (
                <Empty />
              )}
            </Field>
            <Field label="Tareas registradas">{service.tasks?.length ?? 0}</Field>
            <Field label="Registrado por">{service.registered_by || <Empty />}</Field>
            <Field label="Actualizado por">{service.updated_by || <Empty />}</Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Descripción">{service.description || <Empty />}</Field>
            </div>
          </div>
        </FormSection>

        <FormSection
          icon={Plane}
          title="Aeronaves aplicables"
          hint="Las aeronaves que verán este servicio/certificado en su Control de Mantenimiento."
        >
          {service.aircrafts?.length ? (
            <div className="flex flex-wrap gap-2">
              {service.aircrafts.map((aircraft) => (
                <Badge key={aircraft.id} variant="secondary">
                  {aircraft.acronym}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No aplica a ninguna aeronave todavía.</p>
          )}
        </FormSection>

        <ServiceTaskList service={service} />
      </div>

      <ServiceDialog open={openEdit} onOpenChange={setOpenEdit} service={service} />

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este servicio/certificado?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará &quot;{service.name}&quot; con sus tareas y requisitos. Si ya se usó en un Control de
              Mantenimiento o una Orden de Trabajo, el sistema lo rechazará: en ese caso márquelo como superado.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!selectedCompany?.slug) return;
                // La página que se está viendo deja de existir: se vuelve al
                // listado, pero solo si el borrado pasó (puede dar 409).
                try {
                  await deleteCatalogService.mutateAsync({ id: service.id, company: selectedCompany.slug });
                  router.push(`/${selectedCompany.slug}/ingenieria/catalogo/servicios`);
                } catch {
                  // El hook de la mutación ya notificó el fallo.
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ContentLayout>
  );
};

export default ServiceDetailPage;
