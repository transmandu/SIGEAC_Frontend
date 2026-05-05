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
import { Package, Boxes, AlertTriangle } from "lucide-react";

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
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border bg-background/70 backdrop-blur-xl shadow-sm"
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
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const data = payload[0];

  return (
    <div className="rounded-xl border bg-background/90 backdrop-blur-xl shadow-lg px-3 py-2 sm:px-4 sm:py-3 min-w-[140px] sm:min-w-[180px]">
      <p className="text-center font-semibold text-xs sm:text-sm mb-2 text-slate-700 dark:text-slate-200">
        {data?.payload?.name}
      </p>

      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="font-medium text-slate-600 dark:text-slate-300">
          En total
        </span>
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {data?.value ?? 0}
        </span>
      </div>
    </div>
  );
}

export default function ArticlesSummary({
  data,
  isLoading,
  isError,
}: Props) {
  if (isLoading)
    return (
      <div className="text-center text-cyan-600 py-8">
        Cargando información...
      </div>
    );
  if (isError || !data)
    return (
      <div className="text-center text-red-500 py-8">
        Error al cargar información.
      </div>
    );

  const cyanTone = "6,182,212";

  const chartData = [
    { name: "Salidas Totales", value: data.dispatchCount, color: "url(#indigoDispatch)" },
    { name: "Salidas a Aeronaves", value: data.dispatchAircraftCount, color: "url(#cyanIncoming)" },
    { name: "Salidas a Taller", value: data.dispatchWorkOrderCount, color: "url(#violetWorkOrder)" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

      {/* IZQUIERDA */}
      <div className="flex flex-col gap-4 sm:gap-6">

        {/* KPIs */}
        <TintedCard tone={cyanTone}>
          <CardHeader className="pb-2 text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600">
                <Package className="size-4 sm:size-5" />
              </div>
            </div>

            <CardTitle className="text-lg sm:text-2xl font-semibold tracking-tight">
              Resumen de Artículos
            </CardTitle>

            <CardDescription className="mx-auto max-w-xs sm:max-w-md text-xs sm:text-sm">
              Resumen semanal basado en registros creados en el sistema
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 text-center">

              <div>
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-b from-sky-600 to-cyan-500 bg-clip-text text-transparent">
                  {data.storedCount ?? 0}%
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  Artículos Activos
                </p>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-b from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                  {data.dispatchCount ?? 0}
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  Salidas Totales
                </p>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-b from-slate-700 to-slate-500 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                  {data.dispatchAircraftCount ?? 0}
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  Salidas a Aeronaves
                </p>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-b from-amber-600 to-orange-500 bg-clip-text text-transparent">
                  {data.dispatchWorkOrderCount ?? 0}
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  Salidas a Taller
                </p>
              </div>

            </div>
          </CardContent>
        </TintedCard>

        {/* TABLA */}
        <TintedCard tone={cyanTone}>
          <CardHeader className="pb-2 text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600">
                <Boxes className="size-4 sm:size-5" />
              </div>
            </div>

            <CardTitle className="text-lg sm:text-2xl">
              Artículos Fuera de Stock
            </CardTitle>

            <CardDescription className="mx-auto max-w-xs sm:max-w-md text-xs sm:text-sm">
              Listado de artículos sin disponibilidad<br />
              Cantidad: {data.restockCount ?? 0}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="overflow-hidden rounded-xl border border-cyan-100/40 dark:border-cyan-900/20">
              
              {/* scroll horizontal solo si rompe */}
              <div className="overflow-x-auto">
                <div className="min-w-[500px]">
                  <div className="overflow-y-auto max-h-[180px] sm:max-h-[220px]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background/80 backdrop-blur">
                        <TableRow>
                          <TableHead className="text-center w-[40%]">Descripción</TableHead>
                          <TableHead className="text-center w-[30%]">Part Number</TableHead>
                          <TableHead className="text-center w-[30%]">Categoría</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {data.articlesOutOfStock?.length ? (
                          data.articlesOutOfStock.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="text-center break-words whitespace-normal">
                                {item.description}
                              </TableCell>

                              <TableCell className="text-center break-words">
                                {item.part_number}
                              </TableCell>

                              <TableCell className="text-center break-words">
                                {item.category}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-4">
                              No hay artículos fuera de stock
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </TintedCard>
      </div>

      {/* GRÁFICO */}
      <TintedCard tone={cyanTone}>
        <CardHeader className="text-center pb-4 space-y-2 sm:space-y-3">
          <div className="flex justify-center">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600">
              <AlertTriangle className="size-4 sm:size-5" />
            </div>
          </div>

          <CardTitle className="text-lg sm:text-2xl">
            Gráfico de Salidas
          </CardTitle>

          <CardDescription className="mx-auto max-w-xs sm:max-w-md text-xs sm:text-sm">
            Comparativa de tipos de despacho
          </CardDescription>
        </CardHeader>

        <CardContent className="h-[260px] sm:h-[400px] pt-4 sm:pt-10 pb-6 sm:pb-8 px-4 sm:px-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>

              <defs>
                <linearGradient id="indigoDispatch" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#818CF8" stopOpacity={0.6} />
                </linearGradient>

                <linearGradient id="cyanIncoming" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22D3EE" />
                  <stop offset="100%" stopColor="#67E8F9" stopOpacity={0.6} />
                </linearGradient>

                <linearGradient id="violetWorkOrder" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.6} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="name"
                interval={0}
                tickMargin={10}
                tickFormatter={(value) => {
                  if (value === "Salidas Totales") return "Totales";
                  if (value === "Salidas a Aeronaves") return "Aeronaves";
                  if (value === "Salidas a Taller") return "Taller";
                  return value;
                }}
                tick={{ fontSize: 10 }}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />

              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
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