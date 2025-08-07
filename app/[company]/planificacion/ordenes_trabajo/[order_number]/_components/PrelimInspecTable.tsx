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
import { cn } from "@/lib/utils"
import { WorkOrder } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { columns } from "../columns"
import { DataTable } from "../data-table"
import { Loader2, Printer } from "lucide-react"
import { useCompanyStore } from "@/stores/CompanyStore"

// Esquema de validación con Zod
const createPrelimnSchema = z.object({
  authorizing: z.string().min(1, "El código ATA es requerido"),
  observation: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
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
      observation: "",
      authorizing: "",
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

  const handleCreateInspection = async (values: z.infer<typeof createPrelimnSchema>) => {
    await createPrelimInspection.mutateAsync({
      data: {
        ...values,
        work_order_id: work_order.id.toString(),
      },
      company: selectedCompany!.slug
    })
  }
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-center w-full flex flex-col gap-4">Inspección Preliminar
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
                              <DialogTitle className="text-center text-xl">¿Desea dar por finalizada la inspección?</DialogTitle>
                              <DialogDescription className="text-center">
                                Se da por finalizada la inspección preliminar y se da la opción de su impresión.
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
                        <Button><Printer /></Button>
                      </div>
                    )
                  }
                </div>
              ) : (
                <p className="text-sm text-muted italic">No hay inspección registrada...</p>
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
                <h2 className="text-2xl font-semibold">Crear Inspección Preliminar</h2>
                <p className="text-muted-foreground text-center max-w-md">
                  Presione el botón para iniciar una nueva inspección preliminar.
                </p>
                <Button className="mt-4">
                  Crear Inspección
                </Button>
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Crear Insp.</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
        {
          work_order?.preliminary_inspection && (
            <div className="flex flex-col items-center justify-center">
              <div className="w-full">
                <DataTable columns={columns} data={work_order.preliminary_inspection.pre_inspection_items} />
              </div>
            </div>
          )
        }
      </CardContent>
    </Card >
  )
}

export default PrelimInspecTable
