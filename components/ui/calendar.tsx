"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type ChevronProps, type DropdownProps } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { es } from "date-fns/locale"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

/**
 * Selector de mes/año de la cabecera.
 *
 * react-day-picker trae uno propio: un `<select>` nativo transparente encima de
 * una caja. El navegador le dibuja su flecha nativa, que no sigue el tema ni el
 * modo oscuro; por eso se reemplaza por el Select de la aplicación.
 */
function CaptionDropdown({
  value,
  onChange,
  options = [],
  "aria-label": ariaLabel,
}: DropdownProps) {
  const selected = options.find((option) => `${option.value}` === `${value}`)

  return (
    <Select
      value={`${value}`}
      onValueChange={(next) => {
        // El componente espera el evento de cambio del `<select>` nativo que
        // reemplaza: solo lee `target.value`.
        onChange?.({
          target: { value: next },
        } as React.ChangeEvent<HTMLSelectElement>)
      }}
      onOpenChange={(open) => {
        if (!open) {
          // Radix bloquea los eventos del cuerpo mientras el desplegable está
          // abierto y los restaura al cerrar; si el popover que lo contiene se
          // desmonta en ese mismo instante, la limpieza no llega a ocurrir.
          setTimeout(() => {
            document.body.style.pointerEvents = ""
          }, 0)
        }
      }}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className="h-8 w-fit gap-1 border-none bg-transparent px-2 text-sm font-medium capitalize shadow-none focus:ring-0 focus:ring-offset-0 hover:bg-accent"
      >
        <SelectValue>{selected?.label}</SelectValue>
      </SelectTrigger>
      {/* Sin `popper`: ese modo ata el desplegable al ancho del disparador y
          los doce meses no entrarían. */}
      <SelectContent position="item-aligned" className="max-h-72 min-w-24">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={`${option.value}`}
            disabled={option.disabled}
            className="capitalize"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Un solo componente para las dos flechas: decide por la orientación. */
function CaptionChevron({ orientation }: ChevronProps) {
  const Icon = orientation === "left" ? ChevronLeft : ChevronRight

  return <Icon className="h-4 w-4" />
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        // La navegación ya no vive dentro de la cabecera: es hermana de los
        // meses, así que se posiciona sobre la fila del título.
        months: "relative flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-3",
        nav: "absolute inset-x-1 top-1 z-10 flex items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 rounded-md p-0 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 rounded-md p-0 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        ),
        month_caption: "relative flex h-8 items-center justify-center pt-1",
        caption_label: "text-sm font-medium capitalize",
        dropdowns:
          "flex items-center justify-center gap-1 **:data-radix-select-trigger:capitalize",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-9 rounded-md text-[0.75rem] font-medium uppercase tracking-wide text-muted-foreground",
        week: "flex w-full mt-1",
        // Las clases de estado van en la celda, no en el botón: el fondo de la
        // celda es el que da continuidad a los rangos.
        day: cn(
          "relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "data-[selected=true]:bg-accent data-[outside=true]:data-[selected=true]:bg-accent/50",
          "first:data-[selected=true]:rounded-l-md last:data-[selected=true]:rounded-r-md",
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 rounded-md p-0 font-normal transition-colors",
        ),
        // El relleno del día del medio de un rango tiene que ganarle al de
        // `selected`, y en Tailwind 4 las dos utilidades tienen la misma
        // especificidad: se marca el medio con una clase propia y `selected` la
        // excluye, en vez de depender del orden del CSS generado.
        selected: [
          "[&:not(.dia-medio-de-rango)>button]:bg-primary",
          "[&:not(.dia-medio-de-rango)>button]:font-medium",
          "[&:not(.dia-medio-de-rango)>button]:text-primary-foreground",
          "[&:not(.dia-medio-de-rango)>button:hover]:bg-primary",
          "[&:not(.dia-medio-de-rango)>button:hover]:text-primary-foreground",
          "[&:not(.dia-medio-de-rango)>button:focus]:bg-primary",
          "[&:not(.dia-medio-de-rango)>button:focus]:text-primary-foreground",
        ].join(" "),
        // Anillo en vez de relleno: el día de hoy dejaba de distinguirse en
        // cuanto quedaba seleccionado, porque ambos pintaban el fondo. El
        // selector con `data-selected` gana por especificidad, no por orden.
        today: [
          "[&>button]:font-semibold",
          "[&:not(.dia-medio-de-rango)>button]:text-primary",
          "[&>button]:ring-1 [&>button]:ring-inset [&>button]:ring-primary/40",
          "[&[data-selected=true]:not(.dia-medio-de-rango)>button]:text-primary-foreground",
          "[&[data-selected=true]>button]:ring-0",
        ].join(" "),
        outside:
          "[&>button]:text-muted-foreground/60 [&[data-selected=true]>button]:bg-accent/50 [&[data-selected=true]>button]:text-muted-foreground [&[data-selected=true]>button]:opacity-30",
        disabled: "[&>button]:text-muted-foreground [&>button]:opacity-40",
        range_start: "rounded-l-md",
        range_end: "rounded-r-md",
        range_middle:
          "dia-medio-de-rango [&>button]:bg-accent [&>button]:text-accent-foreground [&>button]:rounded-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Dropdown: CaptionDropdown,
        Chevron: CaptionChevron,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
