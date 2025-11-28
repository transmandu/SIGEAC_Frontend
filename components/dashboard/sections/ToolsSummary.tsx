'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { WarehouseDashboard } from '@/types'

interface Props { data?: WarehouseDashboard; isLoading: boolean; isError: boolean }

export default function ToolsSummary({ data, isLoading, isError }: Props) {
  if (isLoading) return <div className="text-center text-blue-600 py-8">Cargando información...</div>
  if (isError || !data) return <div className="text-center text-red-500 py-8">Error al cargar información.</div>

  const lineChartData = [
    { type: 'Por Calibrar', count: data.expired_tools_count },
    { type: 'Próxima Calibración', count: data.tool_need_calibration_count }
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-2xl font-semibold text-red-600">Herramientas por Calibrar</CardTitle>
            <CardDescription className="text-gray-500">
              Cantidad total de herramientas pendientes por calibrar: {data.expired_tools_count}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-y-auto max-h-[220px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Descripción</TableHead>
                    <TableHead className="text-center">Part Number</TableHead>
                    <TableHead className="text-center">Fecha de Calibración</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.expired_tools?.length ? data.expired_tools.map(tool => (
                    <TableRow key={tool.tool_id}>
                      <TableCell className="text-center">{tool.batch_name}</TableCell>
                      <TableCell className="text-center">{tool.part_number}</TableCell>
                      <TableCell className="text-center">{tool.next_calibration}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500 py-4">No hay herramientas por calibrar</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-2xl font-semibold text-yellow-600">Herramientas Próximas a Calibrar</CardTitle>
            <CardDescription className="text-gray-500">
              Cantidad total de herramientas próximas a calibrar: {data.tool_need_calibration_count}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-y-auto max-h-[220px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Descripción</TableHead>
                    <TableHead className="text-center">Part Number</TableHead>
                    <TableHead className="text-center">Fecha de Calibración</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.tools_need_calibration?.length ? data.tools_need_calibration.map(tool => (
                    <TableRow key={tool.tool_id}>
                      <TableCell className="text-center">{tool.batch_name}</TableCell>
                      <TableCell className="text-center">{tool.part_number}</TableCell>
                      <TableCell className="text-center">{tool.next_calibration}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500 py-4">No hay herramientas próximas a calibrar</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-blue-600">Gráfico de Calibraciones</CardTitle>
          <CardDescription className="text-gray-500 text-sm">Resumen visual de herramientas por estado</CardDescription>
        </CardHeader>

        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={lineChartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="type" tick={{ fontSize: 12 }} width={120} />
              <Tooltip />
              <Bar dataKey="count" name="Cantidad" fill="#2563eb" radius={[0, 6, 6, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}