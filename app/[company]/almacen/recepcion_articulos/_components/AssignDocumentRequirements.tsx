"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

import {
  useAssignArticleDocumentRequirements,
  useConsignRequirementDocuments,
  type RequirementConsignment,
} from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetArticleDocumentTypes } from "@/hooks/mantenimiento/almacen/articulos/useGetArticleDocumentTypes";
import { validateDocumentFile } from "@/lib/warehouse/documents";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  Check,
  CircleAlert,
  FileText,
  Loader2,
  Paperclip,
  Search,
  X,
} from "lucide-react";

interface Props {
  articleId: number;
  /** Tipos ya declarados, para no volver a ofrecerlos. */
  assignedTypeIds?: number[];
  onAssigned?: () => void;
}

/** Cómo llegó cada documento que se indica: en papel, con archivo, o ambos. */
type Support = { isPhysical: boolean; file?: File };

const ACCEPT = "application/pdf,image/jpeg,image/png";

/**
 * Selección de los documentos que un artículo exige.
 *
 * Se monta embebido y no en un diálogo propio: vive dentro de la ficha del
 * artículo, que ya es un diálogo, y apilar uno encima obligaba a cerrar dos
 * cosas para volver a lo que se estaba viendo. Tampoco reutiliza el formulario
 * de edición: ahí esto es un campo entre treinta, y lo que hace falta aquí es
 * responder una sola pregunta —qué papeles le corresponden— sin tocar el resto
 * del artículo ni competir con el botón de editar.
 *
 * Cada documento puede indicarse ya con su soporte: marcarlo recibido en físico
 * y/o adjuntar el archivo. Si no, queda pendiente de consignar, como siempre.
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
  const { consignRequirementDocuments } = useConsignRequirementDocuments();

  const [selected, setSelected] = useState<number[]>([]);
  const [support, setSupport] = useState<Record<number, Support>>({});
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

  // Quitar la marca descarta también lo adjuntado: un archivo de un documento
  // que ya no se exige no debe viajar a escondidas.
  const toggle = (id: number) => {
    if (selected.includes(id)) {
      setSelected((prev) => prev.filter((v) => v !== id));
      setSupport((prev) => {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      });
      return;
    }

    setSelected((prev) => [...prev, id]);
  };

  // Indicar el soporte de un documento es decir que se exige: la fila se marca
  // sola en vez de dejar un adjunto que no se enviaría.
  const updateSupport = (id: number, patch: Partial<Support>) => {
    setSelected((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setSupport((prev) => ({
      ...prev,
      [id]: {
        isPhysical: patch.isPhysical ?? prev[id]?.isPhysical ?? false,
        // `file: undefined` en el parche es "quitar el archivo".
        file: "file" in patch ? patch.file : prev[id]?.file,
      },
    }));
  };

  const busy =
    assignArticleDocumentRequirements.isPending ||
    consignRequirementDocuments.isPending;

  const handleAssign = async () => {
    if (!selectedCompany?.slug || selected.length === 0) return;

    let created;

    try {
      created = await assignArticleDocumentRequirements.mutateAsync({
        company: selectedCompany.slug,
        articleId,
        documentTypeIds: selected,
      });
    } catch {
      // El toast de error lo emite la mutación; la selección se conserva.
      return;
    }

    const consignments: RequirementConsignment[] = created.flatMap(
      (requirement) => {
        const entry = support[requirement.article_document_type_id];

        return entry?.file || entry?.isPhysical
          ? [
              {
                requirementId: requirement.id,
                file: entry.file,
                isPhysical: entry.isPhysical,
              },
            ]
          : [];
      },
    );

    // Los requerimientos ya existen: la selección se vacía aunque el soporte
    // falle después, o quedaría marcando tipos que dejaron de ofrecerse.
    setSelected([]);
    setSupport({});
    setSearch("");
    onAssigned?.();

    if (consignments.length === 0) return;

    try {
      await consignRequirementDocuments.mutateAsync({
        company: selectedCompany.slug,
        consignments,
      });

      toast.success("Documentación consignada", {
        description:
          consignments.length === 1
            ? "Se registró el soporte del documento."
            : `Se registró el soporte de ${consignments.length} documentos.`,
      });
    } catch {
      // El toast de error lo emite la mutación; el documento queda pendiente
      // de consignar.
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
          const entry = support[type.id];

          return (
            <div
              key={type.id}
              className={cn(
                "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border px-3 py-2.5 transition-colors",
                // Dentro de la sección teñida, un no-marcado en naranja claro se
                // perdía en el fondo: el fondo opaco es lo que hace legible la
                // diferencia entre marcado y no marcado.
                checked
                  ? "border-orange-500 bg-orange-100 dark:border-orange-500/70 dark:bg-orange-900/40"
                  : "border-border/60 bg-background hover:bg-muted/60",
              )}
            >
              <label
                htmlFor={`doc-type-${type.id}`}
                className="flex min-w-0 flex-1 basis-40 cursor-pointer items-start gap-2.5"
              >
                <Checkbox
                  id={`doc-type-${type.id}`}
                  checked={checked}
                  disabled={busy}
                  onCheckedChange={() => toggle(type.id)}
                  className="mt-0.5"
                />
                <span className="min-w-0">
                  <span className="block text-xs font-semibold">
                    {type.name}
                  </span>
                  {type.regulation && (
                    <span className="block text-[10px] text-muted-foreground">
                      {type.regulation}
                    </span>
                  )}
                </span>
              </label>

              {/* Soporte del documento: mismo alto en sus dos controles para que
                  la fila no se vea desigual con o sin archivo. */}
              <div className="flex shrink-0 items-center gap-2 max-sm:w-full max-sm:pl-7">
                <label
                  htmlFor={`doc-physical-${type.id}`}
                  className={cn(
                    "flex h-7 cursor-pointer items-center gap-1.5 rounded-md border px-2 text-xs font-medium transition-colors",
                    entry?.isPhysical
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-border/70 bg-background/80 text-muted-foreground hover:bg-muted/60",
                    busy && "cursor-not-allowed opacity-60",
                  )}
                >
                  <Checkbox
                    id={`doc-physical-${type.id}`}
                    checked={entry?.isPhysical ?? false}
                    disabled={busy}
                    onCheckedChange={(value) =>
                      updateSupport(type.id, { isPhysical: value === true })
                    }
                    className="size-3.5"
                  />
                  En físico
                </label>

                <AttachFileButton
                  file={entry?.file}
                  disabled={busy}
                  onChange={(file) => updateSupport(type.id, { file })}
                />
              </div>
            </div>
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
            ? "Marca los documentos que exige este artículo. Si ya llegó alguno, márcalo en físico o adjúntalo."
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

