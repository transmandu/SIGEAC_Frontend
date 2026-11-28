"use client";

import { memo, useState, useEffect, useRef } from "react";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Loader2,
  Lock,
} from "lucide-react";
import { ActionMenuItems } from "@/components/library/ActionMenuItems";
import {
  ActionsContextMenu,
  useContextMenu,
} from "@/components/library/ActionsContextMenu";
import { folderActions } from "@/components/library/menu-actions";
import { FolderNode } from "@/lib/libraryService";
import {
  hasDraggedDocuments,
  readDraggedDocumentIds,
} from "@/lib/Library/drag";
import { isOwnEvent } from "@/lib/Library/shortcuts";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Punto de color que distingue un departamento de otro.
const DEPARTMENT_DOTS = [
  "bg-blue-500",
  "bg-orange-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-amber-700",
  "bg-purple-500",
  "bg-pink-500",
  "bg-teal-500",
];

function getDeptShape(index: number) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-2.5 shrink-0 rounded-full",
        DEPARTMENT_DOTS[index % DEPARTMENT_DOTS.length],
      )}
    />
  );
}

export interface DepartmentFolderGroup {
  departmentId: number;
  departmentName: string;
  folders: FolderNode[];
  department_parent_id?: number | null;
  descendants?: DepartmentFolderGroup[];
}

interface FolderTreeProps {
  departmentFolders: DepartmentFolderGroup[];
  isMultiDept: boolean;
  selectedDeptName: string | null;
  selectedFolderPath: string | null;
  onSelect: (folderPath: string, departmentName: string) => void;
  onRename: (
    folder: FolderNode,
    departmentId: number,
    departmentName: string,
  ) => void;
  onDelete: (
    folder: FolderNode,
    departmentId: number,
    departmentName: string,
  ) => void;
  onAccess: (
    folder: FolderNode,
    departmentId: number,
    departmentName: string,
  ) => void;
  onShare: (
    folder: FolderNode,
    departmentId: number,
    departmentName: string,
  ) => void;
  onDropDocument: (
    documentIds: number[],
    folderPath: string,
    departmentId: number,
    departmentName: string,
  ) => void;
  onToggleDept?: (departmentId: number) => void;
  companySlug: string;
  loadingDeptIds?: number[];
  canManage: boolean;
}

