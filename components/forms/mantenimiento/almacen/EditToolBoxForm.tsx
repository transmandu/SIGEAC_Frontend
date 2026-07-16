"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { useUpdateToolBox } from "@/actions/mantenimiento/almacen/inventario/caja_herramientas/actions"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { useGetEmployeesForBox } from "@/hooks/mantenimiento/almacen/caja_herramientas/useGetEmployeeForBox"
import { useGetEditToolBoxTools } from "@/hooks/mantenimiento/almacen/caja_herramientas/useGetToolBoxTools"
import { cn } from "@/lib/utils"
import { useCompanyStore } from "@/stores/CompanyStore"
import { ToolBox } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Box, Check, ChevronsUpDown, Loader2, User, Wrench, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Avatar, AvatarFallback } from "../../../ui/avatar"
import { Badge } from "../../../ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../../ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover"

const FormSchema = z.object({
  name: z.string().min(3, {
    message: "El usuario debe tener al menos 3 caracteres.",
  }),
  created_by: z.string(),
  delivered_by: z.string(),
  employee_id: z.string(),
  tool_id: z.array(z.string()),
})

type FormSchemaType = z.infer<typeof FormSchema>

interface FormProps {
  onClose: () => void,
  initialData: ToolBox,
}

const AVATAR_PALETTE = [
  "bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
  "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
  "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  "bg-violet-500/15 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
  "bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
  "bg-cyan-500/15 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
]

const getAvatarPalette = (seed: number) => AVATAR_PALETTE[seed % AVATAR_PALETTE.length]

