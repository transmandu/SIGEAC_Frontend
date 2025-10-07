"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { useCompanyStore } from "@/stores/CompanyStore"
import { useGetClients } from "@/hooks/general/clientes/useGetClients"
import { useGetLocationsByCompanyId } from "@/hooks/sistema/useGetLocationsByCompanyId"
import { useGetManufacturers } from "@/hooks/general/condiciones/useGetConditions"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { Calendar as CalendarIcon, Check, ChevronsUpDown, Loader2, Plane, Building2, Hash, MapPin, Clock, RotateCcw, FileText } from "lucide-react"

// =========================
//   Schema & Types
// =========================
const AircraftInfoSchema = z.object({
  manufacturer_id: z.string().min(1, "Debe seleccionar un fabricante"),
  serial: z.string().min(1, "El serial es obligatorio"),
  model: z.string().min(1, "El modelo es obligatorio"),
  acronym: z.string().min(1, "El acrónimo es obligatorio"),
  flight_hours: z
    .string()
    .refine((val) => {
      const num = parseInt(val)
      return !isNaN(num) && num >= 0
    }, "Debe ser un número entero mayor o igual a 0"),
  flight_cycles: z
    .string()
    .refine((val) => {
      const num = parseInt(val)
      return !isNaN(num) && num >= 0
    }, "Debe ser un número entero mayor o igual a 0"),
  fabricant_date: z.date({ required_error: "Seleccione la fecha" }),
  comments: z.string().optional(),
  location_id: z.string().min(1, "La ubicación es obligatoria"),
})

export type AircraftInfoType = z.infer<typeof AircraftInfoSchema>

interface AircraftInfoFormProps {
  onNext: (data: AircraftInfoType) => void
  onBack?: () => void
  initialData?: Partial<AircraftInfoType>
}

