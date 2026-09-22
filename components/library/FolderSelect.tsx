"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Folder,
  FolderOpen,
  Loader2,
  Layers,
  Star,
} from "lucide-react";
import { LibraryFolderNode } from "@/types";
import { useGetDepartments } from "@/hooks/ajustes/departamento/useGetDepartment";
import libraryService from "@/lib/libraryService";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormControl } from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface FolderSelectProps {
  company: string | null | undefined;
  departmentAcronym?: string;
  /** Recibe SIEMPRE un array de paths: permite seleccionar varias carpetas. */
  onChange: (folderPaths: string[]) => void;
  value?: string[];
  includeRoot?: boolean;
  /** Muestra/permite marcar la carpeta principal (estrella). */
  withPrimary?: boolean;
  /** Un solo folder: cada selección reemplaza la anterior y no hay estrella. */
  single?: boolean;
}

type ExpandedSet = Set<string>;

/**
 * Devuelve las rutas de todas las carpetas ancestro de las selecciones,
 * incluyendo las propias. Se usa para auto-expandir el árbol hasta las
 * carpetas ya seleccionadas cuando el popover se abre.
 */
function ancestorPaths(values: string[] = []): string[] {
  const paths: string[] = ["/"];
  for (const value of values) {
    if (!value || value === "/") continue;
    const segments = value.replace(/^\/+/, "").split("/").filter(Boolean);
    segments.reduce((current, segment) => {
      const next = `${current}/${segment}`;
      paths.push(next);
      return next;
    }, "");
  }
  return paths;
}

/** Convierte una ruta técnica en una etiqueta legible ("/A/B" -> "A / B"). */
function formatPathLabel(value: string): string {
  if (!value || value === "/") return "Raíz";
  return value
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .join(" / ");
}

interface FolderRowProps {
  node: LibraryFolderNode;
  level: number;
  selected: Set<string>;
  expanded: ExpandedSet;
  onToggle: (path: string) => void;
  onSetPrimary: (path: string) => void;
  primary: string | null;
  showPrimary: boolean;
}

