"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Check,
  Building2,
  FolderTree as FolderTreeIcon,
  Loader2,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import libraryService from "@/lib/libraryService";
import { toast } from "sonner";
import { DepartmentFolderGroup } from "@/components/library/FolderTree";

interface MoveDocumentsDialogProps {
  open: boolean;
  onClose: () => void;
  company: string;
  documentIds: number[];
  departmentFolders: DepartmentFolderGroup[];
  departments: { id: number; name: string }[];
  onLoadFolders: (departmentId: number) => void;
  onSuccess: (departmentId: number, folderPath: string) => void;
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

function FolderOptionRow({
  node,
  level,
  selectedPath,
  onSelect,
  expandedFolders,
  onToggle,
}: {
  node: { id: string; name: string; path: string; children: any[] };
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
        className={`group flex items-center gap-1.5 py-1.5 rounded-lg cursor-pointer transition-all text-sm
          ${
            isSelected
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
          }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={() => onSelect(node.path)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {isExpanded ? (
          <FolderOpen className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <Folder className="h-3.5 w-3.5 shrink-0" />
        )}

        <span className="truncate flex-1">{node.name}</span>

        {isSelected && (
          <Check className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
        )}
      </div>

      {isExpanded &&
        node.children.map((child: any) => (
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
  company,
  documentIds,
  departmentFolders,
  departments,
  onLoadFolders,
  onSuccess,
}: MoveDocumentsDialogProps) {
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [selectedPath, setSelectedPath] = useState("/");
  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({});
  const [loading, setLoading] = useState(false);
  const wasOpen = useRef(false);

  useEffect(() => {
    // Solo al abrir (transición false→true) se reinicia la selección; si el
    // padre re-renderiza con un array departments nuevo, no se toca nada.
    if (open && !wasOpen.current && departments.length > 0) {
      setSelectedDeptId(departments[0].id);
      setSelectedPath("/");
      setExpandedFolders({});
    }
    wasOpen.current = open;
  }, [open, departments]);

  useEffect(() => {
    if (open && selectedDeptId) {
      onLoadFolders(selectedDeptId);
    }
  }, [open, selectedDeptId, onLoadFolders]);

  const deptGroup = useMemo(
    () =>
      selectedDeptId ? findGroup(departmentFolders, selectedDeptId) : null,
    [departmentFolders, selectedDeptId],
  );

  const folders = deptGroup?.folders ?? [];

  const handleToggleFolder = (id: string) => {
    setExpandedFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConfirm = async () => {
    if (!selectedDeptId) return;
    setLoading(true);
    try {
      await libraryService.moveDocumentsBatch(company, {
        document_ids: documentIds,
        department_id: selectedDeptId,
        folder_path: selectedPath,
      });
      toast.success(
        `${documentIds.length} documento${documentIds.length === 1 ? "" : "s"} movido${documentIds.length === 1 ? "" : "s"} exitosamente`,
      );
      onSuccess(selectedDeptId, selectedPath);
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error al mover los documentos",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedPath("/");
    setExpandedFolders({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white dark:bg-[#1a1c1e] border-none text-slate-900 dark:text-white sm:max-w-[460px] rounded-2xl overflow-hidden p-0 outline-hidden shadow-2xl">
        <div className="bg-slate-50 dark:bg-gray-800/40 px-6 py-5 border-b border-slate-200 dark:border-gray-700">
          <DialogTitle className="text-lg font-bold text-slate-800 dark:text-white tracking-tight uppercase">
            Mover documentos
          </DialogTitle>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">
            {documentIds.length} documento{documentIds.length === 1 ? "" : "s"}{" "}
            seleccionado{documentIds.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Departamento */}
          {departments.length > 1 && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-blue-500" /> Departamento
                destino
              </label>
              <div className="relative">
                <select
                  value={selectedDeptId ?? ""}
                  onChange={(e) => setSelectedDeptId(Number(e.target.value))}
                  className="w-full h-11 pl-4 pr-10 border border-slate-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-slate-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-hidden appearance-none cursor-pointer"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Carpeta destino */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 flex items-center gap-2">
              <FolderTreeIcon className="h-3.5 w-3.5 text-blue-500" /> Carpeta
              destino
            </label>

            <div className="border border-slate-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 max-h-[320px] overflow-y-auto p-2 space-y-0.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
              {/* Raíz option */}
              <div
                className={`group flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer transition-all text-sm ${
                  selectedPath === "/"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
                onClick={() => setSelectedPath("/")}
              >
                <span className="w-4" />
                <Folder className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1">Raíz</span>
                {selectedPath === "/" && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                )}
              </div>

              {folders.map((folder) => (
                <FolderOptionRow
                  key={folder.id}
                  node={folder}
                  level={0}
                  selectedPath={selectedPath}
                  onSelect={setSelectedPath}
                  expandedFolders={expandedFolders}
                  onToggle={handleToggleFolder}
                />
              ))}

              {folders.length === 0 && (
                <p className="px-2 py-4 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  No hay carpetas disponibles
                </p>
              )}
            </div>

            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
              Ruta: {selectedPath === "/" ? "/ (raíz)" : selectedPath}
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 text-[10px] font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest transition-colors"
            >
              CANCELAR
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !selectedDeptId}
              className="flex-1 px-4 py-3 text-[10px] font-black text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20 uppercase tracking-widest transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" /> MOVIENDO...
                </span>
              ) : (
                `MOVER ${documentIds.length} DOCUMENTO${documentIds.length === 1 ? "" : "S"}`
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
