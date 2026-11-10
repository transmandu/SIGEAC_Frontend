"use client";

import * as React from "react";
import { addMonths, format, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type ChevronProps } from "react-day-picker";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/** Un solo componente para las dos flechas: decide por la orientación. */
function CaptionChevron({ orientation }: ChevronProps) {
  const Icon = orientation === "left" ? ChevronLeft : ChevronRight;

  return <Icon className="h-4 w-4" />;
}

const navButton = cn(
  buttonVariants({ variant: "ghost" }),
  "size-9 rounded-lg p-0 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0 disabled:opacity-30",
);

const captionButton =
  "flex h-9 items-center gap-1 rounded-lg px-2.5 text-sm font-semibold capitalize transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-hidden";

const pickerCell =
  "flex h-10 items-center justify-center rounded-lg text-sm capitalize transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-35";

const selectedCell =
  "bg-primary font-medium text-primary-foreground hover:bg-primary";

type PickerView = "days" | "months" | "years";

const monthIndex = (date: Date) => date.getFullYear() * 12 + date.getMonth();

/**
 * Cabecera con selector de mes y año. En lugar de los selects nativos de
 * react-day-picker (que dentro de un popover dentro de un diálogo no abrían),
 * el mes y el año son botones que cambian la vista del propio calendario por
 * una cuadrícula de meses o de años.
 */
