"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

type Props = {
  id: number
  base: number
  edited?: number
  onCommit: (id: number, value: string) => void
}

export function QuantityEditCell({ id, base, edited, onCommit }: Props) {
  const initial = edited !== undefined ? String(edited) : ""
  const [local, setLocal] = React.useState<string>(initial)

  // Si desde arriba cambian los edits (ej: reset), sincroniza
  React.useEffect(() => {
    setLocal(edited !== undefined ? String(edited) : "")
  }, [edited])

  const parsedLocal = local === "" ? undefined : Math.max(0, Number(local))
  const isDirty =
    parsedLocal !== undefined && Math.trunc(parsedLocal) !== Math.trunc(base)

  const commit = React.useCallback(() => {
    onCommit(id, local)
  }, [id, local, onCommit])

  return (
    <div className="flex flex-col items-center justify-center gap-1.5">
      <Input
        value={local}
        onChange={(e) => {
          const next = e.target.value.replace(/[^\d]/g, "")
          setLocal(next)
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            commit()
            ;(e.currentTarget as HTMLInputElement).blur()
          }
          if (e.key === "Escape") {
            e.preventDefault()
            setLocal(initial)
            ;(e.currentTarget as HTMLInputElement).blur()
          }
        }}
        placeholder={String(base)}
        inputMode="numeric"
        className={[
          "h-9 w-[120px] text-center tabular-nums",
          isDirty ? "border-orange-400 bg-orange-50/40 dark:bg-orange-950/10" : "",
        ].join(" ")}
      />

      <Badge
        variant={isDirty ? "secondary" : "outline"}
        className="text-[11px]"
        title={isDirty ? "Pendiente de guardar" : "Sin cambios"}
      >
        {isDirty ? "Modificado" : "OK"}
      </Badge>
    </div>
  )
}
