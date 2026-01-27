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
import { Textarea } from "@/components/ui/textarea"
import axiosInstance from "@/lib/axios"
import { cn } from "@/lib/utils"
import { useCompanyStore } from "@/stores/CompanyStore"
import { WorkOrder } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Printer } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { DataTable } from "../data-table"
import { columns } from "./report-columns"

// Esquema de validación con Zod
const createPrelimnSchema = z.object({
  ata_code: z.string().min(1, "El código ATA es requerido"),
  report: z.string().min(10, "El reporte debe tener al menos 10 caracteres"),
  action_taken: z.string().min(10, "La acción debe tener al menos 10 caracteres"),
})

const PrelimInspecTable = ({ work_order }: { work_order: WorkOrder }) => {
  const { createPrelimInspection } = useCreatePrelimInspection()
  const { updatePrelimInspection } = useUpdatePrelimInspection()
  const { selectedCompany } = useCompanyStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFinishOpen, setIsFinishOpen] = useState(false)

  // Form hook
  const form = useForm<z.infer<typeof createPrelimnSchema>>({
    resolver: zodResolver(createPrelimnSchema),
    defaultValues: {
      ata_code: '',
      report: '',
      action_taken: '',
    }
  })

  const handleFinishInspection = async () => {
    if (!work_order?.preliminary_inspection) return
    await updatePrelimInspection.mutateAsync({
      data: {
        id: work_order.preliminary_inspection.id.toString(),
        status: "FINALIZADO",
      },
      company: selectedCompany!.slug
    })
    setIsFinishOpen(false)
  }


    const handlePrint = async () => {
      try {
        const response = await axiosInstance.get(`/hangar74/work-order-pdf-report/${work_order.order_number}`, {
          responseType: 'blob', // Importante para manejar archivos binarios
        });

        // Crear URL del blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `PRELIM_INSPECTION_WO-${work_order.order_number}.pdf`);
        document.body.appendChild(link);
        link.click();

        // Limpieza
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);

      } catch (error) {
        toast.error('Error al descargar el PDF', {
          description: 'Hubo un problema al generar el PDF de la inspección preliminar.'
        });
        console.error('Error al descargar el PDF:', error);
      }
    };

  const handleCreateInspection = async (values: z.infer<typeof createPrelimnSchema>) => {
    console.log(values)
  }
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-center w-full flex flex-col gap-4">Reportes de WO
          <>
            {
              work_order?.preliminary_inspection ? (
                <div className="flex flex-col items-center gap-4">
                  <Badge className={cn("text-center text-xl", work_order?.preliminary_inspection.status === "PROCESO" ? "bg-yellow-500" : "bg-red-500")}>
                    {work_order?.preliminary_inspection.status}
                  </Badge>
                  {
                    work_order?.preliminary_inspection.status === "PROCESO" && (
                      <div className="flex gap-2">
                        <PrelimInspectItemDialog id={work_order.preliminary_inspection.id.toString()} />
                        <Dialog open={isFinishOpen} onOpenChange={setIsFinishOpen}>
                          <DialogTrigger asChild>
                            <Button variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Finalizar Inspección</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle className="text-center text-xl">¿Desea dar por finalizado los reportes?</DialogTitle>
                              <DialogDescription className="text-center">
                                Se da por finalizado los reportes y se da la opción de su impresión.
                              </DialogDescription>
                            </DialogHeader>

                            <DialogFooter>
                              <Button disabled={updatePrelimInspection.isPending} onClick={handleFinishInspection}>{updatePrelimInspection.isPending ? <Loader2 className="animate-spin" /> : "Finalizar"}</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )
                  }
                  {
                    work_order?.preliminary_inspection.status === "FINALIZADO" && (
                      <div className="flex gap-2">
                        <Button onClick={handlePrint}><Printer /></Button>
                      </div>
                    )
                  }
                </div>
              ) : (
                <p className="text-sm text-muted italic">No hay reportes registrados...</p>
              )
            }
          </>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!work_order?.preliminary_inspection && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <h2 className="text-2xl font-semibold">Crear Reportes de WO</h2>
                <p className="text-muted-foreground text-center max-w-md">
                  Presione el botón para iniciar una nueva hoja de reportes.
                </p>
                <Button className="mt-4">
                  Crear Reporte
                </Button>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Crear Reporte</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateInspection)} className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <FormField
                      control={form.control}
                      name="ata_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código ATA</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Ej. 50" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="report"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reporte</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Ej. Se encontró..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="action_taken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Acción Efectuada</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Ej. Se removió..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Crear Reporte</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
        {
          work_order?.reports && (
            <div className="flex flex-col items-center justify-center">
              <div className="w-full">
                <DataTable columns={columns} data={work_order.reports} />
              </div>
            </div>
          )
        }
      </CardContent>
    </Card >
  )
}

export default PrelimInspecTable