function CalendarWithPicker({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const today = new Date();
  const startMonth =
    props.startMonth ?? new Date(today.getFullYear() - 100, 0, 1);
  const endMonth = props.endMonth ?? new Date(today.getFullYear() + 5, 11, 1);

  const initial = startOfMonth(
    props.month ??
      props.defaultMonth ??
      (props.mode === "single" && props.selected instanceof Date
        ? props.selected
        : today),
  );

  const [inner, setInner] = React.useState(initial);
  const [view, setViewState] = React.useState<PickerView>("days");
  // La primera vista no se anima (el popover ya entra con su propia
  // animación); solo los cambios que hace el usuario.
  const [animated, setAnimated] = React.useState(false);
  const [daysNode, setDaysNode] = React.useState<HTMLDivElement | null>(null);

  const setView = (next: PickerView) => {
    setAnimated(true);
    setViewState(next);
  };
  // Año que se hojea en la vista de meses.
  const [browsingYear, setBrowsingYear] = React.useState(initial.getFullYear());

  const current = props.month ? startOfMonth(props.month) : inner;

  // Desplaza un instante la cuadrícula de días hacia donde se avanza. Va con la
  // Web Animations API sobre el mismo nodo (sin remontarlo) para no perder el
  // foco del teclado, y se omite con "reducir movimiento".
  const slideDays = (direction: number) => {
    const node = daysNode;
    if (
      !node ||
      direction === 0 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    node.animate(
      [
        { opacity: 0, transform: `translateX(${direction * 14}px)` },
        { opacity: 1, transform: "none" },
      ],
      { duration: 170, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  };

  const clamp = (date: Date) => {
    const index = monthIndex(date);
    if (index < monthIndex(startMonth)) return startOfMonth(startMonth);
    if (index > monthIndex(endMonth)) return startOfMonth(endMonth);
    return startOfMonth(date);
  };

  const goTo = (date: Date) => {
    const next = clamp(date);
    slideDays(Math.sign(monthIndex(next) - monthIndex(current)));
    setInner(next);
    props.onMonthChange?.(next);
  };

  const canGo = (delta: number) => {
    const index = monthIndex(current) + delta;
    return index >= monthIndex(startMonth) && index <= monthIndex(endMonth);
  };

  const startYear = startMonth.getFullYear();
  const endYear = endMonth.getFullYear();
  const years = Array.from(
    { length: Math.max(0, endYear - startYear + 1) },
    (_, index) => startYear + index,
  );

  const yearsRef = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (view !== "years") return;
    const list = yearsRef.current;
    const active = list?.querySelector<HTMLElement>("[data-current=true]");
    if (list && active) {
      list.scrollTop =
        active.offsetTop - list.clientHeight / 2 + active.clientHeight / 2;
    }
  }, [view]);

  const monthEnabled = (year: number, month: number) => {
    const index = year * 12 + month;
    return index >= monthIndex(startMonth) && index <= monthIndex(endMonth);
  };

  const heading =
    view === "days" ? (
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Mes anterior"
          className={navButton}
          disabled={!canGo(-1)}
          onClick={() => goTo(addMonths(current, -1))}
        >
          <ChevronLeft className="size-4" />
        </button>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className={captionButton}
            aria-label="Elegir el mes"
            onClick={() => {
              setBrowsingYear(current.getFullYear());
              setView("months");
            }}
          >
            {format(current, "LLLL", { locale: es })}
            <ChevronDown className="size-3.5 opacity-50" />
          </button>
          <button
            type="button"
            className={captionButton}
            aria-label="Elegir el año"
            onClick={() => setView("years")}
          >
            {current.getFullYear()}
            <ChevronDown className="size-3.5 opacity-50" />
          </button>
        </div>

        <button
          type="button"
          aria-label="Mes siguiente"
          className={navButton}
          disabled={!canGo(1)}
          onClick={() => goTo(addMonths(current, 1))}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    ) : view === "months" ? (
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Año anterior"
          className={navButton}
          disabled={browsingYear <= startYear}
          onClick={() => setBrowsingYear((year) => year - 1)}
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          className={captionButton}
          aria-label="Elegir el año"
          onClick={() => setView("years")}
        >
          {browsingYear}
          <ChevronDown className="size-3.5 opacity-50" />
        </button>
        <button
          type="button"
          aria-label="Año siguiente"
          className={navButton}
          disabled={browsingYear >= endYear}
          onClick={() => setBrowsingYear((year) => year + 1)}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    ) : (
      <div className="flex h-9 items-center justify-center text-sm font-semibold">
        Elegir el año
      </div>
    );

  const backToDays = () => setView("days");
  const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const todayAllowed = monthEnabled(today.getFullYear(), today.getMonth());

  const pickerBar = (shortcut: string) => (
    <div className="mt-1 flex h-9 items-center justify-between">
      <button
        type="button"
        onClick={backToDays}
        className="flex h-8 items-center gap-1 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-hidden"
      >
        <ChevronLeft className="size-4" />
        Volver
      </button>
      <button
        type="button"
        disabled={!todayAllowed}
        onClick={() => {
          setBrowsingYear(today.getFullYear());
          goTo(todayMonth);
          backToDays();
        }}
        className="h-8 rounded-lg px-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-35"
      >
        {shortcut}
      </button>
    </div>
  );

  return (
    <div
      className={cn("w-76 p-3", className)}
      // Escape en las vistas de mes y año vuelve a los días sin cerrar el popover.
      onKeyDown={(event) => {
        if (view !== "days" && event.key === "Escape") {
          event.stopPropagation();
          backToDays();
        }
      }}
    >
      {heading}

      {view === "days" && (
        <div
          ref={setDaysNode}
          className={cn(
            animated &&
              "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-[1.03] motion-safe:duration-150",
          )}
        >
          <DayPicker
            locale={es}
            showOutsideDays={showOutsideDays}
            // Seis filas siempre: la altura no salta al cambiar de mes.
            fixedWeeks
            {...props}
            captionLayout="label"
            hideNavigation
            month={current}
            onMonthChange={goTo}
            startMonth={startMonth}
            endMonth={endMonth}
            className="p-0"
            classNames={{
              // La navegación no vive dentro de la cabecera: es hermana de los
              // meses y se posiciona sobre la fila del título, a los lados.
              months: "relative flex flex-col gap-4 sm:flex-row",
              month: "space-y-2",
              nav: "absolute inset-x-0 top-0 z-10 flex items-center justify-between",
              button_previous: cn(
                buttonVariants({ variant: "ghost" }),
                "size-9 rounded-lg p-0 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0",
              ),
              button_next: cn(
                buttonVariants({ variant: "ghost" }),
                "size-9 rounded-lg p-0 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0",
              ),
              // La cabecera propia reemplaza a la de react-day-picker.
              month_caption: "hidden",
              caption_label: "text-sm font-semibold capitalize",
              dropdowns: "flex items-center justify-center gap-0.5",
              month_grid: "w-full border-collapse",
              weekdays: "mb-1 flex border-b border-border/60 pb-1",
              weekday:
                "flex size-10 items-center justify-center text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground",
              week: "mt-1 flex w-full",
              day: "relative size-10 p-0 text-center text-sm focus-within:relative focus-within:z-20",
              day_button: cn(
                buttonVariants({ variant: "ghost" }),
                "size-10 rounded-lg p-0 font-normal transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0",
              ),
              // El relleno del día del medio de un rango tiene que ganarle al de
              // `selected`, y en Tailwind 4 las dos utilidades tienen la misma
              // especificidad: se marca el medio con una clase propia y `selected` la
              // excluye, en vez de depender del orden del CSS generado.
              selected: [
                "[&:not(.dia-medio-de-rango)>button]:bg-primary",
                "[&:not(.dia-medio-de-rango)>button]:font-medium",
                "[&:not(.dia-medio-de-rango)>button]:text-primary-foreground",
                "[&:not(.dia-medio-de-rango)>button]:shadow-xs",
                "[&:not(.dia-medio-de-rango)>button:hover]:bg-primary",
                "[&:not(.dia-medio-de-rango)>button:hover]:text-primary-foreground",
                "[&:not(.dia-medio-de-rango)>button:focus]:bg-primary",
                "[&:not(.dia-medio-de-rango)>button:focus]:text-primary-foreground",
              ].join(" "),
              // Hoy se distingue con un tinte del color primario; ya seleccionado,
              // gana el relleno sólido (el selector con `data-selected` gana por
              // especificidad, no por orden).
              today: [
                "[&>button]:font-semibold",
                "[&:not(.dia-medio-de-rango)>button]:bg-primary/10",
                "[&:not(.dia-medio-de-rango)>button]:text-primary",
                "[&[data-selected=true]:not(.dia-medio-de-rango)>button]:bg-primary",
                "[&[data-selected=true]:not(.dia-medio-de-rango)>button]:text-primary-foreground",
              ].join(" "),
              outside:
                "[&>button]:text-muted-foreground/50 [&[data-selected=true]>button]:opacity-60",
              disabled:
                "[&>button]:cursor-not-allowed [&>button]:text-muted-foreground [&>button]:opacity-35 [&>button]:hover:bg-transparent",
              // El fondo continuo del rango va en la celda; el de un día suelto no.
              range_start: "rounded-l-lg bg-accent",
              range_end: "rounded-r-lg bg-accent",
              range_middle:
                "dia-medio-de-rango bg-accent [&>button]:rounded-none [&>button]:bg-transparent [&>button]:text-accent-foreground [&>button:hover]:bg-primary/15",
              hidden: "invisible",
              ...classNames,
            }}
            components={{ Chevron: CaptionChevron }}
          />
        </div>
      )}

      {view === "months" && (
        <div
          key={browsingYear}
          className={cn(
            "mt-2 grid h-64 grid-cols-3 content-start gap-1.5 pt-2",
            "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-150",
            animated && "motion-safe:zoom-in-95",
          )}
        >
          {Array.from({ length: 12 }, (_, month) => {
            const selected =
              browsingYear === current.getFullYear() &&
              month === current.getMonth();

            return (
              <button
                key={month}
                type="button"
                disabled={!monthEnabled(browsingYear, month)}
                onClick={() => {
                  goTo(new Date(browsingYear, month, 1));
                  setView("days");
                }}
                className={cn(pickerCell, "h-12", selected && selectedCell)}
              >
                {format(new Date(2000, month, 1), "LLL", { locale: es })}
              </button>
            );
          })}
        </div>
      )}
      {view === "months" && pickerBar("Este mes")}

      {view === "years" && (
        <div
          ref={yearsRef}
          className="relative mt-2 grid h-64 grid-cols-4 content-start gap-1.5 overflow-y-auto pt-2 pr-1 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-150"
        >
          {years.map((year) => {
            const selected = year === current.getFullYear();

            return (
              <button
                key={year}
                type="button"
                data-current={selected}
                onClick={() => {
                  setBrowsingYear(year);
                  goTo(new Date(year, current.getMonth(), 1));
                  setView("days");
                }}
                className={cn(
                  pickerCell,
                  "tabular-nums",
                  year === today.getFullYear() &&
                    !selected &&
                    "font-semibold text-primary",
                  selected && selectedCell,
                )}
              >
                {year}
              </button>
            );
          })}
        </div>
      )}
      {view === "years" && pickerBar("Este año")}
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout,
  ...props
}: CalendarProps) {
  const withPicker =
    captionLayout?.startsWith("dropdown") && (props.numberOfMonths ?? 1) === 1;

  if (withPicker) {
    return (
      <CalendarWithPicker
        className={className}
        classNames={classNames}
        showOutsideDays={showOutsideDays}
        {...props}
      />
    );
  }

  return (
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      captionLayout="label"
      className={cn("p-3", className)}
      classNames={{
        // La navegación no vive dentro de la cabecera: es hermana de los
        // meses y se posiciona sobre la fila del título, a los lados.
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "space-y-2",
        nav: "absolute inset-x-0 top-0 z-10 flex items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 rounded-lg p-0 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0",
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 rounded-lg p-0 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0",
        ),
        month_caption: "relative flex h-9 items-center justify-center",
        caption_label: "text-sm font-semibold capitalize",
        dropdowns: "flex items-center justify-center gap-0.5",
        month_grid: "w-full border-collapse",
        weekdays: "mb-1 flex border-b border-border/60 pb-1",
        weekday:
          "flex size-10 items-center justify-center text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground",
        week: "mt-1 flex w-full",
        day: "relative size-10 p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-10 rounded-lg p-0 font-normal transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0",
        ),
        // El relleno del día del medio de un rango tiene que ganarle al de
        // `selected`, y en Tailwind 4 las dos utilidades tienen la misma
        // especificidad: se marca el medio con una clase propia y `selected` la
        // excluye, en vez de depender del orden del CSS generado.
        selected: [
          "[&:not(.dia-medio-de-rango)>button]:bg-primary",
          "[&:not(.dia-medio-de-rango)>button]:font-medium",
          "[&:not(.dia-medio-de-rango)>button]:text-primary-foreground",
          "[&:not(.dia-medio-de-rango)>button]:shadow-xs",
          "[&:not(.dia-medio-de-rango)>button:hover]:bg-primary",
          "[&:not(.dia-medio-de-rango)>button:hover]:text-primary-foreground",
          "[&:not(.dia-medio-de-rango)>button:focus]:bg-primary",
          "[&:not(.dia-medio-de-rango)>button:focus]:text-primary-foreground",
        ].join(" "),
        // Hoy se distingue con un tinte del color primario; ya seleccionado,
        // gana el relleno sólido (el selector con `data-selected` gana por
        // especificidad, no por orden).
        today: [
          "[&>button]:font-semibold",
          "[&:not(.dia-medio-de-rango)>button]:bg-primary/10",
          "[&:not(.dia-medio-de-rango)>button]:text-primary",
          "[&[data-selected=true]:not(.dia-medio-de-rango)>button]:bg-primary",
          "[&[data-selected=true]:not(.dia-medio-de-rango)>button]:text-primary-foreground",
        ].join(" "),
        outside:
          "[&>button]:text-muted-foreground/50 [&[data-selected=true]>button]:opacity-60",
        disabled:
          "[&>button]:cursor-not-allowed [&>button]:text-muted-foreground [&>button]:opacity-35 [&>button]:hover:bg-transparent",
        // El fondo continuo del rango va en la celda; el de un día suelto no.
        range_start: "rounded-l-lg bg-accent",
        range_end: "rounded-r-lg bg-accent",
        range_middle:
          "dia-medio-de-rango bg-accent [&>button]:rounded-none [&>button]:bg-transparent [&>button]:text-accent-foreground [&>button:hover]:bg-primary/15",
        hidden: "invisible",
        ...classNames,
      }}
      components={{ Chevron: CaptionChevron }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
