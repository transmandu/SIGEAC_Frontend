"use client";

import React, { useState, useEffect, useMemo } from "react";
import { BarChart, FileText, Share2, Eye, Send, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import libraryService, { Document } from "@/lib/libraryService";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useTourContext } from "@/components/tour/TourProvider";
import { bibliotecaDashboardSteps } from "@/components/tour/steps/biblioteca/biblioteca-dashboard";

interface DashboardModalProps {
  open: boolean;
  onClose: () => void;
  company: string;
}

// Unified professional color palette matching PieChartComponent.tsx
const CHART_COLORS = [
  "#64bda5", // Soft mint green
  "#0369a1", // Deep sky blue
  "#7c3aed", // Violet
  "#ea580c", // Orange
  "#16a34a", // Green
  "#be123c", // Crimson red
  "#4b5563", // Slate Gray
];

const STATUS_COLORS = {
  vigente: "#64bda5",
  vencido: "#be123c",
  no_aplica: "#0369a1",
};

const DonutChart = ({
  data,
  total,
}: {
  data: { label: string; value: number; color: string }[];
  total: number;
}) => {
  const [hovered, setHovered] = useState<{
    label: string;
    value: number;
    percent: number;
  } | null>(null);

  if (total === 0) {
    return (
      <div className="relative w-48 h-48 mx-auto mt-4 mb-2 flex items-center justify-center">
        <span className="text-slate-400 text-sm font-bold">Sin datos</span>
      </div>
    );
  }

  const getCleanLabel = (name: string): string => {
    const upper = name.toUpperCase();
    if (upper.includes("SEGURIDAD OPERACIONAL") || upper.includes("SMS"))
      return "Seguridad Op.";
    if (upper.includes("TECNOLOGIA") || upper.includes("DIP"))
      return "IT / DIP";
    if (upper.includes("MANTENIMIENTO") || upper.includes("DMA"))
      return "Mantenimiento";
    return name;
  };

  const chartData = data
    .filter((d) => d.value > 0)
    .map((d) => ({
      name: getCleanLabel(d.label),
      value: d.value,
      color: d.color,
    }));

  return (
    <div className="relative w-48 h-48 mx-auto mt-4 mb-2">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={3}
            onMouseEnter={(_, index) => {
              const item = chartData[index];
              if (item) {
                setHovered({
                  label: item.name,
                  value: item.value,
                  percent: Math.round((item.value / total) * 100),
                });
              }
            }}
            onMouseLeave={() => setHovered(null)}
            className="outline-none"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                className="transition-all duration-300 cursor-pointer hover:opacity-90 outline-none"
              />
            ))}
          </Pie>
          <RechartsTooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const percent = Math.round((data.value / total) * 100);
                return (
                  <div className="bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-md text-white px-3 py-2 rounded-xl text-[10px] font-black border border-white/10 shadow-2xl flex flex-col gap-0.5 whitespace-nowrap">
                    <span className="text-slate-300 uppercase tracking-widest text-[8px] font-bold">
                      {data.name}
                    </span>
                    <span className="text-white text-[11px] font-black">
                      {data.value} docs ({percent}%)
                    </span>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none">
        {hovered ? (
          <>
            <span
              className="text-[10px] font-black text-slate-800 dark:text-white truncate max-w-[80%] uppercase tracking-wider"
              title={hovered.label}
            >
              {hovered.label}
            </span>
            <span className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">
              {hovered.value} ({hovered.percent}%)
            </span>
          </>
        ) : (
          <>
            <span className="text-3xl font-black text-slate-800 dark:text-white leading-none">
              {total}
            </span>
            <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase mt-1">
              Total
            </span>
          </>
        )}
      </div>
    </div>
  );
};

