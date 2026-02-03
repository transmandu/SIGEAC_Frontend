"use client"

import { useCreatePrelimInspection, useUpdatePrelimInspection } from "@/actions/mantenimiento/planificacion/ordenes_trabajo/inspecccion_preliminar/actions"
import { PrelimInspectItemDialog } from "@/components/dialogs/mantenimiento/ordenes_trabajo/PrelimInspecItemDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import axiosInstance from "@/lib/axios"
import { cn } from "@/lib/utils"
import { useCompanyStore } from "@/stores/CompanyStore"
import { WorkOrder } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Printer } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { columns } from "../columns"
import { DataTable } from "../data-table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type HoursMode = "auto" | "manual"

// Esquema de validación con Zod
const createPrelimnSchema = z.object({
  authorizing: z.string().min(1, "El código ATA es requerido"),
  observation: z.string(),
})

const PrelimInspecTable = ({ work_order }: { work_order: WorkOrder }) => {
  const { createPrelimInspection } = useCreatePrelimInspection()
  const { updatePrelimInspection } = useUpdatePrelimInspection()
  const { selectedCompany } = useCompanyStore()
  const companySlug = selectedCompany?.slug || "hangar74"

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFinishOpen, setIsFinishOpen] = useState(false)

  // ✅ Dialog de impresión (igual que WO/Reportes)
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // ✅ Horas auto/manual
  const [hoursMode, setHoursMode] = useState<HoursMode>("auto")
  const [manualHours, setManualHours] = useState<string>("") // vacío => PDF vacío
  const [manualError, setManualError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof createPrelimnSchema>>({
    resolver: zodResolver(createPrelimnSchema),
    defaultValues: {
      observation: "",
      authorizing: "",
    },
  })

  const validateManualHours = () => {
    if (hoursMode !== "manual") return true

    // ✅ Permitir vacío: en el PDF debe salir vacío
    if (manualHours.trim() === "") {
      setManualError(null)
      return true
    }

    // Acepta coma o punto
    const normalized = manualHours.replace(",", ".")
    const n = Number(normalized)

    if (!Number.isFinite(n)) {
      setManualError("Ingresa un número válido.")
      return false
    }
    if (n < 0) {
      setManualError("Las horas no pueden ser negativas.")
      return false
    }

    setManualError(null)
    return true
  }

  const handleFinishInspection = async () => {
    if (!work_order?.preliminary_inspection) return

    await updatePrelimInspection.mutateAsync({
      data: {
        id: work_order.preliminary_inspection.id.toString(),
        status: "FINALIZADO",
      },
      company: selectedCompany!.slug,
    })

    setIsFinishOpen(false)
  }

  const handlePrint = async () => {
    if (!validateManualHours()) return

    const params: Record<string, any> = {
      aircraft_hours_mode: hoursMode,
    }

    // ✅ Solo enviar aircraft_hours si hay valor
    if (hoursMode === "manual" && manualHours.trim() !== "") {
      params.aircraft_hours = Number(manualHours.replace(",", "."))
    }

    try {
      setIsDownloading(true)

      const response = await axiosInstance.get(
        `/${companySlug}/work-order-prelim-inspection/${work_order.order_number}`,
        {
          responseType: "blob",
          params,
        }
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `PRELIM_INSPECTION_WO-${work_order.order_number}.pdf`)
      document.body.appendChild(link)
      link.click()

      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)

      setIsPrintDialogOpen(false)
    } catch (error) {
      toast.error("Error al descargar el PDF", {
        description: "Hubo un problema al generar el PDF de la inspección preliminar.",
      })
      console.error("Error al descargar el PDF:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleCreateInspection = async (values: z.infer<typeof createPrelimnSchema>) => {
    await createPrelimInspection.mutateAsync({
      data: {
        ...values,
        work_order_id: work_order.id.toString(),
      },
      company: selectedCompany!.slug,
    })
    setIsDialogOpen(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-center w-full flex flex-col gap-4">
          Inspección Preliminar
          <>
            {work_order?.preliminary_inspection ? (
              <div className="flex flex-col items-center gap-4">
                <Badge
                  className={cn(
                    "text-center text-xl",
                    work_order?.preliminary_inspection.status === "PROCESO"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  )}
                >
                  {work_order?.preliminary_inspection.status}
                </Badge>

                {work_order?.preliminary_inspection.status === "PROCESO" && (
                  <div className="flex gap-2">
                    <PrelimInspectItemDialog id={work_order.preliminary_inspection.id.toString()} />

                    <Dialog open={isFinishOpen} onOpenChange={setIsFinishOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="flex items-center justify-center gap-2 h-8 border-dashed"
                        >
                          Finalizar Inspección
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle className="text-center text-xl">
                            ¿Desea dar por finalizada la inspección?
                          </DialogTitle>
                          <DialogDescription className="text-center">
                            Se da por finalizada la inspección preliminar y se da la opción de su impresión.
                          </DialogDescription>
                        </DialogHeader>

                        <DialogFooter>
                          <Button
                            disabled={updatePrelimInspection.isPending}
                            onClick={handleFinishInspection}
                          >
                            {updatePrelimInspection.isPending ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              "Finalizar"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {/* ✅ Dialog para imprimir con horas auto/manual */}
                <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" disabled={isDownloading} className="gap-2">
                      {isDownloading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Printer className="size-4" />
                      )}
                      Imprimir
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                      <DialogTitle>Imprimir inspección preliminar</DialogTitle>
                      <DialogDescription>
                        Selecciona cómo quieres mostrar las horas de la aeronave en el PDF.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Horas de aeronave</Label>
                        <RadioGroup
                          value={hoursMode}
                          onValueChange={(v) => {
                            setHoursMode(v as HoursMode)
                            setManualError(null)
                          }}
                          className="grid gap-2"
                        >
                          <div className="flex items-center gap-2 rounded-md border p-3">
                            <RadioGroupItem value="auto" id="hours-auto" />
                            <Label htmlFor="hours-auto" className="cursor-pointer">
                              Automáticas (del sistema)
                            </Label>
                          </div>

                          <div className="flex items-center gap-2 rounded-md border p-3">
                            <RadioGroupItem value="manual" id="hours-manual" />
                            <Label htmlFor="hours-manual" className="cursor-pointer">
                              Manuales (definir valor)
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {hoursMode === "manual" && (
                        <div className="space-y-2">
                          <Label htmlFor="manual-hours">Horas a mostrar</Label>
                          <Input
                            id="manual-hours"
                            inputMode="decimal"
                            value={manualHours}
                            onChange={(e) => {
                              setManualHours(e.target.value)
                              setManualError(null)
                            }}
                            onBlur={validateManualHours}
                            placeholder="Déjalo vacío para imprimir sin horas"
                          />
                          {manualError && <p className="text-sm text-destructive">{manualError}</p>}
                          <p className="text-xs text-muted-foreground">
                            Tip: puedes escribir decimales con coma o punto.
                          </p>
                        </div>
                      )}
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsPrintDialogOpen(false)}
                        disabled={isDownloading}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handlePrint} disabled={isDownloading}>
                        {isDownloading ? "Descargando..." : "Descargar PDF"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No hay inspección registrada...</p>
            )}
          </>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {!work_order?.preliminary_inspection && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <h2 className="text-2xl font-semibold">Crear Inspección Preliminar</h2>
                <p className="text-muted-foreground text-center max-w-md">
                  Presione el botón para iniciar una nueva inspección preliminar.
                </p>
                <Button className="mt-4">Crear Inspección</Button>
              </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Crear Inspec. Preliminar</DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateInspection)} className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <FormField
                      control={form.control}
                      name="authorizing"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Autorización</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="PROPIETARIO">Propietario</SelectItem>
                                <SelectItem value="EXPLOTADOR">Explotador</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="observation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observaciones</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Ej. Ala derecha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button disabled={createPrelimInspection.isPending} type="submit">
                      {createPrelimInspection.isPending ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Crear Insp."
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}

        {work_order?.preliminary_inspection && (
          <div className="flex flex-col items-center justify-center">
            <div className="w-full">
              <DataTable columns={columns} data={work_order.preliminary_inspection.pre_inspection_items} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PrelimInspecTable
