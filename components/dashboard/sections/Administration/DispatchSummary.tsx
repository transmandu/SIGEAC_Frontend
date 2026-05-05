'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { WarehouseDashboard } from '@/types'
import {
  Plane,
  Package,
  Truck,
  BarChart3,
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

  const dispatchChartData = [
    { name: 'Salidas\nTotales', value: data.dispatchCount ?? 0, color: '#0F766E' },
    { name: 'Salidas a\nAeronaves', value: data.dispatchAircraftCount ?? 0, color: '#14B8A6' },
    { name: 'Salidas a\nTaller', value: data.dispatchWorkOrderCount ?? 0, color: '#2DD4BF' },
  ]

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
              <Metric value={data.dispatchCount ?? 0} label="Salidas Totales" tone="15,118,110" />
              <Metric value={data.dispatchAircraftCount ?? 0} label="Aeronaves" tone="20,184,166" />
              <Metric value={data.dispatchWorkOrderCount ?? 0} label="Taller" tone="45,212,191" />
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
              Resumen de Solicitudes de Entradas
            </CardTitle>

            <CardDescription className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Resumen semanal basado en registros creados en el sistema
            </CardDescription>
          </CardHeader>

          <CardContent className="py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <Metric value={`${data.storedCount ?? 0}%`} label="Artículos Activos" tone="29,78,216" />
              <Metric value={data.entryCount ?? 0} label="Entradas Totales" tone="79,70,229" />
            </div>
          </CardContent>
        </TintedCard>
      </div>

      {/* ================= RIGHT ================= */}
      <TintedCard tone={purpleTone}>
        <CardHeader className="text-center pb-2 space-y-2">
          <div className="flex justify-center">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <BarChart3 className="size-5" />
            </div>
          </div>

          <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Gráfico de Salidas
          </CardTitle>

          <CardDescription className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Comparativa de tipos de despacho (Esta semana)
          </CardDescription>
        </CardHeader>

        <CardContent className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dispatchChartData}>
              <XAxis
                dataKey="name"
                tick={({ x, y, payload }) => (
                  <text
                    x={x}
                    y={y + 10}
                    textAnchor="middle"
                    fontSize={12}
                    className="fill-slate-500"
                  >
                    {payload.value.split('\n').map((line: string, i: number) => (
                      <tspan key={i} x={x} dy={i === 0 ? 0 : 14}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                )}
              />

              <YAxis className="text-slate-500" />
              <Tooltip />

              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {dispatchChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </TintedCard>
    </div>
  )
}