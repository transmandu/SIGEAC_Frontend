"use client"

import * as React from "react"
import { useCommandState } from "cmdk"
import { CommandGroup } from "@/components/ui/command"

/**
 * Agrupa por lote solo mientras no se busca.
 *
 * Al filtrar, cmdk reordena grupos e items por puntuación moviendo nodos por
 * todo el DOM. Con un grupo por lote son decenas de contenedores
 * reacomodándose, y la lista da saltos. Sin encabezados los items quedan planos
 * en un único grupo y el reordenamiento no se nota.
 *
 * Debe renderizarse dentro de un <Command>: useCommandState lee su contexto.
 */
export function SearchAwareGroup({
    heading,
    children,
}: {
    heading: string
    children: React.ReactNode
}) {
    const searching = useCommandState((state) => state.search).trim().length > 0

    return <CommandGroup heading={searching ? undefined : heading}>{children}</CommandGroup>
}
