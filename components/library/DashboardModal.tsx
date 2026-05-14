'use client';

import { useState, useEffect, useMemo } from 'react';
import { BarChart, FileText, Share2, Eye, Send, Loader2, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import libraryService, { Document, ActivityLog } from '@/lib/libraryService';
import axiosInstance from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardModalProps {
  open: boolean;
  onClose: () => void;
  company: string;
}

export default function DashboardModal({ open, onClose, company }: DashboardModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Record<string, Document[]>>({});
  const [traceability, setTraceability] = useState<any[]>([]);
  const [shareRequests, setShareRequests] = useState<any[]>([]);

  const isSuperUser = useMemo(() => {
    return user?.roles?.some((role: any) =>
      ['SUPERUSER', 'ADMIN', 'ADMINISTRADOR'].includes(role.name.toUpperCase())
    ) ?? false;
  }, [user]);

  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [docsRes, traceRes, reqRes] = await Promise.all([
          libraryService.getDocuments(company),
          axiosInstance.get(`/${company}/library/trazabilidad`),
          libraryService.getShareRequests(company),
        ]);
        setDocuments(docsRes.data || {});
        setTraceability(traceRes.data || []);
        setShareRequests(reqRes.data || []);
      } catch {
        setDocuments({});
        setTraceability([]);
        setShareRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [open, company]);

  const stats = useMemo(() => {
    const deptNames = Object.keys(documents);
    const byDept = deptNames.map(dept => {
      const docs = documents[dept] || [];
      const shared = traceability.filter((t: any) =>
        t.department?.toUpperCase() === dept.toUpperCase()
      );
      const totalAccesses = shared.reduce((sum: number, s: any) => sum + (s.access_count || 0), 0);
      const pending = shareRequests.filter((r: any) =>
        r.status === 'pending'
      );
      return {
        department: dept,
        totalDocs: docs.length,
        totalShared: shared.length,
        totalAccesses,
        pendingRequests: pending.length,
      };
    });

    const totalDocs = byDept.reduce((s, d) => s + d.totalDocs, 0);
    const totalShared = byDept.reduce((s, d) => s + d.totalShared, 0);
    const totalAccesses = byDept.reduce((s, d) => s + d.totalAccesses, 0);
    const pendingRequests = byDept.reduce((s, d) => s + d.pendingRequests, 0);

    return { byDept, totalDocs, totalShared, totalAccesses, pendingRequests };
  }, [documents, traceability, shareRequests]);

  const cards = [
    {
      label: 'Documentos',
      value: stats.totalDocs,
      icon: FileText,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Compartidos',
      value: stats.totalShared,
      icon: Share2,
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      label: 'Accesos vía QR',
      value: stats.totalAccesses,
      icon: Eye,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    },
    {
      label: 'Solicitudes Pendientes',
      value: stats.pendingRequests,
      icon: Send,
      color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-[#1a1c1e] border-none text-slate-900 dark:text-white sm:max-w-[700px] rounded-2xl overflow-hidden p-0 outline-none shadow-2xl">
        <div className="bg-slate-50 dark:bg-gray-800/40 px-6 py-5 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BarChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-white tracking-tight uppercase">
              Dashboard
            </DialogTitle>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                {cards.map((card) => (
                  <div key={card.label} className="p-5 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        {card.label}
                      </span>
                      <div className={`p-2 rounded-lg ${card.color}`}>
                        <card.icon className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{card.value}</p>
                  </div>
                ))}
              </div>

              {isSuperUser && stats.byDept.length > 1 && (
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Por Departamento
                  </h3>
                  <div className="space-y-2">
                    {stats.byDept.map((dept) => {
                      const maxVal = Math.max(...stats.byDept.map(d => d.totalDocs), 1);
                      const pct = (dept.totalDocs / maxVal) * 100;
                      return (
                        <div key={dept.department} className="flex items-center gap-4">
                          <span className="w-40 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase truncate shrink-0">
                            {dept.department}
                          </span>
                          <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all duration-500 flex items-center justify-end px-2"
                              style={{ width: `${pct}%` }}
                            >
                              <span className="text-[9px] font-bold text-white">{dept.totalDocs}</span>
                            </div>
                          </div>
                          <div className="flex gap-3 text-[10px] text-slate-500 shrink-0">
                            <span>{dept.totalShared} compartidos</span>
                            <span>{dept.totalAccesses} accesos</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
