import type { GeneralArticleIntakeEntryType } from "@/types/purchase";

/**
 * Opciones de filtro por origen de la entrada. Las comparten el listado de
 * recepción y el diálogo del reporte, para que ambos digan lo mismo.
 */
export const ENTRY_TYPE_OPTIONS: {
  value: "ALL" | GeneralArticleIntakeEntryType;
  label: string;
}[] = [
  { value: "ALL", label: "Todos los orígenes" },
  { value: "PURCHASE", label: "Compras" },
  { value: "ADMINISTRATIVE", label: "Recepción administrativa" },
  { value: "RECLASSIFIED", label: "Reclasificados" },
];

/**
 * Cómo se nombra el origen en la fila de una entrada que no viene de compras
 * (las de compras muestran su requisición).
 */
export const ENTRY_TYPE_ROW_LABEL: Partial<
  Record<GeneralArticleIntakeEntryType, string>
> = {
  ADMINISTRATIVE: "Recepción administrativa",
  RECLASSIFIED: "Reclasificado",
};
