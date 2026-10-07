import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { MISSING_FIELD_LABELS } from "@/lib/maintenanceCatalogLabels";
import { cn } from "@/lib/utils";
import type { CatalogService } from "@/types/maintenanceCatalog";

export function IncompleteBadge({
  service,
  className,
}: {
  service: Pick<CatalogService, "is_incomplete" | "missing_fields">;
  className?: string;
}) {
  if (!service.is_incomplete) return null;

  return (
    <Badge
      variant="outline"
      title={`Falta: ${service.missing_fields
        .map((field) => MISSING_FIELD_LABELS[field])
        .join(", ")}`}
      className={cn(
        "gap-1 border-amber-500/50 bg-amber-500/10 text-[10px] text-amber-700 dark:text-amber-400",
        className,
      )}
    >
      <AlertTriangle className="size-3" />
      Incompleto
    </Badge>
  );
}
