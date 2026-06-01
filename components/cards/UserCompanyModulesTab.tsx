'use client'

import { useMemo, useState } from 'react'
import { User } from '@/types'
import { cn } from '@/lib/utils'

import { useGetCompanies } from '@/hooks/sistema/useGetCompanies'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

import {
  Loader2,
  Plus,
  X,
  Building2,
} from 'lucide-react'

import {
  useAddModulesToUser,
  useRemoveModulesFromUser,
} from '@/actions/sistema/usuarios/actions'

type Props = {
  user: User
}

type CompanyModule = {
  id: number
  label: string
}

const UserCompanyModulesTab = ({ user }: Props) => {
  const { data: companies = [] } = useGetCompanies()

  const { addModules } = useAddModulesToUser()
  const { removeModules } = useRemoveModulesFromUser()

  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [selectedModuleIds, setSelectedModuleIds] = useState<number[]>([])

  /**
   * Empresas asignadas al usuario
   */
  const userCompanies = useMemo(() => {
    return companies.filter((company) =>
      user.companies?.some(
        (userCompany) => Number(userCompany.id) === Number(company.id)
      )
    )
  }, [companies, user.companies])

  /**
   * Empresa seleccionada (desde catálogo maestro)
   */
  const selectedCompany = useMemo(() => {
    return companies.find(
      (company) => Number(company.id) === Number(selectedCompanyId)
    )
  }, [companies, selectedCompanyId])

  /**
   * Módulos ya asignados al usuario para esa empresa
   */
  const assignedModules: CompanyModule[] =
    user.modules_by_company
      ?.find(
        (item) =>
          Number(item.company_id) === Number(selectedCompanyId)
      )
      ?.modules?.map((module) => ({
        id: Number(module.id),
        label: module.label,
      })) ?? []

  /**
   * Módulos disponibles para agregar
   */
  const availableModules: CompanyModule[] =
    selectedCompany?.modules
      ?.filter(
        (module) =>
          !assignedModules.some(
            (assigned) => assigned.id === Number(module.id)
          )
      )
      .map((module) => ({
        id: Number(module.id),
        label: module.label,
      })) ?? []

  const companyHasModules =
    (selectedCompany?.modules?.length ?? 0) > 0

  const toggleModule = (id: number) => {
    setSelectedModuleIds((prev) =>
      prev.includes(id)
        ? prev.filter((m) => m !== id)
        : [...prev, id]
    )
  }

  const handleAdd = () => {
    if (!selectedCompanyId || selectedModuleIds.length === 0) return

    addModules.mutate(
      {
        userId: String(user.id),
        companyId: Number(selectedCompanyId),
        moduleIds: selectedModuleIds,
      },
      {
        onSuccess: () => {
          setSelectedModuleIds([])
        },
      }
    )
  }

  const handleRemove = (moduleId: number) => {
    if (!selectedCompanyId) return

    removeModules.mutate({
      userId: String(user.id),
      companyId: Number(selectedCompanyId),
      moduleIds: [moduleId],
    })
  }

  const removingModuleId =
    removeModules.isPending &&
    removeModules.variables?.moduleIds?.[0]

  return (
    <div className="space-y-5 p-1">

      {/* Empresa */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Empresa
        </p>

        <Select
          value={selectedCompanyId}
          onValueChange={(value) => {
            setSelectedCompanyId(value)
            setSelectedModuleIds([])
          }}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Seleccionar empresa..." />
          </SelectTrigger>

          <SelectContent>
            {userCompanies.map((company) => (
              <SelectItem
                key={company.id}
                value={String(company.id)}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="size-3.5 text-muted-foreground" />
                  {company.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Módulos asignados */}
      {selectedCompanyId && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Módulos asignados
          </p>

          {assignedModules.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">
              No hay módulos asignados.
            </p>
          ) : (
            <ul className="space-y-2 max-h-[112px] overflow-y-auto pr-1">
              {assignedModules.map((module) => (
                <li
                  key={module.id}
                  className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-3 py-2"
                >
                  <span className="text-sm font-medium">
                    {module.label}
                  </span>

                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={removingModuleId === module.id}
                    className={cn(
                      'size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                    )}
                    onClick={() => handleRemove(module.id)}
                  >
                    {removingModuleId === module.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <X className="size-3.5" />
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Separator />

      {/* Agregar módulos */}
      {selectedCompanyId && (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Agregar módulos
          </p>

          {availableModules.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">
              {companyHasModules
                ? 'Todos los módulos de esta empresa ya están asignados al usuario.'
                : 'Esta empresa no tiene módulos disponibles para asignar.'}
            </p>
          ) : (
            <ul className="space-y-1.5 rounded-md border border-border/50 bg-muted/10 p-2.5 max-h-[112px] overflow-y-auto pr-1">
              {availableModules.map((module) => (
                <li
                  key={module.id}
                  className="flex items-center gap-2"
                >
                  <Checkbox
                    id={`module-${module.id}`}
                    checked={selectedModuleIds.includes(module.id)}
                    onCheckedChange={() =>
                      toggleModule(module.id)
                    }
                  />

                  <Label
                    htmlFor={`module-${module.id}`}
                    className="cursor-pointer text-sm"
                  >
                    {module.label}
                  </Label>
                </li>
              ))}
            </ul>
          )}

          <Button
            size="sm"
            className="gap-1.5"
            disabled={
              !selectedCompanyId ||
              selectedModuleIds.length === 0 ||
              addModules.isPending
            }
            onClick={handleAdd}
          >
            {addModules.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Plus className="size-3.5" />
            )}

            Agregar módulos
          </Button>
        </div>
      )}
    </div>
  )
}

export default UserCompanyModulesTab