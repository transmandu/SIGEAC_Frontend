"use client";

import { useState } from "react";

import { useAssignArticleDocumentRequirements } from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useGetArticleDocumentTypes } from "@/hooks/mantenimiento/almacen/articulos/useGetArticleDocumentTypes";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Check, CircleAlert, Loader2, Search } from "lucide-react";

interface Props {
  articleId: number;
  /** Tipos ya declarados, para no volver a ofrecerlos. */
  assignedTypeIds?: number[];
  onAssigned?: () => void;
}

/**
 * Selección de los documentos que un artículo exige.
 *
 * Se monta embebido y no en un diálogo propio: vive dentro de la ficha del
 * artículo, que ya es un diálogo, y apilar uno encima obligaba a cerrar dos
 * cosas para volver a lo que se estaba viendo. Tampoco reutiliza el formulario
 * de edición: ahí esto es un campo entre treinta, y lo que hace falta aquí es
 * responder una sola pregunta —qué papeles le corresponden— sin tocar el resto
 * del artículo ni competir con el botón de editar.
 */
export function AssignDocumentRequirements({
  articleId,
  assignedTypeIds = [],
  onAssigned,
}: Props) {
  const { selectedCompany } = useCompanyStore();
  const { data: types, isLoading } = useGetArticleDocumentTypes(
    selectedCompany?.slug,
  );
  const { assignArticleDocumentRequirements } =
    useAssignArticleDocumentRequirements();

  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  const assigned = new Set(assignedTypeIds);
  const available = (types ?? []).filter((type) => !assigned.has(type.id));

  const q = search.trim().toLowerCase();
  const visible = q
    ? available.filter(
        (type) =>
          type.name.toLowerCase().includes(q) ||
          type.regulation?.toLowerCase().includes(q),
      )
    : available;

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );

  const busy = assignArticleDocumentRequirements.isPending;

  const handleAssign = async () => {
    if (!selectedCompany?.slug || selected.length === 0) return;

    try {
      await assignArticleDocumentRequirements.mutateAsync({
        company: selectedCompany.slug,
        articleId,
        documentTypeIds: selected,
      });

      setSelected([]);
      setSearch("");
      onAssigned?.();
    } catch {
      // El toast de error lo emite la mutación.
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-1 py-3 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        Cargando tipos de documento...
      </div>
    );
  }

  if (available.length === 0) {
    return (
      <p className="px-1 py-3 text-xs text-muted-foreground">
        No hay más tipos de documento en el catálogo para asignar.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {available.length > 6 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tipo de documento..."
            className="h-8 bg-background pl-8 text-xs"
          />
        </div>
      )}

      <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
        {visible.map((type) => {
          const checked = selected.includes(type.id);

          return (
            <label
              key={type.id}
              className={cn(
                "flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2 transition-colors",
                // Dentro de la sección teñida, un no-marcado en naranja claro se
                // perdía en el fondo: el fondo opaco es lo que hace legible la
                // diferencia entre marcado y no marcado.
                checked
                  ? "border-orange-500 bg-orange-100 dark:border-orange-500/70 dark:bg-orange-900/40"
                  : "border-border/60 bg-background hover:bg-muted/60",
              )}
            >
              <Checkbox
                checked={checked}
                disabled={busy}
                onCheckedChange={() => toggle(type.id)}
                className="mt-0.5"
              />
              <span className="min-w-0">
                <span className="block text-xs font-semibold">{type.name}</span>
                {type.regulation && (
                  <span className="block text-[10px] text-muted-foreground">
                    {type.regulation}
                  </span>
                )}
              </span>
            </label>
          );
        })}

        {visible.length === 0 && (
          <p className="px-1 py-2 text-xs text-muted-foreground">
            Ningún tipo coincide con &quot;{search}&quot;.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-orange-300/60 pt-3 dark:border-orange-700/50">
        <span className="text-[11px] text-orange-900/70 dark:text-orange-200/70">
          {selected.length === 0
            ? "Marca los documentos que exige este artículo."
            : `${selected.length} seleccionado${selected.length === 1 ? "" : "s"}.`}
        </span>

        <Button
          size="sm"
          disabled={busy || selected.length === 0}
          onClick={handleAssign}
          className="h-7 gap-1.5 bg-orange-600 text-xs text-white hover:bg-orange-700 disabled:bg-muted disabled:text-muted-foreground"
        >
          {busy ? (
            <Loader2 className="size-3 animate-spin" />
          ) : selected.length > 0 ? (
            <Check className="size-3" />
          ) : (
            <CircleAlert className="size-3" />
          )}
          Indicar documentación
        </Button>
      </div>
    </div>
  );
}
