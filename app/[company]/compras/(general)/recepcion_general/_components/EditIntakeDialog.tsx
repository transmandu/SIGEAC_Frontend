"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { AlertTriangle, Calendar as CalendarIcon, Loader2, Save } from "lucide-react"

import { useUpdateGeneralArticleIntake } from "@/actions/mantenimiento/almacen/inventario/articulos_generales/actions"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits"
import { useGetWarehousesByLocation } from "@/hooks/administracion/useGetWarehousesByUser"
import { useCompanyStore } from "@/stores/CompanyStore"
import { cn } from "@/lib/utils"
import type { GeneralArticleIntake, UpdateGeneralArticleIntakePayload } from "@/types/purchase"

// Estado editable del formulario. Las fechas viven como Date|null y el resto
// como string para que los inputs sean controlados sin saltos de cursor.
type FormState = {
  description: string
  variant_type: string
  brand_model: string
  cost: string
  quantity: string
  unit_id: string
  warehouse_id: string
  arrived_at: Date | null
  confirmed_at: Date | null
  rejected_at: Date | null
  rejection_reason: string
  observation: string
}

const toFormState = (intake: GeneralArticleIntake): FormState => ({
  description: intake.historical_description ?? intake.description ?? "",
  variant_type: intake.historical_variant_type ?? "",
  brand_model: intake.historical_brand_model ?? "",
  cost: intake.cost != null ? String(intake.cost) : "",
  quantity: intake.quantity != null ? String(intake.quantity) : "",
  unit_id: intake.unit?.id != null ? String(intake.unit.id) : "",
  warehouse_id: intake.warehouse?.id != null ? String(intake.warehouse.id) : "",
  arrived_at: intake.arrived_at ? new Date(intake.arrived_at) : null,
  confirmed_at: intake.confirmed_at ? new Date(intake.confirmed_at) : null,
  rejected_at: intake.rejected_at ? new Date(intake.rejected_at) : null,
  rejection_reason: intake.rejection_reason ?? "",
  observation: intake.observation ?? "",
})

// Un campo de texto vacío significa "sin valor" para las columnas opcionales;
// description es obligatoria, así que ahí el vacío no se envía nunca.
const emptyToNull = (value: string) => {
  const trimmed = value.trim()
  return trimmed === "" ? null : trimmed
}

