"use client";

import { Check } from "lucide-react";
import { Fragment } from "react";

import { CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { GeneralArticle } from "@/types";
import { truncateText } from "./truncate";

interface Props {
  articles: GeneralArticle[];
  /** Artículos que ya tienen fila en la salida. */
  selectedIds: Set<number>;
  /** Artículos individuales ya elegidos en cualquier fila. */
  pickedIndividualIds: Set<number>;
  /** Cajas que ya salen completas: lo que guardan no se elige por su cuenta. */
  lockedToolBoxIds?: Set<number>;
  onAdd: (article: GeneralArticle) => void;
  onToggleIndividual: (article: GeneralArticle, individualId: number) => void;
}

/**
 * Opciones del selector de artículos generales de una salida.
 *
 * Un artículo con artículos individuales en el almacén trae debajo, como
 * sub-opciones, cada uno por su identificador: se elige directamente lo que
 * sale, sin tener que abrir la tarjeta del artículo. El propio artículo sigue
 * siendo elegible para sacar cantidad sin identificar.
 */
export function GeneralCatalogOptions({
  articles,
  selectedIds,
  pickedIndividualIds,
  lockedToolBoxIds,
  onAdd,
  onToggleIndividual,
}: Props) {
  const locked = (individual: { tool_box?: { id: number } | null }) =>
    !!individual.tool_box && !!lockedToolBoxIds?.has(individual.tool_box.id);

  return (
    <>
      {articles.map((ga) => {
        const already = selectedIds.has(Number(ga.id));
        const individuals = ga.stocked_individuals ?? [];
        const base = `${ga.description ?? ""} ${ga.brand_model ?? ""} ${ga.variant_type ?? ""}`;

        return (
          <Fragment key={`g-${ga.id}`}>
            <CommandItem
              value={base}
              className="max-w-full"
              onSelect={() => onAdd(ga)}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  already ? "opacity-100" : "opacity-0",
                )}
              />
              <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <span className="truncate font-medium">
                  {truncateText(ga.description) || "N/A"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {ga.brand_model ?? "N/A"} · {ga.variant_type ?? "N/A"} · Disp:{" "}
                  {ga.quantity ?? 0} {ga.general_primary_unit?.label ?? ""}
                  {individuals.length > 0 &&
                    ` · ${individuals.length} identificado${individuals.length === 1 ? "" : "s"}`}
                </span>
              </div>
            </CommandItem>

            {individuals.map((individual, position) => (
              <CommandItem
                key={`g-${ga.id}-i-${individual.id}`}
                // Lleva el artículo en el valor: al buscar por su nombre salen
                // también sus identificados, y al buscar por el identificador
                // sale solo el que se busca.
                value={`${base} ${individual.identifier}`}
                // Si su caja ya sale completa, sale con ella y no se elige aparte.
                disabled={locked(individual)}
                // Rama: una línea baja desde el artículo y un ramal por cada
                // identificado; la del último se corta a la mitad.
                className={cn(
                  "relative max-w-full pl-13",
                  "before:absolute before:left-9 before:top-0 before:w-px before:bg-muted-foreground/40",
                  position === individuals.length - 1
                    ? "before:h-1/2"
                    : "before:h-full",
                  "after:absolute after:left-9 after:top-1/2 after:h-px after:w-3 after:bg-muted-foreground/40",
                )}
                onSelect={() => onToggleIndividual(ga, individual.id)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    pickedIndividualIds.has(individual.id) || locked(individual)
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                  <span className="truncate font-medium">
                    {individual.identifier}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {individual.tool_box
                      ? `En caja: ${truncateText(individual.tool_box.name, 24)}`
                      : "Identificado"}{" "}
                    · {truncateText(ga.description) || "N/A"}
                  </span>
                </div>
              </CommandItem>
            ))}
          </Fragment>
        );
      })}
    </>
  );
}
