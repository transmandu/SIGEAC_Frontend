"use client";

import { PanelSection } from "@/components/forms/PanelSection";
import { useMemo } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Info,
  Loader2,
  Package,
  Save,
  StickyNote,
  Wallet,
} from "lucide-react";

import { useUpdateGeneralArticleIntake } from "@/actions/mantenimiento/almacen/inventario/articulos_generales/actions";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import {
  fieldClass,
  labelClass,
  selectTriggerClass,
  textareaClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { NumericTextInput } from "@/components/forms/mantenimiento/almacen/_components/NumericInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DateTimeField } from "@/components/misc/DateTimeField";
import { SearchableSelect } from "@/components/misc/SearchableSelect";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { useGetWarehousesByLocation } from "@/hooks/administracion/useGetWarehousesByUser";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { useCompanyStore } from "@/stores/CompanyStore";
import { toZonedWallClock, zonedWallClockToUtcIso } from "@/lib/date";
import { cn } from "@/lib/utils";
import type {
  GeneralArticleIntake,
  UpdateGeneralArticleIntakePayload,
} from "@/types/purchase";
import { useResettingState } from "@/hooks/useResettingState";

// Estado editable del formulario. Las fechas viven como la hora de pared de la
// zona de la compañía (un Date cuyos campos locales son los de esa zona) y el
// resto como string, para que los inputs sean controlados sin saltos de cursor.
type FormState = {
  description: string;
  variant_type: string;
  brand_model: string;
  cost: string;
  quantity: string;
  unit_id: string;
  warehouse_id: string;
  arrived_at: Date | null;
  confirmed_at: Date | null;
  rejected_at: Date | null;
  rejection_reason: string;
  observation: string;
};

const toFormState = (
  intake: GeneralArticleIntake,
  timeZone: string,
): FormState => ({
  description: intake.historical_description ?? intake.description ?? "",
  variant_type: intake.historical_variant_type ?? "",
  brand_model: intake.historical_brand_model ?? "",
  cost: intake.cost != null ? String(intake.cost) : "",
  quantity: intake.quantity != null ? String(intake.quantity) : "",
  unit_id: intake.unit?.id != null ? String(intake.unit.id) : "",
  warehouse_id: intake.warehouse?.id != null ? String(intake.warehouse.id) : "",
  arrived_at: toZonedWallClock(intake.arrived_at, timeZone),
  confirmed_at: toZonedWallClock(intake.confirmed_at, timeZone),
  rejected_at: toZonedWallClock(intake.rejected_at, timeZone),
  rejection_reason: intake.rejection_reason ?? "",
  observation: intake.observation ?? "",
});

// Un campo de texto vacío significa "sin valor" para las columnas opcionales;
// description es obligatoria, así que ahí el vacío no se envía nunca.
const emptyToNull = (value: string) => {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const pickerClass = cn(
  selectTriggerClass,
  "h-10 px-3 text-sm max-sm:text-base",
);

export default function EditIntakeDialog({
  intake,
  open,
  onOpenChange,
}: {
  intake: GeneralArticleIntake;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { updateGeneralArticleIntake } = useUpdateGeneralArticleIntake();
  const { selectedCompany, selectedStation } = useCompanyStore();
  const timeZone = useCompanyTimezone();

  // Cada vez que se abre (o llega otro registro) el formulario parte de los
  // datos del registro. Se compara por id y no por objeto: una recarga en
  // segundo plano trae el mismo registro como objeto nuevo, y reiniciar por eso
  // borraría lo que el usuario lleva escrito. La zona va en las dependencias
  // porque las fechas se guardan como hora de pared de esa zona: si la zona
  // llega después, el formulario debe rehacerse con ella.
  const [form, setForm] = useResettingState<FormState>(
    () => toFormState(intake, timeZone),
    [open, intake.id, timeZone],
  );

  const { data: units, isLoading: isUnitsLoading } = useGetUnits(
    open ? selectedCompany?.slug : undefined,
  );
  const { data: warehouses, isLoading: isWarehousesLoading } =
    useGetWarehousesByLocation({
      company: selectedCompany?.slug ?? "",
      location_id: selectedStation ?? null,
    });

  const generalWarehouses = useMemo(
    () =>
      (warehouses ?? []).filter(
        (warehouse) => warehouse.type?.toUpperCase() === "GENERAL",
      ),
    [warehouses],
  );

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Una entrega directa no pasa por almacén ni tiene confirmación; su destino
  // (departamento/empleado/tercero) no se toca desde aquí.
  const isDirectDelivery = !intake.warehouse;
  const isConfirmed = intake.status === "CONFIRMED";
  const isRejected = intake.status === "REJECTED";

  const orderNumber =
    intake.purchase_order?.quote_order?.requisition_order?.order_number;

  // Solo el orden entre fechas: el "no futuro" vive en el registro real, no aquí.
  const confirmedBeforeArrival =
    !!form.arrived_at &&
    !!form.confirmed_at &&
    form.confirmed_at < form.arrived_at;
  const rejectedBeforeArrival =
    !!form.arrived_at &&
    !!form.rejected_at &&
    form.rejected_at < form.arrived_at;

  const timelineErrors = [
    confirmedBeforeArrival &&
      "La confirmación no puede ser anterior a la llegada.",
    rejectedBeforeArrival && "El rechazo no puede ser anterior a la llegada.",
  ].filter(Boolean) as string[];

  const quantityValue = Number(form.quantity);
  const quantityInvalid =
    form.quantity.trim() === "" ||
    !Number.isFinite(quantityValue) ||
    quantityValue <= 0;
  const descriptionInvalid = form.description.trim() === "";

  // Solo viaja lo que realmente cambió: la edición es parcial y casi siempre
  // toca únicamente las fechas.
  const payload = useMemo<UpdateGeneralArticleIntakePayload>(() => {
    const original = toFormState(intake, timeZone);
    const changes: UpdateGeneralArticleIntakePayload = {};

    if (form.description.trim() !== original.description)
      changes.description = form.description.trim();
    if (form.variant_type !== original.variant_type)
      changes.variant_type = emptyToNull(form.variant_type);
    if (form.brand_model !== original.brand_model)
      changes.brand_model = emptyToNull(form.brand_model);

    if (form.cost !== original.cost) {
      const parsed = Number(form.cost);
      changes.cost =
        form.cost.trim() === "" || !Number.isFinite(parsed) ? null : parsed;
    }

    if (form.quantity !== original.quantity && !quantityInvalid)
      changes.quantity = quantityValue;
    if (form.unit_id !== original.unit_id && form.unit_id !== "")
      changes.unit_id = Number(form.unit_id);
    if (
      form.warehouse_id !== original.warehouse_id &&
      form.warehouse_id !== ""
    ) {
      changes.warehouse_id = Number(form.warehouse_id);
    }

    if (
      form.arrived_at?.getTime() !== original.arrived_at?.getTime() &&
      form.arrived_at
    ) {
      changes.arrived_at = zonedWallClockToUtcIso(form.arrived_at, timeZone);
    }
    if (form.confirmed_at?.getTime() !== original.confirmed_at?.getTime()) {
      changes.confirmed_at = form.confirmed_at
        ? zonedWallClockToUtcIso(form.confirmed_at, timeZone)
        : null;
    }
    if (form.rejected_at?.getTime() !== original.rejected_at?.getTime()) {
      changes.rejected_at = form.rejected_at
        ? zonedWallClockToUtcIso(form.rejected_at, timeZone)
        : null;
    }

    if (form.rejection_reason !== original.rejection_reason) {
      changes.rejection_reason = emptyToNull(form.rejection_reason);
    }
    if (form.observation !== original.observation)
      changes.observation = emptyToNull(form.observation);

    return changes;
  }, [form, intake, timeZone, quantityInvalid, quantityValue]);

  const changedFieldCount = Object.keys(payload).length;

  // Cambiar cantidad/unidad/almacén de una entrada ya confirmada mueve el stock
  // que aportó: se avisa antes, no después.
  const affectsStock =
    isConfirmed &&
    (payload.quantity !== undefined ||
      payload.unit_id !== undefined ||
      payload.warehouse_id !== undefined);

  const canSubmit =
    changedFieldCount > 0 &&
    timelineErrors.length === 0 &&
    !quantityInvalid &&
    !descriptionInvalid &&
    !updateGeneralArticleIntake.isPending;

  const handleSubmit = () => {
    updateGeneralArticleIntake.mutate(
      { id: intake.id, payload },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent
        onClick={(e) => e.stopPropagation()}
        className="sm:max-w-160"
        icon={AlertTriangle}
        tone="amber"
        title="Corregir recepción"
        description={
          <>
            Edición administrativa de la entrada de{" "}
            <span className="font-medium text-foreground">
              {intake.description}
            </span>
            {orderNumber && (
              <>
                {" "}
                · solicitud{" "}
                <span className="font-medium text-foreground">
                  {orderNumber}
                </span>
              </>
            )}
            . Solo se guardan los campos que modifique.
          </>
        }
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateGeneralArticleIntake.isPending}
            >
              Cancelar
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="min-w-35 gap-2"
            >
              {updateGeneralArticleIntake.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Guardar cambios
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <PanelSection icon={Package} title="Artículo" compact>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className={labelClass} htmlFor="intake-description">
                  Descripción <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="intake-description"
                  value={form.description}
                  aria-invalid={descriptionInvalid || undefined}
                  onChange={(e) => set("description", e.target.value)}
                  className={cn(fieldClass, "h-10 max-sm:text-base")}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className={labelClass} htmlFor="intake-brand">
                    Marca / Modelo
                  </Label>
                  <Input
                    id="intake-brand"
                    value={form.brand_model}
                    onChange={(e) => set("brand_model", e.target.value)}
                    className={cn(fieldClass, "h-10 max-sm:text-base")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className={labelClass} htmlFor="intake-variant">
                    Variante
                  </Label>
                  <Input
                    id="intake-variant"
                    value={form.variant_type}
                    onChange={(e) => set("variant_type", e.target.value)}
                    className={cn(fieldClass, "h-10 max-sm:text-base")}
                  />
                </div>
              </div>
            </div>
          </PanelSection>

          <PanelSection icon={Wallet} title="Cantidad y costo" compact>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className={labelClass} htmlFor="intake-quantity">
                    Cantidad <span className="text-red-500">*</span>
                  </Label>
                  <NumericTextInput
                    id="intake-quantity"
                    value={form.quantity}
                    onValueChange={(value) => set("quantity", value)}
                    aria-invalid={quantityInvalid || undefined}
                    className="h-10 max-sm:text-base"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className={labelClass}>Unidad</Label>
                  <SearchableSelect
                    value={form.unit_id}
                    onChange={(value) => set("unit_id", value)}
                    loading={isUnitsLoading}
                    placeholder="Unidad"
                    searchPlaceholder="Buscar unidad..."
                    triggerClassName={pickerClass}
                    options={(units ?? []).map((unit) => ({
                      value: String(unit.id),
                      label: unit.label,
                    }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className={labelClass} htmlFor="intake-cost">
                    Costo unitario
                  </Label>
                  <NumericTextInput
                    id="intake-cost"
                    value={form.cost}
                    onValueChange={(value) => set("cost", value)}
                    className="h-10 max-sm:text-base"
                  />
                </div>
              </div>

              {!isDirectDelivery && (
                <div className="space-y-1.5">
                  <Label className={labelClass}>Almacén</Label>
                  <Select
                    value={form.warehouse_id}
                    onValueChange={(value) => set("warehouse_id", value)}
                  >
                    <SelectTrigger className={pickerClass}>
                      <SelectValue
                        placeholder={
                          isWarehousesLoading
                            ? "Cargando almacenes..."
                            : "Almacén"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {generalWarehouses.map((warehouse) => (
                        <SelectItem
                          key={warehouse.id}
                          value={String(warehouse.id)}
                        >
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </PanelSection>

          <PanelSection
            icon={CalendarClock}
            title="Fechas"
            hint="Hora de la compañía."
            compact
          >
            <div className="space-y-4">
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
                <div
                  role="alert"
                  className="space-y-1 rounded-lg border border-red-500/25 bg-red-500/5 px-3.5 py-3 motion-safe:animate-reveal"
                >
                  {timelineErrors.map((error) => (
                    <p
                      key={error}
                      className="text-[13px] leading-relaxed text-red-600 dark:text-red-400"
                    >
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </PanelSection>

          <PanelSection icon={StickyNote} title="Notas" compact>
            <div className="space-y-4">
              {isRejected && (
                <div className="space-y-1.5">
                  <Label className={labelClass} htmlFor="intake-rejection">
                    Motivo del rechazo
                  </Label>
                  <Textarea
                    id="intake-rejection"
                    rows={3}
                    value={form.rejection_reason}
                    onChange={(e) => set("rejection_reason", e.target.value)}
                    className={textareaClass}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className={labelClass} htmlFor="intake-observation">
                  Observación
                </Label>
                <Textarea
                  id="intake-observation"
                  rows={3}
                  value={form.observation}
                  onChange={(e) => set("observation", e.target.value)}
                  className={textareaClass}
                />
              </div>
            </div>
          </PanelSection>

          {affectsStock && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-amber-300/70 bg-amber-50 p-3.5 text-[13px] leading-relaxed text-amber-900 motion-safe:animate-reveal dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>
                Esta entrada ya fue confirmada. Al cambiar la cantidad, la
                unidad o el almacén, el stock del artículo se reajustará
                automáticamente y quedará registrado en su historial.
              </p>
            </div>
          )}

          <p
            aria-live="polite"
            className="flex items-center gap-1.5 text-[13px] text-muted-foreground"
          >
            <Info className="size-3.5 shrink-0" />
            {changedFieldCount === 0
              ? "Sin cambios todavía."
              : `${changedFieldCount} campo${changedFieldCount === 1 ? "" : "s"} modificado${changedFieldCount === 1 ? "" : "s"}.`}
          </p>
        </div>
      </FormDialogContent>
    </Dialog>
  );
}
