"use client";

import { useMemo } from "react";
import { FolderOpen } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import DocumentRow from "./documentRow";
import { Document } from "@/lib/libraryService";

interface DocumentTableProps {
  company: string;
  documents: Document[];
  onRefresh: () => Promise<void>;
  onView: (id: number) => void;
  onDelete: (id: number | string) => Promise<void>;
  canManage: boolean;
  isDipDirector: boolean;
  user: any;
  selectedIds?: number[];
  onSelectionChange?: (ids: number[]) => void;
  folderPath?: string;
}

export default function DocumentTable({
  company,
  documents,
  onRefresh,
  onView,
  onDelete,
  canManage,
  isDipDirector,
  user,
  selectedIds = [],
  onSelectionChange,
  folderPath,
}: DocumentTableProps) {
  const selectionEnabled = !!(onSelectionChange && canManage);

  const allSelected = useMemo(
    () => documents.length > 0 && selectedIds.length === documents.length,
    [documents, selectedIds],
  );

  const someSelected = useMemo(
    () => selectedIds.length > 0 && !allSelected,
    [selectedIds, allSelected],
  );

  const handleToggleAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(documents.map((d) => d.id));
    }
  };

  const handleToggleOne = (id: number) => {
    if (!onSelectionChange) return;
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter((sid) => sid !== id)
        : [...selectedIds, id],
    );
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
        <p className="text-sm font-bold text-slate-400 dark:text-slate-500">
          No hay documentos en esta carpeta
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-slate-200 dark:divide-gray-800/10">
      {selectionEnabled && (
        <div className="flex items-center gap-4 p-3 pl-4 border-b border-slate-200 dark:border-slate-800">
          <Checkbox
            checked={someSelected ? "indeterminate" : allSelected}
            onCheckedChange={handleToggleAll}
            aria-label="Seleccionar todos"
            className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {selectedIds.length > 0
              ? `${selectedIds.length} seleccionado${selectedIds.length === 1 ? "" : "s"}`
              : `${documents.length} documento${documents.length === 1 ? "" : "s"}`}
          </span>
          <span className="flex-1 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Seleccionar todos
          </span>
        </div>
      )}

      {documents.map((doc) => (
        <DocumentRow
          key={doc.id}
          doc={doc}
          onView={onView}
          onDelete={onDelete}
          onRefresh={onRefresh}
          canManage={canManage}
          isDipDirector={isDipDirector}
          user={user}
          selected={selectedIds.includes(doc.id)}
          onToggleSelect={
            selectionEnabled ? () => handleToggleOne(doc.id) : undefined
          }
          folderPath={folderPath}
        />
      ))}
    </div>
  );
}
