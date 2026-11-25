"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ScanBarcode, Search } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { TagBadge } from "@/components/misc/TagBadge";
import { useGetGeneralArticleIndividuals } from "@/hooks/mantenimiento/almacen/almacen_general/useGeneralArticleIndividuals";
import {
  INDIVIDUAL_STATUS_LABEL,
  INDIVIDUAL_STATUS_TONE,
  isStockedIndividual,
} from "@/types/general-article-individual";
import { cn } from "@/lib/utils";

interface Props {
  articleId: number;
  selected: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
}

const SEARCH_FROM = 8;

/**
 * Elegir por identificador cuáles de los identificados salen. Los elegidos cuentan dentro
 * de la cantidad de la fila; lo que sobre sale como existencia sin identificar.
 * No se pinta nada si el artículo no tiene identificados en el almacén.
 */
export function IndividualsPicker({
  articleId,
  selected,
  onChange,
  disabled,
}: Props) {
  const { data } = useGetGeneralArticleIndividuals(articleId);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const stocked = useMemo(
    () =>
      (data?.individuals ?? []).filter((item) =>
        isStockedIndividual(item.status),
      ),
    [data],
  );

  if (stocked.length === 0) return null;

  const needle = search.trim().toLowerCase();
  const visible = needle
    ? stocked.filter((item) => item.identifier.toLowerCase().includes(needle))
    : stocked;
  const chosen = new Set(selected);

  const toggle = (id: number) =>
    onChange(
      chosen.has(id)
        ? selected.filter((value) => value !== id)
        : [...selected, id],
    );

  return (
    <div className="rounded-lg border border-slate-300/70 bg-muted/20 dark:border-slate-600/50">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
        aria-expanded={open}
      >
        <ScanBarcode className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 text-[13px] font-medium">
          Identificados
          <span className="ml-2 font-normal text-muted-foreground">
            {selected.length > 0
              ? `${selected.length} elegido${selected.length === 1 ? "" : "s"} de ${stocked.length}`
              : `${stocked.length} en el almacén`}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="space-y-2 border-t px-3 pb-3 pt-2">
          <p className="text-xs text-muted-foreground">
            Los que elija cuentan dentro de la cantidad de la fila.
          </p>

          {stocked.length >= SEARCH_FROM && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar identificador"
                className="h-9 pl-8 text-sm max-sm:text-base"
              />
            </div>
          )}

          <ul className="max-h-48 divide-y divide-border/60 overflow-y-auto overscroll-contain rounded-md border bg-background/60">
            {visible.length === 0 ? (
              <li className="px-3 py-3 text-center text-xs text-muted-foreground">
                Ninguno coincide.
              </li>
            ) : (
              visible.map((item) => (
                <li key={item.id}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-muted/40",
                      disabled && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <Checkbox
                      checked={chosen.has(item.id)}
                      disabled={disabled}
                      onCheckedChange={() => toggle(item.id)}
                    />
                    <span className="min-w-0 flex-1 wrap-anywhere font-mono text-sm font-medium">
                      {item.identifier}
                    </span>
                    <TagBadge tone={INDIVIDUAL_STATUS_TONE[item.status]}>
                      {item.status === "INTOOLBOX" && item.tool_box
                        ? `En caja: ${item.tool_box.name}`
                        : INDIVIDUAL_STATUS_LABEL[item.status]}
                    </TagBadge>
                  </label>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
