'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { WarehouseDashboard } from '@/types'

interface Props { data?: WarehouseDashboard; isLoading: boolean; isError: boolean }

export default function  ArticlesSummary({ data, isLoading, isError }: Props) {
  if (isLoading) return <div className="text-center text-blue-600 py-8">Cargando información...</div>
  if (isError || !data) return <div className="text-center text-red-500 py-8">Error al cargar información.</div>

  // Configuración de datos para gráfico con colores y nombres completos
  const chartData = [
    { name: 'Salidas\n Totales', value: data.dispatchCount, color: '#2563eb' },
    { name: 'Salidas a\n Aeronaves', value: data.dispatchAircraftCount, color: '#e90e3dff' },
    { name: 'Salidas a\n Taller', value: data.dispatchWorkshopCount, color: '#f59e0b' },
    // { name: 'Artículos por\n Reabastecer', value: data.restockCount, color: '#22c55e' },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* IZQUIERDA: KPIs + Tabla de fuera de stock */}
      <div className="flex flex-col gap-6">
        {/* Bloque superior: KPIs de resumen de artículos */}
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-2xl font-semibold">Resumen de Artículos</CardTitle>
            <CardDescription className="text-gray-500">Datos generales de inventario activo (últimos 7 días)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 text-center">
              <div><div className="text-3xl font-bold text-blue-600">{data.storedCount ?? 0}%</div><p className="text-sm text-gray-600">Artículos Activos</p></div>
              <div><div className="text-3xl font-bold text-emerald-600">{data.dispatchCount ?? 0}</div><p className="text-sm text-gray-600">Salidas Totales</p></div>
              <div><div className="text-3xl font-bold text-cyan-600">{data.dispatchAircraftCount ?? 0}</div><p className="text-sm text-gray-600">Salidas a Aeronaves</p></div>
              <div><div className="text-3xl font-bold text-amber-600">{data.dispatchWorkshopCount ?? 0}</div><p className="text-sm text-gray-600">Salidas a Taller</p></div>
            </div>
          </CardContent>
        </Card>

        {/* Bloque inferior: Tabla de artículos fuera de stock con scroll */}
        <Card className="rounded-xl border shadow-sm flex flex-col">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-2xl font-semibold">Artículos Fuera de Stock</CardTitle>
            <CardDescription className="text-gray-500">
              Listado de artículos sin disponibilidad<br />
              Cantidad de artículos por reabastecer: {data.restockCount ?? 0}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-y-auto max-h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Categoría</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.articlesOutOfStock?.length ? data.articlesOutOfStock.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-[180px] truncate">{item.description}</TableCell>
                      <TableCell>{item.part_number}</TableCell>
                      <TableCell>{item.category}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500 py-4">No hay artículos fuera de stock</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DERECHA: Gráfico de barras de salidas */}
      <div>
        <Card className="rounded-xl border shadow-sm h-full flex flex-col justify-center">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">Gráfico de Salidas</CardTitle>
            <CardDescription className="text-gray-500">Comparativa de tipos de despacho (últimos 7 días)</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="name"
              tick={({ x, y, payload }) => (
                <text x={x} y={y + 10} textAnchor="middle" fontSize={12}>
                  {payload.value.split('\n').map((line: string, i: number) => (
                    <tspan key={i} x={x} dy={i === 0 ? 0 : 12}>{line}</tspan>
                  ))}
                </text>
              )}
            />
            <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