const getInitials = (firstName?: string, lastName?: string) =>
  `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase()

export function EditToolBoxForm({ onClose, initialData }: FormProps) {

  const { user } = useAuth()

  const [selectedTools, setSelectedTools] = useState<string[]>([])

  const [openArticles, setOpenArticles] = useState(false);

  const [openEmployee, setOpenEmployee] = useState(false);

  const { selectedStation, selectedCompany } = useCompanyStore()

  const { updateToolBox } = useUpdateToolBox()

  const { data: employees, isLoading: employeesLoading } = useGetEmployeesForBox(selectedStation ?? null, selectedCompany?.slug);

  const { data, isLoading } = useGetEditToolBoxTools(selectedStation ?? null, initialData.id ?? null, selectedCompany?.slug);

  const allArticles = useMemo(
    () => (data ?? []).flatMap((batch) => batch.article),
    [data]
  );

  const form = useForm<FormSchemaType>({

    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: initialData.name || "",
      created_by: initialData.created_by || "",
      delivered_by: initialData.delivered_by || "",
      employee_id: initialData.employee?.id.toString() || "",
      tool_id: initialData.tool.map((tool) => tool.article.id!.toString()) || [],
    },
  })

  const handleToolSelect = (currentValue: string) => {
    setSelectedTools((prevSelected) =>
      prevSelected.includes(currentValue)
        ? prevSelected.filter((value) => value !== currentValue)
        : [...prevSelected, currentValue]
    );
  };

  const isToolSelected = (value: string) => selectedTools.includes(value);

  useEffect(() => {
    form.setValue('tool_id', selectedTools);
  }, [selectedTools, form]);

  useEffect(() => {
    if (initialData.tool) {
      const preselectedTools = initialData.tool.map((tool) => tool.article.id!.toString());
      setSelectedTools(preselectedTools);
    }
  }, [initialData.tool]);

  const onSubmit = async (data: FormSchemaType) => {
    const formattedData = {
      ...data,
      created_by: `${user?.first_name} ${user?.last_name}`,
      delivered_by: `${user?.first_name} ${user?.last_name}`,
      id: initialData.id,
    }
    await updateToolBox.mutateAsync({data: formattedData, company: selectedCompany!.slug})
    onClose();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Nombre de la Caja</FormLabel>
                <span className="text-xs text-muted-foreground">Obligatorio</span>
              </div>
              <FormControl>
                <div className="relative">
                  <Input placeholder="Ej: Caja de Mecánica de Motor #4" className="pr-9" {...field} />
                  <Box className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="employee_id"
          render={({ field }) => {
            const selectedEmployee = employees?.find((employee) => employee.id.toString() === field.value)
            return (
              <FormItem className="flex flex-col">
                <FormLabel>Técnico Responsable</FormLabel>
                <Popover open={openEmployee} onOpenChange={setOpenEmployee}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        disabled={employeesLoading}
                        className="w-full justify-between font-normal"
                      >
                        {selectedEmployee ? (
                          <span className="flex items-center gap-2 truncate">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className={cn("text-[9px] font-semibold", getAvatarPalette(selectedEmployee.id))}>
                                {getInitials(selectedEmployee.first_name, selectedEmployee.last_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate">{selectedEmployee.first_name} {selectedEmployee.last_name}</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4 shrink-0" />
                            Seleccione al responsable...
                          </span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start" matchTriggerWidth>
                    <Command>
                      <CommandInput placeholder="Buscar técnico..." />
                      <CommandList>
                        <CommandEmpty className="text-muted-foreground text-xs p-4 text-center">
                          {employeesLoading ? <Loader2 className="mx-auto size-4 animate-spin" /> : "No se encontraron técnicos..."}
                        </CommandEmpty>
                        <CommandGroup>
                          {
                            employees && employees.map((employee) => (
                              <CommandItem
                                key={employee.id}
                                value={`${employee.first_name} ${employee.last_name} ${employee.job_title.name}`}
                                onSelect={() => {
                                  field.onChange(employee.id.toString())
                                  setOpenEmployee(false)
                                }}
                                className="gap-2"
                              >
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className={cn("text-[10px] font-semibold", getAvatarPalette(employee.id))}>
                                    {getInitials(employee.first_name, employee.last_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="flex-1 truncate">
                                  <span className="block font-medium">{employee.first_name} {employee.last_name}</span>
                                  <span className="block text-xs text-muted-foreground">{employee.job_title.name}</span>
                                </span>
                                <Check className={cn("h-4 w-4 shrink-0", field.value === employee.id.toString() ? "opacity-100" : "opacity-0")} />
                              </CommandItem>
                            ))
                          }
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <FormField
          control={form.control}
          name="tool_id"
          render={() => (
            <FormItem className="flex flex-col">
              <div className="flex items-center justify-between">
                <FormLabel>Herramientas a Ingresar</FormLabel>
                {selectedTools.length > 0 && (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {selectedTools.length} Seleccionadas
                  </span>
                )}
              </div>
              <Popover open={openArticles} onOpenChange={setOpenArticles}>
                <PopoverTrigger asChild>
                  <Button
                    disabled={isLoading}
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-normal text-muted-foreground"
                  >
                    <span className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 shrink-0" />
                      Buscar y agregar herramientas...
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start" matchTriggerWidth>
                  <Command>
                    <CommandInput placeholder="Buscar herramienta..." />
                    <CommandList>
                      <CommandEmpty className="text-muted-foreground text-xs p-4 text-center">No se han encontrado herramientas disponibles...</CommandEmpty>
                      {
                        data && data.map((batch) => (
                          <CommandGroup key={batch.id.toString()} heading={batch.name}>
                            {
                              batch.article.map((article) => {
                                const isExpired = article.tool.status === "VENCIDO"
                                return (
                                  <CommandItem
                                    key={article.id}
                                    disabled={isExpired}
                                    onSelect={() => {
                                      handleToolSelect(article.id?.toString()!)
                                    }}
                                    className="gap-2"
                                  >
                                    <Wrench className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                    <span className="flex-1 truncate">SN - {article.serial}</span>
                                    {isExpired && (
                                      <Badge variant="destructive" className="px-1.5 py-0 text-[10px] font-normal">
                                        Vencida
                                      </Badge>
                                    )}
                                    <Check className={cn("h-4 w-4 shrink-0", isToolSelected(article.id!.toString()) ? "opacity-100" : "opacity-0")} />
                                    <span className="hidden">
                                      {article.serial} {batch.name}
                                    </span>
                                  </CommandItem>
                                )
                              })
                            }
                          </CommandGroup>
                        ))
                      }
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedTools.length > 0 && (
                <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto rounded-md border border-dashed border-input p-2">
                  {selectedTools.map((toolId) => {
                    const article = allArticles.find((a) => a.id?.toString() === toolId)
                    return (
                      <Badge key={toolId} variant="secondary" className="gap-1 py-1 pl-2 pr-1 font-normal">
                        <Wrench className="h-3 w-3 text-muted-foreground" />
                        {article ? `SN - ${article.serial}` : toolId}
                        <button
                          type="button"
                          onClick={() => handleToolSelect(toolId)}
                          className="ml-1 rounded-full p-0.5 hover:bg-background/80"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={updateToolBox.isPending} className="gap-1.5">
            {updateToolBox.isPending ? <Loader2 className="animate-spin size-4" /> : <><Check className="h-4 w-4" /> Actualizar Caja</>}
          </Button>
        </div>
      </form>
    </Form>
  )
}
