"use client";

import { EmptyState } from "@/components/misc/EmptyState";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface QueuePanelProps {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  children: ReactNode;
}

/**
 * Contenido de una pestaña que depende de una cola: cargando, con error o con
 * datos. Sin esto, una cola que falla se pintaba como "no se ha encontrado
 * ningún resultado" y parecía vacía en vez de rota.
 */
export function QueuePanel({
  isLoading,
  isError,
  onRetry,
  children,
}: QueuePanelProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        tone="error"
        icon={AlertCircle}
        title="No se pudo cargar la lista"
        description="Revise su conexión e intente de nuevo."
        className="py-20"
        action={
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
}
