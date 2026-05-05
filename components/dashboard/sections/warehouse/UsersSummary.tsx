'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { WarehouseDashboard } from '@/types'
import { Users, Activity } from 'lucide-react'

interface Props {
  data?: WarehouseDashboard
  isLoading: boolean
  isError: boolean
  currentUserRole: string
}

/* =========================
   CARD TINTADO (NO CAMBIA)
   ========================= */
function TintedCard({
  children,
  tone,
  className = ''
}: {
  children: React.ReactNode
  tone: string
  className?: string
}) {
  return (
    <Card
      className={`relative overflow-hidden rounded-3xl border bg-background/70 backdrop-blur-xl shadow-sm ${className}`}
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
   TOOLTIP (SIN CAMBIOS)
   ========================= */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  const dispatch = payload.find((p: any) => p.dataKey === 'dispatch')
  const incoming = payload.find((p: any) => p.dataKey === 'incoming')

  return (
    <div className="rounded-xl border bg-background/90 backdrop-blur-xl shadow-lg px-4 py-3 min-w-[200px]">
      <p className="text-center font-semibold text-sm mb-2 text-slate-700 dark:text-slate-200">
        {label}
      </p>

      <div className="flex flex-col gap-1 text-sm">
        <p className="font-semibold text-indigo-600 flex justify-between">
          <span>Salidas</span>
          <span className="text-slate-700 dark:text-slate-200">{dispatch?.value ?? 0}</span>
        </p>

        <p className="font-semibold text-cyan-600 flex justify-between">
          <span>Registros</span>
          <span className="text-slate-700 dark:text-slate-200">{incoming?.value ?? 0}</span>
        </p>
      </div>
    </div>
  )
}

export default function UsersSummary({
  data,
  isLoading,
  isError,
  currentUserRole
}: Props) {

  const [, tick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => tick(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) return <div className="text-center text-indigo-600 py-8">Cargando información...</div>
  if (isError || !data?.userStats?.length) return <div className="text-center text-red-500 py-8">Error al cargar información.</div>

  const indigoTone = "99,102,241"

  const filteredUsers = data.userStats.filter(u =>
    currentUserRole === 'SUPERUSER' ||
    (currentUserRole === 'JEFE_ALMACEN' && ['Analista', 'Ayudante'].includes(u.job_title))
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
    /* =========================
       FIX PRINCIPAL: MOBILE STACK
       ========================= */
    <div className="flex flex-col lg:flex-row gap-6">

      {/* USERS TABLE */}
      <div className="w-full lg:flex-[4.5]">
        <TintedCard tone={indigoTone} className="h-[520px] flex flex-col">

          <CardHeader className="pb-2 text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                <Users className="size-5" />
              </div>
            </div>

            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Usuarios Almacén
            </CardTitle>

            <CardDescription className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Última actividad y cargo
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 flex items-center justify-center">

            {/* FIX MOBILE: scroll horizontal controlado */}
            <div className="w-full overflow-hidden rounded-xl border border-indigo-100/40 dark:border-indigo-900/20">

              <div className="overflow-x-auto">
                <div className="min-w-[520px] lg:min-w-full">

                  <div className="overflow-y-auto max-h-[260px] lg:max-h-[320px]">

                    <Table>
                      <TableHeader className="sticky top-0 bg-background/80 backdrop-blur">
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
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                isActive(u.last_used_at)
                                  ? 'bg-emerald-500/15 text-emerald-600'
                                  : 'bg-slate-500/15 text-slate-500'
                              }`}>
                                {isActive(u.last_used_at) ? 'Activo' : 'Inactivo'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>

                    </Table>

                  </div>
                </div>
              </div>

            </div>
          </CardContent>

        </TintedCard>
      </div>

      {/* CHART */}
      <div className="w-full lg:flex-[7.5]">
        <TintedCard tone={indigoTone} className="h-[520px] flex flex-col">

          <CardHeader className="text-center pb-2 space-y-2">
            <div className="flex justify-center">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                <Activity className="size-5" />
              </div>
            </div>

            <CardTitle className="text-2xl font-semibold">
              Actividad de Usuarios
            </CardTitle>

            <CardDescription className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Despachos e ingresos por usuario
            </CardDescription>
          </CardHeader>

          {/* FIX CRÍTICO CHART MOBILE */}
          <CardContent className="flex-1 w-full overflow-hidden">

            <div className="h-[300px] sm:h-full w-full">

              <ResponsiveContainer width="100%" height="100%">

                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >

                  {/* FIX EJE X MOBILE (evita labels pegadas/cortadas) */}
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />

                  <YAxis />

                  <Tooltip content={<CustomTooltip />} />

                  <defs>
                    <linearGradient id="indigoDispatch" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={1} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
                    </linearGradient>

                    <linearGradient id="cyanIncoming" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>

                  <Bar
                    dataKey="dispatch"
                    name="Salidas"
                    radius={[6, 6, 0, 0]}
                    fill="url(#indigoDispatch)"
                  />

                  <Bar
                    dataKey="incoming"
                    name="Registros"
                    radius={[6, 6, 0, 0]}
                    fill="url(#cyanIncoming)"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </CardContent>

        </TintedCard>
      </div>

    </div>
  )
}