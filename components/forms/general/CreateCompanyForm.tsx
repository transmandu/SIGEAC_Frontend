"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { useCreateCompany } from "@/actions/sistema/empresas/actions"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useGetModules } from "@/hooks/sistema/useGetModules"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Control, useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { Separator } from "../../ui/separator"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const LocationSchema = z.object({
  type: z.string().min(2, "Nombre requerido"),
  address: z.string().min(5, "Dirección requerida"),
  cod_iata: z.string(),
  isMainBase: z.boolean().default(false),
});

const FormSchema = z.object({
  acronym: z.string({ message: "El acronimo es requerido." }),
  name: z.string().min(3, {
    message: "El usuario debe tener al menos 3 caracteres.",
  }),
  fiscal_address: z.string().min(2, {
    message: "La direccion debe tener al menos 5 caracteres.",
  }),
  rif: z.string().min(4, {
    message: "Debe ingresar un RIF válido."
  }),
  description: z.string().min(10, {
    message: "Debe proveer una descripcion minima."
  }),
  phone_number: z.string(),
  alt_phone_number: z.string().optional(),
  cod_inac: z.string().min(3, {
    message: "El codigo debe tener la longitud correcta.",
  }).max(3, {
    message: "El codigo debe tener la longitud correcta.",
  }),
  cod_iata: z.string().min(3, {
    message: "El codigo debe tener la longitud correcta.",
  }).max(3, {
    message: "El codigo debe tener la longitud correcta.",
  }),
  cod_oaci: z.string().min(3, {
    message: "El codigo debe tener la longitud correcta.",
  }).max(3, {
    message: "El codigo debe tener la longitud correcta.",
  }),
  modules: z.array(z.string()),
  isOMAC: z.boolean(),
  locations: z.array(LocationSchema).min(1, "Debe agregar al menos una ubicación").optional(),
})

type FormSchemaType = z.infer<typeof FormSchema>

interface FormProps {
  onClose: () => void,
}