const HalfDonutChart = ({
  data,
  total,
}: {
  data: { label: string; value: number; color: string }[];
  total: number;
}) => {
  const [hovered, setHovered] = useState<{
    label: string;
    value: number;
    percent: number;
  } | null>(null);

  if (total === 0) {
    return (
      <div className="relative w-full h-24 flex items-center justify-center">
        <span className="text-slate-400 text-sm font-bold">
          Sin solicitudes
        </span>
      </div>
    );
  }

  const chartData = data
    .filter((d) => d.value > 0)
    .map((d) => ({
      name: d.label,
      value: d.value,
      color: d.color,
    }));

  return (
    <div className="relative w-44 h-32 mx-auto mt-4 mb-2 overflow-visible">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="85%"
            startAngle={180}
            endAngle={0}
            innerRadius="55%"
            outerRadius="85%"
            paddingAngle={3}
            onMouseEnter={(_, index) => {
              const item = chartData[index];
              if (item) {
                setHovered({
                  label: item.name,
                  value: item.value,
                  percent: Math.round((item.value / total) * 100),
                });
              }
            }}
            onMouseLeave={() => setHovered(null)}
            className="outline-none"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                className="transition-all duration-300 cursor-pointer hover:opacity-90 outline-none"
              />
            ))}
          </Pie>
          <RechartsTooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const percent = Math.round((data.value / total) * 100);
                return (
                  <div className="bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-md text-white px-3 py-2 rounded-xl text-[10px] font-black border border-white/10 shadow-2xl flex flex-col gap-0.5 whitespace-nowrap">
                    <span className="text-slate-300 uppercase tracking-widest text-[8px] font-bold">
                      {data.name}
                    </span>
                    <span className="text-white text-[11px] font-black">
                      {data.value} solicitudes ({percent}%)
                    </span>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pointer-events-none text-center translate-y-2">
        {hovered ? (
          <>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
              {hovered.label}
            </span>
            <span className="text-lg font-black text-blue-600 dark:text-blue-400 leading-none mt-0.5">
              {hovered.value} ({hovered.percent}%)
            </span>
          </>
        ) : (
          <>
            <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">
              {total}
            </span>
            <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase mt-0.5">
              Total
            </span>
          </>
        )}
      </div>
    </div>
  );
};

