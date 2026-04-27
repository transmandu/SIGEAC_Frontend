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

interface Props {
  data?: WarehouseDashboard
  isLoading: boolean
  isError: boolean
}

export default function DispatchSummary({
  data,
  isLoading,
  isError,
}: Props) {
  if (isLoading) {
    return (
      <div className="py-8 text-center text-blue-600 dark:text-blue-400">
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

  const dispatchChartData = [
    {
      name: 'Salidas\nTotales',
      value: data.dispatchCount ?? 0,
      color: '#2563eb',
    },
    {
      name: 'Salidas a\nAeronaves',
      value: data.dispatchAircraftCount ?? 0,
      color: '#e11d48',
    },
    {
      name: 'Salidas a\nTaller',
      value: data.dispatchWorkOrderCount ?? 0,
      color: '#f59e0b',
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Columna izquierda */}
      <div className="flex flex-col gap-6">
        {/* Resumen de Salidas */}
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-2xl font-semibold">
              Resumen de Solicitudes de Salidas
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Resumen semanal basado en registros creados en el sistema
            </CardDescription>
          </CardHeader>

          <CardContent className="py-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-emerald-600">
                  {data.dispatchCount ?? 0}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Salidas Totales
                </p>
              </div>

              <div>
                <div className="text-4xl font-bold text-cyan-600">
                  {data.dispatchAircraftCount ?? 0}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Salidas a Aeronaves
                </p>
              </div>

              <div>
                <div className="text-4xl font-bold text-amber-600">
                  {data.dispatchWorkOrderCount ?? 0}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Salidas a Taller
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de Entradas */}
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-2xl font-semibold">
              Resumen de Solicitudes de Entradas
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Resumen semanal basado en registros creados en el sistema
            </CardDescription>
          </CardHeader>

          <CardContent className="py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600">
                  {data.storedCount ?? 0}%
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Artículos Activos
                </p>
              </div>

              <div>
                <div className="text-4xl font-bold text-emerald-600">
                  {data.entryCount ?? 0}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Entradas Totales
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Columna derecha */}
      <Card className="rounded-xl border shadow-sm h-full">
        <CardHeader className="pb-2 text-center">
          <CardTitle className="text-2xl font-semibold">
            Gráfico de Salidas
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Comparativa de tipos de despacho (Esta semana)
          </CardDescription>
        </CardHeader>

        <CardContent className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dispatchChartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            >
              <XAxis
                dataKey="name"
                tick={({ x, y, payload }) => (
                  <text
                    x={x}
                    y={y + 10}
                    textAnchor="middle"
                    fontSize={12}
                    className="fill-muted-foreground"
                  >
                    {payload.value.split('\n').map(
                      (line: string, index: number) => (
                        <tspan
                          key={index}
                          x={x}
                          dy={index === 0 ? 0 : 14}
                        >
                          {line}
                        </tspan>
                      )
                    )}
                  </text>
                )}
              />
              <YAxis
                tick={{ fill: 'currentColor' }}
                className="text-muted-foreground"
              />
              <Tooltip />

              <Bar
                dataKey="value"
                name="Cantidad"
                radius={[6, 6, 0, 0]}
              >
                {dispatchChartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.color}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}