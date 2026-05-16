'use client';

import { useState, useEffect } from 'react';
import { FolderPlus, ChevronDown, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import libraryService, { FolderNode } from '@/lib/libraryService';
import { toast } from 'sonner';

interface CreateFolderDialogProps {
  open: boolean;
  onClose: () => void;
  company: string;
  departmentId: number | null;
  departmentName: string | null;
  departments: { id: number; name: string }[];
  folders: FolderNode[];
  selectedFolderPath?: string | null;
  isSuperUser: boolean;
  onSuccess: (deptId: number) => void;
}

function findFolderByPath(nodes: FolderNode[], targetPath: string): FolderNode | undefined {
  for (const node of nodes) {
    if (node.path === targetPath) return node;
    if (node.children.length > 0) {
      const found = findFolderByPath(node.children, targetPath);
      if (found) return found;
    }
  }
  return undefined;
}

export default function CreateFolderDialog({
  open, onClose, company, departmentId, departmentName, departments, folders, selectedFolderPath, isSuperUser, onSuccess
}: CreateFolderDialogProps) {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState(departmentId ?? '');

  useEffect(() => {
    if (open && departmentId) setSelectedDeptId(departmentId);
  }, [open, departmentId]);

  useEffect(() => {
    if (open && selectedFolderPath && selectedFolderPath !== '/') {
      const match = findFolderByPath(folders, selectedFolderPath);
      if (match) setParentId(match.id);
    } else {
      setParentId('');
    }
  }, [open, selectedFolderPath, folders]);

  const [loading, setLoading] = useState(false);

  const availableFolders = selectedDeptId
    ? folders
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedDeptId) return;

    setLoading(true);
    try {
      const deptId = Number(selectedDeptId);
      await libraryService.createFolder(company, {
        department_id: deptId,
        name: name.trim(),
        parent_id: parentId || undefined,
      });
      toast.success('Carpeta creada exitosamente');
      setName('');
      setParentId('');
      onSuccess(deptId);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear la carpeta');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setParentId('');
    onClose();
  };

  const flattenFolders = (nodes: FolderNode[], prefix = ''): { id: string; name: string; label: string }[] => {
    const result: { id: string; name: string; label: string }[] = [];
    for (const node of nodes) {
      result.push({ id: node.id, name: node.name, label: `${prefix}${node.name}` });
      if (node.children.length > 0) {
        result.push(...flattenFolders(node.children, `${prefix}${node.name} / `));
      }
    }
    return result;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white dark:bg-[#1a1c1e] border-none text-slate-900 dark:text-white sm:max-w-[420px] rounded-2xl overflow-hidden p-0 outline-none shadow-2xl">
        <div className="bg-slate-50 dark:bg-gray-800/40 px-6 py-5 border-b border-slate-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FolderPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-white tracking-tight uppercase">
              Nueva Carpeta
            </DialogTitle>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">
              Nombre de la carpeta
            </label>
            <input
              type="text" required
              className="w-full h-11 px-4 border border-slate-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-slate-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ej. Manuales 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
            />
          </div>

          {/* Selector de departamento — solo para superusers que ven múltiples deptos */}
          {(isSuperUser || departments.length > 1) && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-blue-500" /> Departamento
              </label>
              <div className="relative">
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full h-11 pl-4 pr-10 border border-slate-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-slate-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                >
                  {!departmentId && <option value="">Seleccionar departamento</option>}
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">
              Carpeta padre <span className="text-[10px] font-normal normal-case tracking-normal text-slate-400"></span>
            </label>
            <div className="relative">
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full h-11 pl-4 pr-10 border border-slate-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-slate-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                disabled={!selectedDeptId}
              >
                <option value="">Raíz</option>
                {flattenFolders(availableFolders).map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 text-[10px] font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest transition-colors"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !selectedDeptId}
              className="flex-1 px-4 py-3 text-[10px] font-black text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20 uppercase tracking-widest transition-all"
            >
              {loading ? 'CREANDO...' : 'CREAR CARPETA'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}



