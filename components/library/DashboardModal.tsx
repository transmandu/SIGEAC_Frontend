"use client";

import React, { useState, useEffect, useMemo } from "react";
import { BarChart, FileText, Share2, Eye, Send, Loader2 } from "lucide-react";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { PanelSection } from "@/components/forms/PanelSection";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTourContext } from "@/components/tour/TourProvider";
import { bibliotecaDashboardSteps } from "@/components/tour/steps/general/biblioteca/biblioteca-dashboard";
import { notifyError } from "@/lib/notify-error";

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

/** Etiqueta flotante de las gráficas: nombre y valor, legibles y sin efectos. */
const ChartTip = ({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-0.5 whitespace-nowrap rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md">
    <span className="text-xs text-muted-foreground">{name}</span>
    <span className="text-sm font-semibold">{children}</span>
  </div>
);

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
        <span className="text-sm text-muted-foreground">Sin datos</span>
      </div>
    );
  }

  const getCleanLabel = (name: string): string => {
    const upper = name.toUpperCase();
    if (upper.includes("SEGURIDAD OPERACIONAL") || /\bSMS\b/.test(upper))
      return "Seguridad Op.";
    if (upper.includes("TECNOLOGIA") || /\bDIP\b/.test(upper))
      return "IT / DIP";
    if (upper.includes("MANTENIMIENTO") || /\bDMA\b/.test(upper))
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
            className="outline-hidden"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                className="transition-all duration-300 cursor-pointer hover:opacity-90 outline-hidden"
              />
            ))}
          </Pie>
          <RechartsTooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const percent = Math.round((data.value / total) * 100);
                return (
                  <ChartTip name={data.name}>
                    {data.value} docs ({percent}%)
                  </ChartTip>
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
            <span className="max-w-[80%] truncate text-xs text-slate-600 dark:text-slate-400">
              {hovered.label}
            </span>
            <span className="mt-0.5 text-lg font-semibold text-primary">
              {hovered.value} ({hovered.percent}%)
            </span>
          </>
        ) : (
          <>
            <span className="text-3xl font-semibold leading-none text-slate-700 dark:text-slate-200">
              {total}
            </span>
            <span className="mt-1 text-xs text-slate-600 dark:text-slate-400">
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
        <span className="text-sm text-muted-foreground">Sin solicitudes</span>
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
            className="outline-hidden"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                className="transition-all duration-300 cursor-pointer hover:opacity-90 outline-hidden"
              />
            ))}
          </Pie>
          <RechartsTooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const percent = Math.round((data.value / total) * 100);
                return (
                  <ChartTip name={data.name}>
                    {data.value} solicitudes ({percent}%)
                  </ChartTip>
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
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {hovered.label}
            </span>
            <span className="mt-0.5 text-lg font-semibold leading-none text-primary">
              {hovered.value} ({hovered.percent}%)
            </span>
          </>
        ) : (
          <>
            <span className="text-2xl font-semibold leading-none text-slate-700 dark:text-slate-200">
              {total}
            </span>
            <span className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
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

  const getCleanDeptLabel = (name: string): string => {
    const upper = name.toUpperCase();
    if (upper.includes("SEGURIDAD OPERACIONAL") || /\bSMS\b/.test(upper))
      return "Seguridad Op.";
    if (upper.includes("TECNOLOGIA") || /\bDIP\b/.test(upper))
      return "IT / DIP";
    if (upper.includes("MANTENIMIENTO") || /\bDMA\b/.test(upper))
      return "Mantenimiento";
    if (upper.includes("PRESIDENCIA")) return "Presidencia";
    if (upper.includes("OPERACIONES")) return "Operaciones";
    if (upper.includes("PILOTOS")) return "Pilotos";
    if (upper.includes("INSTRUCCI")) return "Instrucción";
    if (upper.includes("CALIDAD")) return "Calidad";
    if (/\bRRHH\b/.test(upper) || upper.includes("ADMINISTRACION"))
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
            tick={{ fontSize: 12, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
          />
          <RechartsTooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <ChartTip name={data.name}>{data.value} accesos</ChartTip>
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
                className="transition-all duration-300 cursor-pointer hover:opacity-90 outline-hidden"
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
        { onlyVisible: true },
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
      } catch (error) {
        console.error("Error al cargar el panel:", error);
        notifyError(error, { action: "cargar los datos del panel" });
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
      tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Compartidos",
      value: stats.totalShared,
      icon: Share2,
      tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Accesos por enlace",
      value: stats.totalAccesses,
      icon: Eye,
      tone: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
    {
      label: "Solicitudes",
      value: reqStats.total,
      icon: Send,
      tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];

  const subtitleText = useMemo(() => {
    if (isSingleDeptView && userDeptName)
      return `Análisis del departamento ${userDeptName}`;
    return "Análisis de interacción y volumen documental";
  }, [isSingleDeptView, userDeptName]);

  const visibleCards = isDipDirector
    ? cards
    : cards.filter((c) => c.label !== "Solicitudes");

  return (
    <TooltipProvider delayDuration={300}>
      <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
        <FormDialogContent
          icon={BarChart}
          title="Estadísticas de la biblioteca"
          description={subtitleText}
          tourId="biblioteca-dashboard-title"
          lockOutside={false}
          className="sm:max-w-6xl"
          footer={
            <Button type="button" variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          }
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Cargando métricas...
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div
                className={cn(
                  "grid grid-cols-2 gap-3",
                  isDipDirector ? "lg:grid-cols-4" : "lg:grid-cols-3",
                )}
                data-tour="biblioteca-dashboard-metrics"
              >
                {visibleCards.map((card) => (
                  <div
                    key={card.label}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700/60 dark:bg-slate-900/60"
                  >
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-xl",
                        card.tone,
                      )}
                    >
                      <card.icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] text-slate-600 dark:text-slate-400">
                        {card.label}
                      </p>
                      <p className="text-2xl font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                        {card.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                {canViewCharts && chartData.length > 0 && (
                  <PanelSection
                    icon={FileText}
                    title="Distribución documental"
                    hint="Por departamento"
                    className="lg:col-span-1"
                  >
                    <div data-tour="biblioteca-dashboard-distribucion">
                      <DonutChart
                        data={chartData.map((d) => ({
                          label: d.label,
                          value: d.docsValue,
                          color: d.color,
                        }))}
                        total={stats.totalDocs}
                      />

                      <div className="mt-4 flex max-h-28 flex-wrap justify-center gap-x-4 gap-y-2 overflow-y-auto">
                        {chartData
                          .filter((d) => d.docsValue > 0)
                          .map((d) => (
                            <div
                              key={d.label}
                              className="flex w-[45%] items-center gap-1.5"
                            >
                              <span
                                className="size-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: d.color }}
                              />
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="truncate text-xs text-slate-600 dark:text-slate-400">
                                    {d.label.substring(0, 18)}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>{d.label}</TooltipContent>
                              </Tooltip>
                            </div>
                          ))}
                      </div>
                    </div>
                  </PanelSection>
                )}

                {isSingleDeptView && statusChartData.length > 0 && (
                  <PanelSection
                    icon={FileText}
                    title="Estado de los documentos"
                    hint="Vigencia en el departamento"
                    className="lg:col-span-1"
                  >
                    <DonutChart
                      data={statusChartData}
                      total={statusChartData.reduce((s, d) => s + d.value, 0)}
                    />

                    <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
                      {statusChartData.map((d) => (
                        <div
                          key={d.label}
                          className="flex items-center gap-1.5"
                        >
                          <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: d.color }}
                          />
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            {d.label}: {d.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </PanelSection>
                )}

                {(canViewCharts || isSingleDeptView) && (
                  <PanelSection
                    icon={Eye}
                    title={
                      isSingleDeptView
                        ? "Documentos más consultados"
                        : "Accesos externos"
                    }
                    hint={
                      isSingleDeptView
                        ? "Con más accesos por enlace o QR"
                        : "Interacciones por enlace o QR"
                    }
                    className={
                      isSingleDeptView
                        ? statusChartData.length > 0
                          ? "lg:col-span-3"
                          : "lg:col-span-4"
                        : "lg:col-span-2"
                    }
                  >
                    <div data-tour="biblioteca-dashboard-accesos">
                      {isSingleDeptView ? (
                        topDocsChart.length > 0 ? (
                          <VerticalBarChart data={topDocsChart} />
                        ) : (
                          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
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
                  </PanelSection>
                )}

                {canViewCharts && (
                  <PanelSection
                    icon={Send}
                    title="Estado de las solicitudes"
                    hint="Aprobaciones y rechazos"
                    className="lg:col-span-1"
                  >
                    <div data-tour="biblioteca-dashboard-solicitudes">
                      <HalfDonutChart data={reqData} total={reqStats.total} />

                      <div className="mt-3 flex flex-col gap-2">
                        {reqData.map((d) => (
                          <div
                            key={d.label}
                            className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="size-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: d.color }}
                              />
                              <span className="text-[13px] text-slate-700 dark:text-slate-300">
                                {d.label}
                              </span>
                            </div>
                            <span className="text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                              {d.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PanelSection>
                )}
              </div>
            </div>
          )}
        </FormDialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