// =========================
//   Component
// =========================
export default function AircraftInfoForm({ onNext, onBack, initialData }: AircraftInfoFormProps) {
  const { selectedCompany } = useCompanyStore()
  const { data: clients, isLoading: isClientsLoading } = useGetClients(selectedCompany?.slug)
  const { data: locations, isPending: isLocationsLoading, isError: isLocationsError, mutate } = useGetLocationsByCompanyId()
  const { data: manufacturers, isLoading: isManufacturersLoading, isError: isManufacturersError } = useGetManufacturers(selectedCompany?.slug)

  useEffect(() => {
    // Cargar ubicaciones de manera perezosa al montar
    mutate(2)
  }, [mutate])

  const form = useForm<AircraftInfoType>({
    resolver: zodResolver(AircraftInfoSchema),
    defaultValues: initialData || {},
  })

  const onSubmit = (data: AircraftInfoType) => onNext(data)

  return (
    <TooltipProvider>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 py-2 sm:py-4">
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2">
                <Plane className="h-6 w-6" /> Registrar Aeronave
              </h1>
              <p className="text-sm text-muted-foreground">Complete la información básica para crear la aeronave en el sistema.</p>
            </div>
            <div className="hidden sm:flex gap-2">
              {onBack && (
                <Button type="button" variant="outline" onClick={onBack}>
                  Anterior
                </Button>
              )}
              <Button type="submit">Siguiente</Button>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Content */}
          <div className="grid grid-cols-1 gap-4">
            <Card className="border-muted/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" /> Información de la aeronave
                </CardTitle>
                <CardDescription>Datos de identificación y fabricación.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fabricante (combobox) */}
                <FormField
                  control={form.control}
                  name="manufacturer_id"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Fabricante</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              disabled={isManufacturersLoading || isManufacturersError}
                              variant="outline"
                              role="combobox"
                              className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                            >
                              {isManufacturersLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              {field.value ? (
                                <span>
                                  {manufacturers?.find((m: any) => `${m.id}` === field.value)?.name || "—"}
                                </span>
                              ) : (
                                "Elige al fabricante..."
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                          <Command>
                            <CommandInput placeholder="Buscar fabricante..." />
                            <CommandList>
                              <CommandEmpty className="p-2 text-sm text-center">Sin resultados</CommandEmpty>
                              <CommandGroup>
                                {manufacturers?.filter((m) => m.type === "AIRCRAFT").map((m) => (
                                  <CommandItem
                                    key={m.id}
                                    value={`${m.name}`}
                                    onSelect={() => form.setValue("manufacturer_id", String(m.id), { shouldValidate: true })}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4", `${m.id}` === field.value ? "opacity-100" : "opacity-0")} />
                                    {m.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Modelo */}
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="flex items-center gap-2"><Plane className="h-4 w-4" /> Modelo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: B737-800" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Acrónimo */}
                <FormField
                  control={form.control}
                  name="acronym"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="flex items-center gap-2"><Hash className="h-4 w-4" /> Acrónimo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: YVXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Serial */}
                <FormField
                  control={form.control}
                  name="serial"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="flex items-center gap-2"><Hash className="h-4 w-4" /> Serial</FormLabel>
                      <FormControl>
                        <Input placeholder="Serial de la aeronave" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fecha de fabricación */}
                <FormField
                control={form.control}
                name="fabricant_date"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" /> Fecha de fabricación
                    </FormLabel>

                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccione una fecha</span>}
                            <CalendarIcon className="h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>

                      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          // Muestra el mes inicial (si hay valor, ese; si no, un año razonable, p.ej. 2000)
                          defaultMonth={field.value ?? new Date(2000, 0, 1)}
                          onSelect={(date) => date && field.onChange(date)}
                          // Evita fechas futuras y muy antiguas
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          // Dropdowns para navegar rápido por mes/año
                          captionLayout="dropdown"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                          // Localización
                          locale={es}
                          // Enfoque inicial dentro del popover
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <FormMessage />
                  </FormItem>
                )}
              />


                {/* Ubicación */}
                <FormField
                  control={form.control}
                  name="location_id"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Ubicación</FormLabel>
                      <Select disabled={isLocationsLoading || isLocationsError} onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations?.map((loc: any) => (
                            <SelectItem key={loc.id} value={String(loc.id)}>
                              {loc.address} — {loc.type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-muted/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" /> Parámetros de uso
                </CardTitle>
                <CardDescription>Horas y ciclos acumulados.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Horas de vuelo */}
                  <FormField
                    control={form.control}
                    name="flight_hours"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="flex items-center gap-2"><Clock className="h-4 w-4" /> Horas de vuelo</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              inputMode="numeric"
                              min="0"
                              step="1"
                              placeholder="Ej: 15000"
                              {...field}
                              onKeyDown={(e) => {
                                if (e.key === "-" || e.key === "." || e.key === ",") e.preventDefault()
                              }}
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">h</span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Ciclos */}
                  <FormField
                    control={form.control}
                    name="flight_cycles"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Ciclos</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              inputMode="numeric"
                              min="0"
                              step="1"
                              placeholder="Ej: 500"
                              {...field}
                              onKeyDown={(e) => {
                                if (e.key === "-" || e.key === "." || e.key === ",") e.preventDefault()
                              }}
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">ciclos</span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-muted/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Comentarios
                </CardTitle>
                <CardDescription>Información adicional relevante.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Comentarios</FormLabel>
                      <FormControl>
                        <Textarea rows={5} className="resize-y" placeholder="Observaciones, historial, particularidades..." {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">Opcional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Action bar (mobile sticky) */}
          <div className="sm:hidden h-16" />
          <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-4xl px-4 py-2 flex items-center justify-between gap-2">
              {onBack && (
                <Button type="button" variant="outline" onClick={onBack} className="w-1/2">Anterior</Button>
              )}
              <Button type="submit" className={cn(onBack ? "w-1/2" : "w-full")}>Siguiente</Button>
            </div>
          </div>

          {/* Desktop actions duplicated (for accessibility / layout) */}
          <div className="hidden sm:flex items-center justify-between gap-4 pt-6">
            {onBack && (
              <Button type="button" variant="outline" onClick={onBack}>
                Anterior
              </Button>
            )}
            <div className="ml-auto">
              <Button type="submit">Siguiente</Button>
            </div>
          </div>
        </form>
      </Form>
    </TooltipProvider>
  )
}
