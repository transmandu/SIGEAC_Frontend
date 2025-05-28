import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import { useUpdateStatusDispatchRequest } from "@/actions/almacen/solicitudes/salida/action"
import { useCreateRequisition } from "@/actions/compras/requisiciones/actions"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from "@/contexts/AuthContext"
import { useGetWarehousesEmployees } from "@/hooks/almacen/useGetWarehousesEmployees"
import { cn } from "@/lib/utils"
import { useCompanyStore } from "@/stores/CompanyStore"
import { DispatchRequest } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, ClipboardPaste, Loader2, MoreHorizontal } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Calendar } from "../ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"


const formSchema = z.object({
  delivered_by: z.string().min(2, {
    message: "Debe elegir quien lo entrega",
  }),
  approved_by: z.string(),
  approved_date: z.date(),
})

const PendingDispatchRequestDropdownActions
  = ({ request }: { request: DispatchRequest }) => {

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        delivered_by: "",
        approved_by: "",
        approved_date: new Date(),
      },
    })

    const [open, setOpen] = useState<boolean>(false)

    const { selectedStation, selectedCompany } = useCompanyStore()

    const { updateDispatchStatus } = useUpdateStatusDispatchRequest()

    const { createRequisition } = useCreateRequisition()

    const { user } = useAuth();

    const { mutate: employeeMutate, data: employees, isPending: employeesLoading, isError: employeesError } = useGetWarehousesEmployees();

    useEffect(() => {
      if (selectedStation) {
        employeeMutate(Number(selectedStation))
      }
    }, [selectedStation])
    const handleAprove = async (data: z.infer<typeof formSchema>) => {
      const newQty = request.batch.article_count - Number(request.batch.articles[0].quantity);
      const qtyToBuy = Math.max(request.batch.min_quantity - newQty + 1, 0);
      const formattedData = {
        ...data,
        id: Number(request.id),
        status: "aprobado",
        approved_by: `${user?.first_name} ${user?.last_name}`
      }
      await updateDispatchStatus.mutateAsync(formattedData);
      if (request.batch.category !== 'herramienta' && (newQty < request.batch.min_quantity)) {
        const reqData = {
          justification: `Restock por solicitud de salida de ${request.batch.name} - ${request.batch.articles[0].part_number}`,
          requested_by: `${user?.first_name} ${user?.last_name}`,
          created_by: user!.id,
          type: "AERONAUTICO",
          company: selectedCompany!.split(" ").join("").toLowerCase(),
          location_id: selectedStation!,
          articles: [
            {
              batch: request.batch.id,
              batch_name: request.batch.name,
              batch_articles: [
                {
                  quantity: qtyToBuy,
                  part_number: request.batch.articles[0].part_number,
                  unit: request.batch.articles[0].unit[0].id,
                }
              ]
            }
          ]
        }
        createRequisition.mutateAsync(reqData)
      }
      setOpen(false)
    }
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="flex gap-2 justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <DropdownMenuItem>
                      {
                        updateDispatchStatus.isPending ? <Loader2 className="size-4 animate-spin" /> : <ClipboardPaste className='size-5' />
                      }
                    </DropdownMenuItem>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Aprobar</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rechazar</p>
                </TooltipContent>
              </Tooltip>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">Aprobar Solicitud</DialogTitle>
              <DialogDescription className="text-center p-2 mb-0 pb-0">
                Rellene los datos para aprobar la solicitud de salida.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAprove)} className="space-y-8 flex justify-end flex-col">
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="delivered_by"
                    render={({ field }) => (
                      <FormItem className="w-1/2">
                        <FormLabel>Entregado por:</FormLabel>
                        <Select onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione el responsable..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {
                              employeesLoading && <Loader2 className="size-4 animate-spin" />
                            }
                            {
                              employees && employees.map((employee) => (
                                <SelectItem key={employee.dni} value={`${employee.first_name} ${employee.last_name}`}>{employee.first_name} {employee.last_name}</SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="approved_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col mt-2.5 w-1/2">
                        <FormLabel>Fecha de Aprobación:</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP",
                                    {
                                      locale: es
                                    }
                                  )
                                ) : (
                                  <span>Seleccione una fecha...</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" disabled={updateDispatchStatus.isPending} className="hover:bg-white hover:text-black hover:border hover:border-black transition-all">{updateDispatchStatus.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Aprobar</p>}</Button>
              </form>
            </Form>
          </DialogContent>
        </TooltipProvider>
      </Dialog>
    )
  }

export default PendingDispatchRequestDropdownActions
