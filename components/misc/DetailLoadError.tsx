"use client";

import { SearchX } from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/misc/EmptyState";
import { Button } from "@/components/ui/button";

interface Props {
  /** Título de la página, el mismo que usa su vista normal. */
  title: string;
  /** Nombre del documento que no se pudo mostrar: "La solicitud de compra". */
  subject: string;
  /** Identificador de la ruta, para la migaja. */
  label?: string;
  onRetry?: () => void;
}

/**
 * Página de detalle cuyo documento no llegó: no existe, se eliminó o la
 * consulta falló. Sin esto el detalle se renderizaba vacío, con la cabecera
 * y las secciones sin datos, como si el documento no tuviera contenido.
 */
export default function DetailLoadError({
  title,
  subject,
  label,
  onRetry,
}: Props) {
  return (
    <ContentLayout title={title}>
      <div className="flex flex-col gap-6">
        <PageHeader currentLabel={label} />

        <EmptyState
          className="min-h-[50vh]"
          icon={SearchX}
          tone="error"
          title={`${subject} no se pudo cargar`}
          description="Es posible que ya no exista o que haya ocurrido un problema de conexión."
          action={
            onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Reintentar
              </Button>
            )
          }
        />
      </div>
    </ContentLayout>
  );
}
