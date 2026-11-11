import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { PaxPassenger } from "@/types";

interface PassengerSummaryCardProps {
  pax: PaxPassenger;
  isCounter: boolean;
}

/** Par etiqueta/valor de la ficha (solo lectura). */
const DataRow = ({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) => (
  <div className={`flex min-w-0 flex-col gap-0.5 ${className}`}>
    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
    <span className="text-sm wrap-break-words">{children}</span>
  </div>
);

/** Dato compacto para la franja de counter (etiqueta en línea). */
const InlineDatum = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <span className="whitespace-nowrap">
    <span className="text-muted-foreground">{label}: </span>
    {children}
  </span>
);

const LODGE_DISPLAY: Record<string, string> = {
  TOURIST: "TURISTAS",
  TURISTA: "TURISTAS",
  TURISTAS: "TURISTAS",
  RESIDENT: "RESIDENTE",
  RESIDENTE: "RESIDENTE",
  PARTICULAR: "PARTICULAR",
  EMPLOYEE: "EMPLEADO",
  EMPLEADO: "EMPLEADO",
  "N/A": "N/A",
};

/**
 * Ficha de solo lectura de un pasajero, para la vista de detalle en pantallas
 * angostas. La tabla de escritorio tiene 11 columnas (~1250px) y obliga a
 * desplazarse horizontalmente dentro de la tarjeta, escondiendo la mayoría de
 * los datos sin que el usuario lo note.
 */
export const PassengerSummaryCard = ({
  pax,
  isCounter,
}: PassengerSummaryCardProps) => {
  return (
    <div className="rounded-lg border p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold wrap-break-words">{pax.full_name}</p>
          <p className="text-xs text-muted-foreground">
            Asiento {pax.seat_number}
          </p>
        </div>
        <Badge variant="outline" className="shrink-0 text-xs">
          {LODGE_DISPLAY[pax.lodge_type] || pax.lodge_type}
        </Badge>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5">
        <DataRow label="Nacionalidad">{pax.nationality}</DataRow>
        <DataRow label="Cédula / ID">
          <span className="font-mono">{pax.id_number}</span>
        </DataRow>
        <DataRow label="Agencia" className="col-span-2">
          {pax.agency || "—"}
        </DataRow>
      </div>

      {isCounter && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t pt-3 text-xs">
          <InlineDatum label="Luggage">
            <span className="font-medium uppercase">
              {pax.luggage_weight || "—"}
            </span>
          </InlineDatum>
          <InlineDatum label="W">
            <span className="font-mono">
              {pax.body_weight != null ? `${pax.body_weight} kg` : "—"}
            </span>
          </InlineDatum>
          <InlineDatum label="FP">
            <span className="font-mono uppercase">
              {pax.payment_method || "—"}
            </span>
          </InlineDatum>
          <InlineDatum label="Monto">
            <span className="font-mono font-medium">
              {pax.amount_paid != null
                ? `$${Number(pax.amount_paid).toFixed(2)}`
                : "—"}
            </span>
          </InlineDatum>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-muted-foreground">Return:</span>
            {pax.return_flight ? (
              <Badge className="border-sky-300 bg-sky-500/10 text-xs text-sky-600">
                SÍ
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">NO</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};
