'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import { WarehouseDashboard } from '@/types'
import {
  Plane,
  Package,
  PackageSearch,
} from 'lucide-react'

interface Props {
  data?: WarehouseDashboard
  isLoading: boolean
  isError: boolean
}

/* =========================
   CARD CON BORDE TINTADO
   ========================= */
function TintedCard({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: string
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
  )
}

/* =========================
   TOOLTIP
   ========================= */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null

  const data = payload[0]
  const total = data?.payload?.total ?? 0
  const value = data?.value ?? 0
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0

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
  )
}

/* =========================
   CONTADOR
   ========================= */
function Metric({
  value,
  label,
  tone,
}: {
  value: number | string
  label: string
  tone: string
}) {
  return (
    <div className="text-center">
      <div
        className="text-4xl font-semibold tracking-tight bg-clip-text text-transparent"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(${tone},1), rgba(${tone},0.65))`,
        }}
      >
        {value}
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  )
}

export default function DispatchSummary({
  data,
  isLoading,
  isError,
}: Props) {
  if (isLoading) {
    return (
      <div className="py-8 text-center text-slate-600 dark:text-slate-300">
        Cargando información...
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="py-8 text-center text-red-500 dark:text-red-400">
        Error al cargar información.
      </div>
    )
  }

  /* =========================
     PURPLE BASE
     ========================= */
  const purpleTone = "168,85,247"

  const dispatchByCategory = data.dispatchByCategory

  const rawChartData = [
    { name: 'Componentes', value: dispatchByCategory?.component ?? 0, color: '#2a78d6' },
    { name: 'Partes', value: dispatchByCategory?.part ?? 0, color: '#1baf7a' },
    { name: 'Consumibles', value: dispatchByCategory?.consumable ?? 0, color: '#eda100' },
    { name: 'Herramientas', value: dispatchByCategory?.tool ?? 0, color: '#008300' },
    { name: 'Artículos Generales', value: dispatchByCategory?.general ?? 0, color: '#4a3aa7' },
  ]

  const totalDispatched = rawChartData.reduce((sum, item) => sum + item.value, 0)
  const chartData = rawChartData.map((item) => ({ ...item, total: totalDispatched }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ================= LEFT ================= */}
      <div className="flex flex-col gap-6">
        {/* SALIDAS */}
        <TintedCard tone={purpleTone}>
          <CardHeader className="text-center pb-2 space-y-2">
            <div className="flex justify-center">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <Plane className="size-5" />
              </div>
            </div>

            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Resumen de Solicitudes de Salidas
            </CardTitle>

            <CardDescription className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Resumen semanal basado en registros creados en el sistema
            </CardDescription>
          </CardHeader>

          <CardContent className="py-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <Metric value={`${data.storedCount ?? 0}%`} label="Artículos por Lote Activos" tone="29,78,216" />
              <Metric value={`${data.generalArticlesAvailablePercentage ?? 0}%`} label="Artículos Generales Disponibles" tone="217,70,239" />
              <Metric value={data.dispatchCount ?? 0} label="Salidas Totales" tone="15,118,110" />
            </div>
          </CardContent>
        </TintedCard>

        {/* ENTRADAS */}
        <TintedCard tone={purpleTone}>
          <CardHeader className="text-center pb-2 space-y-2">
            <div className="flex justify-center">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <Package className="size-5" />
              </div>
            </div>

            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Resumen de Entradas
            </CardTitle>

            <CardDescription className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Resumen semanal basado en registros creados en el sistema
            </CardDescription>
          </CardHeader>

          <CardContent className="py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <Metric value={data.generalArticleIntakeCount ?? 0} label="Registro de Artículos Generales" tone="79,70,229" />
              <Metric value={data.batchReceptionCount ?? 0} label="Recepción de Artículos Aeronáuticos" tone="129,140,248" />
            </div>
          </CardContent>
        </TintedCard>
      </div>

      {/* ================= RIGHT ================= */}
      <TintedCard tone={purpleTone}>
        <CardHeader className="text-center pb-2 space-y-2">
          <div className="flex justify-center">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <PackageSearch className="size-5" />
            </div>
          </div>

          <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Artículos Despachados por Categoría
          </CardTitle>

          <CardDescription className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
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
  )
}