"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { forwardRef, useState } from "react"

/**
 * Botón de acción del módulo SUPERVISOR.
 *
 * Replica el tratamiento que usan los botones de acción principales del resto
 * del sistema (Generar Reporte en administración, Nueva solicitud en compras):
 * borde punteado, fondo translúcido con blur, elevación al hover y un
 * gradiente radial que sigue al cursor.
 *
 * La lógica del gradiente vive aquí y no repetida en cada pantalla porque el
 * patrón solo cambia de color según la acción.
 */

/**
 * El módulo entero se expresa en azul cielo: es una herramienta de saneamiento
 * a la que el supervisor llega cuando algo ya salió mal, así que la interfaz
 * debe transmitir calma en vez de alarma. Por eso no hay tonos por semántica
 * (verde/ámbar/rojo) — solo dos niveles de énfasis dentro de la misma familia.
 *
 * - primary: la acción que hace avanzar la tarea (fusionar, confirmar).
 * - subtle: acciones de apoyo (historial, deshacer, previsualizar).
 */
type ActionEmphasis = "primary" | "subtle"

/**
 * El gradiente se inyecta por style y no puede salir de una clase de
 * Tailwind, por eso el rgba va aparte. Ambos son sky, con distinta intensidad.
 */
const EMPHASIS: Record<ActionEmphasis, { classes: string; glow: string }> = {
    primary: {
        classes: cn(
            "border-sky-400/60 dark:border-sky-300/40",
            "text-sky-700 dark:text-sky-300",
            "hover:border-sky-500/70 dark:hover:border-sky-300/60",
            "hover:bg-sky-50/60 dark:hover:bg-sky-950/25",
            "focus-visible:ring-sky-500/25",
        ),
        glow: "rgba(14,165,233,0.14)",
    },
    subtle: {
        classes: cn(
            "border-sky-300/40 dark:border-sky-400/20",
            "text-sky-600/90 dark:text-sky-300/80",
            "hover:border-sky-400/50 dark:hover:border-sky-300/40",
            "hover:bg-sky-50/40 dark:hover:bg-sky-950/15",
            "focus-visible:ring-sky-500/20",
        ),
        glow: "rgba(14,165,233,0.08)",
    },
}

interface SupervisorActionButtonProps extends React.ComponentProps<typeof Button> {
    emphasis?: ActionEmphasis
}

const SupervisorActionButton = forwardRef<HTMLButtonElement, SupervisorActionButtonProps>(
    ({ emphasis = "primary", className, children, disabled, ...props }, ref) => {
        const [hovered, setHovered] = useState(false)
        const [pos, setPos] = useState({ x: 50, y: 50 })

        const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
            if (!hovered) return

            const rect = event.currentTarget.getBoundingClientRect()

            setPos({
                x: ((event.clientX - rect.left) / rect.width) * 100,
                y: ((event.clientY - rect.top) / rect.height) * 100,
            })
        }

        const { classes, glow } = EMPHASIS[emphasis]

        return (
            <Button
                ref={ref}
                variant="outline"
                disabled={disabled}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onMouseMove={handleMouseMove}
                className={cn(
                    "relative overflow-hidden h-10 px-4",
                    "border border-dashed bg-background/70 backdrop-blur",
                    "font-medium tracking-wide shadow-sm transition-all duration-200",
                    "hover:shadow-md hover:-translate-y-[1px]",
                    "active:translate-y-0 active:shadow-sm",
                    "focus-visible:ring-2",
                    // Deshabilitado no debe insinuar interacción: sin elevación
                    // ni realce de borde.
                    "disabled:opacity-50 disabled:shadow-sm disabled:hover:translate-y-0 disabled:hover:shadow-sm",
                    classes,
                    className,
                )}
                style={{
                    backgroundImage:
                        hovered && !disabled
                            ? `radial-gradient(circle at ${pos.x}% ${pos.y}%, ${glow}, transparent 65%)`
                            : "none",
                }}
                {...props}
            >
                {children}
            </Button>
        )
    },
)

SupervisorActionButton.displayName = "SupervisorActionButton"

export default SupervisorActionButton
