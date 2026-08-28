"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"

interface Props {
  // El formulario de herramientas tiene su propio schema, así que el genérico
  // queda abierto en vez de atarse a FormSchemaType.
  form: UseFormReturn<any>
  canBackdate: boolean
}

/**
 * Registro extemporáneo. Oculto salvo para quien puede responder por él: la
 * salida normal se sella con la fecha del momento y no se muestra nada.
 */
export function BackdatedDispatchField({ form, canBackdate }: Props) {
  // La suscripción va antes del corte por rol: `watch` es una suscripción y
  // saltársela en unos renders y no en otros rompe el contrato de los hooks.
  const isBackdated = form.watch("is_backdated")

  if (!canBackdate) return null

  return (
    <div className="space-y-3">
      <FormField
        control={form.control}
        name="is_backdated"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-md border border-dashed border-amber-400/50 bg-amber-50/40 dark:bg-amber-950/10 p-3">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked === true)
                  // Al desmarcar hay que limpiar también el error: si quedó de un
                  // intento previo, bloquea el envío señalando un campo oculto.
                  if (checked !== true) {
                    form.setValue("submission_date", undefined)
                    form.clearErrors("submission_date")
                  }
                }}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="text-sm font-medium cursor-pointer">
                Registro fuera de tiempo
              </FormLabel>
              <p className="text-xs text-muted-foreground">
                Marque solo si esta salida ocurrió en una fecha anterior a hoy.
              </p>
            </div>
          </FormItem>
        )}
      />

      {isBackdated && (
        <FormField
          control={form.control}
          name="submission_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-sm font-medium">Fecha real de la salida</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn("h-10 w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccione una fecha...</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
}
