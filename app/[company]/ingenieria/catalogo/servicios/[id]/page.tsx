"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ClipboardList, Pencil, Plane, Wrench } from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { Badge } from "@/components/ui/badge";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { FormSection } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { ServiceDialog } from "@/components/dialogs/mantenimiento/catalogo/ServiceDialog";
import { useGetCatalogService } from "@/hooks/mantenimiento/catalogo/useGetCatalogService";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  CATEGORY_LABELS,
  COUNTING_METHOD_LABELS,
  MSG3_TYPE_LABELS,
  REQUIREMENT_TYPE_LABELS,
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
  const { selectedCompany } = useCompanyStore();
  const { data: service, isLoading } = useGetCatalogService(selectedCompany?.slug, id);
  const [openEdit, setOpenEdit] = useState(false);

  if (isLoading || !service) return <LoadingPage />;

  const tasksHref = `/${selectedCompany?.slug}/ingenieria/catalogo/servicios/${service.id}/tareas`;

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

          <ActionTriggerButton type="button" className="shrink-0" onClick={() => setOpenEdit(true)}>
            <Pencil className="mr-2 size-4" />
            Editar
          </ActionTriggerButton>
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
              {service.counting_method ? (
                `${service.interval_value} ${COUNTING_METHOD_LABELS[service.counting_method]}`
              ) : (
                <Empty />
              )}
            </Field>
            <Field label="Tareas registradas">{service.tasks?.length ?? 0}</Field>
            <Field label="Registrado por">{service.registered_by || <Empty />}</Field>
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

        <FormSection
          icon={ClipboardList}
          title="Tareas"
          hint="Las tareas que se ejecutan cuando este servicio genera una orden de trabajo."
          action={
            <ActionTriggerButton asChild>
              <Link href={tasksHref}>
                <ClipboardList className="mr-2 size-4" />
                Administrar Tareas
              </Link>
            </ActionTriggerButton>
          }
        >
          {!service.tasks || service.tasks.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-400/40 py-10 text-center dark:border-slate-600/40">
              <ClipboardList className="size-6 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">Sin tareas registradas todavía.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {service.tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-slate-400/40 bg-gradient-to-br from-background/70 to-background/40 p-3.5 shadow-sm backdrop-blur-md dark:border-slate-600/40"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {MSG3_TYPE_LABELS[task.msg3_type]}
                    </span>
                    {task.ata && <span className="text-xs text-muted-foreground">ATA {task.ata}</span>}
                  </div>
                  <p className="mt-1 text-sm font-medium">{task.description}</p>
                  {task.requirements.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Requisitos:{" "}
                      {task.requirements
                        .map((r) => `${r.description} (${REQUIREMENT_TYPE_LABELS[r.requirement_type]})`)
                        .join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </FormSection>
      </div>

      <ServiceDialog open={openEdit} onOpenChange={setOpenEdit} service={service} />
    </ContentLayout>
  );
};

export default ServiceDetailPage;
