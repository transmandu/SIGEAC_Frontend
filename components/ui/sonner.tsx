"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      // Sonner pausa el temporizador con el mouse encima: sin esto no hay
      // forma de descartar un aviso ya leído.
      closeButton
      // Colores y posición van por variables de sonner: desde Tailwind 4 las
      // utilidades viven en una @layer real y el CSS sin capa que sonner
      // inyecta en runtime les gana siempre, sin importar la especificidad.
      // Por lo mismo, las clases de abajo que pisan reglas suyas llevan `!`.
      style={
        {
          "--normal-bg": "hsl(var(--background))",
          "--normal-text": "hsl(var(--foreground))",
          "--normal-border": "hsl(var(--border))",
          // Sonner 2 ancla el cerrar a la izquierda y lo saca del toast con un
          // translate negativo, dejándolo como una burbuja suelta. El `top: 0`
          // suyo no es variable, así que el centrado necesita la clase de abajo.
          "--toast-close-button-start": "unset",
          "--toast-close-button-end": "0.75rem",
          "--toast-close-button-transform": "translateY(-50%)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group/toast group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:!pr-10",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "!top-1/2 !border-transparent !bg-transparent !opacity-0 transition-opacity group-hover/toast:!opacity-100 focus-visible:!opacity-100 group-[.toast]:text-muted-foreground hover:group-[.toast]:!bg-muted hover:group-[.toast]:text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
