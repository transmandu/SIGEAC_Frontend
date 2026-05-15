'use client';

import { useState, useEffect, useMemo } from 'react';
import libraryService from '@/lib/libraryService';
import { useAuth } from '@/contexts/AuthContext';
import { X, Loader2, Send, CheckCircle2, XCircle, Clock, FileText, MessageSquare, Eye, Copy, Check, Share2, Info, CalendarDays, ShieldAlert, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from 'qrcode.react';

interface ShareRequestsPanelProps {
  company: string;
  onClose: () => void;
  onRefresh?: () => void;
}

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected';

export default function ShareRequestsPanel({ company, onClose, onRefresh }: ShareRequestsPanelProps) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [showQrForRequest, setShowQrForRequest] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('pending');
  const [selectedDetails, setSelectedDetails] = useState<any>(null);

  const isDipDirector = useMemo(() => {
    if (!user) return false;
    const isSuperUser = user.roles?.some((role: any) =>
      ['SUPERUSER', 'ADMIN', 'ADMINISTRADOR'].includes(role.name.toUpperCase())
    );
    const isDirector = user.employee?.some((emp: any) => {
      const jobName = emp.job_title?.name?.toUpperCase() || '';
      return jobName.includes('DIRECTOR');
    });
    return !!(isSuperUser || isDirector);
  }, [user]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await libraryService.getShareRequests(company);
      setRequests(Array.isArray(res) ? res : res.data || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [company]);

  const filteredRequests = useMemo(() => {
    if (activeTab === 'all') return requests;
    return requests.filter((r: any) => r.status === activeTab);
  }, [requests, activeTab]);

  const counts = useMemo(() => ({
    all: requests.length,
    pending: requests.filter((r: any) => r.status === 'pending').length,
    approved: requests.filter((r: any) => r.status === 'approved').length,
    rejected: requests.filter((r: any) => r.status === 'rejected').length,
  }), [requests]);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      const res = await libraryService.approveShareRequest(company, id);
      toast.success('Solicitud aprobada');
      if (res.share_url) {
        setShowQrForRequest(id);
      }
      await fetchRequests();
      onRefresh?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al aprobar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectReason.trim()) return toast.error('Debes indicar un motivo de rechazo');
    setActionLoading(id);
    try {
      await libraryService.rejectShareRequest(company, id, rejectReason.trim());
      toast.success('Solicitud rechazada');
      setRejectingId(null);
      setRejectReason('');
      await fetchRequests();
      onRefresh?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al rechazar');
    } finally {
      setActionLoading(null);
    }
  };

  const downloadQRCode = (url: string, title: string) => {
    const svg = document.querySelector(`[data-qr-value="${url}"]`) as SVGElement;
    if (!svg) {
      const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      tempSvg.innerHTML = `<rect width="1" height="1" fill="white"/>`;
      const svgData = new XMLSerializer().serializeToString(tempSvg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = 220;
        canvas.height = 220;
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 110, 110);
          const link = document.createElement('a');
          link.download = `QR_${title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const link = document.createElement('a');
        link.download = `QR_${title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'pending', label: 'Pendientes', count: counts.pending },
    { key: 'approved', label: 'Aprobadas', count: counts.approved },
    { key: 'rejected', label: 'Rechazadas', count: counts.rejected },
    { key: 'all', label: 'Todas', count: counts.all },
  ];

  const statusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-200"><CheckCircle2 className="h-3 w-3" /> APROBADA</span>;
      case 'rejected': return <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-full border border-red-200"><XCircle className="h-3 w-3" /> RECHAZADA</span>;
      default: return <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-full border border-amber-200"><Clock className="h-3 w-3" /> PENDIENTE</span>;
    }
  };

  return (
    <>
      <div className="w-[480px] h-full bg-white dark:bg-[#1a1c1e] border-l border-slate-200 dark:border-gray-700 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between shrink-0 bg-white dark:bg-gray-800/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Solicitudes</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Compartición de documentos</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-3 border-b border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-white/[0.02]">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all
              ${activeTab === tab.key
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
          >
            {tab.label}
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold
              ${activeTab === tab.key ? 'bg-blue-200 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}
            `}>{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <Send className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-sm font-bold text-slate-400 dark:text-slate-500">No hay solicitudes {activeTab !== 'all' ? activeTab : ''}</p>
            {activeTab === 'pending' && <p className="text-[11px] text-slate-400 mt-1">Los directores pueden solicitar compartir documentos desde el menú de acciones.</p>}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {filteredRequests.map((req: any) => (
              <div key={req.id} className="p-5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-slate-800 dark:text-white truncate">
                      {req.document?.title || req.document_title || 'Documento'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Solicitado por: <span className="font-bold text-slate-700 dark:text-slate-300">{req.requested_by_name || 'N/A'}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {statusBadge(req.status)}
                    <button
                      onClick={() => setSelectedDetails(req)}
                      className="flex items-center gap-1 text-[9px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 px-2 py-1 rounded-md transition-colors uppercase"
                    >
                      <Info className="h-3 w-3" /> Detalles
                    </button>
                  </div>
                </div>

                {req.reason && (
                  <div className="flex items-start gap-2 mb-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{req.reason}</span>
                  </div>
                )}

                {req.shared_with_name && (
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-3">
                    <Eye className="h-3 w-3" />
                    Destinatario: <span className="font-bold text-slate-700 dark:text-slate-300">{req.shared_with_name}</span>
                  </div>
                )}

                {req.shared_link_id && req.status === 'approved' && req.share_url && (
                  <div className="mt-3 flex items-start gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl">
                    <div className="p-1.5 bg-white dark:bg-gray-900 rounded-lg shrink-0" data-qr-value={req.share_url}>
                      <QRCodeSVG value={req.share_url} size={72} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">QR generado</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(req.share_url);
                            setCopiedUrl(req.share_url);
                            setTimeout(() => setCopiedUrl(null), 3000);
                          }}
                          className="flex items-center gap-1 text-[9px] font-bold text-blue-600 hover:text-blue-700 bg-white dark:bg-gray-800 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
                        >
                          {copiedUrl === req.share_url ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copiedUrl === req.share_url ? 'COPIADO' : 'COPIAR LINK'}
                        </button>
                        <button
                          onClick={() => downloadQRCode(req.share_url, req.document?.title || 'documento')}
                          className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 hover:text-emerald-700 bg-white dark:bg-gray-800 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors"
                        >
                          <Download className="h-3 w-3" /> DESCARGAR QR
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {req.status === 'rejected' && req.rejection_reason && (
                  <div className="flex items-start gap-2 text-[11px] text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-xl mt-3">
                    <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span><span className="font-bold">Motivo:</span> {req.rejection_reason}</span>
                  </div>
                )}

                {req.status === 'pending' && isDipDirector && (
                  <div className="mt-4 space-y-3">
                    {rejectingId === req.id ? (
                      <div className="space-y-2">
                        <textarea
                          placeholder="Motivo del rechazo..."
                          className="w-full h-16 px-3 py-2 text-[11px] border border-red-300 dark:border-red-800 rounded-lg bg-white dark:bg-gray-800 text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-red-500 resize-none"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setRejectingId(null); setRejectReason(''); }}
                            className="flex-1 py-2 text-[10px] font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wider transition-colors"
                          >
                            CANCELAR
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            disabled={actionLoading === req.id}
                            className="flex-1 py-2 text-[10px] font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 uppercase tracking-wider"
                          >
                            {actionLoading === req.id ? 'RECHAZANDO...' : 'CONFIRMAR RECHAZO'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(req.id)}
                          disabled={actionLoading === req.id}
                          className="flex-1 py-2.5 text-[10px] font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 uppercase tracking-wider flex items-center justify-center gap-1.5"
                        >
                          {actionLoading === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          APROBAR
                        </button>
                        <button
                          onClick={() => setRejectingId(req.id)}
                          className="flex-1 py-2.5 text-[10px] font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 uppercase tracking-wider flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          RECHAZAR
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

      {/* MODAL DE DETALLES */}
      <Dialog open={!!selectedDetails} onOpenChange={() => setSelectedDetails(null)}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden shadow-2xl bg-white dark:bg-[#1a1c1e] border-slate-200 dark:border-gray-800 outline-none !z-[100]">
          <div className="w-full px-6 py-4 border-b flex items-center justify-center bg-slate-100/50 dark:bg-gray-800/40 border-slate-200 dark:border-gray-700">
            <DialogTitle className="text-slate-900 dark:text-white text-xs font-semibold uppercase tracking-widest flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              Detalles de la Solicitud
            </DialogTitle>
          </div>

          {selectedDetails && (
            <div className="p-5 flex flex-col w-full gap-4 text-[11px] text-slate-700 dark:text-slate-300 max-h-[70vh] overflow-y-auto">

              {/* SECCIÓN: Documento */}
              <div className="bg-slate-50 dark:bg-gray-800/20 p-4 rounded-xl border border-slate-200 dark:border-gray-800 space-y-3">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <FileText className="h-3 w-3" /> Documento
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <span className="block text-[8px] font-bold uppercase text-slate-400 mb-0.5">Título</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedDetails.document?.title || selectedDetails.document_title || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold uppercase text-slate-400 mb-0.5">Departamento</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedDetails.document_department_name || selectedDetails.document?.department?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold uppercase text-slate-400 mb-0.5">Versión</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedDetails.version?.version_label || selectedDetails.version?.version_number || 'Última'}</span>
                  </div>
                </div>
              </div>

              {/* SECCIÓN: Solicitante */}
              <div className="bg-slate-50 dark:bg-gray-800/20 p-4 rounded-xl border border-slate-200 dark:border-gray-800 space-y-3">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Send className="h-3 w-3" /> Solicitante
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[8px] font-bold uppercase text-slate-400 mb-0.5">Solicitado por</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedDetails.requested_by_name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold uppercase text-slate-400 mb-0.5">Depto. Solicitante</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedDetails.requester_department_name || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[8px] font-bold uppercase text-slate-400 mb-0.5">Destinatario</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedDetails.shared_with_name || 'Público / Externo'}</span>
                  </div>
                </div>
              </div>

              {/* SECCIÓN: Seguridad y Vigencia */}
              <div className="bg-slate-50 dark:bg-gray-800/20 p-4 rounded-xl border border-slate-200 dark:border-gray-800 space-y-3">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <ShieldAlert className="h-3 w-3" /> Seguridad y Vigencia
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="flex items-center gap-1 text-[8px] font-bold uppercase text-slate-400 mb-0.5"><CalendarDays className="h-3 w-3" /> Fecha Solicitud</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedDetails.created_at ? new Date(selectedDetails.created_at).toLocaleString() : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="flex items-center gap-1 text-[8px] font-bold uppercase text-slate-400 mb-0.5"><Clock className="h-3 w-3" /> Válido Hasta</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedDetails.calculated_expires_at
                        ? new Date(selectedDetails.calculated_expires_at).toLocaleString()
                        : 'Pendiente de aprobación'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="flex items-center gap-1 text-[8px] font-bold uppercase text-slate-400"><ShieldAlert className="h-3 w-3" /> Nivel:</span>
                  {selectedDetails.read_only ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full"><Eye className="h-3 w-3" /> Solo Lectura</span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full"><CheckCircle2 className="h-3 w-3" /> Permite Descarga</span>
                  )}
                </div>
              </div>

              {/* SECCIÓN: Justificación */}
              {selectedDetails.reason && (
                <div className="bg-slate-50 dark:bg-gray-800/20 p-4 rounded-xl border border-slate-200 dark:border-gray-800 space-y-2">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <MessageSquare className="h-3 w-3" /> Justificación
                  </h4>
                  <p className="bg-white dark:bg-gray-900/40 p-3 rounded-lg border border-slate-200 dark:border-gray-700 italic text-[11px] leading-relaxed">
                    &ldquo;{selectedDetails.reason}&rdquo;
                  </p>
                </div>
              )}

              {selectedDetails.rejection_reason && (
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-200 dark:border-red-900/30 space-y-2">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-red-500 flex items-center gap-1.5">
                    <XCircle className="h-3 w-3" /> Motivo de Rechazo
                  </h4>
                  <p className="bg-white dark:bg-gray-900/40 p-3 rounded-lg border border-red-200 dark:border-red-900/40 italic text-[11px] leading-relaxed">
                    &ldquo;{selectedDetails.rejection_reason}&rdquo;
                  </p>
                </div>
              )}

              <button
                onClick={() => setSelectedDetails(null)}
                className="w-full mt-1 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:opacity-90 transition-opacity"
              >
                CERRAR
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
