'use client'

import { useAddRoleToUser, useRemoveRoleFromUser } from '@/actions/sistema/usuarios/actions'
import { useGetRoles } from '@/hooks/sistema/usuario/useGetRoles'
import { useAuth } from '@/contexts/AuthContext'
import { User } from '@/types'
import { cn } from '@/lib/utils'
import { Building2, Loader2, Plus, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

const UserRolesTab = ({ user }: { user: User }) => {
  const { user: currentUser } = useAuth()
  const isSuperUser = currentUser?.roles?.some((r) => r.name === 'SUPERUSER') ?? false

  const { data: allRoles, isLoading: loadingRoles } = useGetRoles()
  const { addRole } = useAddRoleToUser()
  const { removeRole } = useRemoveRoleFromUser()

  const userCompanies = user.companies ?? []

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')

  const globalRoles = useMemo(
    () => user.roles?.filter((r) => r.company_id === null) ?? [],
    [user.roles]
  )

  const companyRoles = useMemo(
    () =>
      user.roles?.filter((r) => String(r.company_id) === selectedCompanyId) ?? [],
    [user.roles, selectedCompanyId]
  )

  const companyRoleIds = new Set(companyRoles.map((r) => r.id))

  const availableRoles =
    allRoles?.filter(
      (r) =>
        r.name !== 'SUPERUSER' &&
        !companyRoleIds.has(r.id) &&
        (r.company_id === null || String(r.company_id) === selectedCompanyId)
    ) ?? []

  const handleAdd = () => {
    if (!selectedRoleId || !selectedCompanyId) return
    addRole.mutate(
      {
        userId: String(user.id),
        roleId: Number(selectedRoleId),
        companyId: Number(selectedCompanyId),
      },
      { onSuccess: () => setSelectedRoleId('') }
    )
  }

  const handleRemove = (roleId: number) => {
    if (!selectedCompanyId) return
    removeRole.mutate({
      userId: String(user.id),
      roleId,
      companyId: Number(selectedCompanyId),
    })
  }

  const isAdding = addRole.isPending
  const removingId = removeRole.isPending ? removeRole.variables?.roleId : null

  return (
    <div className="space-y-4 p-1">
      {/* Roles globales (SUPERUSER) */}
      {globalRoles.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Roles globales
          </p>
          <ul className="space-y-1.5">
            {globalRoles.map((role) => (
              <li
                key={role.id}
                className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-3 py-2"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{role.label ?? role.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{role.name}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Separator />

      {/* Empresa */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Empresa
        </p>

        <Select
          value={selectedCompanyId}
          onValueChange={(value) => {
            setSelectedCompanyId(value)
            setSelectedRoleId('')
          }}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Seleccionar empresa..." />
          </SelectTrigger>

          <SelectContent>
            {userCompanies.map((company) => (
              <SelectItem key={company.id} value={String(company.id)}>
                <div className="flex items-center gap-2">
                  <Building2 className="size-3.5 text-muted-foreground" />
                  {company.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCompanyId && (
        <>
          {/* Roles actuales de la empresa */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Roles asignados en esta empresa
            </p>

            {companyRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Este usuario no tiene roles asignados en esta empresa.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {companyRoles.map((role) => (
                  <li
                    key={role.id}
                    className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{role.label ?? role.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{role.name}</span>
                    </div>

                    {isSuperUser && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10',
                          removingId === role.id && 'pointer-events-none'
                        )}
                        onClick={() => handleRemove(role.id)}
                        disabled={removingId === role.id}
                      >
                        {removingId === role.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <X className="size-3.5" />
                        )}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Agregar rol — solo SUPERUSER */}
          {isSuperUser && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Agregar rol
              </p>

              <div className="flex gap-2">
                <Select
                  value={selectedRoleId}
                  onValueChange={setSelectedRoleId}
                  disabled={loadingRoles || availableRoles.length === 0}
                >
                  <SelectTrigger className="flex-1 h-9 text-sm">
                    <SelectValue
                      placeholder={
                        loadingRoles
                          ? 'Cargando roles...'
                          : availableRoles.length === 0
                          ? 'No hay roles disponibles'
                          : 'Seleccionar rol...'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.id} value={String(role.id)}>
                        <span className="font-medium">{role.label ?? role.name}</span>
                        <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                          {role.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  size="sm"
                  className="h-9 gap-1.5"
                  disabled={!selectedRoleId || isAdding}
                  onClick={handleAdd}
                >
                  {isAdding ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Plus className="size-3.5" />
                  )}
                  Agregar
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default UserRolesTab
