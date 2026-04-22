'use client'

import { useAddCompanyToUser, useRemoveCompanyFromUser } from '@/actions/sistema/usuarios/actions'
import { useGetCompanies } from '@/hooks/sistema/useGetCompanies'
import { useGetLocationsByCompanyId } from '@/hooks/sistema/useGetLocationsByCompanyId'
import { User } from '@/types'
import { cn } from '@/lib/utils'
import { Building2, Loader2, MapPin, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
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

type UserCompany = {
  id: number
  name: string
  acronym?: string
  locations?: { id: number; address: string; cod_iata?: string; isMainBase?: boolean }[]
}

const UserCompaniesTab = ({ user }: { user: User }) => {
  const { data: allCompanies, isLoading: loadingCompanies } = useGetCompanies()
  const { addCompany } = useAddCompanyToUser()
  const { removeCompany } = useRemoveCompanyFromUser()
  const { mutateAsync: fetchLocations, isPending: loadingLocations } = useGetLocationsByCompanyId()

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [availableLocations, setAvailableLocations] = useState<
    { id: number; address: string; cod_iata?: string; isMainBase?: boolean }[]
  >([])
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([])

  const userCompanies = (user.companies as unknown as UserCompany[]) ?? []
  const userCompanyIds = new Set(userCompanies.map((c) => c.id))
  const assignableCompanies = allCompanies?.filter((c) => !userCompanyIds.has(c.id)) ?? []

  // Cargar ubicaciones cuando cambia la empresa seleccionada
  useEffect(() => {
    if (!selectedCompanyId) {
      setAvailableLocations([])
      setSelectedLocationIds([])
      return
    }
    fetchLocations(Number(selectedCompanyId)).then((locs) => {
      setAvailableLocations(locs ?? [])
      setSelectedLocationIds([])
    })
  }, [selectedCompanyId, fetchLocations])

  const toggleLocation = (id: number) => {
    setSelectedLocationIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    )
  }

  const handleAdd = () => {
    if (!selectedCompanyId || selectedLocationIds.length === 0) return
    addCompany.mutate(
      {
        userId: String(user.id),
        companyId: Number(selectedCompanyId),
        locationIds: selectedLocationIds,
      },
      {
        onSuccess: () => {
          setSelectedCompanyId('')
          setAvailableLocations([])
          setSelectedLocationIds([])
        },
      }
    )
  }

  const handleRemove = (companyId: number) => {
    removeCompany.mutate({ userId: String(user.id), companyId })
  }

  const removingId = removeCompany.isPending ? removeCompany.variables?.companyId : null
  const isAdding = addCompany.isPending

  return (
    <div className="space-y-5 p-1">

      {/* Empresas actuales */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Empresas asignadas
        </p>

        {userCompanies.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Este usuario no tiene empresas asignadas.
          </p>
        ) : (
          <ul className="space-y-2">
            {userCompanies.map((company) => (
              <li
                key={company.id}
                className="rounded-md border border-border/60 bg-muted/20 px-3 py-2.5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{company.name}</span>
                    {company.acronym && (
                      <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border/40">
                        {company.acronym}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10',
                      removingId === company.id && 'pointer-events-none'
                    )}
                    disabled={removingId === company.id}
                    onClick={() => handleRemove(company.id)}
                  >
                    {removingId === company.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <X className="size-3.5" />
                    )}
                  </Button>
                </div>

                {company.locations && company.locations.length > 0 && (
                  <ul className="pl-5 space-y-0.5">
                    {company.locations.map((loc) => (
                      <li key={loc.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3 shrink-0" />
                        <span>{loc.address}</span>
                        {loc.cod_iata && (
                          <span className="font-mono bg-muted/60 px-1 rounded border border-border/30">
                            {loc.cod_iata}
                          </span>
                        )}
                        {loc.isMainBase && (
                          <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                            BASE
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Separator />

      {/* Agregar empresa */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Agregar empresa
        </p>

        <Select
          value={selectedCompanyId}
          onValueChange={setSelectedCompanyId}
          disabled={loadingCompanies || assignableCompanies.length === 0}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue
              placeholder={
                loadingCompanies
                  ? 'Cargando empresas...'
                  : assignableCompanies.length === 0
                  ? 'No hay empresas disponibles'
                  : 'Seleccionar empresa...'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {assignableCompanies.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Ubicaciones de la empresa seleccionada */}
        {selectedCompanyId && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Selecciona las ubicaciones a asignar:
            </p>

            {loadingLocations ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                <Loader2 className="size-3.5 animate-spin" />
                Cargando ubicaciones...
              </div>
            ) : availableLocations.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No hay ubicaciones disponibles para esta empresa.
              </p>
            ) : (
              <ul className="space-y-1.5 rounded-md border border-border/50 bg-muted/10 p-2.5">
                {availableLocations.map((loc) => (
                  <li key={loc.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`loc-${loc.id}`}
                      checked={selectedLocationIds.includes(loc.id)}
                      onCheckedChange={() => toggleLocation(loc.id)}
                    />
                    <Label htmlFor={`loc-${loc.id}`} className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <MapPin className="size-3 text-muted-foreground" />
                      {loc.address}
                      {loc.cod_iata && (
                        <span className="font-mono bg-muted/60 px-1 rounded border border-border/30">
                          {loc.cod_iata}
                        </span>
                      )}
                      {loc.isMainBase && (
                        <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                          BASE
                        </span>
                      )}
                    </Label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <Button
          size="sm"
          className="gap-1.5"
          disabled={!selectedCompanyId || selectedLocationIds.length === 0 || isAdding}
          onClick={handleAdd}
        >
          {isAdding ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Plus className="size-3.5" />
          )}
          Agregar empresa
        </Button>
      </div>

    </div>
  )
}

export default UserCompaniesTab
