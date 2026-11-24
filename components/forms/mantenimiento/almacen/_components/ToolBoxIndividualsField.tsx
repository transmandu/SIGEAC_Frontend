"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Lock, ScanBarcode, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FormLabel } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetToolBoxIndividuals } from "@/hooks/mantenimiento/almacen/caja_herramientas/useGetToolBoxIndividuals";
import { cn } from "@/lib/utils";
import {
  INDIVIDUAL_STATUS_LABEL,
  type ToolBoxIndividual,
} from "@/types/general-article-individual";

interface Props {
  location: string | number | null;
  company?: string;
  /** Ids de las herramientas de ferretería elegidas para la caja. */
  value: number[];
  onChange: (ids: number[]) => void;
  /** Herramientas de ferretería que ya tiene la caja que se edita (para poder mostrarlas). */
  current?: ToolBoxIndividual[];
}

const label = (piece: ToolBoxIndividual) =>
  `${piece.general_article?.description ?? "Artículo"} · ${piece.identifier}`;

/**
 * Herramientas de ferretería identificadas dentro de una caja, junto a las
 * herramientas de lote. Uno que salió con la caja asignada (despachada,
 * en taller) sigue siendo de la caja: se muestra bloqueada y no se puede quitar
 * hasta que vuelva.
 */
export function ToolBoxIndividualsField({
  location,
  company,
  value,
  onChange,
  current = [],
}: Props) {
  const [open, setOpen] = useState(false);
  const { data: available, isLoading } = useGetToolBoxIndividuals(
    location,
    company,
  );

  const pieces = useMemo(() => {
    const byId = new Map<number, ToolBoxIndividual>();
    [...current, ...(available ?? [])].forEach((piece) =>
      byId.set(piece.id, piece),
    );
    return byId;
  }, [available, current]);

  const choices = useMemo(
    () =>
      [...pieces.values()].filter(
        (piece) => piece.status === "STORED" || piece.status === "INTOOLBOX",
      ),
    [pieces],
  );

  const lockedIds = useMemo(
    () =>
      new Set(
        current
          .filter((piece) => piece.status !== "INTOOLBOX")
          .map((piece) => piece.id),
      ),
    [current],
  );

  // Aunque no se pueda quitar, uno fuera sigue contando como de la caja.
  const selected = [...new Set([...value, ...lockedIds])];

  const toggle = (id: number) => {
    if (lockedIds.has(id)) return;
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
    );
  };

  if (!isLoading && choices.length === 0 && selected.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <FormLabel>Herramientas de ferretería</FormLabel>
        {selected.length > 0 && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {selected.length} seleccionadas
          </span>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            disabled={isLoading}
            variant="outline"
            role="combobox"
            className="w-full justify-between font-normal text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              <ScanBarcode className="h-4 w-4 shrink-0" />
              Buscar y agregar herramientas de ferretería...
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start" matchTriggerWidth>
          <Command>
            <CommandInput placeholder="Buscar por identificador o artículo..." />
            <CommandList>
              <CommandEmpty className="p-4 text-center text-xs text-muted-foreground">
                No hay herramientas de ferretería disponibles...
              </CommandEmpty>
              <CommandGroup>
                {choices.map((piece) => (
                  <CommandItem
                    key={piece.id}
                    value={label(piece)}
                    disabled={lockedIds.has(piece.id)}
                    onSelect={() => toggle(piece.id)}
                    className="gap-2"
                  >
                    <ScanBarcode className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">
                      <span className="block font-mono text-sm">
                        {piece.identifier}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {piece.general_article?.description}
                      </span>
                    </span>
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        selected.includes(piece.id)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto rounded-md border border-dashed border-input p-2">
          {selected.map((id) => {
            const piece = pieces.get(id);
            const locked = lockedIds.has(id);

            return (
              <Badge
                key={id}
                variant="secondary"
                className="gap-1 py-1 pl-2 pr-1 font-normal"
              >
                <ScanBarcode className="h-3 w-3 text-muted-foreground" />
                {piece ? label(piece) : id}
                {locked ? (
                  <span
                    className="ml-1 flex items-center gap-1 pr-1 text-xs text-muted-foreground"
                    title="Salió con la caja asignada: vuelve a ella"
                  >
                    <Lock className="size-3" />
                    {piece ? INDIVIDUAL_STATUS_LABEL[piece.status] : ""}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggle(id)}
                    className="ml-1 rounded-full p-0.5 hover:bg-background/80"
                    aria-label="Quitar artículo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
