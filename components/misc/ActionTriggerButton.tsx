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
 * Base neutra con borde sólido; el azul aparece solo al apuntarlo, junto con un
 * brillo que sigue al cursor y un leve levantamiento. El brillo se pinta por
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
  const [pos, setPos] = React.useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
    onMouseMove?.(e);
  };

  /* El único tinte del hover es este brillo siguiendo al cursor. Va en su
     propia capa para poder desvanecerse: sobre el `background` del botón solo
     podría aparecer y desaparecer de golpe. */
  const glow = (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out"
      style={{
        opacity: hovered && !disabled ? 1 : 0,
        backgroundImage: `radial-gradient(circle at ${pos.x}% ${pos.y}%, hsl(var(--primary) / 0.10), transparent 60%)`,
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
        setHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        onMouseLeave?.(e);
      }}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative overflow-hidden h-10 px-4 rounded-md",
        // El trazo va al 40% y el fondo translúcido sobre blur: el botón se
        // apoya en la superficie en vez de recortarse contra ella.
        "border border-foreground/40 bg-background/70 backdrop-blur",
        "text-foreground/90 font-medium tracking-wide",
        "shadow-sm transition-all duration-200",
        "hover:border-primary/50 hover:text-primary hover:shadow-md",
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
