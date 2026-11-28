"use client";

import { TagBadge } from "@/components/misc/TagBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Original o réplica: el mismo aviso en la lista y en la cuadrícula. */
export default function ReplicaTag({
  isPrimaryHere,
  className,
}: {
  isPrimaryHere: boolean;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <TagBadge
          tone={isPrimaryHere ? "amber" : "slate"}
          className={className}
        >
          {isPrimaryHere ? "Original" : "Réplica"}
        </TagBadge>
      </TooltipTrigger>
      <TooltipContent>
        {isPrimaryHere
          ? "Carpeta principal: aquí vive el archivo original"
          : "Réplica: es un vínculo al original, que vive en otra carpeta"}
      </TooltipContent>
    </Tooltip>
  );
}
