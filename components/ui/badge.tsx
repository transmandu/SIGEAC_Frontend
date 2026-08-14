import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// whitespace-nowrap: al envolver, el borde redondeado se dibuja partido en cada
// línea y el badge se ve roto. Prefiere desbordar antes que quebrarse.
//
// El hover no cambia de tono: ajusta el brillo del propio color, así un badge
// rojo se ve rojo un punto más marcado y nunca hereda el azul del tema cuando
// quien lo usa le pasa sus propios colores por className. En oscuro se sube el
// contraste en vez de bajar el brillo, porque oscurecer sobre un fondo ya
// oscuro (y con fondos translúcidos tipo bg-red-500/10) no se percibe.
const badgeVariants = cva(
  "inline-flex w-fit select-none items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-[filter,color,background-color,border-color] duration-150 hover:brightness-95 dark:hover:brightness-100 dark:hover:contrast-125 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        warning: "border-transparent bg-yellow-400/80 text-warning-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
