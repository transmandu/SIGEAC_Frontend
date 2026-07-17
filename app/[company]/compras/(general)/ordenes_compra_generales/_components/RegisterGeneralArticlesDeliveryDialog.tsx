"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Building2, Calendar as CalendarIcon, Check, Handshake, Loader2, PackageCheck, User, UserCog, Warehouse as WarehouseIcon } from "lucide-react"

import { useRegisterGeneralArticlesDelivery, type GeneralArticlesDeliveryDestination } from "@/actions/mantenimiento/compras/ordenes_compras/actions"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGetWarehousesByLocation } from "@/hooks/administracion/useGetWarehousesByUser"
import { useGetDepartments } from "@/hooks/sistema/departamento/useGetDepartment"
import { useGetEmployeesByCompany } from "@/hooks/sistema/empleados/useGetEmployees"
import { useGetAuthorizedEmployees } from "@/hooks/sistema/autorizados/useGetAuthorizedEmployees"
import { useGetThirdParties } from "@/hooks/general/terceros/useGetThirdParties"
import { useCompanyStore } from "@/stores/CompanyStore"
import { cn } from "@/lib/utils"
import type { Department } from "@/types"
import type { PurchaseOrder, PurchaseOrderGeneralArticle } from "@/types/purchase"

// Departments come back as a tree (each with nested `descendants`), so the
// selector must flatten it to let the user pick any department, not just
// the top-level ones.
const flattenDepartments = (departments: Department[]): Department[] =>
  departments.flatMap((department) => [
    department,
    ...flattenDepartments(department.descendants ?? []),
  ])

// Destino de la entrega: el almacén (flujo normal, intake PENDING que el
// almacén confirma) o una entrega directa afiliada a un departamento,
// empleado, autorizado o tercero — mismas entidades que la requisición
// general — que nace DELIVERED, no pasa por inventario y genera Nota de Entrega.
type DestinationType = "WAREHOUSE" | "DEPARTMENT" | "EMPLOYEE" | "AUTHORIZED" | "THIRD_PARTY"

const DESTINATION_OPTIONS: { value: DestinationType; label: string; Icon: typeof WarehouseIcon }[] = [
  { value: "WAREHOUSE", label: "Almacén", Icon: WarehouseIcon },
  { value: "DEPARTMENT", label: "Departamento", Icon: Building2 },
  { value: "EMPLOYEE", label: "Empleado", Icon: User },
  { value: "AUTHORIZED", label: "Solicitante autorizado", Icon: UserCog },
  { value: "THIRD_PARTY", label: "Tercero", Icon: Handshake },
]

