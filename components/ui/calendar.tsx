"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DropdownProps } from "react-day-picker"

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
  children,
  "aria-label": ariaLabel,
}: DropdownProps) {
  const options = React.Children.toArray(
    children,
  ) as React.ReactElement<React.HTMLProps<HTMLOptionElement>>[]

  const selected = options.find((option) => `${option.props.value}` === `${value}`)

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
        <SelectValue>{selected?.props?.children}</SelectValue>
      </SelectTrigger>
      {/* Sin `popper`: ese modo ata el desplegable al ancho del disparador y
          los doce meses no entrarían. */}
      <SelectContent position="item-aligned" className="max-h-[18rem] min-w-[6rem]">
        {options.map((option) => (
          <SelectItem
            key={`${option.props.value}`}
            value={`${option.props.value}`}
            className="capitalize"
          >
            {option.props.children}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
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
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-3",
        caption: "relative flex items-center justify-center pt-1",
        caption_label: "text-sm font-medium capitalize",
        caption_dropdowns: "flex items-center justify-center gap-1 [&_[data-radix-select-trigger]]:capitalize",
        vhidden: "hidden",
        nav: "flex items-center space-x-1",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 rounded-md p-0 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell:
          "w-9 rounded-md text-[0.75rem] font-medium uppercase tracking-wide text-muted-foreground",
        row: "flex w-full mt-1",
        cell: "relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 rounded-md p-0 font-normal transition-colors aria-selected:opacity-100",
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary font-medium text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        // Anillo en vez de relleno: el día de hoy dejaba de distinguirse en
        // cuanto quedaba seleccionado, porque ambos pintaban el fondo.
        day_today:
          "font-semibold text-primary ring-1 ring-inset ring-primary/40 aria-selected:text-primary-foreground aria-selected:ring-0",
        day_outside:
          "day-outside text-muted-foreground/60 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-40",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Dropdown: CaptionDropdown,
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