function FolderRow({
  node,
  level,
  selected,
  expanded,
  onToggle,
  onSetPrimary,
  primary,
  showPrimary,
}: FolderRowProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded.has(node.path);
  const isSelected = selected.has(node.path);
  const isPrimary = primary === node.path;

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onToggle(node.path)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle(node.path);
          }
        }}
        className={cn(
          "group flex w-full items-center gap-1.5 py-1.5 px-2 text-sm rounded-md border text-left cursor-pointer transition-colors",
          isSelected
            ? "bg-muted/60 border-border/60 font-medium text-foreground"
            : "border-transparent text-foreground/90 hover:bg-muted/20",
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.path);
            }}
            className="p-0.5 shrink-0 text-muted-foreground/70 hover:bg-muted/40 rounded"
            aria-label={isExpanded ? "Contraer" : "Expandir"}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        {isExpanded ? (
          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-foreground/80" />
        ) : (
          <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
        )}

        <span className="truncate flex-1" title={node.name}>
          {node.name}
        </span>

        {isSelected && showPrimary && (
          <>
            <button
              type="button"
              title={
                isPrimary
                  ? "Carpeta principal"
                  : "Marcar como carpeta principal"
              }
              aria-label={
                isPrimary ? "Carpeta principal" : "Marcar como principal"
              }
              onClick={(e) => {
                e.stopPropagation();
                onSetPrimary(node.path);
              }}
              className={cn(
                "p-0.5 shrink-0 rounded hover:bg-muted/50 transition-colors",
                isPrimary ? "text-amber-400" : "text-muted-foreground/50",
              )}
            >
              <Star
                className={cn("h-3.5 w-3.5", isPrimary ? "fill-amber-400" : "")}
              />
            </button>
          </>
        )}
        {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
      </div>

      {hasChildren && isExpanded && (
        <div className="pl-3 border-l border-border/40">
          {node.children.map((child) => (
            <FolderRow
              key={child.id}
              node={child}
              level={level + 1}
              selected={selected}
              expanded={expanded}
              onToggle={onToggle}
              onSetPrimary={onSetPrimary}
              primary={primary}
              showPrimary={showPrimary}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FolderSelect({
  company,
  departmentAcronym = "SMS",
  onChange,
  value = [],
  includeRoot = true,
  withPrimary = true,
  single = false,
}: FolderSelectProps) {
  const [open, setOpen] = useState(false);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [folders, setFolders] = useState<LibraryFolderNode[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [expanded, setExpanded] = useState<ExpandedSet>(() => {
    // Por defecto la raíz viene expandida.
    return includeRoot ? new Set(["/"]) : new Set<string>();
  });
  const [draft, setDraft] = useState<Set<string>>(new Set(value));
  const [primary, setPrimary] = useState<string | null>(value[0] ?? null);

  const { data: departments, isLoading: loadingDept } = useGetDepartments(
    company ?? undefined,
  );

  const smsDepartment = useMemo(
    () =>
      departments?.find(
        (dep) =>
          dep.acronym?.toUpperCase() === departmentAcronym.toUpperCase() ||
          dep.name?.toUpperCase() === departmentAcronym.toUpperCase(),
      ),
    [departments, departmentAcronym],
  );

  useEffect(() => {
    if (smsDepartment && smsDepartment.id !== departmentId) {
      setDepartmentId(smsDepartment.id);
    }
  }, [smsDepartment, departmentId]);

  useEffect(() => {
    if (!smsDepartment) return;

    setLoadingFolders(true);
    libraryService
      .getFolders(company ?? "", smsDepartment.id)
      .then((res) => setFolders(res.folders || []))
      .catch(() => setFolders([]))
      .finally(() => setLoadingFolders(false));
  }, [smsDepartment, company]);

  // Al abrir el popover, expandir el árbol hasta las carpetas seleccionadas y
  // tomar como borrador la selección vigente. La carpeta principal es la que
  // ocupa el índice [0] del array (convención: principal primero).
  useEffect(() => {
    if (open) {
      setExpanded(new Set([...ancestorPaths(value)]));
      setDraft(new Set(value));
      setPrimary(value[0] ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggle = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const toggleSelection = (path: string) => {
    if (single) {
      // En modo single la selección reemplaza la anterior.
      setDraft(new Set([path]));
      return;
    }
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const setPrimarySelection = (path: string) => {
    setDraft((prev) => {
      const next = new Set(prev);
      next.add(path);
      return next;
    });
    setPrimary(path);
  };

  const apply = () => {
    if (single) {
      onChange([...draft]);
      setOpen(false);
      return;
    }
    // La carpeta principal va SIEMPRE primero en el array; el backend la usa
    // como carpeta física/primaria (folderPath === folderPaths[0]).
    const next =
      withPrimary && primary
        ? [primary, ...[...draft].filter((p) => p !== primary).sort()]
        : [...draft].sort();
    onChange(next);
    setOpen(false);
  };

  const clearSelection = () => {
    setDraft(new Set());
    setPrimary(null);
  };

  const rootNode: LibraryFolderNode = {
    id: "root",
    name: "Raíz",
    path: "/",
    children: folders,
  };

  const isLoading = !company || loadingDept || loadingFolders;
  const hasFolders = folders.length > 0;
  const selectedCount = value.length;

  const triggerLabel = useMemo(() => {
    if (value.length === 0) return "Sin carpetas seleccionadas";
    if (value.length === 1) return formatPathLabel(value[0]);
    if (withPrimary) {
      const rest = value.length - 1;
      return `${formatPathLabel(value[0])} +${rest} más`;
    }
    return `${value.length} carpetas seleccionadas`;
  }, [value, withPrimary]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            type="button"
            disabled={loadingDept && !company}
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal h-9",
              !value.length && "text-muted-foreground",
            )}
          >
            <span className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
              {value.length > 1 ? (
                <Layers className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
              ) : (
                <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
              )}
              <span className="truncate min-w-0" title={triggerLabel}>
                {triggerLabel}
              </span>
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>

      <PopoverContent
        className="w-[min(420px,calc(100vw-1.5rem))] p-0"
        align="start"
        sideOffset={4}
      >
        <div className="border-b border-border/50 px-3 py-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {smsDepartment?.name ?? departmentAcronym}
          </p>
          <p className="mt-0.5 text-[13px] leading-snug text-foreground/90">
            {value.length === 0
              ? "Sin carpetas seleccionadas"
              : value.length === 1
                ? formatPathLabel(value[0])
                : `${value.length} carpetas seleccionadas`}
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            Cargando carpetas...
          </div>
        )}

        {!isLoading && !smsDepartment && (
          <p className="px-3 py-4 text-sm text-muted-foreground">
            No se encontró el departamento {departmentAcronym}.
          </p>
        )}

        {!isLoading && smsDepartment && !hasFolders && (
          <p className="px-3 py-4 text-sm text-muted-foreground">
            No hay carpetas disponibles. Créelas desde el módulo Librería.
          </p>
        )}

        {!isLoading && smsDepartment && hasFolders && (
          <>
            <div className="max-h-72 overflow-y-auto">
              <p className="px-3 pt-2 pb-1 text-[11px] leading-snug text-muted-foreground">
                {single
                  ? "Selecciona la carpeta donde se guardará el documento."
                  : withPrimary
                    ? "Marca las carpetas donde aparecerá el documento y usa la estrella para fijar la principal."
                    : "Marca las carpetas donde aparecerá el documento. Puedes seleccionar varias."}
              </p>
              <div className="p-1">
                {includeRoot && (
                  <FolderRow
                    node={rootNode}
                    level={0}
                    selected={draft}
                    expanded={expanded}
                    onToggle={toggleSelection}
                    onSetPrimary={setPrimarySelection}
                    primary={withPrimary && !single ? primary : null}
                    showPrimary={withPrimary && !single}
                  />
                )}
                {!includeRoot &&
                  folders.map((node) => (
                    <FolderRow
                      key={node.id}
                      node={node}
                      level={0}
                      selected={draft}
                      expanded={expanded}
                      onToggle={toggleSelection}
                      onSetPrimary={setPrimarySelection}
                      primary={withPrimary && !single ? primary : null}
                      showPrimary={withPrimary && !single}
                    />
                  ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border/50 p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={clearSelection}
              >
                Limpiar
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 text-xs"
                onClick={apply}
                disabled={draft.size === 0}
              >
                Aplicar ({draft.size})
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
