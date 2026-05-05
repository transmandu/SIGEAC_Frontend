"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { WarehouseDashboard } from "@/types";
import { Wrench, AlertTriangle, CalendarClock } from "lucide-react";

interface Props {
  data?: WarehouseDashboard;
  isLoading: boolean;
  isError: boolean;
}

/* =========================
   CARD TINTADO
   ========================= */
function TintedCard({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: string;
}) {
  return (
    <Card
      className="relative overflow-hidden rounded-3xl border bg-background/70 backdrop-blur-xl shadow-sm"
      style={{
        borderColor: `rgba(${tone}, 0.22)`,
        backgroundImage: `linear-gradient(to bottom right, rgba(${tone}, 0.06), transparent 60%)`,
      }}
    >
      {children}
    </Card>
  );
}

/* =========================
   TOOLTIP
   ========================= */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const value = payload?.[0]?.value ?? 0;

  return (
    <div className="rounded-xl border bg-background/90 backdrop-blur-xl shadow-lg px-4 py-3 min-w-[200px]">
      <p className="text-center font-semibold text-sm mb-2 text-slate-700 dark:text-slate-200">
        {label}
      </p>

      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-500 dark:text-slate-400">
          Cantidad
        </span>
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {value}
        </span>
      </div>
    </div>
  );
}

export default function ToolsSummary({ data, isLoading, isError }: Props) {
  if (isLoading)
    return (
      <div className="text-center text-sky-600 py-8">
        Cargando información...
      </div>
    );

  if (isError || !data)
    return (
      <div className="text-center text-red-500 py-8">
        Error al cargar información.
      </div>
    );

  const skyTone = "14,165,233";

  const chartData = [
    {
      type: "Por Calibrar",
      count: data.expired_tools_count,
      color: "url(#indigoDispatch)",
    },
    {
      type: "Próxima Calibración",
      count: data.tool_need_calibration_count,
      color: "url(#cyanIncoming)",
    },
  ];

  /* =========================
     RESPONSIVE CONTROL (SIN CAMBIAR DESKTOP)
     ========================= */
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <div className="flex flex-col gap-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT */}
        <TintedCard tone={skyTone}>
          <CardHeader className="pb-2 text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600">
                <Wrench className="size-5" />
              </div>
            </div>

            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Herramientas por Calibrar
            </CardTitle>

            <CardDescription className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Cantidad total de herramientas pendientes por calibrar:{" "}
              {data.expired_tools_count}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="overflow-hidden rounded-xl border border-sky-100/40 dark:border-sky-900/20">
              <div className="overflow-y-auto max-h-[220px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-background/80 backdrop-blur">
                    <TableRow>
                      <TableHead className="text-center">
                        Descripción
                      </TableHead>
                      <TableHead className="text-center">
                        Part Number
                      </TableHead>
                      <TableHead className="text-center">
                        Fecha de Calibración
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {data.expired_tools?.length ? (
                      data.expired_tools.map((tool) => (
                        <TableRow key={tool.tool_id}>
                          <TableCell className="text-center">
                            {tool.batch_name}
                          </TableCell>
                          <TableCell className="text-center">
                            {tool.part_number}
                          </TableCell>
                          <TableCell className="text-center">
                            {tool.next_calibration}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          No hay herramientas por calibrar
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </TintedCard>

        {/* RIGHT */}
        <TintedCard tone={skyTone}>
          <CardHeader className="pb-2 text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600">
                <CalendarClock className="size-5" />
              </div>
            </div>

            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Herramientas Próximas a Calibrar
            </CardTitle>

            <CardDescription className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Cantidad total de herramientas próximas a calibrar:{" "}
              {data.tool_need_calibration_count}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="overflow-hidden rounded-xl border border-sky-100/40 dark:border-sky-900/20">
              <div className="overflow-y-auto max-h-[220px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-background/80 backdrop-blur">
                    <TableRow>
                      <TableHead className="text-center">
                        Descripción
                      </TableHead>
                      <TableHead className="text-center">
                        Part Number
                      </TableHead>
                      <TableHead className="text-center">
                        Fecha de Calibración
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {data.tools_need_calibration?.length ? (
                      data.tools_need_calibration.map((tool) => (
                        <TableRow key={tool.tool_id}>
                          <TableCell className="text-center">
                            {tool.batch_name}
                          </TableCell>
                          <TableCell className="text-center">
                            {tool.part_number}
                          </TableCell>
                          <TableCell className="text-center">
                            {tool.next_calibration}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          No hay herramientas próximas a calibrar
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </TintedCard>
      </div>

      {/* CHART (FIX REAL RESPONSIVE) */}
      <TintedCard tone={skyTone}>
        <CardHeader className="text-center pb-2 space-y-2">
          <div className="flex justify-center">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600">
              <AlertTriangle className="size-5" />
            </div>
          </div>

          <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Gráfico de Calibraciones
          </CardTitle>

          <CardDescription className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Resumen visual de herramientas por estado
          </CardDescription>
        </CardHeader>

        <CardContent className="h-48 sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 5,
                right: 20,
                left: isMobile ? 0 : 20, // FIX: evita centrado raro en mobile
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="indigoDispatch" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={1} />
                  <stop offset="100%" stopColor="#818CF8" stopOpacity={0.6} />
                </linearGradient>

                <linearGradient id="cyanIncoming" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity={1} />
                  <stop offset="100%" stopColor="#67E8F9" stopOpacity={0.6} />
                </linearGradient>
              </defs>

              <XAxis type="number" tick={{ fontSize: 12 }} />

              <YAxis
                type="category"
                dataKey="type"
                width={isMobile ? 90 : 120} // FIX clave
                tick={{ fontSize: 12 }}
              />

              <Tooltip content={<CustomTooltip />} />

              <Bar
                dataKey="count"
                radius={[0, 6, 6, 0]}
                barSize={24} // NO se toca (desktop intacto)
              >
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </TintedCard>

    </div>
  );
}