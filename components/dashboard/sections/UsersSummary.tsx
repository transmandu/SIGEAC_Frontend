'use client'

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
  if (isLoading) return <div className="text-center text-blue-600 py-8">Cargando información...</div>
  if (isError || !data?.userStats?.length) return <div className="text-center text-red-500 py-8">Error al cargar información.</div>

  const filteredUsers = data.userStats.filter(u => currentUserRole === 'SUPERUSER' || (currentUserRole === 'JEFE_ALMACEN' && u.job_title === 'Analista' && 'Jefe'))
  const chartData = filteredUsers.map(u => ({ name: u.username, dispatch: u.dispatch_count, incoming: u.incoming_count }))
  
  const isActive = (lastUsed: string | null) => lastUsed ? ((Date.now() - new Date(lastUsed).getTime()) / 60000 <= 2) : false

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
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
                    <TableHead className="text-center">Rol</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="text-center">{u.name}</TableCell>
                      <TableCell className="text-center">{u.job_title}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${isActive(u.last_used_at) ? 'bg-green-600' : 'bg-gray-400'}`}>
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
      <div className="lg:col-span-2">
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
                <Bar dataKey="dispatch" stackId="a" radius={[6,6,0,0]} fill="#2563eb" />
                <Bar dataKey="incoming" stackId="a" radius={[6,6,0,0]} fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}