export default function EditIntakeDialog({
  intake,
  open,
  onOpenChange,
}: {
  intake: GeneralArticleIntake
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { updateGeneralArticleIntake } = useUpdateGeneralArticleIntake()
  const { selectedCompany, selectedStation } = useCompanyStore()

  const [form, setForm] = useState<FormState>(() => toFormState(intake))

  const { data: units, isLoading: isUnitsLoading } = useGetUnits(open ? selectedCompany?.slug : undefined)
  const { data: warehouses, isLoading: isWarehousesLoading } = useGetWarehousesByLocation({
    company: selectedCompany?.slug ?? "",
    location_id: selectedStation ?? null,
  })

  const generalWarehouses = useMemo(
    () => (warehouses ?? []).filter((warehouse) => warehouse.type?.toUpperCase() === "GENERAL"),
    [warehouses]
  )

  useEffect(() => {
    if (!open) return
    setForm(toFormState(intake))
  }, [open, intake])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  // Una entrega directa no pasa por almacén ni tiene confirmación; su destino
  // (departamento/empleado/tercero) no se toca desde aquí.
  const isDirectDelivery = !intake.warehouse
  const isConfirmed = intake.status === "CONFIRMED"
  const isRejected = intake.status === "REJECTED"

  const orderNumber = intake.purchase_order?.quote_order?.requisition_order?.order_number

  // Solo el orden entre fechas: el "no futuro" vive en el registro real, no aquí.
  const confirmedBeforeArrival =
    !!form.arrived_at && !!form.confirmed_at && form.confirmed_at < form.arrived_at
  const rejectedBeforeArrival =
    !!form.arrived_at && !!form.rejected_at && form.rejected_at < form.arrived_at

  const timelineErrors = [
    confirmedBeforeArrival && "La confirmación no puede ser anterior a la llegada.",
    rejectedBeforeArrival && "El rechazo no puede ser anterior a la llegada.",
  ].filter(Boolean) as string[]

  const quantityValue = Number(form.quantity)
  const quantityInvalid = form.quantity.trim() === "" || !Number.isFinite(quantityValue) || quantityValue <= 0
  const descriptionInvalid = form.description.trim() === ""

  // Solo viaja lo que realmente cambió: la edición es parcial y casi siempre
  // toca únicamente las fechas.
  const payload = useMemo<UpdateGeneralArticleIntakePayload>(() => {
    const original = toFormState(intake)
    const changes: UpdateGeneralArticleIntakePayload = {}

    if (form.description.trim() !== original.description) changes.description = form.description.trim()
    if (form.variant_type !== original.variant_type) changes.variant_type = emptyToNull(form.variant_type)
    if (form.brand_model !== original.brand_model) changes.brand_model = emptyToNull(form.brand_model)

    if (form.cost !== original.cost) {
      const parsed = Number(form.cost)
      changes.cost = form.cost.trim() === "" || !Number.isFinite(parsed) ? null : parsed
    }

    if (form.quantity !== original.quantity && !quantityInvalid) changes.quantity = quantityValue
    if (form.unit_id !== original.unit_id && form.unit_id !== "") changes.unit_id = Number(form.unit_id)
    if (form.warehouse_id !== original.warehouse_id && form.warehouse_id !== "") {
      changes.warehouse_id = Number(form.warehouse_id)
    }

    if (form.arrived_at?.getTime() !== original.arrived_at?.getTime() && form.arrived_at) {
      changes.arrived_at = form.arrived_at.toISOString()
    }
    if (form.confirmed_at?.getTime() !== original.confirmed_at?.getTime()) {
      changes.confirmed_at = form.confirmed_at ? form.confirmed_at.toISOString() : null
    }
    if (form.rejected_at?.getTime() !== original.rejected_at?.getTime()) {
      changes.rejected_at = form.rejected_at ? form.rejected_at.toISOString() : null
    }

    if (form.rejection_reason !== original.rejection_reason) {
      changes.rejection_reason = emptyToNull(form.rejection_reason)
    }
    if (form.observation !== original.observation) changes.observation = emptyToNull(form.observation)

    return changes
  }, [form, intake, quantityInvalid, quantityValue])

  const changedFieldCount = Object.keys(payload).length

  // Cambiar cantidad/unidad/almacén de una entrada ya confirmada mueve el stock
  // que aportó: se avisa antes, no después.
  const affectsStock =
    isConfirmed &&
    (payload.quantity !== undefined || payload.unit_id !== undefined || payload.warehouse_id !== undefined)

  const canSubmit =
    changedFieldCount > 0 &&
    timelineErrors.length === 0 &&
    !quantityInvalid &&
    !descriptionInvalid &&
    !updateGeneralArticleIntake.isPending

  const handleSubmit = () => {
    updateGeneralArticleIntake.mutate(
      { id: intake.id, payload },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="w-[95vw] max-w-[95vw] sm:max-w-[640px] p-0 overflow-hidden max-h-[88vh] flex flex-col"
      >
        <DialogHeader className="shrink-0 border-b border-border/40 bg-muted/20 px-6 pt-5 pb-4 text-left">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 shrink-0 rounded-xl border border-amber-500/20 bg-amber-500/10">
              <AlertTriangle className="size-4.5 text-amber-700 dark:text-amber-300" />
            </div>

            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-semibold tracking-tight leading-none">
                Corregir recepción
              </DialogTitle>

              <DialogDescription className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Edición administrativa de la entrada de{" "}
                <span className="font-medium text-foreground">{intake.description}</span>
                {orderNumber && (
                  <>
                    {" "}· solicitud <span className="font-medium text-foreground">{orderNumber}</span>
                  </>
                )}
                . Solo se guardan los campos que modifiques.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-5 space-y-5">

          <Section title="Artículo">
            <div className="space-y-1.5">
              <Label className="text-xs">Descripción</Label>
              <Input
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className={cn("h-9 text-sm", descriptionInvalid && "border-red-500/50")}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Marca / Modelo</Label>
                <Input
                  value={form.brand_model}
                  onChange={(e) => set("brand_model", e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Variante</Label>
                <Input
                  value={form.variant_type}
                  onChange={(e) => set("variant_type", e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </Section>

          <Section title="Cantidad y costo">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Cantidad</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.quantity}
                  onChange={(e) => set("quantity", e.target.value)}
                  className={cn("h-9 text-sm", quantityInvalid && "border-red-500/50")}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Unidad</Label>
                <Select value={form.unit_id} onValueChange={(value) => set("unit_id", value)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder={isUnitsLoading ? "Cargando..." : "Unidad"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(units ?? []).map((unit) => (
                      <SelectItem key={unit.id} value={String(unit.id)}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Costo unitario</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.cost}
                  onChange={(e) => set("cost", e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {!isDirectDelivery && (
              <div className="space-y-1.5">
                <Label className="text-xs">Almacén</Label>
                <Select value={form.warehouse_id} onValueChange={(value) => set("warehouse_id", value)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder={isWarehousesLoading ? "Cargando almacenes..." : "Almacén"} />
                  </SelectTrigger>
                  <SelectContent>
                    {generalWarehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </Section>

          <Section title="Fechas">
            <DateTimeField
              label="Llegada"
              value={form.arrived_at}
              onChange={(date) => set("arrived_at", date)}
              invalid={confirmedBeforeArrival || rejectedBeforeArrival}
            />

            {!isDirectDelivery && !isRejected && (
              <DateTimeField
                label="Confirmación"
                value={form.confirmed_at}
                onChange={(date) => set("confirmed_at", date)}
                invalid={confirmedBeforeArrival}
                clearable
              />
            )}

            {isRejected && (
              <DateTimeField
                label="Rechazo"
                value={form.rejected_at}
                onChange={(date) => set("rejected_at", date)}
                invalid={rejectedBeforeArrival}
                clearable
              />
            )}

            {timelineErrors.length > 0 && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 space-y-1">
                {timelineErrors.map((error) => (
                  <p key={error} className="text-[11px] leading-relaxed text-red-600 dark:text-red-400">
                    {error}
                  </p>
                ))}
              </div>
            )}
          </Section>

          <Section title="Notas">
            {isRejected && (
              <div className="space-y-1.5">
                <Label className="text-xs">Motivo del rechazo</Label>
                <Textarea
                  value={form.rejection_reason}
                  onChange={(e) => set("rejection_reason", e.target.value)}
                  className="min-h-16 text-sm resize-none"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Observación</Label>
              <Textarea
                value={form.observation}
                onChange={(e) => set("observation", e.target.value)}
                className="min-h-16 text-sm resize-none"
              />
            </div>
          </Section>

          {affectsStock && (
            <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2.5">
              <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
                Esta entrada ya fue confirmada. Al cambiar la cantidad, la unidad o el almacén, el
                stock del artículo se reajustará automáticamente y quedará registrado en su historial.
              </p>
            </div>
          )}

        </div>

        <DialogFooter className="shrink-0 flex flex-row items-center justify-between gap-2 border-t border-border/40 bg-muted/20 px-6 py-4">
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {changedFieldCount === 0
              ? "Sin cambios"
              : `${changedFieldCount} campo${changedFieldCount === 1 ? "" : "s"} modificado${changedFieldCount === 1 ? "" : "s"}`}
          </span>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              disabled={updateGeneralArticleIntake.isPending}
              className="
                h-10 rounded-lg px-5
                bg-slate-500/10 text-slate-600
                hover:bg-slate-500/20
                border border-slate-500/20
                shadow-sm transition-colors
                dark:bg-slate-400/10 dark:text-slate-300
                dark:hover:bg-slate-400/20 dark:border-slate-400/20
              "
            >
              Cancelar
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="
                h-10 rounded-lg px-5
                bg-amber-500/20 text-amber-900
                hover:bg-amber-500/30
                border border-amber-500/30
                shadow-sm transition-colors
                flex items-center justify-center gap-2
                dark:bg-amber-400/10 dark:text-amber-100
                dark:hover:bg-amber-400/20 dark:border-amber-400/20
              "
            >
              {updateGeneralArticleIntake.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Save className="size-4" />
                  Guardar cambios
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
    {children}
  </div>
)

const DateTimeField = ({
  label,
  value,
  onChange,
  invalid,
  clearable,
}: {
  label: string
  value: Date | null
  onChange: (date: Date | null) => void
  invalid?: boolean
  clearable?: boolean
}) => {
  const handleDateSelect = (day: Date | undefined) => {
    if (!day) return
    const next = new Date(day)
    // Al elegir día se conserva la hora ya cargada; si no había fecha, arranca
    // en 00:00 para no inventar una hora que el usuario no eligió.
    next.setHours(value?.getHours() ?? 0, value?.getMinutes() ?? 0, 0, 0)
    onChange(next)
  }

  const handleTimeChange = (raw: string) => {
    const [hours, minutes] = raw.split(":").map(Number)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return
    const next = new Date(value ?? new Date())
    next.setHours(hours, minutes, 0, 0)
    onChange(next)
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-9 flex-1 justify-start text-sm bg-background/70",
                !value && "text-muted-foreground",
                invalid && "border-red-500/50"
              )}
            >
              <CalendarIcon className="mr-2 h-3 w-3 opacity-60" />
              {value ? format(value, "dd MMM yyyy", { locale: es }) : "Sin fecha"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={value ?? undefined}
              onSelect={handleDateSelect}
              locale={es}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Input
          type="time"
          value={value ? format(value, "HH:mm") : ""}
          onChange={(e) => handleTimeChange(e.target.value)}
          className={cn("h-9 w-28 bg-background/70 text-sm", invalid && "border-red-500/50")}
        />

        {clearable && value && (
          <Button
            variant="ghost"
            onClick={() => onChange(null)}
            className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Quitar
          </Button>
        )}
      </div>
    </div>
  )
}
