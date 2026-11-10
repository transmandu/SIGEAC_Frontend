"use client";

import { locationName } from "@/lib/locations";
import { PanelSection } from "@/components/forms/PanelSection";
import { useMemo, useState } from "react";
import {
  Check,
  Info,
  Loader2,
  MapPin,
  MessageSquareText,
  Package,
  PackageCheck,
  Truck,
} from "lucide-react";

import { Dialog } from "@/components/ui/dialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import {
  labelClass,
  numericFieldClass,
  selectTriggerClass,
  textareaClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/misc/SearchableSelect";
import CopyPartNumberButton from "@/components/misc/CopyPartNumberButton";
import { TagBadge } from "@/components/misc/TagBadge";
import { cn } from "@/lib/utils";

import { useDetermineArticleDestination } from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany";
import { useGetEmployeesByCompany } from "@/hooks/ajustes/empleados/useGetEmployees";
import { useGetDepartments } from "@/hooks/ajustes/departamento/useGetDepartment";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { DestinationArticle } from "@/types/purchase";

interface Props {
  article: DestinationArticle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Cantidad sin ceros de más ("2", "1.5"): el reparto admite hasta 4 decimales. */
const formatQuantity = (value: number) => String(Number(value.toFixed(4)));

const pickerClass = cn(
  selectTriggerClass,
  "h-10 px-3 text-sm max-sm:text-base",
);

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
export function DetermineDestinationDialog({
  article,
  open,
  onOpenChange,
}: Props) {
  const { selectedCompany } = useCompanyStore();
  const { data: locations = [], isLoading } = useGetLocationsByCompany(
    selectedCompany?.slug,
  );
  const { data: employees = [] } = useGetEmployeesByCompany(
    selectedCompany?.slug,
  );
  const { data: allDepartments = [] } = useGetDepartments(
    selectedCompany?.slug,
  );
  const { determineDestination } = useDetermineArticleDestination();

  /** Cantidad asignada a cada sede, indexada por id. Vacío = no participa. */
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  /** Quién pidió el material y para qué departamento, por sede destino. */
  const [requesters, setRequesters] = useState<Record<number, string>>({});
  const [departments, setDepartments] = useState<Record<number, string>>({});
  const [justification, setJustification] = useState("");

  const currentLocationId = article.batch?.warehouse?.location?.id ?? null;
  const available = Number(article.quantity ?? 1);
  const unit = article.unit ?? "UNIDAD";
  const busy = determineDestination.isPending;

  // Un serializado es UNA pieza: no se reparte, va entera a una sola sede.
  const isSplittable = available > 1;

  const allocations = useMemo(
    () =>
      Object.entries(amounts)
        .map(([id, value]) => ({
          location_id: Number(id),
          quantity: Number(value.replace(",", ".")),
          requested_by: requesters[Number(id)] || undefined,
          department_id: departments[Number(id)]
            ? Number(departments[Number(id)])
            : undefined,
        }))
        .filter(
          (entry) => Number.isFinite(entry.quantity) && entry.quantity > 0,
        ),
    [amounts, requesters, departments],
  );

  const assigned = allocations.reduce((sum, entry) => sum + entry.quantity, 0);
  const pending = Number((available - assigned).toFixed(4));
  // Se compara el sobrante ya redondeado: 0.1 + 0.2 > 0.3 en punto flotante
  // marcaría "excede" un reparto exacto.
  const exceeds = pending < 0;
  const complete = assigned > 0 && pending === 0;

  const hasTransfers = allocations.some(
    (entry) => entry.location_id !== currentLocationId,
  );

  // Lo que se queda aquí no abre salida: solo los traslados necesitan a quién
  // atribuírsele en la sede que los recibe.
  const transfersReady = allocations
    .filter((entry) => entry.location_id !== currentLocationId)
    .every((entry) => entry.requested_by && entry.department_id);

  const canSubmit =
    allocations.length > 0 && !exceeds && pending === 0 && transfersReady;

  // Lo que falta para confirmar, dicho una vez: el botón se deshabilita y esto
  // explica por qué, en lugar de desaparecer y reaparecer.
  const blocker =
    allocations.length === 0
      ? "Elija la sede a la que pertenece el artículo."
      : exceeds
        ? `Se asignó ${formatQuantity(assigned - available)} ${unit} de más.`
        : pending > 0
          ? `Faltan ${formatQuantity(pending)} ${unit} por asignar.`
          : !transfersReady
            ? "Indique el departamento y quién solicita en cada traslado."
            : null;

  /**
   * Solo dígitos y un separador decimal: el campo es de texto para no arrastrar
   * las flechas y el scroll del input numérico, así que la restricción se hace
   * aquí. Se acepta la coma, que es como se escribe un decimal en el teclado
   * local, y se normaliza a punto al enviar.
   */
  const setAmount = (locationId: number, value: string) => {
    if (value !== "" && !/^\d*[.,]?\d*$/.test(value)) return;

    setAmounts((prev) => ({ ...prev, [locationId]: value }));
  };

  // Lo que falta por repartir, a la sede indicada (sumado a lo que ya tenía).
  const assignRemaining = (locationId: number) => {
    const current = Number((amounts[locationId] ?? "").replace(",", ".")) || 0;
    setAmounts((prev) => ({
      ...prev,
      [locationId]: formatQuantity(current + Math.max(pending, 0)),
    }));
  };

  // Al soltar una sede se va también a quién se le atribuía: dejarlo colgando
  // reenviaría el solicitante de un destino que ya no participa.
  const toggleWhole = (locationId: number) => {
    setAmounts((prev) =>
      prev[locationId] ? {} : { [locationId]: String(available) },
    );
    setRequesters({});
    setDepartments({});
  };

  const submit = async () => {
    if (!canSubmit) return;

    try {
      await determineDestination.mutateAsync({
        id: article.id,
        allocations,
        justification: justification.trim() || undefined,
      });
    } catch {
      // El aviso del error lo muestra la mutación; el diálogo sigue abierto.
      return;
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent
        className="sm:max-w-2xl"
        icon={MapPin}
        title="Determinar destino"
        description="Indique a qué sede pertenece el artículo. Puede repartirlo entre varias."
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              disabled={busy || !canSubmit}
              onClick={submit}
              className="min-w-35 gap-2"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              Confirmar destino
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Identidad del artículo */}
          <PanelSection icon={Package} title="Artículo" compact>
            <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-mono text-base font-semibold wrap-anywhere">
                    {article.part_number || "Sin P/N"}
                  </p>
                  <CopyPartNumberButton value={article.part_number} />
                </div>
                <p className="text-sm text-muted-foreground wrap-anywhere">
                  {article.batch?.name || "Sin descripción"}
                </p>
                <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  Ahora en
                  <TagBadge tone="slate" className="h-5 px-2">
                    {article.batch?.warehouse?.location?.cod_iata ??
                      "sede desconocida"}
                  </TagBadge>
                </p>
              </div>

              <div className="text-right max-sm:text-left">
                <p className="text-[13px] text-muted-foreground">
                  Por repartir
                </p>
                <p className="font-mono text-lg font-semibold tabular-nums">
                  {formatQuantity(available)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {unit}
                  </span>
                </p>
              </div>
            </div>
          </PanelSection>
          {/* Reparto por sede */}
          <PanelSection
            icon={MapPin}
            title="¿A qué sede pertenece?"
            hint={
              isSplittable
                ? "Reparta la cantidad entre las sedes que correspondan."
                : "Es una sola pieza: va entera a una sede."
            }
            compact
            action={
              exceeds ? (
                <TagBadge tone="rose">
                  Excede en {formatQuantity(assigned - available)} {unit}
                </TagBadge>
              ) : complete ? (
                <TagBadge tone="emerald" icon={Check}>
                  Completo
                </TagBadge>
              ) : (
                <TagBadge tone="slate">
                  Sin asignar: {formatQuantity(pending)} {unit}
                </TagBadge>
              )
            }
          >
            {/* La lista llega a los bordes del panel: sin recuadro por sede, con
                una línea entre filas. La barra de avance queda pegada bajo la
                franja del encabezado. */}
            <div className="-m-3 overflow-hidden rounded-b-xl">
              {isSplittable && (
                <div aria-hidden className="h-1 bg-muted">
                  <div
                    className={cn(
                      "h-full transition-[width,background-color] duration-300 ease-out",
                      exceeds
                        ? "bg-rose-500"
                        : complete
                          ? "bg-emerald-500"
                          : "bg-primary",
                    )}
                    style={{
                      width: `${Math.min(100, (assigned / available) * 100)}%`,
                    }}
                  />
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ul className="divide-y divide-border/60">
                  {locations.map((location) => {
                    const isCurrent = location.id === currentLocationId;
                    const value = amounts[location.id] ?? "";
                    const isSelected = Number(value.replace(",", ".")) > 0;

                    // Solo un traslado abre salida, y toda salida se le atribuye
                    // a alguien: lo que se queda aquí sigue el camino de siempre.
                    const needsRequester = isSelected && !isCurrent;

                    // El personal se acota por el departamento elegido, no por la
                    // sede: los cargos son genéricos ("Jefe", "Ayudante") y es el
                    // departamento el que separa el almacén de una sede y otra.
                    const chosenDepartment = departments[location.id];
                    const locationEmployees = chosenDepartment
                      ? employees.filter(
                          (employee) =>
                            String(employee.department?.id) ===
                            chosenDepartment,
                        )
                      : [];

                    const identity = (
                      <span className="min-w-0 flex-1 basis-36">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold">
                          {location.cod_iata}
                          {isCurrent && (
                            <TagBadge tone="sky" className="h-5 px-2">
                              Donde está ahora
                            </TagBadge>
                          )}
                        </span>
                        <span className="block text-[13px] text-muted-foreground wrap-anywhere">
                          {locationName(location)}
                        </span>
                      </span>
                    );
                    return (
                      <li
                        key={location.id}
                        className={cn(
                          "px-3 py-3 transition-colors duration-200",
                          isSelected && "bg-primary/5",
                        )}
                      >
                        {isSplittable ? (
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
                            {identity}

                            {/* La unidad va FUERA del campo y no superpuesta: su
                              ancho depende del texto ("UNIDADES" es largo) y con
                              un padding fijo terminaba encima de lo escrito. */}
                            <div className="flex w-full items-center gap-2 sm:w-auto">
                              <Input
                                inputMode="decimal"
                                disabled={busy}
                                value={value}
                                aria-label={`Cantidad para ${location.cod_iata}`}
                                onChange={(event) =>
                                  setAmount(location.id, event.target.value)
                                }
                                placeholder="0"
                                className={cn(
                                  numericFieldClass,
                                  "h-10 min-w-0 flex-1 text-right sm:w-28 sm:flex-none max-sm:text-base",
                                )}
                              />
                              <span className="w-14 shrink-0 text-xs text-muted-foreground">
                                {unit}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                disabled={busy || pending <= 0}
                                onClick={() => assignRemaining(location.id)}
                                className="h-10 shrink-0 px-3 text-sm"
                              >
                                Resto
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // Con una sola unidad no hay nada que repartir: toda la
                          // fila elige la sede, sin pedir una cantidad que solo
                          // puede ser 1.
                          <button
                            type="button"
                            aria-pressed={isSelected}
                            disabled={busy}
                            onClick={() => toggleWhole(location.id)}
                            className="-mx-1 flex w-[calc(100%+0.5rem)] items-center gap-3 rounded-lg px-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {identity}
                            <span
                              className={cn(
                                "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-slate-400/60 dark:border-slate-600/60",
                              )}
                            >
                              {isSelected && <Check className="size-3" />}
                            </span>
                          </button>
                        )}

                        {needsRequester && (
                          <div className="mt-3 grid gap-3 motion-safe:animate-reveal sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <Label className={labelClass}>
                                Departamento{" "}
                                <span className="text-red-500">*</span>
                              </Label>
                              <SearchableSelect
                                value={chosenDepartment ?? ""}
                                onChange={(value) => {
                                  setDepartments((prev) => ({
                                    ...prev,
                                    [location.id]: value,
                                  }));
                                  // El solicitante se elige dentro del departamento:
                                  // al cambiarlo, el anterior ya no pertenece.
                                  setRequesters((prev) => {
                                    const next = { ...prev };
                                    delete next[location.id];
                                    return next;
                                  });
                                }}
                                placeholder="Seleccione..."
                                searchPlaceholder="Buscar departamento..."
                                triggerClassName={pickerClass}
                                options={allDepartments.map((department) => ({
                                  value: String(department.id),
                                  label: department.name,
                                }))}
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className={labelClass}>
                                Solicitado por{" "}
                                <span className="text-red-500">*</span>
                              </Label>
                              <SearchableSelect
                                value={requesters[location.id] ?? ""}
                                onChange={(value) =>
                                  setRequesters((prev) => ({
                                    ...prev,
                                    [location.id]: value,
                                  }))
                                }
                                disabled={!chosenDepartment}
                                placeholder={
                                  chosenDepartment
                                    ? "Seleccione..."
                                    : "Elija el departamento"
                                }
                                searchPlaceholder="Buscar empleado..."
                                triggerClassName={pickerClass}
                                options={locationEmployees.map((employee) => ({
                                  value: employee.dni,
                                  label: `${employee.first_name} ${employee.last_name}`,
                                  description: employee.job_title?.name,
                                }))}
                              />
                              {chosenDepartment &&
                                locationEmployees.length === 0 && (
                                  <p className="text-[13px] text-amber-600 dark:text-amber-400">
                                    Ese departamento no tiene empleados
                                    registrados.
                                  </p>
                                )}
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </PanelSection>

          {/* Consecuencia del reparto y lo que falta para confirmar */}
          {allocations.length > 0 && (
            <div
              className={cn(
                "flex items-start gap-2.5 rounded-xl border p-3.5 text-[13px] leading-relaxed motion-safe:animate-reveal",
                hasTransfers
                  ? "border-amber-300/70 bg-amber-50 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200"
                  : "border-slate-200 bg-muted/40 text-muted-foreground dark:border-slate-700/60",
              )}
            >
              {hasTransfers ? (
                <Truck className="mt-0.5 size-4 shrink-0" />
              ) : (
                <PackageCheck className="mt-0.5 size-4 shrink-0" />
              )}
              <div className="space-y-1">
                <p>
                  {hasTransfers
                    ? "Se abrirá una salida por cada sede destino, para que lo de cada una no se mezcle. Quedarán en tránsito hasta que allá confirmen la recepción; lo que se queda entra a recepción de esta sede."
                    : "El artículo entrará a recepción de esta sede y seguirá el camino normal."}
                </p>
                {blocker && (
                  <p className="flex items-center gap-1.5 font-medium">
                    <Info className="size-3.5 shrink-0" />
                    {blocker}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Justificación */}
          <PanelSection
            icon={MessageSquareText}
            title="Justificación"
            hint="Opcional. Queda en el documento del traslado y la otra sede lo verá."
            compact
          >
            <Textarea
              id="determine-justification"
              aria-label="Justificación"
              value={justification}
              disabled={busy}
              onChange={(event) => setJustification(event.target.value)}
              rows={3}
              className={textareaClass}
              placeholder="Ej: pedido por CBL para el trabajo del YV2272."
            />
          </PanelSection>
        </div>
      </FormDialogContent>
    </Dialog>
  );
}
