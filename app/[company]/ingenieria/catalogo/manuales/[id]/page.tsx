"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { BookOpen, ClipboardList, ExternalLink, Pencil, Wrench } from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { Badge } from "@/components/ui/badge";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { FormSection } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { ManualDialog } from "@/components/dialogs/mantenimiento/catalogo/ManualDialog";
import { useGetCatalogManual } from "@/hooks/mantenimiento/catalogo/useGetCatalogManual";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  CATEGORY_LABELS,
  COUNTING_METHOD_LABELS,
  MSG3_TYPE_LABELS,
} from "@/lib/maintenanceCatalogLabels";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
    <div className="text-sm">{children}</div>
  </div>
);

const Empty = () => <span className="text-muted-foreground">—</span>;

const ManualDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { selectedCompany } = useCompanyStore();
  const { data: manual, isLoading } = useGetCatalogManual(selectedCompany?.slug, id);
  const [openEdit, setOpenEdit] = useState(false);

  if (isLoading || !manual) return <LoadingPage />;

  const services = manual.services ?? [];

  return (
    <ContentLayout title={manual.name}>
      <div className="flex flex-col gap-6">
        <PageHeader currentLabel={manual.name} />

        <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">{manual.name}</h1>
            <p className="text-sm text-muted-foreground">
              {manual.description || "Sin descripción."}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {manual.file_url && (
              <ActionTriggerButton asChild>
                <a href={manual.file_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 size-4" />
                  Ver Archivo
                </a>
              </ActionTriggerButton>
            )}
            <ActionTriggerButton type="button" onClick={() => setOpenEdit(true)}>
              <Pencil className="mr-2 size-4" />
              Editar
            </ActionTriggerButton>
          </div>
        </div>

        <FormSection icon={BookOpen} title="Datos del Manual">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Código">{manual.manual_code || <Empty />}</Field>
            <Field label="Revisión">{manual.revision || <Empty />}</Field>
            <Field label="Soporte">
              {manual.is_physical ? "Solo físico" : manual.file_url ? "Digital" : "Sin archivo"}
            </Field>
            <Field label="Servicios declarados">{services.length}</Field>
            <Field label="Registrado por">{manual.registered_by || <Empty />}</Field>
            <Field label="Actualizado por">{manual.updated_by || <Empty />}</Field>
          </div>
        </FormSection>

        <FormSection
          icon={Wrench}
          title="Servicios y Certificados"
          hint="Lo que este manual declara, con las tareas de cada uno."
        >
          {services.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-400/40 py-10 text-center dark:border-slate-600/40">
              <Wrench className="size-6 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">
                Ningún servicio/certificado referencia este manual.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-xl border border-slate-400/40 bg-gradient-to-br from-background/70 to-background/40 p-4 shadow-sm backdrop-blur-md dark:border-slate-600/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={service.category === "CERTIFICATE" ? "secondary" : "default"}>
                        {CATEGORY_LABELS[service.category]}
                      </Badge>
                      <Link
                        href={`/${selectedCompany?.slug}/ingenieria/catalogo/servicios/${service.id}`}
                        className="text-sm font-semibold transition-colors hover:text-primary"
                      >
                        {service.name}
                      </Link>
                      {service.counting_method && (
                        <span className="text-xs text-muted-foreground">
                          cada {service.interval_value} {COUNTING_METHOD_LABELS[service.counting_method]}
                        </span>
                      )}
                    </div>

                    {service.aircrafts && service.aircrafts.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {service.aircrafts.map((aircraft) => (
                          <Badge key={aircraft.id} variant="outline" className="text-[11px]">
                            {aircraft.acronym}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {service.tasks && service.tasks.length > 0 ? (
                    <ul className="mt-3 space-y-1.5 border-t border-slate-400/30 pt-3 dark:border-slate-600/30">
                      {service.tasks.map((task) => (
                        <li key={task.id} className="flex items-start gap-2 text-sm">
                          <ClipboardList className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/70" />
                          <span className="min-w-0 flex-1">
                            {task.description}
                            <span className="ml-2 text-xs text-muted-foreground">
                              {MSG3_TYPE_LABELS[task.msg3_type]}
                              {task.ata ? ` · ATA ${task.ata}` : ""}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 border-t border-slate-400/30 pt-3 text-xs text-muted-foreground dark:border-slate-600/30">
                      Sin tareas registradas.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </FormSection>
      </div>

      <ManualDialog open={openEdit} onOpenChange={setOpenEdit} manual={manual} />
    </ContentLayout>
  );
};

export default ManualDetailPage;
