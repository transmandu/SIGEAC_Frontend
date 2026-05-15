'use client';

import { useState, useEffect, useMemo } from 'react';
import { BarChart, FileText, Share2, Eye, Send, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import libraryService, { Document } from '@/lib/libraryService';
import axiosInstance from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardModalProps {
  open: boolean;
  onClose: () => void;
  company: string;
}

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e', '#84cc16'];
const STATUS_COLORS = { vigente: '#10b981', vencido: '#f43f5e', no_aplica: '#3b82f6' };

const DonutChart = ({ data, total }: { data: { label: string, value: number, color: string }[], total: number }) => {
  let currentAngle = 0;

  if (total === 0) {
    return (
      <div className="relative w-48 h-48 mx-auto mt-4 mb-2 flex items-center justify-center">
        <span className="text-slate-400 text-sm font-bold">Sin datos</span>
      </div>
    );
  }

  return (
    <div className="relative w-48 h-48 mx-auto mt-4 mb-2">
      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 drop-shadow-sm">
        {data.map((item, i) => {
          if (item.value === 0) return null;
          const fraction = item.value / total;
          const dash = fraction * 251.2;
          const gap = data.filter(d => d.value > 0).length > 1 ? 5 : 0;
          const strokeDasharray = `${Math.max(0, dash - gap)} 251.2`;
          const offset = -(currentAngle / total) * 251.2;
          currentAngle += item.value;

          return (
            <circle
              key={i}
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke={item.color}
              strokeWidth="12"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-slate-800 dark:text-white">{total}</span>
        <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase mt-1">Total</span>
      </div>
    </div>
  );
};

const HalfDonutChart = ({ data, total }: { data: { label: string, value: number, color: string }[], total: number }) => {
  let currentAngle = 0;

  if (total === 0) {
    return (
      <div className="relative w-full h-24 flex items-center justify-center">
        <span className="text-slate-400 text-sm font-bold">Sin solicitudes</span>
      </div>
    );
  }

  return (
    <div className="relative w-40 h-20 mx-auto mt-6 mb-8">
      <svg viewBox="0 0 100 50" className="w-full h-full drop-shadow-sm overflow-visible">
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="transparent"
          stroke="currentColor"
          className="text-slate-100 dark:text-slate-800"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {data.map((item, i) => {
          if (item.value === 0) return null;
          const fraction = item.value / total;
          const dash = fraction * 125.66;
          const gap = data.filter(d => d.value > 0).length > 1 ? 4 : 0;
          const strokeDasharray = `${Math.max(0, dash - gap)} 125.66`;
          const offset = -(currentAngle / total) * 125.66;
          currentAngle += item.value;

          return (
            <path
              key={i}
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="transparent"
              stroke={item.color}
              strokeWidth="12"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          );
        })}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center translate-y-4">
        <span className="text-3xl font-black text-slate-800 dark:text-white leading-none">{total}</span>
        <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase mt-1">Total</span>
      </div>
    </div>
  );
};

const VerticalBarChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end justify-around h-48 mt-4 gap-2">
      {data.map((item, i) => {
        const height = (item.value / maxVal) * 100;
        return (
          <div key={i} className="flex flex-col items-center gap-2 group flex-1 max-w-[48px]">
            <span className="text-[11px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
              {item.value}
            </span>
            <div className="w-full max-w-[20px] h-32 bg-slate-100 dark:bg-slate-800/40 rounded-full flex items-end overflow-hidden p-0.5">
              <div
                className="w-full rounded-full transition-all duration-1000 shadow-sm"
                style={{ height: `${height}%`, backgroundColor: item.color }}
              />
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase truncate w-full text-center px-1" title={item.label}>
              {item.label.split(' ')[0] === 'Direccion' || item.label.split(' ')[0] === 'Jefatura' ? item.label.split(' ')[2] : item.label.split(' ')[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

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

  const isDipDirector = useMemo(() => {
    if (isSuperUser) return true;
    if (!user) return false;
    return user.employee?.some((emp: any) =>
      emp.department?.acronym?.toUpperCase() === 'DIP'
    ) ?? false;
  }, [isSuperUser, user]);

  const isDirector = useMemo(() => {
    if (isSuperUser) return true;
    return user?.employee?.some((emp: any) => {
      const name = emp.job_title?.name || '';
      return name.toUpperCase().includes('DIRECTOR');
    }) ?? false;
  }, [isSuperUser, user]);

  const canViewCharts = isSuperUser || isDipDirector;
  const isSingleDeptView = isDirector && !canViewCharts;

  const userDeptName = useMemo(() => {
    return user?.employee?.[0]?.department?.name ?? null;
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
        setDocuments(docsRes.data || docsRes || {});
        setTraceability(traceRes.data || traceRes || []);
        setShareRequests(Array.isArray(reqRes) ? reqRes : reqRes.data || []);
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

  const deptNames = useMemo(() => {
    if (isSingleDeptView && userDeptName) {
      return Object.keys(documents).filter(d => d.toUpperCase() === userDeptName.toUpperCase());
    }
    return Object.keys(documents);
  }, [documents, isSingleDeptView, userDeptName]);

  const stats = useMemo(() => {
    const byDept = deptNames.map(dept => {
      const docs = documents[dept] || [];
      const shared = traceability.filter((t: any) => {
        const dName = t.department_name || t.document?.department?.name || '';
        return dName.toUpperCase() === dept.toUpperCase();
      });
      const totalAccesses = shared.reduce((sum: number, s: any) => {
        return sum + (s.access_count !== undefined ? Number(s.access_count) : (s.views !== undefined ? Number(s.views) : 1));
      }, 0);
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
  }, [documents, traceability, shareRequests, deptNames]);

  const chartData = useMemo(() => {
    return stats.byDept.map((d, i) => ({
      label: d.department,
      docsValue: d.totalDocs,
      accessValue: d.totalAccesses,
      color: CHART_COLORS[i % CHART_COLORS.length]
    }));
  }, [stats]);

  const statusChartData = useMemo(() => {
    if (!isSingleDeptView || !userDeptName) return [];
    const deptDocs = Object.entries(documents)
      .filter(([name]) => name.toUpperCase() === userDeptName.toUpperCase())
      .flatMap(([, docs]) => docs);

    const vigente = deptDocs.filter(d => d.status === 'vigente').length;
    const vencido = deptDocs.filter(d => d.status === 'vencido').length;
    const noAplica = deptDocs.filter(d => d.status === 'no_aplica').length;

    return [
      { label: 'Vigentes', value: vigente, color: STATUS_COLORS.vigente },
      { label: 'Vencidos', value: vencido, color: STATUS_COLORS.vencido },
      { label: 'Permanentes', value: noAplica, color: STATUS_COLORS.no_aplica },
    ].filter(d => d.value > 0);
  }, [documents, isSingleDeptView, userDeptName]);

  const topDocsChart = useMemo(() => {
    if (!isSingleDeptView || !userDeptName) return [];
    const deptShared = traceability.filter((t: any) => {
      const dName = t.department_name || t.document?.department?.name || '';
      return dName.toUpperCase() === userDeptName.toUpperCase();
    });
    const docAccessMap = new Map<string, number>();
    deptShared.forEach((s: any) => {
      const title = s.document_title || 'Documento';
      const count = s.access_count !== undefined ? Number(s.access_count) : 1;
      docAccessMap.set(title, (docAccessMap.get(title) || 0) + count);
    });
    return Array.from(docAccessMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value], i) => ({
        label: label.length > 15 ? label.substring(0, 15) + '...' : label,
        value,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }));
  }, [traceability, isSingleDeptView, userDeptName]);

  const reqStats = useMemo(() => {
    let filtered = shareRequests;
    if (isSingleDeptView && userDeptName) {
      filtered = shareRequests.filter((r: any) =>
        r.requester_department_name?.toUpperCase() === userDeptName.toUpperCase()
      );
    }
    const total = filtered.length;
    const approved = filtered.filter((r: any) => r.status === 'approved' || r.status === 'aprobada').length;
    const rejected = filtered.filter((r: any) => r.status === 'rejected' || r.status === 'rechazada').length;
    const pending = filtered.filter((r: any) => r.status === 'pending').length;
    return { total, approved, rejected, pending };
  }, [shareRequests, isSingleDeptView, userDeptName]);

  const reqData = [
    { label: 'Aprobadas', value: reqStats.approved, color: '#10b981' },
    { label: 'Pendientes', value: reqStats.pending, color: '#f59e0b' },
    { label: 'Rechazadas', value: reqStats.rejected, color: '#f43f5e' },
  ];

  const cards = [
    {
      label: 'Documentos',
      value: stats.totalDocs,
      icon: FileText,
      bgLight: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Compartidos',
      value: stats.totalShared,
      icon: Share2,
      bgLight: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
    {
      label: 'Accesos (QR)',
      value: stats.totalAccesses,
      icon: Eye,
      bgLight: 'bg-purple-50',
      iconColor: 'text-purple-500',
    },
    {
      label: 'Solicitudes',
      value: reqStats.total,
      icon: Send,
      bgLight: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
  ];

  const subtitleText = useMemo(() => {
    if (isSingleDeptView && userDeptName) return `Análisis del departamento ${userDeptName}`;
    return 'Análisis de interacción y volumen documental';
  }, [isSingleDeptView, userDeptName]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-100 dark:bg-[#0a0c10] border border-slate-200/60 dark:border-white/10 text-slate-900 dark:text-white max-w-[1200px] w-[95vw] rounded-[2rem] overflow-hidden p-0 outline-none shadow-2xl">
        <div className="bg-white dark:bg-slate-900 px-8 py-5 border-b border-slate-200/80 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-2xl shadow-sm">
              <BarChart className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                Estadísticas de la Biblioteca
              </DialogTitle>
              <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                {subtitleText}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <p className="text-sm font-medium text-slate-500">Cargando métricas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

              {canViewCharts && chartData.length > 0 && (
                <div className="col-span-1 lg:col-span-1 bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200/50 dark:border-white/5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[14px] font-black text-slate-800 dark:text-white tracking-tight">
                      Distribución Documental
                    </h3>
                    <p className="text-[11px] font-medium text-slate-400 mb-2">Por departamento</p>
                  </div>

                  <DonutChart data={chartData.map(d => ({ label: d.label, value: d.docsValue, color: d.color }))} total={stats.totalDocs} />

                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center max-h-24 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200">
                    {chartData.filter(d => d.docsValue > 0).map(d => (
                      <div key={d.label} className="flex items-center gap-1.5 w-[45%]">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-[9px] font-bold text-slate-500 truncate" title={d.label}>
                          {d.label.substring(0, 18)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isSingleDeptView && statusChartData.length > 0 && (
                <div className="col-span-1 lg:col-span-1 bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200/50 dark:border-white/5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[14px] font-black text-slate-800 dark:text-white tracking-tight">
                      Estado de Documentos
                    </h3>
                    <p className="text-[11px] font-medium text-slate-400 mb-2">Vigencia en el departamento</p>
                  </div>

                  <DonutChart data={statusChartData} total={statusChartData.reduce((s, d) => s + d.value, 0)} />

                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center">
                    {statusChartData.map(d => (
                      <div key={d.label} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-[9px] font-bold text-slate-500">{d.label}: {d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(canViewCharts || isSingleDeptView) && (
                <div className={`${isSingleDeptView ? 'col-span-1 lg:col-span-2' : 'col-span-1 lg:col-span-2'} bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200/50 dark:border-white/5`}>
                  <h3 className="text-[14px] font-black text-slate-800 dark:text-white tracking-tight">
                    {isSingleDeptView ? 'Top Documentos Accedidos' : 'Accesos Externos'}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-400 mb-2">
                    {isSingleDeptView ? 'Documentos con más accesos vía QR' : 'Interacciones vía QR'}
                  </p>

                  {isSingleDeptView ? (
                    topDocsChart.length > 0 ? (
                      <VerticalBarChart data={topDocsChart} />
                    ) : (
                      <div className="flex items-center justify-center h-48 text-slate-400 text-sm font-bold">Sin accesos registrados</div>
                    )
                  ) : (
                    <VerticalBarChart data={chartData.map(d => ({ label: d.label, value: d.accessValue, color: d.color }))} />
                  )}
                </div>
              )}

              {(canViewCharts || isSingleDeptView) && (
                <div className="col-span-1 lg:col-span-1 bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200/50 dark:border-white/5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[14px] font-black text-slate-800 dark:text-white tracking-tight">
                      Estado Solicitudes
                    </h3>
                    <p className="text-[11px] font-medium text-slate-400 mb-2">Aprobaciones y rechazos</p>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <HalfDonutChart data={reqData} total={reqStats.total} />
                  </div>

                  <div className="mt-2 flex flex-col gap-2">
                    {reqData.map(d => (
                      <div key={d.label} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{d.label}</span>
                        </div>
                        <span className="text-[12px] font-black text-slate-800 dark:text-white">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tarjetas de Métricas Rápidas */}
              <div className="col-span-1 lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                  <div key={card.label} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200/50 dark:border-white/5 flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex justify-between items-center mb-4">
                      <div className={`p-3 rounded-2xl ${card.bgLight} dark:bg-white/5`}>
                        <card.icon className={`h-5 w-5 ${card.iconColor} dark:text-white`} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
                    </div>
                    <div>
                      <div className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">
                        {card.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
