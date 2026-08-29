"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useGetConversionSuggestions,
  type ConversionSuggestion,
} from "@/hooks/mantenimiento/almacen/articulos/useUnitConversionCatalog";
import type { ConvertibleType } from "@/hooks/mantenimiento/almacen/articulos/useArticleUnitConversions";
import { useCompanyStore } from "@/stores/CompanyStore";
import { BookMarked, Info, Loader2, Ruler, Search, Users } from "lucide-react";
import { memo, useMemo, useState } from "react";

interface ConversionSuggestionPickerProps {
  type: ConvertibleType;
  articleId: number;
  /**
   * Limita las sugerencias a una unidad. Lo usa la recepción de compra, donde
   * falta una equivalencia concreta y ofrecer otras sólo estorba.
   */
  onlyUnitId?: number;
  /** Copia la equivalencia elegida al formulario de alta. */
  onPick: (suggestion: ConversionSuggestion) => void;
}

/**
 * Equivalencias ya registradas en el sistema que este artículo puede copiar.
 *
 * Copiar, no enlazar: se toma el número y la conversión resultante pertenece al
 * artículo. Editarla después no toca al origen ni a ningún otro artículo.
 *
 * El backend sólo manda las que comparten unidad base con este artículo — una
 * equivalencia hacia otra base daría un número plausible en la unidad
 * equivocada — y omite las unidades que el artículo ya tiene resueltas.
 */
export const ConversionSuggestionPicker = memo(function ConversionSuggestionPicker({
  type,
  articleId,
  onlyUnitId,
  onPick,
}: ConversionSuggestionPickerProps) {
  const { selectedCompany } = useCompanyStore();
  const { data, isLoading } = useGetConversionSuggestions(
    type,
    articleId,
    selectedCompany?.slug,
  );

  const [search, setSearch] = useState("");

  const { presets, derived } = useMemo(() => {
    const term = search.trim().toLowerCase();

    const matches = (row: ConversionSuggestion) =>
      !term ||
      [row.unit?.label, row.name, row.lectura, ...row.articles]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term));

    const rows = (data?.suggestions ?? [])
      .filter((row) => !onlyUnitId || row.unit?.id === onlyUnitId)
      .filter(matches);

    return {
      presets: rows.filter((row) => row.source === "preset"),
      derived: rows.filter((row) => row.source === "derived"),
    };
  }, [data?.suggestions, search, onlyUnitId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
        <Loader2 className="mr-2 size-3.5 animate-spin" />
        Buscando equivalencias...
      </div>
    );
  }

  const total = presets.length + derived.length;

  // Con onlyUnitId la lista ya está acotada a una unidad: que no haya nada es
  // el caso normal, no vale la pena ocupar espacio diciéndolo.
  if (total === 0 && onlyUnitId) return null;

  if (!data?.suggestions?.length) {
    return (
      <p className="py-3 text-xs text-muted-foreground">
        No hay equivalencias registradas que apliquen a este artículo. Escriba la
        conversión abajo y quedará disponible para los demás.
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      {!onlyUnitId && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar unidad o artículo..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      )}

      {total === 0 ? (
        <p className="py-3 text-center text-xs text-muted-foreground">
          Ninguna equivalencia coincide con la búsqueda.
        </p>
      ) : (
        <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
          {presets.length > 0 && (
            <SuggestionGroup
              title="Equivalencias estándar"
              icon={<BookMarked className="size-3.5" />}
              rows={presets}
              onPick={onPick}
            />
          )}

          {derived.length > 0 && (
            <SuggestionGroup
              title="Usadas en otros artículos"
              icon={<Users className="size-3.5" />}
              rows={derived}
              onPick={onPick}
            />
          )}
        </div>
      )}
    </div>
  );
});

const SuggestionGroup = memo(function SuggestionGroup({
  title,
  icon,
  rows,
  onPick,
}: {
  title: string;
  icon: React.ReactNode;
  rows: ConversionSuggestion[];
  onPick: (suggestion: ConversionSuggestion) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </div>

      {rows.map((row) => (
        <SuggestionRow
          key={`${row.source}-${row.preset_id ?? row.unit?.id}-${row.base_per_unit}`}
          row={row}
          onPick={onPick}
        />
      ))}
    </div>
  );
});

const SuggestionRow = memo(function SuggestionRow({
  row,
  onPick,
}: {
  row: ConversionSuggestion;
  onPick: (suggestion: ConversionSuggestion) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(row)}
      className="w-full rounded-md border bg-background/70 p-2 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium tabular-nums">{row.lectura}</p>

          {row.name && (
            <p className="text-[11px] text-muted-foreground">{row.name}</p>
          )}

          {row.articles.length > 0 && (
            <p className="truncate text-[11px] text-muted-foreground">
              {row.articles.join(", ")}
              {row.article_count > row.articles.length &&
                ` y ${row.article_count - row.articles.length} más`}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {row.is_physical && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="gap-1 px-1.5 text-[10px]">
                    <Ruler className="size-3" />
                    Física
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  Equivalencia física verificable: vale igual para cualquier
                  artículo.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {row.source === "derived" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="gap-1 px-1.5 text-[10px]">
                    <Info className="size-3" />
                    {row.article_count}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  Usada por {row.article_count}{" "}
                  {row.article_count === 1 ? "artículo" : "artículos"}. Si es una
                  unidad de empaque (CAJA, ROLLO, SET), confirme que este artículo
                  viene igual: no todas las cajas traen lo mismo.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </button>
  );
});
