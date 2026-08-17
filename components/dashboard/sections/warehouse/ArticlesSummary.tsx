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
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { WarehouseDashboard } from "@/types";
import { Package, Boxes, PackageSearch, Archive } from "lucide-react";

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
  const total = data?.payload?.total ?? 0;
  const value = data?.value ?? 0;
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="rounded-xl border bg-background/90 backdrop-blur-xl shadow-lg px-3 py-2 sm:px-4 sm:py-3 min-w-[140px] sm:min-w-[180px]">
      <p className="text-center font-semibold text-xs sm:text-sm mb-2 text-slate-700 dark:text-slate-200">
        {data?.payload?.name}
      </p>

      <div className="flex items-center justify-between text-xs sm:text-sm gap-4">
        <span className="font-medium text-slate-600 dark:text-slate-300">
          Despachos
        </span>
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {value} ({percentage}%)
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

  const dispatchByCategory = data.dispatchByCategory;

  const rawChartData = [
    { name: "Componentes", value: dispatchByCategory?.component ?? 0, color: "#2a78d6" },
    { name: "Partes", value: dispatchByCategory?.part ?? 0, color: "#1baf7a" },
    { name: "Consumibles", value: dispatchByCategory?.consumable ?? 0, color: "#eda100" },
    { name: "Herramientas", value: dispatchByCategory?.tool ?? 0, color: "#008300" },
    { name: "Artículos Generales", value: dispatchByCategory?.general ?? 0, color: "#4a3aa7" },
  ];

  const totalDispatched = rawChartData.reduce((sum, item) => sum + item.value, 0);
  const chartData = rawChartData.map((item) => ({ ...item, total: totalDispatched }));

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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 text-center">

              <div>
                <div className="text-lg sm:text-xl font-bold bg-gradient-to-b from-sky-600 to-cyan-500 bg-clip-text text-transparent">
                  {data.storedCount ?? 0}%
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  Artículos Activos
                </p>
              </div>

              <div>
                <div className="flex items-center justify-center gap-1 text-lg sm:text-xl font-bold bg-gradient-to-b from-fuchsia-600 to-pink-500 bg-clip-text text-transparent">
                  <Archive className="size-3.5 sm:size-4 shrink-0" />
                  {data.generalArticlesAvailablePercentage ?? 0}%
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  Artículos Generales
                </p>
              </div>

              <div>
                <div className="text-lg sm:text-xl font-bold bg-gradient-to-b from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                  {data.dispatchCount ?? 0}
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  Salidas Totales
                </p>
              </div>

              <div>
                <div className="text-lg sm:text-xl font-bold bg-gradient-to-b from-slate-700 to-slate-500 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                  {data.dispatchAircraftCount ?? 0}
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  Salidas a Aeronaves
                </p>
              </div>

              <div>
                <div className="text-lg sm:text-xl font-bold bg-gradient-to-b from-amber-600 to-orange-500 bg-clip-text text-transparent">
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
              Por Lote: {data.restockCount ?? 0} | Generales: {data.generalArticlesRestockCount ?? 0}
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
              <PackageSearch className="size-4 sm:size-5" />
            </div>
          </div>

          <CardTitle className="text-lg sm:text-2xl">
            Artículos Despachados por Tipo
          </CardTitle>

          <CardDescription className="mx-auto max-w-xs sm:max-w-md text-xs sm:text-sm">
            Distribución semanal de despachos según categoría de artículo
          </CardDescription>
        </CardHeader>

        <CardContent className="h-[320px] sm:h-[420px] pt-2 sm:pt-4 pb-6 sm:pb-8 px-4 sm:px-6">
          {totalDispatched === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-sm text-slate-500">
              No hay despachos registrados en esta semana
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />

                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={2}
                  cornerRadius={4}
                  stroke="none"
                >
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>

                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                  formatter={(value) => (
                    <span className="text-slate-600 dark:text-slate-300">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </TintedCard>

    </div>
  );
}