/**
 * Botón de adjuntar de una fila: un icono mientras no hay archivo y, con él, su
 * nombre con la opción de quitarlo. Valida contra las mismas reglas del backend
 * antes de aceptarlo.
 */
function AttachFileButton({
  file,
  disabled,
  onChange,
}: {
  file?: File;
  disabled?: boolean;
  onChange: (file: File | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    event.target.value = "";
    if (!picked) return;

    const error = validateDocumentFile(picked);
    if (error) {
      toast.error(error);
      return;
    }

    onChange(picked);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={handleFile}
      />

      {file ? (
        <span className="inline-flex h-7 max-w-44 items-center gap-1.5 rounded-md border border-teal-500/40 bg-teal-500/10 pr-0.5 pl-2 text-xs font-medium text-teal-700 dark:text-teal-300">
          <FileText className="size-3.5 shrink-0" />
          <span className="truncate" title={file.name}>
            {file.name}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Quitar archivo"
            disabled={disabled}
            onClick={() => onChange(undefined)}
            className="size-6 shrink-0 text-teal-700 hover:bg-teal-500/20 hover:text-teal-800 dark:text-teal-300"
          >
            <X className="size-3" />
          </Button>
        </span>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
                className="h-7 shrink-0 gap-1.5 bg-background/80 px-2 text-xs font-medium text-muted-foreground"
              >
                <Paperclip className="size-3.5" />
                Adjuntar
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Adjuntar archivo (PDF, JPG o PNG)
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
}
