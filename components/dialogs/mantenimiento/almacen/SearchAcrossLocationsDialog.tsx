'use client'

import { useDeferredValue, useState } from 'react'
import { Loader2, MapPin, PackageSearch, Search } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { formatCondition } from '@/lib/warehouse/conditions'
import { formatStatusLabel } from '@/lib/warehouse/statuses'
import {
  useSearchAcrossLocations,
  type CrossLocationAeronautical,
} from '@/hooks/mantenimiento/almacen/articulos/useSearchAcrossLocations'

/**
 * Qué inventario está consultando: cada uno enseña sus propias columnas.
 *
 * `warehouse` es la gestión de almacén, que necesita el estado del artículo y
 * su cantidad. `general` es la vista de consulta de los demás departamentos,
 * donde importa la parte alterna y basta con saber si hay disponibilidad.
 */
export type CrossLocationVariant = 'warehouse' | 'general'

/**
 * Consulta de existencia en las sedes de la compañía.
 *
 * Nace vacío y solo busca al escribir: no es un listado del inventario ajeno,
 * es la respuesta a una pregunta puntual. La última columna es la SEDE y no
 * acciones, porque desde aquí no se opera sobre material de otra estación.
 *
 * Muestra TODOS los estados a propósito: si un artículo existiera pero no
 * apareciera por estar en cuarentena o despachado, se leería como inexistente.
 */
export function SearchAcrossLocationsDialog({
  open,
  onOpenChange,
  variant = 'warehouse',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant?: CrossLocationVariant
}) {
  const [search, setSearch] = useState('')
  const deferred = useDeferredValue(search)

  const { data, isFetching } = useSearchAcrossLocations(deferred)

  const term = deferred.trim()
  const hasQuery = term.length >= 2

  const aeronautical = data?.aeronautical ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Consultar en sedes</DialogTitle>
          <DialogDescription>
            Busque por número de parte en las <strong>otras</strong> sedes. Se
            muestran todos los estados: un artículo puede existir sin estar
            disponible.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Número de parte o parte alterna..."
            className="h-10 pl-9"
          />
        </div>

        {/* El scroll va en el cuerpo, no en el DialogContent. */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {!hasQuery && (
            <EmptyState message="Escriba al menos dos caracteres para buscar." />
          )}

          {hasQuery && isFetching && (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              <span className="text-sm">Buscando en todas las sedes...</span>
            </div>
          )}

          {hasQuery && !isFetching && aeronautical.length === 0 && (
            <EmptyState
              message={`No se encontró "${term}" en las otras sedes.`}
            />
          )}

          {hasQuery && !isFetching && aeronautical.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {aeronautical.length} resultado(s)
              </p>
              <div className="overflow-x-auto rounded-lg border">
                <AeronauticalTable rows={aeronautical} variant={variant} />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
    <PackageSearch className="size-10 text-muted-foreground/40" />
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
)

const LocationBadge = ({ location }: { location: string }) => (
  <div className="flex justify-center">
    <Badge variant="secondary" className="gap-1 font-mono text-[11px]">
      <MapPin className="size-3" />
      {location}
    </Badge>
  </div>
)

/**
 * En la vista de consulta no se enseña la cantidad: a quien no opera el almacén
 * le importa si puede contar con el artículo, no cuánto hay. Disponible es
 * existencia real y almacenada; cualquier otro estado no lo está aunque exista.
 *
 * Misma regla que la columna "Disponiblidad" de general/inventario_articulos.
 */
const AvailabilityBadge = ({
  quantity,
  status,
}: {
  quantity: number
  status?: string | null
}) => {
  const isAvailable =
    quantity > 0 && (status === undefined || status?.toLowerCase() === 'stored')

  return (
    <div className="flex justify-center">
      <Badge
        variant={isAvailable ? 'default' : 'destructive'}
        className="whitespace-nowrap px-3 py-1 text-xs font-bold"
      >
        {isAvailable ? 'Disponible' : 'No Disponible'}
      </Badge>
    </div>
  )
}

const AeronauticalTable = ({
  rows,
  variant,
}: {
  rows: CrossLocationAeronautical[]
  variant: CrossLocationVariant
}) => {
  const showStatus = variant === 'warehouse'
  const showAlternate = variant === 'general'

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Descripción</TableHead>
          <TableHead>Nro. de Parte</TableHead>
          {showAlternate && <TableHead>Parte Alterna</TableHead>}
          <TableHead>Serial / Lote</TableHead>
          <TableHead className="text-center">Condición</TableHead>
          {showStatus && <TableHead className="text-center">Estado</TableHead>}
          <TableHead className={showStatus ? 'text-right' : 'text-center'}>
            {showStatus ? 'Cantidad' : 'Disponiblidad'}
          </TableHead>
          <TableHead className="text-center">Sede</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.map((row) => {
          const condition = formatCondition(row.condition)
          const alternates = Array.isArray(row.alternative_part_number)
            ? row.alternative_part_number
            : row.alternative_part_number
              ? [row.alternative_part_number]
              : []

          return (
            <TableRow key={row.id}>
              <TableCell className="max-w-[220px]">
                <p className="truncate text-sm font-medium">
                  {row.description ?? 'Sin descripción'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {row.category ?? '—'}
                </p>
              </TableCell>

              <TableCell>
                <span className="font-mono text-sm">
                  {row.part_number ?? '—'}
                </span>
              </TableCell>

              {showAlternate && (
                <TableCell>
                  <span className="font-mono text-xs text-muted-foreground">
                    {alternates.length > 0 ? alternates.join(', ') : '—'}
                  </span>
                </TableCell>
              )}

              <TableCell>
                <span className="font-mono text-xs">{row.serial ?? '—'}</span>
              </TableCell>

              <TableCell className="text-center">
                {condition ? (
                  <span className="text-xs">
                    <span className="font-medium">{condition.es}</span>{' '}
                    <span className="italic text-muted-foreground">
                      ({condition.en})
                    </span>
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>

              {showStatus && (
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-[11px]">
                    {formatStatusLabel(row.status ?? '')}
                  </Badge>
                </TableCell>
              )}

              {showStatus ? (
                <TableCell className="text-right">
                  <span className="font-mono text-sm tabular-nums">
                    {row.quantity} {row.unit}
                  </span>
                </TableCell>
              ) : (
                <TableCell>
                  <AvailabilityBadge quantity={row.quantity} status={row.status} />
                </TableCell>
              )}

              <TableCell>
                <LocationBadge location={row.location} />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
