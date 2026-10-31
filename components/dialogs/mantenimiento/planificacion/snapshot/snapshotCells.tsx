import { TableCell } from "@/components/ui/table";
import {
  ComputedMaintenanceItem,
  STATUS_META,
} from "@/lib/maintenanceControlCalc";
import { cn } from "@/lib/utils";

/**
 * Celdas que repiten los cuatro snapshots (Mantenimiento, Directivas,
 * Componentes, Aviónica): el cálculo ya viene resuelto del backend y
 * `computeMaintenanceItem` solo lo formatea, así que acá no hay lógica de
 * negocio — solo cómo se pinta cada pieza de un ítem con varios intervalos
 * ("lo que ocurra primero").
 */

const extraClass = "block text-xs text-muted-foreground";

export function FrequencyCell({
  computed,
}: {
  computed: ComputedMaintenanceItem;
}) {
  return (
    <TableCell>
      {computed.frequency}
      {computed.extras.map((extra, i) => (
        <span key={i} className={extraClass}>
          Ó {extra.frequency}
        </span>
      ))}
    </TableCell>
  );
}

export function NextCell({ computed }: { computed: ComputedMaintenanceItem }) {
  return (
    <TableCell>
      {computed.next}
      {computed.extras.map((extra, i) => (
        <span key={i} className={extraClass}>
          {extra.next}
        </span>
      ))}
    </TableCell>
  );
}

export function RemainingCell({
  computed,
}: {
  computed: ComputedMaintenanceItem;
}) {
  const meta = STATUS_META[computed.status];

  return (
    <TableCell>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 font-semibold",
          meta.text,
        )}
      >
        <span className={cn("size-1.5 shrink-0 rounded-full", meta.dot)} />
        {computed.remaining}
      </span>
      {computed.extras.map((extra, i) => (
        <span
          key={i}
          className={cn(
            "block text-xs",
            extra.status
              ? STATUS_META[extra.status].text
              : "text-muted-foreground",
          )}
        >
          {extra.remaining}
        </span>
      ))}
    </TableCell>
  );
}

export function EstimateCell({
  computed,
}: {
  computed: ComputedMaintenanceItem;
}) {
  return (
    <TableCell>
      {computed.estimate}
      {computed.extras.map((extra, i) => (
        <span key={i} className={extraClass}>
          {extra.estimate}
        </span>
      ))}
    </TableCell>
  );
}
