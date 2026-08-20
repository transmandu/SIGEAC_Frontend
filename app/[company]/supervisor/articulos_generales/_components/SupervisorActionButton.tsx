"use client"

import { forwardRef } from "react"

import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Botón de acción del módulo SUPERVISOR.
 *
 * Toma el tratamiento base de [ActionTriggerButton] y solo añade el nivel de
 * énfasis: dentro de este módulo conviven la acción que hace avanzar la tarea
 * y las de apoyo, y conviene distinguirlas sin recurrir a otro color.
 *
 * - primary: la acción que hace avanzar la tarea (fusionar, confirmar).
 * - subtle: acciones de apoyo (historial, deshacer, previsualizar).
 */
type ActionEmphasis = "primary" | "subtle"

const EMPHASIS: Record<ActionEmphasis, string> = {
    primary: "",
    subtle: "border-foreground/20 text-foreground/80",
}

interface SupervisorActionButtonProps extends React.ComponentProps<typeof Button> {
    emphasis?: ActionEmphasis
}

const SupervisorActionButton = forwardRef<HTMLButtonElement, SupervisorActionButtonProps>(
    ({ emphasis = "primary", className, children, ...props }, ref) => (
        <ActionTriggerButton
            ref={ref}
            className={cn(EMPHASIS[emphasis], className)}
            {...props}
        >
            {children}
        </ActionTriggerButton>
    ),
)

SupervisorActionButton.displayName = "SupervisorActionButton"

export default SupervisorActionButton