export function CreateCompanyForm({ onClose }: FormProps) {

  const {createCompany} = useCreateCompany()

  const {data: modules, isLoading: isLoadingModules, isError: isModulesError} = useGetModules()

  const [openModules, setOpenModules] = useState(false)

  const [selectedModules, setSelectedModules] = useState<string[]>([])

  const [step, setStep] = useState<"company" | "locations">("company");

  const form = useForm<FormSchemaType>({
  resolver: zodResolver(FormSchema),
  defaultValues: {
    isOMAC: false,
    name: "",
    fiscal_address: "",
    rif: "",
    phone_number: "",
    description: "",
    alt_phone_number: "",
    cod_iata: "",
    cod_oaci: "",
    cod_inac: "",
  },
})

  const isModuleSelected = (value: string) => selectedModules.includes(value);

  const handleModuleSelect = (currentValue: string) => {
    setSelectedModules((prevSelected) =>
      prevSelected.includes(currentValue)
        ? prevSelected.filter((value) => value !== currentValue)
        : [...prevSelected, currentValue]
    );
  };

  useEffect(() => {
    form.setValue('modules', selectedModules);
  }, [selectedModules, form]);

  const onSubmit = (data: FormSchemaType) => {
    createCompany.mutateAsync(data)
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-3">
        {
          step === "company" && (
            <>
              <div className='flex gap-2 items-center'>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razón Social</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Hangar74" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rif"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RIF</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: J-#######" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="acronym"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acronimo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: TMD - HG74 - etc..." {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input placeholder="Empresa de mantenimiento..." {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fiscal_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación Fiscal</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Av. Atlantico, Calle 804..." {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 items-center">
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: +58424-2025399" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alt_phone_number"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel >Teléfono 2 <span className="text-xs text-muted-foreground">(opcional)</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: +58424-2025399" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name="cod_inac"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código INAC</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC123" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cod_iata"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código IATA</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC123" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cod_oaci"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código OACI</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC123" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="isOMAC"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start rounded-md space-y-2 py-2">
                    <FormLabel>¿Es una OMAC?</FormLabel>
                    <div className="flex gap-2 items-center justify-center">
                      <FormControl>
                        <Checkbox
                          className="checked:bg-primary"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Sí, la empresa es una OMAC.
                        </FormLabel>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="modules"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Modulos</FormLabel>
                    <Popover open={openModules} onOpenChange={setOpenModules}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {selectedModules?.length > 0 && (
                            <>
                              <Separator orientation="vertical" className="mx-2 h-4" />
                              <Badge
                                variant="secondary"
                                className="rounded-sm px-1 font-normal lg:hidden"
                              >
                                {selectedModules.length}
                              </Badge>
                              <div className="hidden space-x-1 lg:flex">
                                {selectedModules.length > 3 ? (
                                  <Badge
                                    variant="secondary"
                                    className="rounded-sm px-1 font-normal"
                                  >
                                    {selectedModules.length} seleccionados
                                  </Badge>
                                ) : (
                                  modules?.filter((option) => selectedModules.includes(option.id.toString()))
                                    .map((option) => (
                                      <Badge
                                        variant="secondary"
                                        key={option.id}
                                        className="rounded-sm px-1 font-medium"
                                      >
                                        {option.label}
                                      </Badge>
                                    ))
                                )}
                              </div>
                            </>
                          )}
                          {
                            selectedModules.length <= 0 && "Seleccione..."
                          }
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Buscar modulos..." />
                          <CommandList>
                            <CommandEmpty>No se han encontrado modulos...</CommandEmpty>
                            <CommandGroup>
                              {
                                isLoadingModules && <Loader2 className="animate-spin size-4" />
                              }
                              {modules?.map((m) => (
                                <CommandItem
                                  key={m.id}
                                  value={m.id.toString()}
                                  onSelect={() => handleModuleSelect(m.id.toString())}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      isModuleSelected(m.id.toString()) ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {m.label}
                                </CommandItem>
                              ))}
                              {
                                isModulesError && <p className="text-center text-muted-foreground text-sm">Ha ocurrido un error al cargar los modulos...</p>
                              }
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
              type="button"
              onClick={async () => {
                const isCompanyValid = await form.trigger(); // Valida todos los campos visibles (del paso actual)
                if (isCompanyValid) {
                  setStep("locations");
                } else {
                  toast.error("Completa todos los campos requeridos antes de continuar");
                }
              }}
            >
              Siguiente: Ubicaciones
            </Button>
            </>
          )
        }
        {step === "locations" && (
          <>
            <LocationsStep
              control={form.control}
            />
            <div className="flex justify-between items-center gap-x-4">
              <Separator className="flex-1" />
              <p className="text-muted-foreground">SIGEAC</p>
              <Separator className="flex-1" />
            </div>
            <div className="flex justify-between">
              <Button type="button" variant="ghost" onClick={() => setStep("company")}>
                Volver
              </Button>
              <Button variant={'ghost'} disabled={createCompany.isPending}>{createCompany.isPending ? <Loader2 className="animate-spin" /> : "Crear Empresa"}</Button>
            </div>
          </>
        )}
      </form>
    </Form>
  )
}


const LocationsStep = ({ control }: {control: Control<FormSchemaType>}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "locations",
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="border p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Ubicación #{index + 1}</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
            >
              Eliminar
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <FormField
          control={control}
          name={`locations.${index}.type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="principal">Principal</SelectItem>
                  <SelectItem value="alterno">Alterno</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
            <FormField
              control={control}
              name={`locations.${index}.cod_iata`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código IATA</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`locations.${index}.address`}
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Dirección *</FormLabel>
                  <FormControl>
                    <Input placeholder="Av. Principal, Edificio XYZ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`locations.${index}.isMainBase`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      ¿Es la sede principal?
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => append({
          type: "",
          address: "",
          cod_iata: "",
          isMainBase: false
        })}
      >
        + Agregar otra ubicación
      </Button>
    </div>
  );
};
