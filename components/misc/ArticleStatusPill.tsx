import { Badge } from "@/components/ui/badge";
import { statusDisplay } from "@/lib/warehouse/statuses";

/**
 * Estado del artículo bajo un "No disponible": dice por qué no se puede contar
 * con él (cuarentena, en espera de formato, por inspeccionar…). El backend lo
 * guarda en minúsculas; aquí se muestra en mayúsculas y con espacios.
 */
export function ArticleStatusPill({ status }: { status: string }) {
  // Un artículo almacenado no tiene nada que explicar: si no figura
  // disponible es porque no queda existencia, no por su estado.
  if (status.trim().toUpperCase() === "STORED") return null;

  return (
    <Badge
      variant="secondary"
      className="px-3 py-1 text-xs font-bold whitespace-nowrap"
    >
      {statusDisplay(status).toLocaleUpperCase("es")}
    </Badge>
  );
}
