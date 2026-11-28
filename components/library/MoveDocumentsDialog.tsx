"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRightLeft,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { OptionCombobox } from "@/components/forms/general/OptionCombobox";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import {
  PanelSection,
  PanelStaticLabel,
} from "@/components/forms/PanelSection";
import { DepartmentFolderGroup } from "@/components/library/FolderTree";
import { Dialog } from "@/components/ui/dialog";
import libraryService, { FolderNode } from "@/lib/libraryService";
import { notifyError } from "@/lib/notify-error";
import { cn } from "@/lib/utils";

interface MoveDocumentsDialogProps {
  open: boolean;
  /** Mover cambia el documento de sitio; copiar le añade una réplica en otra carpeta. */
  mode?: "move" | "copy";
  onClose: () => void;
  company: string;
  documentIds: number[];
  departmentFolders: DepartmentFolderGroup[];
  departments: { id: number; name: string }[];
  onLoadFolders: (departmentId: number) => void;
  /** Departamentos cuyas carpetas se están pidiendo todavía. */
  loadingDepartmentIds?: number[];
  onSuccess: (
    departmentId: number,
    folderPath: string,
  ) => void | Promise<unknown>;
  /** Carpeta desde la que se mueven los documentos (para distinguir una réplica). */
  sourceFolderPath?: string;
}

function findGroup(
  list: DepartmentFolderGroup[],
  id: number,
): DepartmentFolderGroup | null {
  for (const g of list) {
    if (g.departmentId === id) return g;
    if (g.descendants?.length) {
      const found = findGroup(g.descendants, id);
      if (found) return found;
    }
  }
  return null;
}

const rowClass = (selected: boolean) =>
  cn(
    "flex cursor-pointer items-center gap-1.5 rounded-lg py-1.5 pr-2 text-sm motion-safe:transition-colors max-md:py-2.5",
    selected
      ? "bg-primary/10 font-semibold text-primary"
      : "text-slate-700 hover:bg-muted/60 dark:text-slate-300",
  );