export default function RegisterGeneralArticlesDeliveryDialog({
  po,
  company,
  open,
  onOpenChange,
}: {
  po: PurchaseOrder
  company: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { registerGeneralArticlesDelivery } = useRegisterGeneralArticlesDelivery()
  const { selectedStation } = useCompanyStore()

  const pendingItems = useMemo(
    () => (po.general_article_purchase_order ?? []).filter((item) => !item.general_article_intake),
    [po.general_article_purchase_order]
  )

  const [arrivedAt, setArrivedAt] = useState<Date>(() => new Date())
  const [selected, setSelected] = useState<Record<number, boolean>>({})
  const [destinationType, setDestinationType] = useState<DestinationType>("WAREHOUSE")
  const [destinationId, setDestinationId] = useState<string>("")

  const { data: warehouses, isLoading: isWarehousesLoading } = useGetWarehousesByLocation({
    company,
    location_id: selectedStation ?? null,
  })
  const { data: departments, isLoading: isDepartmentsLoading } = useGetDepartments(open ? company : undefined)
  const { data: employees, isLoading: isEmployeesLoading } = useGetEmployeesByCompany(open ? company : undefined)
  const { data: authorizedEmployees, isLoading: isAuthorizedLoading } = useGetAuthorizedEmployees(open ? company : undefined)
  const { data: thirdParties, isLoading: isThirdPartiesLoading } = useGetThirdParties()

  // Solo los almacenes de tipo GENERAL de la estación activa son destinos
  // válidos para artículos generales.
  const generalWarehouses = useMemo(
    () => (warehouses ?? []).filter((warehouse) => warehouse.type?.toUpperCase() === "GENERAL"),
    [warehouses]
  )

  const allDepartments = useMemo(
    () => flattenDepartments(departments ?? []),
    [departments]
  )

  useEffect(() => {
    if (!open) return
    setArrivedAt(new Date())
    setSelected(Object.fromEntries(pendingItems.map((item) => [item.id, true])))
    setDestinationType("WAREHOUSE")
    setDestinationId("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Por defecto la entrega va al primer almacén GENERAL de la estación.
  useEffect(() => {
    if (!open || destinationType !== "WAREHOUSE" || destinationId) return
    if (generalWarehouses.length > 0) {
      setDestinationId(generalWarehouses[0].id.toString())
    }
  }, [open, destinationType, destinationId, generalWarehouses])

  const toggleItem = (id: number) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }))

  const selectedIds = pendingItems.filter((item) => selected[item.id]).map((item) => item.id)
  const selectedCount = selectedIds.length
  const allSelected = selectedCount === pendingItems.length && pendingItems.length > 0

  const toggleAll = () => {
    const next = !allSelected
    setSelected(Object.fromEntries(pendingItems.map((item) => [item.id, next])))
  }

  const handleDateSelect = (day: Date | undefined) => {
    if (!day) return
    setArrivedAt((prev) => {
      const next = new Date(day)
      next.setHours(prev.getHours(), prev.getMinutes(), 0, 0)
      return next
    })
  }

  const handleTimeChange = (value: string) => {
    const [hours, minutes] = value.split(":").map(Number)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return
    setArrivedAt((prev) => {
      const next = new Date(prev)
      next.setHours(hours, minutes, 0, 0)
      return next
    })
  }

  const isDirectDelivery = destinationType !== "WAREHOUSE"

  const canSubmit =
    selectedCount > 0 &&
    destinationId !== "" &&
    !registerGeneralArticlesDelivery.isPending

  const handleSubmit = () => {
    const id = Number(destinationId)

    const destination: GeneralArticlesDeliveryDestination = {
      locationId: selectedStation ?? undefined,
      ...(destinationType === "WAREHOUSE" ? { warehouseId: id } : {}),
      ...(destinationType === "DEPARTMENT" ? { departmentId: id } : {}),
      ...(destinationType === "EMPLOYEE" ? { employeeId: id } : {}),
      ...(destinationType === "AUTHORIZED" ? { authorizedEmployeeId: id } : {}),
      ...(destinationType === "THIRD_PARTY" ? { thirdPartyId: id } : {}),
    }

    registerGeneralArticlesDelivery.mutate(
      {
        id: po.id,
        company,
        arrivedAt,
        generalArticlePurchaseOrderIds: selectedIds,
        destination,
      },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="w-[95vw] max-w-[95vw] sm:max-w-[560px] p-0 overflow-hidden max-h-[85vh] flex flex-col"
      >
        {/* HEADER */}
        <DialogHeader className="shrink-0 border-b border-border/40 bg-muted/20 px-6 pt-5 pb-4 text-left">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 shrink-0 rounded-xl border border-[#439A97]/10 bg-[#439A97]/[0.08]">
              <PackageCheck className="size-4.5 text-[#2f716f] dark:text-[#6fc2bf]" />
            </div>

            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-semibold tracking-tight leading-none">
                Registrar entrega de artículos
              </DialogTitle>

              <DialogDescription className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Confirma qué artículos generales de{" "}
                <span className="font-medium text-foreground">{po.order_number}</span> llegaron físicamente.
                Los que desmarques quedarán pendientes para una entrega posterior.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* BODY */}
        <div className="overflow-y-auto px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={toggleAll}
              className="flex items-center gap-2 text-sm font-medium text-foreground select-none"
            >
              <div
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                  allSelected ? "border-[#439A97] bg-[#439A97] text-white" : "border-muted-foreground/30"
                )}
              >
                {allSelected && <Check className="size-3" />}
              </div>
              Artículos pendientes de entrega
            </button>

            <span className="text-xs text-muted-foreground tabular-nums select-none">
              {selectedCount} de {pendingItems.length} seleccionado{pendingItems.length === 1 ? "" : "s"}
            </span>
          </div>

          <ScrollArea className={cn("w-full", pendingItems.length > 6 && "h-[280px]")}>
            <div className="space-y-1.5 pr-1">
              {pendingItems.map((item) => (
                <ArticleRow
                  key={item.id}
                  item={item}
                  checked={selected[item.id] ?? false}
                  onToggle={() => toggleItem(item.id)}
                />
              ))}

              {pendingItems.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground italic">
                  No hay artículos generales pendientes de entrega.
                </p>
              )}
            </div>
          </ScrollArea>

          {/* Destino de la entrega */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Destino de la entrega
              </span>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Select
                value={destinationType}
                onValueChange={(value) => {
                  setDestinationType(value as DestinationType)
                  setDestinationId("")
                }}
              >
                <SelectTrigger className="h-9 bg-background/70 text-sm sm:w-44 sm:shrink-0">
                  <SelectValue placeholder="Tipo de destino" />
                </SelectTrigger>
                <SelectContent>
                  {DESTINATION_OPTIONS.map(({ value, label, Icon }) => (
                    <SelectItem key={value} value={value}>
                      <span className="flex items-center gap-2">
                        <Icon className="size-3.5 opacity-70" />
                        {label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={destinationId} onValueChange={setDestinationId}>
                <SelectTrigger className="h-9 flex-1 bg-background/70 text-sm">
                  <SelectValue
                    placeholder={
                      destinationType === "WAREHOUSE"
                        ? (isWarehousesLoading ? "Cargando almacenes..." : "Selecciona el almacén")
                        : destinationType === "DEPARTMENT"
                          ? (isDepartmentsLoading ? "Cargando departamentos..." : "Selecciona el departamento")
                          : destinationType === "EMPLOYEE"
                            ? (isEmployeesLoading ? "Cargando empleados..." : "Selecciona el empleado")
                            : destinationType === "AUTHORIZED"
                              ? (isAuthorizedLoading ? "Cargando autorizados..." : "Selecciona el autorizado")
                              : (isThirdPartiesLoading ? "Cargando terceros..." : "Selecciona el tercero")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {destinationType === "WAREHOUSE" &&
                    generalWarehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                        {warehouse.name}
                      </SelectItem>
                    ))}

                  {destinationType === "WAREHOUSE" && !isWarehousesLoading && generalWarehouses.length === 0 && (
                    <p className="px-2 py-1.5 text-xs text-muted-foreground italic">
                      No hay almacenes de tipo General en esta estación.
                    </p>
                  )}

                  {destinationType === "DEPARTMENT" &&
                    allDepartments.map((department) => (
                      <SelectItem key={department.id} value={department.id.toString()}>
                        {department.name}
                      </SelectItem>
                    ))}

                  {destinationType === "EMPLOYEE" &&
                    (employees ?? []).map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.first_name} {employee.last_name}
                        {employee.dni ? ` — ${employee.dni}` : ""}
                      </SelectItem>
                    ))}

                  {destinationType === "AUTHORIZED" &&
                    (authorizedEmployees ?? []).map((authorized) => (
                      <SelectItem key={authorized.id} value={authorized.id.toString()}>
                        {authorized.employee_name}
                      </SelectItem>
                    ))}

                  {destinationType === "THIRD_PARTY" &&
                    (thirdParties ?? []).map((thirdParty) => (
                      <SelectItem key={thirdParty.id} value={thirdParty.id.toString()}>
                        {thirdParty.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {isDirectDelivery && (
              <p className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-[11px] leading-relaxed text-blue-700 dark:text-blue-300">
                Entrega directa: los artículos no entrarán al inventario del almacén ni requieren
                confirmación. El registro quedará en Recepción General y podrás descargar su{" "}
                <span className="font-medium">Nota de Entrega</span>.
              </p>
            )}
          </div>

          {/* Fecha y hora de llegada */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Fecha y hora de llegada
              </span>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-9 flex-1 justify-start text-sm bg-background/70",
                      !arrivedAt && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3 opacity-60" />
                    {format(arrivedAt, "dd MMM yyyy", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={arrivedAt}
                    onSelect={handleDateSelect}
                    locale={es}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Input
                type="time"
                value={format(arrivedAt, "HH:mm")}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="h-9 w-28 bg-background/70 text-sm"
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter className="shrink-0 flex flex-row items-center justify-end gap-2 border-t border-border/40 bg-muted/20 px-6 py-4">
          <Button
            onClick={() => onOpenChange(false)}
            disabled={registerGeneralArticlesDelivery.isPending}
            className="
              h-10 rounded-lg px-5
              bg-slate-500/10 text-slate-600
              hover:bg-slate-500/20
              active:bg-slate-500/30
              border border-slate-500/20
              shadow-sm
              transition-colors
              dark:bg-slate-400/10
              dark:text-slate-300
              dark:hover:bg-slate-400/20
              dark:border-slate-400/20
            "
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="
              h-10 rounded-lg px-5
              bg-teal-500/20 text-teal-900
              hover:bg-teal-500/30
              active:bg-teal-500/40
              border border-teal-500/30
              shadow-sm
              transition-colors
              flex items-center justify-center gap-2
              dark:bg-teal-400/10
              dark:text-teal-100
              dark:hover:bg-teal-400/20
              dark:border-teal-400/20
            "
          >
            {registerGeneralArticlesDelivery.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <PackageCheck className="size-4" />
                Confirmar entrega
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const ArticleRow = ({
  item,
  checked,
  onToggle,
}: {
  item: PurchaseOrderGeneralArticle
  checked: boolean
  onToggle: () => void
}) => {
  const req = item.general_article_quote_order?.general_article_requisition_order
  const description = req?.description ?? "Artículo"
  const quantity = item.general_article_quote_order?.quantity

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
        checked
          ? "border-[#439A97]/40 bg-[#439A97]/[0.04]"
          : "border-border/60 bg-background/60 opacity-60"
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
            checked ? "border-[#439A97] bg-[#439A97] text-white" : "border-muted-foreground/30"
          )}
        >
          {checked && <Check className="size-3" />}
        </div>
        <span className="truncate text-sm font-medium text-foreground">{description}</span>
      </div>

      {quantity != null && (
        <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
          {quantity} unid.
        </span>
      )}
    </button>
  )
}
