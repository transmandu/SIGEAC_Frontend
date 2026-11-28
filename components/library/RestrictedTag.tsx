"use client";

import { Lock } from "lucide-react";
import { TagBadge } from "@/components/misc/TagBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Documento con lista propia de personas: el mismo aviso en lista y cuadrícula. */
export default function RestrictedTag({
  memberCount,
  className,
}: {
  memberCount?: number;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <TagBadge tone="amber" className={className}>
          <Lock className="size-3" aria-hidden />
          Restringido
        </TagBadge>
      </TooltipTrigger>
      <TooltipContent>
        {typeof memberCount === "number"
          ? `Solo lo ven ${memberCount} ${memberCount === 1 ? "persona" : "personas"} y la dirección del departamento`
          : "Acceso restringido a personas concretas"}
      </TooltipContent>
    </Tooltip>
  );
}
