"use client";

import { memo } from "react";
import { Star } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  favorite: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * Estrella de favorito de un documento. Marcado se ve siempre; sin marcar solo
 * aparece al apuntar la fila o tarjeta (o con el teclado), y siempre en
 * pantallas táctiles, donde no hay hover.
 */
function FavoriteButton({
  favorite,
  onToggle,
  className,
}: FavoriteButtonProps) {
  const label = favorite ? "Quitar de favoritos" : "Añadir a favoritos";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-pressed={favorite}
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-xl outline-hidden motion-safe:transition-colors hover:bg-muted focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary/30 max-md:size-10",
            favorite
              ? "text-amber-500"
              : "text-muted-foreground opacity-0 group-hover:opacity-100 pointer-coarse:opacity-100",
            className,
          )}
        >
          <Star className={cn("size-4", favorite && "fill-current")} />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export default memo(FavoriteButton);