function FolderNodeRow({
  node,
  selectedFolderPath,
  onSelect,
  onRename,
  onDelete,
  onAccess,
  onShare,
  onDropDocument,
  canManage,
  departmentId,
  departmentName,
  level = 0,
  isExpanded,
  onToggleFolder,
  expandedFolders,
}: {
  node: FolderNode;
  selectedFolderPath: string | null;
  onSelect: (path: string, deptName: string) => void;
  onRename: (folder: FolderNode, deptId: number, deptName: string) => void;
  onDelete: (folder: FolderNode, deptId: number, deptName: string) => void;
  onAccess: (folder: FolderNode, deptId: number, deptName: string) => void;
  onShare: (folder: FolderNode, deptId: number, deptName: string) => void;
  onDropDocument: (
    documentIds: number[],
    folderPath: string,
    deptId: number,
    deptName: string,
  ) => void;
  canManage: boolean;
  departmentId: number;
  departmentName: string;
  level: number;
  isExpanded: boolean;
  onToggleFolder: (path: string) => void;
  expandedFolders: Record<string, boolean>;
}) {
  const [dragOver, setDragOver] = useState(false);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedFolderPath === node.path;

  const handleDrop = (e: React.DragEvent) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const ids = readDraggedDocumentIds(e.dataTransfer);
    if (ids.length > 0) {
      onDropDocument(ids, node.path, departmentId, departmentName);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    // Solo documentos de la biblioteca: un archivo del escritorio se sube al
    // panel de contenido, no se suelta sobre una carpeta del árbol.
    if (!canManage || !hasDraggedDocuments(e.dataTransfer)) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!canManage) return;
    // Pasar a un hijo de la fila (icono, texto) no es salir de ella.
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const isRoot = node.id === "root";

  // Las mismas acciones en el «⋯» y en el clic derecho; el clic derecho además
  // ofrece abrir la carpeta. La raíz del departamento no tiene menú.
  const contextMenu = useContextMenu();
  const menuActions = isRoot
    ? []
    : folderActions({
        node,
        canManage,
        onOpen: () => onSelect(node.path, departmentName),
        onRename: () => onRename(node, departmentId, departmentName),
        onAccess: () => onAccess(node, departmentId, departmentName),
        onShare: () => onShare(node, departmentId, departmentName),
        onDelete: () => onDelete(node, departmentId, departmentName),
      });
  const actions = menuActions.filter((action) => action.key !== "open");

  return (
    <div>
      <div
        className={cn(
          "group relative flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium motion-safe:transition-colors max-md:py-2.5",
          isSelected
            ? "bg-primary/10 font-semibold text-primary"
            : dragOver
              ? "bg-primary/5 text-primary ring-2 ring-primary/40"
              : "text-slate-700 hover:bg-muted/60 dark:text-slate-300",
        )}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={(e) => {
          // El menú y sus diálogos cuelgan de la fila (portal): un clic en ellos
          // no debe abrir la carpeta.
          if (isOwnEvent(e)) onSelect(node.path, departmentName);
        }}
        onContextMenu={
          menuActions.length > 0 ? contextMenu.onContextMenu : undefined
        }
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        data-tour="biblioteca-folder-node"
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={isExpanded ? "Contraer carpeta" : "Expandir carpeta"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFolder(node.path);
            }}
            className="rounded p-0.5 hover:bg-muted"
          >
            {isExpanded ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {isExpanded ? (
          <FolderOpen className="size-4 shrink-0" />
        ) : (
          <Folder className="size-4 shrink-0" />
        )}

        <span
          className={cn(
            "flex-1 truncate",
            node.navigation_only && "opacity-60",
          )}
        >
          {node.name}
        </span>

        {node.restricted && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Lock
                className="size-3.5 shrink-0 text-amber-500"
                aria-label="Carpeta con acceso restringido"
              />
            </TooltipTrigger>
            <TooltipContent>
              {typeof node.member_count === "number"
                ? `Acceso restringido · ${node.member_count} ${node.member_count === 1 ? "persona" : "personas"}`
                : "Acceso restringido"}
            </TooltipContent>
          </Tooltip>
        )}

        {actions.length > 0 && (
          <div data-tour="biblioteca-folder-actions">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={`Acciones de ${node.name}`}
                  onClick={(e) => e.stopPropagation()}
                  className="grid size-6 place-items-center rounded-md opacity-0 outline-hidden hover:bg-muted focus-visible:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100 pointer-coarse:opacity-100 max-md:size-8"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-44">
                <ActionMenuItems actions={actions} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <ActionsContextMenu
          point={contextMenu.point}
          onClose={contextMenu.close}
          actions={menuActions}
        />
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <FolderNodeRow
              key={child.id}
              node={child}
              selectedFolderPath={selectedFolderPath}
              onSelect={onSelect}
              onRename={onRename}
              onDelete={onDelete}
              onAccess={onAccess}
              onShare={onShare}
              onDropDocument={onDropDocument}
              canManage={canManage}
              departmentId={departmentId}
              departmentName={departmentName}
              level={level + 1}
              isExpanded={!!expandedFolders[`${departmentId}:${child.path}`]}
              onToggleFolder={onToggleFolder}
              expandedFolders={expandedFolders}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FolderTree({
  departmentFolders,
  isMultiDept,
  selectedDeptName,
  selectedFolderPath,
  onSelect,
  onRename,
  onDelete,
  onAccess,
  onShare,
  onDropDocument,
  onToggleDept,
  loadingDeptIds = [],
  canManage,
  companySlug,
}: FolderTreeProps) {
  // Con varios departamentos el usuario abre y cierra cada uno; con uno solo
  // siempre está abierto.
  const [openedDepts, setExpandedDepts] = useState<number[]>([]);
  const expandedDepts = isMultiDept
    ? openedDepts
    : departmentFolders.map((d) => d.departmentId);

  const STORAGE_KEY = `biblioteca_expanded_folders_` + companySlug;

  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleToggleFolder = (deptId: number, path: string) => {
    const key = `${deptId}:${path}`;
    setExpandedFolders((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggledDepts = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!isMultiDept && departmentFolders.length > 0) {
      departmentFolders.forEach((d) => {
        if (
          d.folders.length === 0 &&
          !toggledDepts.current.has(d.departmentId)
        ) {
          toggledDepts.current.add(d.departmentId);
          onToggleDept?.(d.departmentId);
        }
      });
    }
  }, [departmentFolders, isMultiDept, onToggleDept]);

  const toggleDept = (id: number) => {
    // La decisión y el aviso al padre van fuera de la función actualizadora:
    // React la ejecuta durante el render y el padre (`onToggleDept`) hace
    // setState, lo que dispara «Cannot update a component while rendering».
    if (openedDepts.includes(id)) {
      setExpandedDepts(openedDepts.filter((n) => n !== id));
      return;
    }

    setExpandedDepts([...openedDepts, id]);
    onToggleDept?.(id);
  };

  const renderDept = (dept: DepartmentFolderGroup, idx: number, depth = 0) => {
    const isDeptExpanded = expandedDepts.includes(dept.departmentId);
    const isLoading = loadingDeptIds.includes(dept.departmentId);
    const isSelected =
      selectedDeptName === dept.departmentName && selectedFolderPath === "/";

    return (
      <div key={dept.departmentId}>
        <div
          className={cn(
            "flex w-full items-center gap-1 rounded-lg p-1 motion-safe:transition-colors",
            isSelected ? "bg-primary/10" : "hover:bg-muted/60",
          )}
          data-tour="biblioteca-dept-row"
        >
          {isMultiDept && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleDept(dept.departmentId);
              }}
              type="button"
              aria-label={
                isDeptExpanded
                  ? "Contraer departamento"
                  : "Expandir departamento"
              }
              className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted max-md:p-2.5"
            >
              {isDeptExpanded || (dept.folders.length > 0 && !isLoading) ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </button>
          )}
          <button
            onClick={() => onSelect("/", dept.departmentName)}
            type="button"
            className={cn(
              "flex flex-1 items-center gap-2.5 truncate p-1.5 text-left text-sm font-semibold max-md:py-2.5",
              isSelected
                ? "text-primary"
                : "text-slate-700 dark:text-slate-200",
            )}
          >
            {getDeptShape(idx + depth)}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate">{dept.departmentName}</span>
              </TooltipTrigger>
              <TooltipContent>{dept.departmentName}</TooltipContent>
            </Tooltip>
            {isLoading && (
              <Loader2 className="ml-1 size-3.5 shrink-0 animate-spin text-primary" />
            )}
          </button>
        </div>

        {isDeptExpanded && (
          <div className="mb-2 ml-2.5 mt-1 border-l border-border/60 pl-2.5">
            {isLoading && dept.folders.length === 0 ? (
              <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                Cargando carpetas...
              </div>
            ) : (
              <FolderNodeRow
                node={{
                  id: "root",
                  name: "Raíz",
                  path: "/",
                  children: dept.folders,
                }}
                // Una ruta como «/Manuales» puede existir en varios departamentos:
                // solo se resalta la del departamento que está abierto.
                selectedFolderPath={
                  selectedDeptName === dept.departmentName
                    ? selectedFolderPath
                    : null
                }
                onSelect={onSelect}
                onRename={onRename}
                onDelete={onDelete}
                onAccess={onAccess}
                onShare={onShare}
                onDropDocument={onDropDocument}
                canManage={canManage}
                departmentId={dept.departmentId}
                departmentName={dept.departmentName}
                level={0}
                isExpanded={!!expandedFolders[`${dept.departmentId}:/`]}
                onToggleFolder={(path: string) =>
                  handleToggleFolder(dept.departmentId, path)
                }
                expandedFolders={expandedFolders}
              />
            )}

            {Array.isArray(dept.descendants) &&
              dept.descendants.map((childDept, ci) => (
                <div key={childDept.departmentId} className="mt-2">
                  {renderDept(childDept, idx + ci + 1, depth + 1)}
                </div>
              ))}
          </div>
        )}
      </div>
    );
  };

  if (departmentFolders.length === 0) {
    return (
      <p className="px-2 py-6 text-center text-sm text-muted-foreground">
        No tiene departamentos asignados.
      </p>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-0.5">
        {departmentFolders.map((d, i) => renderDept(d, i, 0))}
      </div>
    </TooltipProvider>
  );
}

export default memo(FolderTree);
