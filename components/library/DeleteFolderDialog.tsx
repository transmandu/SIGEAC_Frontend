'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import libraryService from '@/lib/libraryService';
import { toast } from 'sonner';

interface DeleteFolderDialogProps {
  open: boolean;
  onClose: () => void;
  company: string;
  folderId: string;
  folderName: string;
  departmentId: number;
  onSuccess: () => void;
}

export default function DeleteFolderDialog({
  open, onClose, company, folderId, folderName, departmentId, onSuccess
}: DeleteFolderDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await libraryService.deleteFolder(company, folderId, departmentId);
      toast.success('Carpeta eliminada exitosamente');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar la carpeta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-[#1a1c1e] border-none text-slate-900 dark:text-white sm:max-w-[380px] rounded-2xl overflow-hidden p-0 outline-none shadow-2xl">
        <div className="bg-slate-50 dark:bg-gray-800/40 px-6 py-5 border-b border-slate-200 dark:border-gray-700">
          <div className="flex items-center gap-2" data-tour="biblioteca-folder-delete-title">
            <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-white tracking-tight uppercase">
              Eliminar Carpeta
            </DialogTitle>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
            ¿Estás seguro de eliminar la carpeta <span className="text-slate-900 dark:text-white font-bold">&quot;{folderName}&quot;</span>?
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Solo se puede eliminar si no contiene documentos. Esta acción no se puede deshacer.
          </p>

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-gray-700">
            <button
              data-tour="biblioteca-folder-delete-cancel"
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-[10px] font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest transition-colors"
            >
              CANCELAR
            </button>
            <button
              data-tour="biblioteca-folder-delete-confirm"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 px-4 py-3 text-[10px] font-black text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 shadow-lg shadow-red-500/20 uppercase tracking-widest transition-all"
            >
              {loading ? 'ELIMINANDO...' : 'ELIMINAR'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
