'use client'

import { ContentLayout } from '@/components/layout/ContentLayout'
import BackButton from '@/components/misc/BackButton'
import LoadingPage from '@/components/misc/LoadingPage'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import UserRolesTab from '@/components/cards/UserRolesTab'
import UserCompaniesTab from '@/components/cards/UserCompaniesTab'
import { useGetUserById } from '@/hooks/sistema/usuario/useGetUserById'
import { cn } from '@/lib/utils'
import { Mail, User as UserIcon } from 'lucide-react'

const UserByIdPage = ({ params }: { params: { id: string } }) => {
  const { data: user, isLoading, isError } = useGetUserById(params.id)

  if (isLoading) return <LoadingPage />

  if (isError || !user) {
    return (
      <ContentLayout title="Usuario">
        <p className="text-sm text-muted-foreground text-center mt-20">
          No se pudo cargar la información del usuario.
        </p>
      </ContentLayout>
    )
  }

  const isActive = user.isActive === true || (user.isActive as unknown) === 1

  return (
    <ContentLayout title={`${user.first_name} ${user.last_name}`}>
      <div className="flex flex-col gap-y-4">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <BackButton iconOnly tooltip="Volver" variant="secondary" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/sistema/usuarios_permisos/usuarios">
                  Usuarios
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {user.first_name} {user.last_name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

          {/* ── Información personal ─────────────────────────────── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserIcon className="size-4" />
                Información del usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nombre completo</span>
                <span className="text-sm font-medium">
                  {user.first_name} {user.last_name}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Usuario</span>
                <span className="font-mono text-sm font-semibold">{user.username}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="size-3" /> Email
                </span>
                <span className="text-sm">{user.email}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado</span>
                <Badge
                  className={cn(
                    'text-[10px] font-semibold',
                    isActive
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400'
                      : 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400'
                  )}
                  variant="outline"
                >
                  {isActive ? 'ACTIVO' : 'INACTIVO'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* ── Roles ────────────────────────────────────────────── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <UserRolesTab user={user} />
            </CardContent>
          </Card>

          {/* ── Empresas y ubicaciones ───────────────────────────── */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Empresas y ubicaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <UserCompaniesTab user={user} />
            </CardContent>
          </Card>

        </div>
      </div>
    </ContentLayout>
  )
}

export default UserByIdPage
