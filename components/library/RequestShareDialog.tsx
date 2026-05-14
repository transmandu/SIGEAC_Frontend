'use client';

import { useState, useEffect } from 'react';
import { Share2, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import libraryService from '@/lib/libraryService';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

interface RequestShareDialogProps {
  open: boolean;
  onClose: () => void;
  doc: any;
  company: string;
}

export default function RequestShareDialog({ open, onClose, doc, company }: RequestShareDialogProps) {
  const [versionId, setVersionId] = useState('');
  const [sharedWithName, setSharedWithName] = useState('');
  const [reason, setReason] = useState('');
  const [expiresIn, setExpiresIn] = useState('24');
  const [readOnly, setReadOnly] = useState(true);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingVersions, setLoadingVersions] = useState(false);

  useEffect(() => {
    if (open && doc?.id) {
      fetchVersions();
    } else {
      setVersionId('');
      setSharedWithName('');
      setReason('');
      setExpiresIn('24');
      setVersions([]);
    }
  }, [open, doc]);

  const fetchVersions = async () => {
    setLoadingVersions(true);
    try {
      const res = await axiosInstance.get(`/${company}/library/documents/${doc.id}/versions`);
      const data = res.data?.data?.versions || res.data?.data || [];
      setVersions(Array.isArray(data) ? data : []);
    } catch {
      setVersions([]);
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 10) {
      return toast.error('El motivo debe tener al menos 10 caracteres');
    }

    setLoading(true);
    try {
      await libraryService.createShareRequest(company, {
        document_id: doc.id,
        version_id: versionId ? Number(versionId) : undefined,
        shared_with_name: sharedWithName.trim() || undefined,
        reason: reason.trim(),
        expires_in_hours: Number(expiresIn),
        read_only: readOnly,
      });
      toast.success('Solicitud de compartición enviada. Pendiente de aprobación.');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-[#1a1c1e] border-none text-slate-900 dark:text-white sm:max-w-[480px] rounded-2xl overflow-hidden p-0 outline-none shadow-2xl">
        <div className="bg-slate-50 dark:bg-gray-800/40 px-6 py-5 border-b border-slate-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-800 dark:text-white tracking-tight uppercase">
                Solicitar Compartición
              </DialogTitle>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{doc?.title}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-slate-50 dark:bg-[#1a1c1e]">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">Versión</label>
              <div className="relative">
                <select
                  value={versionId}
                  onChange={(e) => setVersionId(e.target.value)}
                  disabled={loadingVersions}
                  className="w-full h-11 pl-4 pr-10 border border-slate-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-slate-700 dark:text-white outline-none appearance-none cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  <option value="">Última versión</option>
                  {versions.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.version_label || v.version_number} {v.change_log ? `— ${v.change_log.substring(0, 30)}` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">Vence en</label>
              <div className="relative">
                <select
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="w-full h-11 pl-4 pr-10 border border-slate-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-slate-700 dark:text-white outline-none appearance-none cursor-pointer shadow-sm"
                >
                  <option value="24">24 horas</option>
                  <option value="48">48 horas</option>
                  <option value="72">72 horas</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">
              Destinatario <span className="text-[10px] font-normal normal-case tracking-normal text-slate-400">(opcional)</span>
            </label>
            <input
              type="text"
              className="w-full h-11 px-4 border border-slate-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm placeholder:text-slate-400"
              placeholder="Nombre de la persona que recibirá el enlace"
              value={sharedWithName}
              onChange={(e) => setSharedWithName(e.target.value)}
              maxLength={255}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">Motivo *</label>
            <textarea
              required
              className="w-full h-20 px-4 py-3 border border-slate-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none shadow-sm placeholder:text-slate-400"
              placeholder="¿Por qué necesitas compartir este documento? (mín. 10 caracteres)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
            />
          </div>

          <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800/40 rounded-xl border border-slate-200 dark:border-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={readOnly}
              onChange={(e) => setReadOnly(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">Compartir en Solo Lectura</span>
              <p className="text-[10px] text-slate-400">Si se desmarca, el visor público mostrará un botón de descarga</p>
            </div>
          </label>

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-[10px] font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest transition-colors"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="flex-1 px-4 py-3 text-[10px] font-black text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20 uppercase tracking-widest transition-all"
            >
              {loading ? 'ENVIANDO...' : 'SOLICITAR'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
