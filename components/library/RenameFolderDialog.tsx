'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import libraryService from '@/lib/libraryService';
import { toast } from 'sonner';

interface RenameFolderDialogProps {
  open: boolean;
  onClose: () => void;
  company: string;
  folderId: string;
  currentName: string;
  departmentId: number;
  onSuccess: () => void;
}

export default function RenameFolderDialog({
  open, onClose, company, folderId, currentName, departmentId, onSuccess
}: RenameFolderDialogProps) {
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim() === currentName) return;

    setLoading(true);
    try {
      await libraryService.updateFolder(company, folderId, {
        department_id: departmentId,
        name: name.trim(),
      });
      toast.success('Carpeta renombrada exitosamente');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al renombrar la carpeta');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName(currentName);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white dark:bg-[#1a1c1e] border-none text-slate-900 dark:text-white sm:max-w-[380px] rounded-2xl overflow-hidden p-0 outline-none shadow-2xl">
        <div className="bg-slate-50 dark:bg-gray-800/40 px-6 py-5 border-b border-slate-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Pencil className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-white tracking-tight uppercase">
              Renombrar Carpeta
            </DialogTitle>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">
              Nuevo nombre
            </label>
            <input
              type="text" required autoFocus
              className="w-full h-11 px-4 border border-slate-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-slate-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
            />
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
              disabled={loading || !name.trim() || name.trim() === currentName}
              className="flex-1 px-4 py-3 text-[10px] font-black text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20 uppercase tracking-widest transition-all"
            >
              {loading ? 'GUARDANDO...' : 'GUARDAR'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
