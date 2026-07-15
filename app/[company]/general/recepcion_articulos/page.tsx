
'use client'

import { ContentLayout } from '@/components/layout/ContentLayout'
import BackButton from '@/components/misc/BackButton'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { useCompanyStore } from '@/stores/CompanyStore'
import { ShieldOff } from 'lucide-react'
import { useState } from 'react'
import { ArticulosEnTransitoTab } from './_components/ArticulosEnTransitoTab'
import { RecepcionGeneralTab } from './_components/RecepcionGeneralTab'
import { DownloadReportDialog } from './_components/DownloadReportDialog'

const ALMACEN_ROLES = ['ALMACEN', 'JEFE_ALMACEN', 'ANALISTA_ALMACEN', 'SUPERUSER']

const RecepcionArticulosPage = () => {
    const { selectedCompany } = useCompanyStore()
    const { user } = useAuth()
    const [visitedTabs, setVisitedTabs] = useState<Set<string>>(() => new Set(['transito']))

    const userRoles = user?.roles?.map((r) => r.name) ?? []
    const canView = ALMACEN_ROLES.some((r) => userRoles.includes(r))

    if (!canView) {
        return (
            <ContentLayout title="Recepción de Artículos">
                <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
                    <ShieldOff className="size-10" />
                    <p className="text-sm font-medium">No tienes permiso para ver esta sección.</p>
                    <p className="text-xs">Se requiere el rol de Almacén.</p>
                </div>
            </ContentLayout>
        )
    }

    return (
        <ContentLayout title="Recepción de Artículos">
            <div className="flex flex-col gap-y-3">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2">
                    <BackButton iconOnly tooltip="Volver" variant="secondary" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/${selectedCompany?.slug ?? ''}/dashboard`}>
                                    Inicio
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink>Compras</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Recepción de Artículos</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Encabezado */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Recepción de Artículos</h1>
                    <DownloadReportDialog />
                </div>

                {/* Tabs */}
                <Tabs
                    defaultValue="transito"
                    className="space-y-4"
                    onValueChange={(value) => {
                        if (!visitedTabs.has(value)) {
                            setVisitedTabs((prev) => new Set(prev).add(value))
                        }
                    }}
                >
                    <TabsList>
                        <TabsTrigger value="transito">Artículos en Tránsito</TabsTrigger>
                        <TabsTrigger value="recepcion-general">Recepción General</TabsTrigger>
                    </TabsList>

                    <TabsContent value="transito">
                        {visitedTabs.has('transito') && <ArticulosEnTransitoTab />}
                    </TabsContent>

                    <TabsContent value="recepcion-general">
                        {visitedTabs.has('recepcion-general') && <RecepcionGeneralTab />}
                    </TabsContent>
                </Tabs>

            </div>
        </ContentLayout>
    )
}

export default RecepcionArticulosPage
