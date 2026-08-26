"use client";

import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChildProps = {
  className?: string;
  children?: React.ReactNode;
};

/**
 * Botón que abre un diálogo de acción (crear, descargar, generar reporte).
 *
 * Base neutra con borde estándar; el azul aparece solo al apuntarlo, junto con
 * un brillo que sigue al cursor y un leve levantamiento. El brillo se pinta por
 * `style` porque su posición es dinámica y no puede salir de una clase.
 *
 * Va dentro de `DialogTrigger asChild`, que inyecta onClick y aria-*: por eso
 * los props se reenvían y el ref se propaga al botón real. Acepta además su
 * propio `asChild` para renderizarse como `Link`.
 */
export const ActionTriggerButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(function ActionTriggerButton(
  {
    className,
    children,
    disabled,
    asChild,
    onMouseEnter,
    onMouseLeave,
    onMouseMove,
    style,
    ...props
  },
  ref,
) {
  const [hovered, setHovered] = React.useState(false);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });

  const track = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  /* Va en su propia capa para poder desvanecerse: sobre el `background` del
     botón solo podría aparecer y desaparecer de golpe.

     El radio es fijo en px —y el centro en px, no en %— porque el tamaño por
     defecto se escala con el botón: en los anchos el brillo cubría todo.

     El color no hereda del token, que es oscuro y saturado: un pastel necesita
     saturación baja y luminosidad alta, o el brillo lee como un foco azul. */
  const glow = (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out"
      style={{
        opacity: hovered && !disabled ? 1 : 0,
        backgroundImage: `radial-gradient(circle 55px at ${pos.x}px ${pos.y}px, hsl(var(--primary-h, 226) 55% 78% / 0.30), hsl(var(--primary-h, 226) 55% 78% / 0.10) 50%, transparent 75%)`,
      }}
    />
  );

  const inner = (nodes: React.ReactNode) => (
    <>
      {glow}
      <span className="relative flex items-center justify-center">{nodes}</span>
    </>
  );

  /* Con `asChild` el botón se colapsa en su hijo mediante Radix Slot, que exige
     UN solo elemento: no se puede envolver. El brillo se inyecta dentro del
     hijo, que además debe posicionarse para que la capa lo cubra. */
  let content: React.ReactNode;

  if (!asChild) {
    content = inner(children);
  } else if (React.isValidElement<ChildProps>(children)) {
    content = React.cloneElement(
      children,
      {
        className: cn(
          "relative inline-flex items-center justify-center",
          children.props.className,
        ),
      },
      inner(children.props.children),
    );
  } else {
    content = children;
  }

  return (
    <Button
      ref={ref}
      variant="outline"
      disabled={disabled}
      onMouseEnter={(e) => {
        // También aquí: con el centro en px, sin posición previa el brillo
        // arrancaría en la esquina.
        track(e);
        setHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        onMouseLeave?.(e);
      }}
      onMouseMove={(e) => {
        track(e);
        onMouseMove?.(e);
      }}
      className={cn(
        "relative overflow-hidden h-10 px-4 rounded-md",
        // Fondo sólido: el brillo del hover se enturbiaba sobre una base
        // translúcida con blur.
        "border-border bg-background",
        "text-foreground font-medium",
        "shadow-sm transition-all duration-200",
        // El fondo no cambia al apuntar; el único tinte es el brillo que sigue
        // al cursor. `hover:bg-transparent` anula el gris de la variante.
        "hover:bg-transparent",
        "hover:border-primary/40 hover:text-primary hover:shadow-md",
        "hover:-translate-y-[1px]",
        "active:translate-y-0 active:shadow-sm",
        "focus-visible:ring-2 focus-visible:ring-primary/20",
        // Deshabilitado no debe insinuar interacción: sin elevación ni realce.
        "disabled:opacity-50 disabled:shadow-sm disabled:hover:translate-y-0",
        className,
      )}
      style={style}
      asChild={asChild}
      {...props}
    >
      {content}
    </Button>
  );
});
