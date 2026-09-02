"use client";

import EvidenceGallery from "@/components/misc/EvidenceGallery";
import { useGetArticleReturnContext } from "@/hooks/mantenimiento/almacen/articulos/useGetArticleReturnContext";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { formatInstant } from "@/lib/date";
import { Undo2, User } from "lucide-react";

/**
 * Por qué esta pieza está en incoming, cuando llegó devuelta de una salida.
 *
 * Un artículo devuelto no viene de una compra: no tiene orden, ni factura, ni
 * remisión que explique su presencia. Lo único que la justifica es lo que
 * declaró el almacén al devolverlo, y las fotos de cómo volvió. Sin eso el
 * inspector no sabe qué desviación debe buscar.
 *
 * No se renderiza cuando el artículo llegó por la vía normal, que es el caso
 * corriente: una sección vacía en cada inspección solo sería ruido.
 */
export function ReturnEvidenceSection({ articleId }: { articleId: number }) {
  const { data: context } = useGetArticleReturnContext(articleId);
  const timeZone = useCompanyTimezone();

  if (!context) return null;

  const returnedAt = context.returned_at
    ? formatInstant(context.returned_at, timeZone, "dd MMM yyyy 'a las' HH:mm")
    : null;

  return (
    <section className="rounded-xl border border-amber-500/40 bg-amber-500/[0.04] p-5">
      <div className="flex items-center gap-2">
        <Undo2 className="h-4 w-4 text-amber-600 dark:text-amber-500" />
        <p className="text-[11px] font-medium uppercase tracking-widest text-amber-700 dark:text-amber-500">
          Artículo devuelto de una salida
        </p>
      </div>

      <p className="mt-3 text-sm text-foreground">
        {context.justification || "Sin justificación registrada."}
      </p>

      <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <User className="h-3.5 w-3.5" />
        Devuelto por {context.returned_by ?? "—"}
        {returnedAt ? ` · ${returnedAt}` : ""}
      </p>

      {/* Adjuntar fotos es opcional: sin ellas la sección sigue valiendo por la
          justificación, que es lo que explica la desviación declarada. */}
      {context.evidences.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-muted-foreground">
            Cómo fue devuelto al almacén
          </p>
          <EvidenceGallery
            images={context.evidences}
            title="Evidencia de devolución"
            size={72}
          />
        </div>
      )}
    </section>
  );
}

export default ReturnEvidenceSection;
