"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      // Botón de cerrar en todos los toasts: la duración por defecto es larga
      // y sonner además pausa el temporizador con el mouse encima, así que sin
      // esto no hay forma de descartar un aviso ya leído.
      closeButton
      // Los colores van por las variables de sonner y no por las clases de
      // abajo. Desde Tailwind 4 las utilidades viven en una @layer real y el
      // CSS sin capa que sonner inyecta en runtime les gana siempre, sin que
      // importe la especificidad: con las clases solas el toast salía negro
      // puro en oscuro en lugar del fondo del tema. Estas tres variables son
      // las que la propia hoja de sonner lee, y como no usamos `richColors`
      // también cubren los toasts de éxito y de error.
      style={
        {
          "--normal-bg": "hsl(var(--background))",
          "--normal-text": "hsl(var(--foreground))",
          "--normal-border": "hsl(var(--border))",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "group-[.toast]:text-muted-foreground hover:group-[.toast]:bg-muted hover:group-[.toast]:text-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
