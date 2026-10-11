"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Department } from "@/types";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import {
  ArrowDown,
  ArrowUp,
  Building2,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  GripVertical,
  Landmark,
  Network,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toolbarBarClass, toolbarFieldClass, toolbarIconButtonClass } from "./theme";
import { toneFor } from "./tones";

export const ROOT_DROP_ID = "drop-root";
export const dragId = (id: number) => `dept-${id}`;
export const dropId = (id: number) => `drop-${id}`;

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();

/** Conserva los nodos que coinciden y los ancestros que llevan a una coincidencia. */
const filterTree = (nodes: Department[], query: string): Department[] =>
  nodes.flatMap((node) => {
    const children = filterTree(node.children ?? [], query);
    const matches =
      normalize(node.full_name).includes(query) || normalize(node.acronym).includes(query);

    return matches || children.length ? [{ ...node, children }] : [];
  });

const parentIds = (nodes: Department[]): number[] =>
  nodes.flatMap((node) =>
    node.children?.length ? [node.id, ...parentIds(node.children)] : [],
  );

interface NodeProps {
  node: Department;
  depth: number;
  index: number;
  siblings: Department[];
  parentId: number | null;
  selectedId: number | null;
  collapsed: Set<number>;
  forceOpen: boolean;
  onToggle: (id: number) => void;
  onSelect: (id: number) => void;
  onAddChild: (parentId: number) => void;
  onReorder: (parentId: number | null, orderedIds: number[]) => void;
}

function TreeNode({
  node,
  depth,
  index,
  siblings,
  parentId,
  selectedId,
  collapsed,
  forceOpen,
  onToggle,
  onSelect,
  onAddChild,
  onReorder,
}: NodeProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({ id: dragId(node.id) });
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: dropId(node.id) });

  const children = node.children ?? [];
  const hasChildren = children.length > 0;
  const open = hasChildren && (forceOpen || !collapsed.has(node.id));
  const selected = selectedId === node.id;
  const tone = toneFor(node.department_type_id);
  const Icon = depth === 0 ? Landmark : hasChildren ? Network : Building2;

  const sites = (node.locations ?? [])
    .filter((entry) => entry.is_active && entry.location)
    .map((entry) => entry.location!.cod_iata);

  const swap = (offset: -1 | 1) => {
    const ids = siblings.map((sibling) => sibling.id);
    const target = index + offset;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    onReorder(parentId, ids);
  };

  return (
    <li>
      <div
        ref={(element) => {
          setDragRef(element);
          setDropRef(element);
        }}
        className={cn(
          "group relative flex items-center gap-1.5 rounded-xl border border-transparent px-1.5 py-1.5 transition-all",
          selected ? "bg-primary/8 border-primary/30 shadow-xs" : "hover:bg-muted/60",
          isOver && !isDragging && "bg-primary/12 ring-primary/60 ring-2",
          isDragging && "opacity-40",
          !node.is_active && "opacity-70",
        )}
      >
        <button
          type="button"
          aria-label="Arrastrar para mover"
          className="text-muted-foreground/60 hover:text-foreground cursor-grab touch-none rounded-md p-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <button
          type="button"
          aria-label={open ? "Contraer" : "Expandir"}
          disabled={!hasChildren}
          onClick={() => onToggle(node.id)}
          className="text-muted-foreground hover:bg-muted grid size-5 shrink-0 place-content-center rounded-md disabled:opacity-0"
        >
          <ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} />
        </button>

        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          <span className={cn("grid size-9 shrink-0 place-content-center rounded-lg", tone.tile)}>
            <Icon className="size-4.5" />
          </span>

          <span className="min-w-0">
            <span
              className={cn(
                "block truncate text-sm leading-tight font-medium",
                !node.is_active && "line-through decoration-1",
              )}
            >
              {node.full_name}
            </span>
            <span className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
              <span className="font-mono tracking-wide">{node.acronym}</span>
              {sites.length > 0 && (
                <>
                  <span className="bg-border size-1 rounded-full" />
                  <span className="truncate">{sites.join(" · ")}</span>
                </>
              )}
              {!node.is_active && (
                <>
                  <span className="bg-border size-1 rounded-full" />
                  <span>Inactivo</span>
                </>
              )}
            </span>
          </span>
        </button>

        {typeof node.employees_count === "number" && node.employees_count > 0 && (
          <span className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs tabular-nums">
            <Users className="size-3.5" />
            {node.employees_count}
          </span>
        )}

        <div className="flex shrink-0 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Subir"
            title="Subir"
            disabled={forceOpen || index === 0}
            onClick={() => swap(-1)}
          >
            <ArrowUp className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Bajar"
            title="Bajar"
            disabled={forceOpen || index === siblings.length - 1}
            onClick={() => swap(1)}
          >
            <ArrowDown className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Agregar departamento dependiente"
            title="Agregar dependiente"
            onClick={() => onAddChild(node.id)}
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>

      {open && (
        <ul className="border-border/70 mt-0.5 ml-5.5 space-y-0.5 border-l pl-2">
          {children.map((child, childIndex) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              index={childIndex}
              siblings={children}
              parentId={node.id}
              selectedId={selectedId}
              collapsed={collapsed}
              forceOpen={forceOpen}
              onToggle={onToggle}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onReorder={onReorder}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

interface TreeProps {
  nodes: Department[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAddChild: (parentId: number) => void;
  onReorder: (parentId: number | null, orderedIds: number[]) => void;
}

export function DepartmentTree({ nodes, selectedId, onSelect, onAddChild, onReorder }: TreeProps) {
  const { setNodeRef, isOver } = useDroppable({ id: ROOT_DROP_ID });

  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const needle = normalize(query);
  const visible = useMemo(() => (needle ? filterTree(nodes, needle) : nodes), [nodes, needle]);

  const toggle = (id: number) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return (
    <div className="space-y-3">
      <div className={toolbarBarClass}>
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre o siglas..."
            className={cn(toolbarFieldClass, "pr-8 pl-8")}
          />
          {query && (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className={toolbarIconButtonClass}
          aria-label="Expandir todo"
          title="Expandir todo"
          onClick={() => setCollapsed(new Set())}
        >
          <ChevronsUpDown className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={toolbarIconButtonClass}
          aria-label="Contraer todo"
          title="Contraer todo"
          onClick={() => setCollapsed(new Set(parentIds(nodes)))}
        >
          <ChevronsDownUp className="size-4" />
        </Button>
      </div>

      {visible.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          Ningún departamento coincide con &quot;{query}&quot;.
        </p>
      ) : (
        <ul className="space-y-0.5">
          {visible.map((node, index) => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              index={index}
              siblings={visible}
              parentId={null}
              selectedId={selectedId}
              collapsed={collapsed}
              forceOpen={needle !== ""}
              onToggle={toggle}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onReorder={onReorder}
            />
          ))}
        </ul>
      )}

      <div
        ref={setNodeRef}
        className={cn(
          "text-muted-foreground rounded-xl border border-dashed px-3 py-2.5 text-center text-xs transition-colors",
          isOver && "border-primary bg-primary/10 text-foreground",
        )}
      >
        Suelta aquí para dejar un departamento en la raíz del organigrama
      </div>
    </div>
  );
}
