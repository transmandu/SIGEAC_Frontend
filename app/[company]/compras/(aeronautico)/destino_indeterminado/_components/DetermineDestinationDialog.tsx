'use client'

import { useMemo, useState } from 'react'
import { Loader2, MapPin, Package, Truck } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import { useDetermineArticleDestination } from '@/actions/mantenimiento/almacen/inventario/articulos/actions'
import { useGetLocationsByCompany } from '@/hooks/sistema/useGetLocationsByCompany'
import { useGetEmployeesByCompany } from '@/hooks/ajustes/empleados/useGetEmployees'
import { useGetDepartments } from '@/hooks/ajustes/departamento/useGetDepartment'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCompanyStore } from '@/stores/CompanyStore'
import type { DestinationArticle } from '@/types/purchase'

interface Props {
  article: DestinationArticle
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Compras decide a qué sede pertenece un artículo que llegó sin destino.
 *
 * Lo que llegó puede repartirse: de dos galones uno puede ser de esta sede y
 * el otro de otra. Por eso se eligen varias sedes y cada una lleva su
 * cantidad, en vez de una sola elección.
 *
 * Lo que queda en la sede actual entra a recepción; lo que va a otra abre un
 * traslado que esa sede tendrá que acusar cuando el material llegue.
 */
export function DetermineDestinationDialog({ article, open, onOpenChange }: Props) {
  const { selectedCompany } = useCompanyStore()
  const { data: locations = [], isLoading } = useGetLocationsByCompany(selectedCompany?.slug)
  const { data: employees = [] } = useGetEmployeesByCompany(selectedCompany?.slug)
  const { data: allDepartments = [] } = useGetDepartments(selectedCompany?.slug)
  const { determineDestination } = useDetermineArticleDestination()

  /** Cantidad asignada a cada sede, indexada por id. Vacío = no participa. */
  const [amounts, setAmounts] = useState<Record<number, string>>({})
  /** Quién pidió el material y para qué departamento, por sede destino. */
  const [requesters, setRequesters] = useState<Record<number, string>>({})
  const [departments, setDepartments] = useState<Record<number, string>>({})
  const [justification, setJustification] = useState('')

  const currentLocationId = article.batch?.warehouse?.location?.id ?? null
  const available = Number(article.quantity ?? 1)
  const unit = article.unit ?? 'UNIDAD'
  const busy = determineDestination.isPending

  // Un serializado es UNA pieza: no se reparte, va entera a una sola sede.
  const isSplittable = available > 1

  const allocations = useMemo(
    () =>
      Object.entries(amounts)
        .map(([id, value]) => ({
          location_id: Number(id),
          quantity: Number(value.replace(',', '.')),
          requested_by: requesters[Number(id)] || undefined,
          department_id: departments[Number(id)]
            ? Number(departments[Number(id)])
            : undefined,
        }))
        .filter((entry) => Number.isFinite(entry.quantity) && entry.quantity > 0),
    [amounts, requesters, departments],
  )

  const assigned = allocations.reduce((sum, entry) => sum + entry.quantity, 0)
  const pending = Number((available - assigned).toFixed(4))
  const exceeds = assigned > available

  // Lo que se queda aquí no abre salida: solo los traslados necesitan a quién
  // atribuírsele en la sede que los recibe.
  const transfersReady = allocations
    .filter((entry) => entry.location_id !== currentLocationId)
    .every((entry) => entry.requested_by && entry.department_id)

  const canSubmit =
    allocations.length > 0 && !exceeds && pending === 0 && transfersReady

  /**
   * Solo dígitos y un separador decimal: el campo es de texto para no arrastrar
   * las flechas y el scroll del input numérico, así que la restricción se hace
   * aquí. Se acepta la coma, que es como se escribe un decimal en el teclado
   * local, y se normaliza a punto al enviar.
   */
  const setAmount = (locationId: number, value: string) => {
    if (value !== '' && !/^\d*[.,]?\d*$/.test(value)) return

    setAmounts((prev) => ({ ...prev, [locationId]: value }))
  }

  // Al soltar una sede se va también a quién se le atribuía: dejarlo colgando
  // reenviaría el solicitante de un destino que ya no participa.
  const toggleWhole = (locationId: number) => {
    setAmounts((prev) => (prev[locationId] ? {} : { [locationId]: String(available) }))
    setRequesters({})
    setDepartments({})
  }

  const submit = async () => {
    if (!canSubmit) return

    await determineDestination.mutateAsync({
      id: article.id,
      allocations,
      justification: justification.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle className="text-lg">Determinar destino</DialogTitle>
          <DialogDescription>
            Indique a qué sede pertenece el artículo. Puede repartirlo entre
            varias.
          </DialogDescription>
        </DialogHeader>

        {/* El overflow va en el cuerpo: el footer queda fijo y visible. */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">

          {/* Identidad del artículo */}
          <section className="flex items-start gap-3 rounded-xl border border-slate-200/70 p-4 dark:border-slate-700/60">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Package className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="font-mono text-sm font-semibold">
                {article.part_number || 'Sin P/N'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {article.batch?.name || 'Sin descripción'}
              </p>
              <p className="text-xs text-muted-foreground">
                Actualmente en{' '}
                <span className="font-medium text-foreground">
                  {article.batch?.warehouse?.location?.cod_iata ?? 'sede desconocida'}
                </span>
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-sm font-semibold tabular-nums">
                {available} {unit}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                por repartir
              </p>
            </div>
          </section>

          {/* Reparto por sede */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                ¿A qué sede pertenece? <span className="text-red-500">*</span>
              </Label>
              <span
                className={cn(
                  'font-mono text-xs tabular-nums',
                  exceeds
                    ? 'font-semibold text-red-500'
                    : pending === 0 && assigned > 0
                      ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                      : 'text-muted-foreground',
                )}
              >
                {exceeds
                  ? `Excede en ${(assigned - available).toFixed(2)} ${unit}`
                  : `Sin asignar: ${pending} ${unit}`}
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid gap-2">
                {locations.map((location) => {
                  const isCurrent = location.id === currentLocationId
                  const value = amounts[location.id] ?? ''
                  const isSelected = Number(value) > 0

                  // Solo un traslado abre salida, y toda salida se le atribuye
                  // a alguien: lo que se queda aquí sigue el camino de siempre.
                  const needsRequester = isSelected && !isCurrent

                  // El personal se acota por el departamento elegido, no por la
                  // sede: los cargos son genéricos ("Jefe", "Ayudante") y es el
                  // departamento el que separa el almacén de una sede y otra.
                  const chosenDepartment = departments[location.id]
                  const locationEmployees = chosenDepartment
                    ? employees.filter(
                        (employee) =>
                          String(employee.department?.id) === chosenDepartment,
                      )
                    : []

                  return (
                    <div
                      key={location.id}
                      className={cn(
                        'rounded-xl border p-3 transition-colors',
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200/70 dark:border-slate-700/60',
                      )}
                    >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {isCurrent ? (
                          <MapPin className="size-4 text-muted-foreground" />
                        ) : (
                          <Truck className="size-4 text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {location.cod_iata}
                          {isCurrent && (
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                              donde está ahora
                            </span>
                          )}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {location.address}
                        </p>
                      </div>

                      {/* Con una sola unidad no hay nada que repartir: la sede
                          se marca entera y se evita pedir una cantidad que
                          solo puede ser 1. */}
                      {isSplittable ? (
                        // La unidad va FUERA del campo y no superpuesta: su
                        // ancho depende del texto ("UNIDADES" es largo) y con
                        // un padding fijo terminaba encima de lo escrito.
                        <div className="flex shrink-0 items-center gap-2">
                          <Input
                            inputMode="decimal"
                            disabled={busy}
                            value={value}
                            onChange={(event) => setAmount(location.id, event.target.value)}
                            placeholder="0"
                            className="h-9 w-24 text-right font-mono tabular-nums"
                          />
                          <span className="w-20 shrink-0 text-xs text-muted-foreground">
                            {unit}
                          </span>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant={isSelected ? 'default' : 'outline'}
                          disabled={busy}
                          onClick={() => toggleWhole(location.id)}
                          className="h-8 shrink-0"
                        >
                          {isSelected ? 'Seleccionada' : 'Elegir'}
                        </Button>
                      )}
                    </div>

                    {needsRequester && (
                      <div className="mt-3 grid gap-3 border-t border-dashed pt-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">
                            Departamento <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={chosenDepartment ?? ''}
                            onValueChange={(value) => {
                              setDepartments((prev) => ({ ...prev, [location.id]: value }))
                              // El solicitante se elige dentro del departamento:
                              // al cambiarlo, el anterior ya no pertenece.
                              setRequesters((prev) => {
                                const next = { ...prev }
                                delete next[location.id]
                                return next
                              })
                            }}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Seleccione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {allDepartments.map((department) => (
                                <SelectItem
                                  key={department.id}
                                  value={String(department.id)}
                                >
                                  {department.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">
                            Solicitado por <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={requesters[location.id] ?? ''}
                            onValueChange={(value) =>
                              setRequesters((prev) => ({ ...prev, [location.id]: value }))
                            }
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue
                                placeholder={
                                  chosenDepartment
                                    ? 'Seleccione...'
                                    : 'Elija el departamento'
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {locationEmployees.map((employee) => (
                                <SelectItem key={employee.id} value={employee.dni}>
                                  {employee.first_name} {employee.last_name}
                                  {employee.job_title?.name
                                    ? ` — ${employee.job_title.name}`
                                    : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {chosenDepartment && locationEmployees.length === 0 && (
                            <p className="text-[11px] text-amber-600 dark:text-amber-400">
                              Ese departamento no tiene empleados registrados.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Consecuencia del reparto */}
          {allocations.length > 0 && (
            <div
              className={cn(
                'rounded-xl border p-3 text-xs leading-relaxed',
                allocations.some((a) => a.location_id !== currentLocationId)
                  ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300'
                  : 'border-slate-200/70 bg-muted/40 text-muted-foreground dark:border-slate-700/60',
              )}
            >
              {allocations.some((a) => a.location_id !== currentLocationId)
                ? 'Se abrirá una salida por cada sede destino, para que lo de cada una no se mezcle. Quedarán en tránsito hasta que allá confirmen la recepción; lo que se queda entra a recepción de esta sede.'
                : 'El artículo entrará a recepción de esta sede y seguirá el camino normal.'}
            </div>
          )}

          {/* Justificación */}
          <section className="space-y-2">
            <Label htmlFor="determine-justification" className="text-sm font-semibold">
              Justificación{' '}
              <span className="font-normal text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="determine-justification"
              value={justification}
              disabled={busy}
              onChange={(event) => setJustification(event.target.value)}
              rows={3}
              className="resize-none"
              placeholder="Ej: pedido por CBL para el trabajo del YV2272."
            />
            <p className="text-xs text-muted-foreground">
              Queda en el documento del traslado y la otra sede lo verá.
            </p>
          </section>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>

          {canSubmit && (
            <Button type="button" disabled={busy} onClick={submit}>
              {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
              Confirmar destino
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
