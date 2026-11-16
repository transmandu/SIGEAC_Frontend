"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { InfoSection } from "@/components/misc/InfoSection";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { useGetTransitUpdates } from "@/hooks/mantenimiento/compras/useGetTransitUpdates";
import { formatInstant } from "@/lib/date";
import { Globe, MessageSquareText, Truck } from "lucide-react";

interface Props {
  articleId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Descripción del renglón, si quien abre la ficha ya la tiene a mano. */
  description?: string | null;
}

/**
 * Bitácora de tránsito de un artículo, solo para consulta: la escribe compras
 * desde su pantalla. Almacén la ve para saber por dónde venía lo que esperaba.
 * Con el aspecto de la ficha de detalle del almacén (placa y secciones), no el
 * de los diálogos de compras.
 */
export function TransitUpdatesReadOnlyDialog({
  articleId,
  open,
  onOpenChange,
  description,
}: Props) {
  const timeZone = useCompanyTimezone();
  const { data, isLoading, isError } = useGetTransitUpdates(articleId, open);

  const partNumber = data?.article.part_number;
  const orderNumber = data?.article.purchase_order_number;

  const tracking = [
    {
      label: "Tracking nacional",
      icon: Truck,
      value: data?.article.shipping_tracking,
    },
    {
      label: "Tracking internacional",
      icon: Globe,
      value: data?.article.international_shipping_tracking,
    },
  ].filter((item) => !!item.value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">
          Bitácora de tránsito{partNumber ? ` del artículo ${partNumber}` : ""}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Novedades que compras registró sobre el envío del artículo
        </DialogDescription>

        {/* Placa de identificación */}
        <div className="shrink-0 border-b bg-muted/40 px-6 py-5 pr-14">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Bitácora de tránsito
          </p>
          <p className="mt-1 truncate font-mono text-2xl font-bold leading-tight tracking-tight">
            {partNumber ?? "—"}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {description ?? "Novedades del envío"}
            {orderNumber && ` · Orden ${orderNumber}`}
          </p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : isError || !data ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No se pudo cargar la bitácora.
            </p>
          ) : (
            <>
              {tracking.length > 0 && (
                <InfoSection icon={Truck} title="Seguimiento del envío">
                  <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                    {tracking.map(({ label, icon: Icon, value }) => (
                      <div key={label} className="min-w-0">
                        <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                          <Icon className="size-3" />
                          {label}
                        </p>
                        <p className="mt-0.5 break-all font-mono text-[13px] font-semibold leading-snug">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </InfoSection>
              )}

              <InfoSection
                icon={MessageSquareText}
                title={`Novedades (${data.data.length})`}
                hint="Lo que compras fue anotando mientras el artículo venía en camino."
              >
                {data.data.length === 0 ? (
                  <p className="text-sm text-muted-foreground/60">
                    Compras no registró novedades de este envío.
                  </p>
                ) : (
                  <ol className="space-y-3">
                    {data.data.map((update) => (
                      <li
                        key={update.id}
                        className="border-l-2 border-sky-300 pl-3 dark:border-sky-700/60"
                      >
                        <p className="whitespace-pre-wrap text-[13px] leading-snug wrap-anywhere">
                          {update.note}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {update.registered_by} ·{" "}
                          {formatInstant(
                            update.occurred_at,
                            timeZone,
                            "dateTime",
                          )}
                          {update.edited_at && " · editada"}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </InfoSection>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
