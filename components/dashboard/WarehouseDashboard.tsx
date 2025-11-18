// components/dashboard/WarehouseDashboard.tsx
'use client'

import { ContentLayout } from '@/components/layout/ContentLayout'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Plane, Shield, Package2, Wrench, Users, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import { useGetWarehouseDashboard } from '@/hooks/sistema/dashboard/useWarehouseDashboard'
import { User } from '@/types'

// Subcomponents
import ArticlesSummary from '@/components/dashboard/sections/ArticlesSummary'
import ToolsSummary from '@/components/dashboard/sections/ToolsSummary'
import UsersSummary from '@/components/dashboard/sections/UsersSummary'
import DashboardSummary from '@/components/dashboard/sections/DashboardSummary'

interface WarehouseDashboardProps {
  companySlug: string
  location_id: string
  user: User
  roleNames: string[]
}

export default function WarehouseDashboard({ companySlug, location_id, user, roleNames }: WarehouseDashboardProps) {
  const [activeTab, setActiveTab] = useState('DASHBOARD')
  const { data, isLoading, isError } = useGetWarehouseDashboard(companySlug, location_id)

  const canViewUsersTab = roleNames.some((r) => ['SUPERUSER', 'JEFE_ALMACEN'].includes(r))

  return (
    <ContentLayout title={`Dashboard / ${companySlug || ''}`}>
      <header className="shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Sistema de Gestión Aeronáutica Civil</h1>
              <p className="text-sm">Plataforma oficial de administración</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">Sistema Seguro</span>
          </div>
        </div>
      </header>

      {/* Tabs principales */}
      <main className="max-w-7xl mt-6 mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex justify-center mb-0 space-x-3 border-b rounded-t-xl bg-muted/40">
            <TabsTrigger value="DASHBOARD" className="flex gap-2">
              <LayoutDashboard className="size-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="ARTICULOS" className="flex gap-2">
              <Package2 className="size-4" /> Artículos
            </TabsTrigger>
            <TabsTrigger value="HERRAMIENTAS" className="flex gap-2">
              <Wrench className="size-4" /> Herramientas
            </TabsTrigger>

            {canViewUsersTab && (
              <TabsTrigger value="USUARIOS" className="flex gap-2">
                <Users className="size-4" /> Usuarios
              </TabsTrigger>
            )}
          </TabsList>

          <div className="mt-10">
            <TabsContent value="DASHBOARD">
              <DashboardSummary companySlug={companySlug} />
            </TabsContent>

            <TabsContent value="ARTICULOS">
              <ArticlesSummary data={data} isLoading={isLoading} isError={isError} />
            </TabsContent>

            <TabsContent value="HERRAMIENTAS">
              <ToolsSummary data={data} isLoading={isLoading} isError={isError} />
            </TabsContent>

            {canViewUsersTab && (
              <TabsContent value="USUARIOS">
                <UsersSummary data={data} isLoading={isLoading} isError={isError} currentUserRole={roleNames[0]}/>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </main>
    </ContentLayout>
  )
}