const VerticalBarChart = ({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) => {
  const sortedData = useMemo(() => {
    return [...data]
      .sort((a, b) => b.value - a.value)
      .map((d) => ({
        name: d.label,
        value: d.value,
        color: d.color,
      }));
  }, [data]);

  const maxVal = Math.max(...sortedData.map((d) => d.value), 1);

  const getCleanDeptLabel = (name: string): string => {
    const upper = name.toUpperCase();
    if (upper.includes("SEGURIDAD OPERACIONAL") || upper.includes("SMS"))
      return "Seguridad Op.";
    if (upper.includes("TECNOLOGIA") || upper.includes("DIP"))
      return "IT / DIP";
    if (upper.includes("MANTENIMIENTO") || upper.includes("DMA"))
      return "Mantenimiento";
    if (upper.includes("PRESIDENCIA")) return "Presidencia";
    if (upper.includes("OPERACIONES")) return "Operaciones";
    if (upper.includes("PILOTOS")) return "Pilotos";
    if (upper.includes("INSTRUCCI")) return "Instrucción";
    if (upper.includes("CALIDAD")) return "Calidad";
    if (upper.includes("RRHH") || upper.includes("ADMINISTRACION"))
      return "RRHH / Adm.";

    let clean = name.replace(
      /^(Dirección de |Direccion de |Jefatura de |Jefatura de la |Departamento de )/gi,
      "",
    );
    return clean.length > 12 ? clean.substring(0, 12) + "..." : clean;
  };

  return (
    <div className="w-full h-52 mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={sortedData}
          margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
          <XAxis
            dataKey="name"
            tickFormatter={getCleanDeptLabel}
            tick={{ fontSize: 9, fontWeight: 700, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 9, fontWeight: 700, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
          />
          <RechartsTooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-md text-white px-3 py-2 rounded-xl text-[10px] font-black border border-white/10 shadow-2xl flex flex-col gap-0.5 whitespace-nowrap">
                    <span className="text-slate-300 uppercase tracking-widest text-[8px] font-bold">
                      {data.name}
                    </span>
                    <span className="text-white text-[11px] font-black">
                      {data.value} accesos
                    </span>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="value"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
            animationDuration={1200}
            animationEasing="ease-out"
          >
            {sortedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                className="transition-all duration-300 cursor-pointer hover:opacity-90 outline-none"
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function DashboardModal({
  open,
  onClose,
  company,
}: DashboardModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Record<string, Document[]>>({});
  const [traceability, setTraceability] = useState<any[]>([]);
  const [shareRequests, setShareRequests] = useState<any[]>([]);

  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (open) {
      registerTour(
        "biblioteca-dashboard",
        "Dashboard Biblioteca",
        bibliotecaDashboardSteps,
      );
    }
    return () => unregisterTour("biblioteca-dashboard");
  }, [open, registerTour, unregisterTour]);


  const isSuperUser = useMemo(() => {
    return (
      user?.roles?.some((role: any) =>
        ["SUPERUSER", "ADMIN", "ADMINISTRADOR"].includes(
          role.name.toUpperCase(),
        ),
      ) ?? false
    );
  }, [user]);

  const isDipDirector = useMemo(() => {
    if (isSuperUser) return true;
    if (!user) return false;
    return (
      user.employee?.some(
        (emp: any) => emp.department?.acronym?.toUpperCase() === "DIP",
      ) ?? false
    );
  }, [isSuperUser, user]);

  const isDirector = useMemo(() => {
    if (isSuperUser) return true;
    return (
      user?.employee?.some((emp: any) => {
        const name = emp.job_title?.name || "";
        return name.toUpperCase().includes("DIRECTOR");
      }) ?? false
    );
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
      return Object.keys(documents).filter(
        (d) => d.toUpperCase() === userDeptName.toUpperCase(),
      );
    }
    return Object.keys(documents);
  }, [documents, isSingleDeptView, userDeptName]);

  const stats = useMemo(() => {
    const byDept = deptNames.map((dept) => {
      const docs = documents[dept] || [];
      const shared = traceability.filter((t: any) => {
        const dName = t.department_name || t.document?.department?.name || "";
        return dName.toUpperCase() === dept.toUpperCase();
      });
      const totalAccesses = shared.reduce((sum: number, s: any) => {
        return (
          sum +
          (s.access_count !== undefined
            ? Number(s.access_count)
            : s.views !== undefined
              ? Number(s.views)
              : 1)
        );
      }, 0);
      const pending = shareRequests.filter((r: any) => r.status === "pending");
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
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [stats]);

  const statusChartData = useMemo(() => {
    if (!isSingleDeptView) return [];
    const deptDocs = userDeptName
      ? Object.entries(documents)
          .filter(([name]) => name.toUpperCase() === userDeptName.toUpperCase())
          .flatMap(([, docs]) => docs)
      : Object.values(documents).flat();

    const vigente = deptDocs.filter((d) => d.status === "vigente").length;
    const vencido = deptDocs.filter((d) => d.status === "vencido").length;
    const noAplica = deptDocs.filter((d) => d.status === "no_aplica").length;

    return [
      { label: "Vigentes", value: vigente, color: STATUS_COLORS.vigente },
      { label: "Vencidos", value: vencido, color: STATUS_COLORS.vencido },
      { label: "Permanentes", value: noAplica, color: STATUS_COLORS.no_aplica },
    ].filter((d) => d.value > 0);
  }, [documents, isSingleDeptView, userDeptName]);

  const topDocsChart = useMemo(() => {
    if (!isSingleDeptView) return [];
    let deptShared = traceability;
    if (userDeptName) {
      deptShared = traceability.filter((t: any) => {
        const dName = t.department_name || t.document?.department?.name || "";
        return dName.toUpperCase() === userDeptName.toUpperCase();
      });
    }
    const docAccessMap = new Map<string, number>();
    deptShared.forEach((s: any) => {
      const title = s.document_title || "Documento";
      const count =
        s.access_count !== undefined
          ? Number(s.access_count)
          : s.views !== undefined
            ? Number(s.views)
            : 1;
      docAccessMap.set(title, (docAccessMap.get(title) || 0) + count);
    });
    return Array.from(docAccessMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value], i) => ({
        label: label.length > 15 ? label.substring(0, 15) + "..." : label,
        value,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }));
  }, [traceability, isSingleDeptView, userDeptName]);

  const reqStats = useMemo(() => {
    let filtered = shareRequests;
    if (isSingleDeptView && userDeptName) {
      filtered = shareRequests.filter(
        (r: any) =>
          r.requester_department_name?.toUpperCase() ===
          userDeptName.toUpperCase(),
      );
    }
    const total = filtered.length;
    const approved = filtered.filter(
      (r: any) => r.status === "approved" || r.status === "aprobada",
    ).length;
    const rejected = filtered.filter(
      (r: any) => r.status === "rejected" || r.status === "rechazada",
    ).length;
    const pending = filtered.filter((r: any) => r.status === "pending").length;
    return { total, approved, rejected, pending };
  }, [shareRequests, isSingleDeptView, userDeptName]);

  const reqData = [
    { label: "Aprobadas", value: reqStats.approved, color: "#10b981" },
    { label: "Pendientes", value: reqStats.pending, color: "#f59e0b" },
    { label: "Rechazadas", value: reqStats.rejected, color: "#f43f5e" },
  ];

  const cards = [
    {
      label: "Documentos",
      value: stats.totalDocs,
      icon: FileText,
      bgLight: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      label: "Compartidos",
      value: stats.totalShared,
      icon: Share2,
      bgLight: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
    {
      label: "Accesos (QR)",
      value: stats.totalAccesses,
      icon: Eye,
      bgLight: "bg-purple-50",
      iconColor: "text-purple-500",
    },
    {
      label: "Solicitudes",
      value: reqStats.total,
      icon: Send,
      bgLight: "bg-amber-50",
      iconColor: "text-amber-500",
    },
  ];

  const subtitleText = useMemo(() => {
    if (isSingleDeptView && userDeptName)
      return `Análisis del departamento ${userDeptName}`;
    return "Análisis de interacción y volumen documental";
  }, [isSingleDeptView, userDeptName]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-100 dark:bg-[#0a0c10] border border-slate-200/60 dark:border-white/10 text-slate-900 dark:text-white max-w-[1200px] w-[95vw] rounded-[2rem] overflow-hidden p-0 outline-none shadow-2xl">
        <div
          className="bg-white dark:bg-slate-900 px-8 py-5 border-b border-slate-200/80 dark:border-white/5 flex items-center justify-between"
          data-tour="biblioteca-dashboard-title"
        >
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
              <p className="text-sm font-medium text-slate-500">
                Cargando métricas...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" >
              {canViewCharts && chartData.length > 0 && (
                <div className="col-span-1 lg:col-span-1 bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200/50 dark:border-white/5 flex flex-col justify-between" data-tour="biblioteca-dashboard-distribucion">
                  <div >
                    <h3 className="text-[14px] font-black text-slate-800 dark:text-white tracking-tight">
                      Distribución Documental
                    </h3>
                    <p className="text-[11px] font-medium text-slate-400 mb-2">
                      Por departamento
                    </p>
                  </div>

                  <DonutChart
                    data={chartData.map((d) => ({
                      label: d.label,
                      value: d.docsValue,
                      color: d.color,
                    }))}
                    total={stats.totalDocs}
                  />

                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center max-h-24 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200">
                    {chartData
                      .filter((d) => d.docsValue > 0)
                      .map((d) => (
                        <div
                          key={d.label}
                          className="flex items-center gap-1.5 w-[45%]"
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: d.color }}
                          />
                          <span
                            className="text-[9px] font-bold text-slate-500 truncate"
                            title={d.label}
                          >
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
                    <p className="text-[11px] font-medium text-slate-400 mb-2">
                      Vigencia en el departamento
                    </p>
                  </div>

                  <DonutChart
                    data={statusChartData}
                    total={statusChartData.reduce((s, d) => s + d.value, 0)}
                  />

                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center">
                    {statusChartData.map((d) => (
                      <div key={d.label} className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: d.color }}
                        />
                        <span className="text-[9px] font-bold text-slate-500">
                          {d.label}: {d.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(canViewCharts || isSingleDeptView) && (
                <div
                  className={`${isSingleDeptView ? (statusChartData.length > 0 ? "col-span-1 lg:col-span-3" : "col-span-1 lg:col-span-4") : "col-span-1 lg:col-span-2"} bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200/50 dark:border-white/5`}
                  data-tour="biblioteca-dashboard-accesos"
                >
                  <h3 className="text-[14px] font-black text-slate-800 dark:text-white tracking-tight">
                    {isSingleDeptView
                      ? "Top Documentos Accedidos"
                      : "Accesos Externos"}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-400 mb-2">
                    {isSingleDeptView
                      ? "Documentos con más accesos vía QR"
                      : "Interacciones vía QR"}
                  </p>

                  {isSingleDeptView ? (
                    topDocsChart.length > 0 ? (
                      <VerticalBarChart data={topDocsChart} />
                    ) : (
                      <div className="flex items-center justify-center h-48 text-slate-400 text-sm font-bold">
                        Sin accesos registrados
                      </div>
                    )
                  ) : (
                    <VerticalBarChart
                      data={chartData.map((d) => ({
                        label: d.label,
                        value: d.accessValue,
                        color: d.color,
                      }))}
                    />
                  )}
                </div>
              )}

              {canViewCharts && (
                <div
                  className="col-span-1 lg:col-span-1 bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200/50 dark:border-white/5 flex flex-col justify-between"
                  data-tour="biblioteca-dashboard-solicitudes"
                >
                  <div>
                    <h3 className="text-[14px] font-black text-slate-800 dark:text-white tracking-tight">
                      Estado Solicitudes
                    </h3>
                    <p className="text-[11px] font-medium text-slate-400 mb-2">
                      Aprobaciones y rechazos
                    </p>
                  </div>

                  <div className="flex-1 flex flex-col justify-center overflow-visible">
                    <HalfDonutChart data={reqData} total={reqStats.total} />
                  </div>

                  <div className="mt-2 flex flex-col gap-2">
                    {reqData.map((d) => (
                      <div
                        key={d.label}
                        className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2 px-3"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: d.color }}
                          />
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                            {d.label}
                          </span>
                        </div>
                        <span className="text-[12px] font-black text-slate-800 dark:text-white">
                          {d.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tarjetas de Métricas Rápidas */}
              <div
                className={`col-span-1 lg:col-span-4 grid grid-cols-2 lg:grid-cols-${(isDipDirector ? cards : cards.filter((c) => c.label !== "Solicitudes")).length} gap-6`}
                data-tour="biblioteca-dashboard-metrics"
              >
                {(isDipDirector
                  ? cards
                  : cards.filter((c) => c.label !== "Solicitudes")
                ).map((card) => (
                  <div
                    key={card.label}
                    className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200/50 dark:border-white/5 flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div
                        className={`p-3 rounded-2xl ${card.bgLight} dark:bg-white/5`}
                      >
                        <card.icon
                          className={`h-5 w-5 ${card.iconColor} dark:text-white`}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {card.label}
                      </span>
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
