"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { LibraryView } from "@/components/library/LibraryToolbar";
import type { MenuAction } from "@/components/library/menu-actions";
import { useDocumentShortcuts } from "@/components/library/useDocumentShortcuts";
import type { LibraryDocument } from "@/lib/Library/document-info";
import DocumentCard from "./documentCard";
import DocumentRow from "./documentRow";

interface DocumentTableProps {
  company: string;
  documents: LibraryDocument[];
  view: LibraryView;
  onRefresh: () => Promise<void>;
  onView: (id: number) => void;
  /** Mueve un documento, o la selección donde esté incluido, a otra carpeta. */
  onMove?: (id: number) => void;
  onCopy?: (id: number) => void;
  onToggleFavorite?: (id: number, favorite: boolean) => void;
  showDepartment?: boolean;
  canManage: boolean;
  isDipDirector: boolean;
  user: any;
  selectedIds?: number[];
  onSelectionChange?: (ids: number[]) => void;
  folderPath?: string;
  showFolderPath?: boolean;
  /** Atajos de teclado activos; se apagan con un visor o un panel encima. */
  shortcutsEnabled?: boolean;
}

/**
 * Los documentos de la carpeta abierta, en lista o en cuadrícula. La selección,
 * el arrastre y las acciones son los mismos en las dos vistas: solo cambia
 * cómo se pinta cada documento.
 */
function DocumentTable({
  company,
  documents,
  view,
  onRefresh,
  onView,
  onMove,
  onCopy,
  onToggleFavorite,
  showDepartment = false,
  canManage,
  isDipDirector,
  user,
  selectedIds = [],
  onSelectionChange,
  folderPath,
  showFolderPath = false,
  shortcutsEnabled = true,
}: DocumentTableProps) {
  const selectionEnabled = !!(onSelectionChange && canManage);

  // Se cuenta solo lo que está a la vista: una selección que incluya ids de
  // otra vista no debe dar "todos seleccionados" ni contadores inflados.
  const selectedHere = useMemo(() => {
    const visible = new Set(documents.map((d) => d.id));
    return selectedIds.filter((id) => visible.has(id));
  }, [documents, selectedIds]);
  const selectedSet = useMemo(() => new Set(selectedHere), [selectedHere]);

  const allSelected =
    documents.length > 0 && selectedHere.length === documents.length;
  const someSelected = selectedHere.length > 0 && !allSelected;

  const handleToggleAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? [] : documents.map((d) => d.id));
  };

  // La selección vigente se lee de una referencia: así el handler no cambia
  // en cada selección y los documentos (memoizados) no se repintan todos.
  const selectedRef = useRef(selectedIds);
  useEffect(() => {
    selectedRef.current = selectedIds;
  }, [selectedIds]);

  // Arrastrar uno seleccionado lleva toda la selección; uno suelto, solo él.
  const getDragIds = useCallback((id: number) => {
    const current = selectedRef.current;
    return current.length > 1 && current.includes(id) ? current : [id];
  }, []);

  const handleToggleOne = useCallback(
    (id: number) => {
      if (!onSelectionChange) return;
      const current = selectedRef.current;
      onSelectionChange(
        current.includes(id)
          ? current.filter((sid) => sid !== id)
          : [...current, id],
      );
    },
    [onSelectionChange],
  );

  // Cursor del teclado: el documento al que apuntan las flechas. Si el listado
  // cambia y ya no está, deja de valer sin tener que reiniciarlo.
  const [cursorId, setActiveId] = useState<number | null>(null);
  const activeId =
    cursorId !== null && documents.some((d) => d.id === cursorId)
      ? cursorId
      : null;
  const gridRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cada documento entrega aquí las acciones de su menú: así el teclado usa
  // las mismas (con los mismos permisos) que el «⋯» y el clic derecho.
  const actionsRegistry = useRef(new Map<number, MenuAction[]>());
  const registerActions = useCallback(
    (id: number, actions: MenuAction[] | null) => {
      if (actions) actionsRegistry.current.set(id, actions);
      else actionsRegistry.current.delete(id);
    },
    [],
  );
  const runAction = useCallback((id: number, key: string) => {
    const action = actionsRegistry.current.get(id)?.find((a) => a.key === key);
    action?.onSelect();
    return !!action;
  }, []);

  useDocumentShortcuts({
    enabled: shortcutsEnabled,
    documents,
    view,
    gridRef,
    activeId,
    setActiveId,
    selectedIds: selectedHere,
    onSelectionChange: selectionEnabled ? onSelectionChange : undefined,
    runAction,
  });

  // El cursor siempre queda a la vista.
  useEffect(() => {
    if (activeId === null) return;
    containerRef.current
      ?.querySelector(`[data-doc-id="${activeId}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  const shared = {
    registerActions,
    onActivate: setActiveId,
    company,
    onView,
    onRefresh,
    onMove,
    onCopy,
    onToggleFavorite,
    showDepartment,
    canManage,
    isDipDirector,
    user,
    onToggleSelect: selectionEnabled ? handleToggleOne : undefined,
    getDragIds,
    folderPath,
    showFolderPath,
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div ref={containerRef} className="@container">
        {selectionEnabled && (
          <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-2 max-sm:px-3">
            <Checkbox
              checked={someSelected ? "indeterminate" : allSelected}
              onCheckedChange={handleToggleAll}
              aria-label="Seleccionar todos"
            />
            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
              {selectedHere.length > 0
                ? `${selectedHere.length} ${selectedHere.length === 1 ? "seleccionado" : "seleccionados"}`
                : "Seleccionar todos"}
            </span>
          </div>
        )}

        {view === "grid" ? (
          <div
            ref={gridRef}
            className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3 p-4 max-sm:p-3 sm:grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]"
          >
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                selected={selectedSet.has(doc.id)}
                selectionActive={selectedHere.length > 0}
                active={doc.id === activeId}
                {...shared}
              />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {documents.map((doc) => (
              <DocumentRow
                key={doc.id}
                doc={doc}
                selected={selectedSet.has(doc.id)}
                active={doc.id === activeId}
                {...shared}
              />
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

// Escribir en el buscador repinta la página: la tabla solo se repinta si cambió algo suyo.
export default memo(DocumentTable);
