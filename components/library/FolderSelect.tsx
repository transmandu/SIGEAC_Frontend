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
  onChange: (folderPath: string) => void;
  value?: string;
  includeRoot?: boolean;
}

type ExpandedSet = Set<string>;

/**
 * Devuelve las rutas de todas las carpetas ancestro de la selección,
 * incluyendo la propia. Se usa para auto-expandir el árbol hasta la
 * carpeta ya seleccionada cuando el popover se abre.
 */
function ancestorPaths(value?: string): string[] {
  if (!value || value === "/") return ["/"];
  const segments = value.replace(/^\/+/, "").split("/").filter(Boolean);
  const paths: string[] = ["/"];
  let current = "";
  for (const segment of segments) {
    current += "/" + segment;
    paths.push(current);
  }
  return paths;
}

/** Convierte una ruta técnica en una etiqueta legible ("/A/B" -> "A / B"). */
function formatPathLabel(value?: string): string {
  if (!value || value === "/") return "Raíz";
  return value.replace(/^\/+|\/+$/g, "").split("/").join(" / ");
}

interface FolderRowProps {
  node: LibraryFolderNode;
  level: number;
  selected: string;
  expanded: ExpandedSet;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
}

function FolderRow({
  node,
  level,
  selected,
  expanded,
  onSelect,
  onToggle,
}: FolderRowProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded.has(node.path);
  const isSelected = selected === node.path;
  const isRoot = node.id === "root";

  return (
<div>
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelect(node.path)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(node.path);
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

          {isSelected && (
            <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
          )}
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
                onSelect={onSelect}
                onToggle={onToggle}
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
  value,
  includeRoot = true,
}: FolderSelectProps) {
  const [open, setOpen] = useState(false);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [folders, setFolders] = useState<LibraryFolderNode[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [expanded, setExpanded] = useState<ExpandedSet>(() => {
    // Por defecto la raíz viene expandida.
    return includeRoot ? new Set(["/"]) : new Set<string>();
  });

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

  // Al abrir el popover, expandir el árbol hasta la carpeta seleccionada.
  useEffect(() => {
    if (open) {
      setExpanded(new Set([...ancestorPaths(value)]));
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

  const handleSelect = (path: string) => {
    onChange(path);
    setOpen(false);
  };

  const rootNode: LibraryFolderNode = {
    id: "root",
    name: "Raíz",
    path: "/",
    children: folders,
  };

  const isLoading = !company || loadingDept || loadingFolders;
  const hasFolders = folders.length > 0;

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
              !value && "text-muted-foreground",
            )}
          >
            <span className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
              <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
              <span className="truncate min-w-0" title={value ? formatPathLabel(value) : undefined}>
                {value ? formatPathLabel(value) : "Seleccione una carpeta"}
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
          <p
            className="mt-0.5 text-[13px] leading-snug text-foreground/90"
            title={formatPathLabel(value)}
          >
            {value ? formatPathLabel(value) : "Raíz"}
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
          <div className="max-h-72 overflow-y-auto">
            <div className="p-1">
              <FolderRow
                node={rootNode}
                level={0}
                selected={includeRoot ? value ?? "" : ""}
                expanded={expanded}
                onSelect={includeRoot ? handleSelect : () => {}}
                onToggle={toggle}
              />
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}