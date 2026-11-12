import type { ElementType } from "react";

import RequisitionCycle from "@/components/misc/RequisitionCycle";

export interface OverviewItem {
  label: string;
  value?: string | null;
  icon?: ElementType;
}

/**
 * La información básica de la solicitud y su ciclo, en una misma fila: lo que
 * se consulta de un vistazo, sin apilar un bloque encima de otro.
 *
 * Se parte por el ancho del contenedor y no por el de la ventana: la página
 * vive con y sin menú lateral. Con 1150 px el ciclo cabe en horizontal: necesita
 * 700 px interiores (ver RequisitionCycle) más 42 de borde y relleno, a lo que se
 * suman la columna de la información (24 rem = 384 px) y el hueco de 16 px: 1142.
 * Por debajo todo se apila y cada bloque ocupa el ancho completo, como antes.
 *
 * La información va en dos columnas internas: con una sola, cuatro datos hacían
 * esa tarjeta mucho más alta que el ciclo.
 */
export default function RequisitionOverview({
  requisitionId,
  items,
}: {
  requisitionId?: number;
  items: OverviewItem[];
}) {
  return (
    <div className="@container w-full">
      <div className="grid gap-4 @min-[1150px]:grid-cols-[24rem_minmax(0,1fr)]">
        <section className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5 dark:border-slate-700/60 dark:bg-slate-900/60">
          <div className="mb-4 flex shrink-0 items-center gap-3 select-none">
            <span className="text-xs font-semibold whitespace-nowrap text-muted-foreground">
              Información de la solicitud
            </span>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4 @min-[1150px]:grid-cols-2 @min-[1150px]:gap-y-4">
            {items.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex min-w-0 flex-col gap-0.5">
                <dt className="text-xs font-medium text-muted-foreground select-none">
                  {label}
                </dt>
                <dd className="flex items-center gap-1.5 text-sm font-medium wrap-anywhere">
                  {Icon && (
                    <Icon className="size-3.5 shrink-0 text-muted-foreground/50" />
                  )}
                  {value ?? "—"}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <RequisitionCycle requisitionId={requisitionId} variant="section" />
      </div>
    </div>
  );
}