function FolderOptionRow({
  node,
  level,
  selectedPath,
  onSelect,
  expandedFolders,
  onToggle,
}: {
  node: FolderNode;
  level: number;
  selectedPath: string;
  onSelect: (path: string) => void;
  expandedFolders: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  const isExpanded = !!expandedFolders[node.id];
  const hasChildren = node.children.length > 0;
  const isSelected = selectedPath === node.path;

  return (
    <div>
      <div
        role="option"
        aria-selected={isSelected}
        className={rowClass(isSelected)}
        style={{ paddingLeft: `${8 + level * 16}px` }}
        onClick={() => onSelect(node.path)}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={isExpanded ? "Contraer carpeta" : "Expandir carpeta"}
            onClick={(event) => {
              event.stopPropagation();
              onToggle(node.id);
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

        <span className="flex-1 truncate">{node.name}</span>

        {isSelected && <Check className="size-4 shrink-0" />}
      </div>

      {isExpanded &&
        node.children.map((child) => (
          <FolderOptionRow
            key={child.id}
            node={child}
            level={level + 1}
            selectedPath={selectedPath}
            onSelect={onSelect}
            expandedFolders={expandedFolders}
            onToggle={onToggle}
          />
        ))}
    </div>
  );
}

export default function MoveDocumentsDialog({
  open,
  onClose,
  ...form
}: MoveDocumentsDialogProps) {
  const count = form.documentIds.length;
  const copying = form.mode === "copy";

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <FormDialogContent
        icon={copying ? Copy : ArrowRightLeft}
        title={copying ? "Copiar documentos" : "Mover documentos"}
        description={
          copying
            ? `${count} ${count === 1 ? "documento" : "documentos"}: queda una réplica en la carpeta elegida, sin duplicar el archivo.`
            : `${count} ${count === 1 ? "documento seleccionado" : "documentos seleccionados"}`
        }
        className="sm:max-w-xl"
      >
        {/* Dentro del diálogo: al cerrarlo se desmonta y reabre en la raíz del primer departamento. */}
        <MoveDocumentsForm onClose={onClose} {...form} />
      </FormDialogContent>
    </Dialog>
  );
}

function MoveDocumentsForm({
  onClose,
  company,
  documentIds,
  departmentFolders,
  departments,
  onLoadFolders,
  loadingDepartmentIds = [],
  onSuccess,
  sourceFolderPath,
  mode = "move",
}: Omit<MoveDocumentsDialogProps, "open">) {
  const copying = mode === "copy";
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(
    departments[0]?.id ?? null,
  );
  const [selectedPath, setSelectedPath] = useState("/");
  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({});
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    if (selectedDeptId) onLoadFolders(selectedDeptId);
  }, [selectedDeptId, onLoadFolders]);

  const folders = useMemo(
    () =>
      (selectedDeptId
        ? findGroup(departmentFolders, selectedDeptId)?.folders
        : null) ?? [],
    [departmentFolders, selectedDeptId],
  );

  const departmentOptions = useMemo(
    () => departments.map((d) => ({ id: String(d.id), label: d.name })),
    [departments],
  );

  const loadingFolders =
    selectedDeptId !== null && loadingDepartmentIds.includes(selectedDeptId);
  const count = documentIds.length;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedDeptId) return;

    setMoving(true);
    try {
      if (copying) {
        const { copied, skipped } = await libraryService.copyDocuments(
          company,
          {
            document_ids: documentIds,
            department_id: selectedDeptId,
            folder_path: selectedPath,
          },
        );
        const text =
          copied === 0
            ? "Ya estaban en esa carpeta: no se copió nada."
            : `${copied} ${copied === 1 ? "documento copiado" : "documentos copiados"}${
                skipped > 0 ? `; ${skipped} ya estaban en esa carpeta` : ""
              }.`;
        if (copied === 0) toast.info(text);
        else toast.success(text);
      } else {
        await libraryService.moveDocumentsBatch(company, {
          document_ids: documentIds,
          department_id: selectedDeptId,
          folder_path: selectedPath,
          ...(sourceFolderPath != null
            ? { source_folder_path: sourceFolderPath }
            : {}),
        });
        toast.success(
          count === 1 ? "Documento movido" : `${count} documentos movidos`,
        );
      }
      await onSuccess(selectedDeptId, selectedPath);
      onClose();
    } catch (error) {
      notifyError(error, {
        action: copying ? "copiar los documentos" : "mover los documentos",
      });
    } finally {
      setMoving(false);
    }
  };

  return (
    <ArticleFormShell
      onSubmit={handleSubmit}
      onCancel={onClose}
      busy={moving}
      canSave={!!selectedDeptId}
      submitLabel={
        copying
          ? count === 1
            ? "Copiar documento"
            : `Copiar ${count} documentos`
          : count === 1
            ? "Mover documento"
            : `Mover ${count} documentos`
      }
    >
      <PanelSection
        icon={copying ? Copy : ArrowRightLeft}
        title="Destino"
        compact
      >
        <div className="space-y-4">
          {departments.length > 1 && (
            <div>
              <PanelStaticLabel>Departamento destino</PanelStaticLabel>
              <OptionCombobox
                value={selectedDeptId ? String(selectedDeptId) : ""}
                onChange={(value) => {
                  setSelectedDeptId(Number(value));
                  // La ruta elegida pertenece al departamento anterior.
                  setSelectedPath("/");
                  setExpandedFolders({});
                }}
                options={departmentOptions}
                searchPlaceholder="Buscar departamento..."
              />
            </div>
          )}

          <div>
            <PanelStaticLabel>Carpeta destino</PanelStaticLabel>
            <div
              role="listbox"
              aria-label="Carpeta destino"
              className="max-h-72 space-y-0.5 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-background p-2 dark:border-slate-700/60"
            >
              <div
                role="option"
                aria-selected={selectedPath === "/"}
                className={cn(rowClass(selectedPath === "/"), "pl-2")}
                onClick={() => setSelectedPath("/")}
              >
                <span className="w-5" />
                <Folder className="size-4 shrink-0" />
                <span className="flex-1">Raíz</span>
                {selectedPath === "/" && <Check className="size-4 shrink-0" />}
              </div>

              {folders.map((folder) => (
                <FolderOptionRow
                  key={folder.id}
                  node={folder}
                  level={0}
                  selectedPath={selectedPath}
                  onSelect={setSelectedPath}
                  expandedFolders={expandedFolders}
                  onToggle={(id) =>
                    setExpandedFolders((prev) => ({ ...prev, [id]: !prev[id] }))
                  }
                />
              ))}

              {folders.length === 0 &&
                (loadingFolders ? (
                  <p className="flex items-center justify-center gap-2 px-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> Cargando
                    carpetas...
                  </p>
                ) : (
                  <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                    No hay carpetas disponibles.
                  </p>
                ))}
            </div>

            <p className="mt-2 text-[13px] text-muted-foreground">
              Ruta: {selectedPath === "/" ? "/ (raíz)" : selectedPath}
            </p>
          </div>
        </div>
      </PanelSection>
    </ArticleFormShell>
  );
}
