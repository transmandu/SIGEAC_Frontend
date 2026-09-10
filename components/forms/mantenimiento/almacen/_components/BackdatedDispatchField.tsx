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
 * Fecha de la salida, con el candado que la habilita justo debajo.
 *
 * Se muestra siempre —para quien puede fecharla— en vez de aparecer al marcar
 * la casilla: así ocupa su columna en la fila de campos y el formulario no
 * cambia de forma al activarla. Nace bloqueada porque la salida normal se sella
 * con la fecha del momento; escribirla es la excepción y hay que declararla.
 */
export function BackdatedDispatchField({ form, canBackdate }: Props) {
  // La suscripción va antes del corte por rol: `watch` es una suscripción y
  // saltársela en unos renders y no en otros rompe el contrato de los hooks.
  const isBackdated = form.watch("is_backdated")

  if (!canBackdate) return null

  return (
    // El campo es un FormItem idéntico a sus vecinos —label, input, mensaje— y
    // la casilla cuelga debajo como hermana: metida dentro, el space-y-2 de
    // FormItem la trataba como un hijo más y desplazaba label e input.
    <div>
      <FormField
        control={form.control}
        name="submission_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">Fecha de la salida</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    // En el botón y no solo en el trigger: con el trigger
                    // deshabilitado el clic no abre, pero el botón sigue
                    // recibiendo foco al tabular y aparenta ser usable.
                    disabled={!isBackdated}
                    className={cn(
                      "h-10 w-full px-3 text-left font-normal",
                      !field.value && "text-muted-foreground",
                      !isBackdated && "disabled:opacity-60",
                    )}
                  >
                    {isBackdated && field.value
                      ? format(field.value, "PPP", { locale: es })
                      : <span>{isBackdated ? "Seleccione una fecha..." : "Hoy"}</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
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

      <FormField
        control={form.control}
        name="is_backdated"
        render={({ field }) => (
          <FormItem className="mt-2 flex flex-row items-center gap-2 space-y-0">
            <FormControl>
              <Checkbox
                className="size-3.5"
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked === true)
                  // Al desmarcar hay que limpiar también el error: si quedó de
                  // un intento previo, bloquea el envío señalando un campo que
                  // ya no se puede corregir.
                  if (checked !== true) {
                    form.setValue("submission_date", undefined)
                    form.clearErrors("submission_date")
                  }
                }}
              />
            </FormControl>
            {/* FormLabel resuelve el htmlFor contra el id que FormControl le
                pone al checkbox; uno propio rompería ese vínculo. */}
            <FormLabel className="cursor-pointer text-xs font-normal text-muted-foreground">
              Ocurrió antes de hoy
            </FormLabel>
          </FormItem>
        )}
      />
    </div>
  )
}
