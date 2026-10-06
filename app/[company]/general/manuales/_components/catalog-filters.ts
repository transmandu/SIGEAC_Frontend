import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/maintenanceCatalogLabels";
import type { CatalogManual, CatalogService } from "@/types/maintenanceCatalog";

export type ServiceFilters = {
  search: string;
  category: string[];
  status: string[];
};

export type ManualFilters = {
  status: string[];
  support: string[];
};

export const emptyServiceFilters: ServiceFilters = {
  search: "",
  category: [],
  status: [],
};

export const emptyManualFilters: ManualFilters = { status: [], support: [] };

export const isFilteringServices = (filters: ServiceFilters) =>
  filters.search.trim() !== "" ||
  filters.category.length > 0 ||
  filters.status.length > 0;

/**
 * La búsqueda corre sobre el texto que el usuario ve (no sobre "ACTIVE") y
 * llega hasta las tareas: un ATA o un número de tarea encuentra el servicio que
 * lo contiene, que es como lo busca Ingeniería.
 */
export function matchesService(
  service: CatalogService,
  filters: ServiceFilters,
): boolean {
  if (filters.category.length && !filters.category.includes(service.category)) {
    return false;
  }
  if (filters.status.length && !filters.status.includes(service.status)) {
    return false;
  }

  const term = filters.search.trim().toLowerCase();
  if (!term) return true;

  const haystack = [
    service.name,
    service.code,
    service.description,
    service.manual?.name,
    CATEGORY_LABELS[service.category],
    STATUS_LABELS[service.status],
    ...(service.tasks ?? []).flatMap((task) => [
      task.description,
      task.ata,
      task.task_number,
      task.reference,
    ]),
  ];

  return haystack.some((value) => value?.toLowerCase().includes(term));
}

export function matchesManualFilters(
  manual: CatalogManual,
  filters: ManualFilters,
): boolean {
  if (filters.status.length && !filters.status.includes(manual.status)) {
    return false;
  }
  if (filters.support.length) {
    const support = manual.is_physical ? "PHYSICAL" : "DIGITAL";
    if (!filters.support.includes(support)) return false;
  }
  return true;
}
