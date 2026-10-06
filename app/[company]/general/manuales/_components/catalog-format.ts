import { COUNTING_METHOD_LABELS } from "@/lib/maintenanceCatalogLabels";
import type { CatalogInterval } from "@/types/maintenanceCatalog";

/** "6000 Horas Ó 1825 Días": el vencimiento es el primero que ocurra. */
export const formatIntervals = (intervals: CatalogInterval[]): string =>
  intervals
    .map(
      (i) => `${i.interval_value} ${COUNTING_METHOD_LABELS[i.counting_method]}`,
    )
    .join(" Ó ");
