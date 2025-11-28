'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { WarehouseDashboard } from '@/types'

interface Props {
  data?: WarehouseDashboard
  isLoading: boolean
  isError: boolean
  currentUserRole: string
}

export default function UsersSummary({ data, isLoading, isError, currentUserRole }: Props) {
  const [, tick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => tick(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) return <div className="text-center text-blue-600 py-8">Cargando información...</div>
  if (isError || !data?.userStats?.length) return <div className="text-center text-red-500 py-8">Error al cargar información.</div>

  const filteredUsers = data.userStats.filter(u =>
    currentUserRole === 'SUPERUSER' ||
    (currentUserRole === 'JEFE_ALMACEN' && u.job_title === 'Analista')
  )

  const chartData = filteredUsers.map(u => ({
    name: u.username,
    dispatch: u.dispatch_count,
    incoming: u.incoming_count
  }))

  const parseDate = (str: string | null) => {
    if (!str) return null
    const [d, t] = str.split(' ')
    const [day, month, year] = d.split('-').map(Number)
    const [h, m, s] = t.split(':').map(Number)
    return new Date(year, month - 1, day, h, m, s)
  }

  const isActive = (lastUsed: string | null) => {
    const parsed = parseDate(lastUsed)
    if (!parsed) return false
    return (Date.now() - parsed.getTime()) / 60000 <= 2
  }

  return (
    <div className="flex gap-6">
      {/* Usuarios: 4.5 "columnas" */}
      <div className="flex-[4.5]">
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-2xl font-semibold">Usuarios Almacén</CardTitle>
            <CardDescription className="text-gray-500">Última actividad y cargo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-y-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Nombre</TableHead>
                    <TableHead className="text-center">Cargo</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="text-center">{u.name}</TableCell>
                      <TableCell className="text-center">{u.job_title}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                            isActive(u.last_used_at) ? 'bg-green-600' : 'bg-gray-400'
                          }`}
                        >
                          {isActive(u.last_used_at) ? 'Activo' : 'Inactivo'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico: 7.5 "columnas" */}
      <div className="flex-[7.5]">
        <Card className="rounded-2xl border shadow-sm h-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">Actividad de Usuarios</CardTitle>
            <CardDescription className="text-gray-500">Despachos e ingresos por usuario</CardDescription>
          </CardHeader>
          <CardContent className="h-96 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="dispatch" name="Salidas" stackId="a" radius={[6,6,0,0]} fill="#2563eb" />
                <Bar dataKey="incoming" name="Registros" stackId="a" radius={[6,6,0,0]} fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}