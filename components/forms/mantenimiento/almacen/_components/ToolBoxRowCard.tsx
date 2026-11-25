"use client";

import { Button } from "@/components/ui/button";
import type { ToolBoxMember } from "@/components/forms/mantenimiento/almacen/_hooks/useDispatchForm";
import { cn } from "@/lib/utils";
import { ChevronDown, Clock, PackageOpen, X } from "lucide-react";
import { useState } from "react";

interface ToolBoxRowCardProps {
  name: string;
  /** Qué guarda la caja: herramientas y herramientas de ferretería. */
  summary: string;
  responsible?: string | null;
  /** Lo que guarda la caja, dentro o fuera del almacén. */
  members: ToolBoxMember[];
  onRemove: () => void;
}

/**
 * Fila de una caja de herramientas en la salida. La caja no tiene cantidad:
 * sale lo que está dentro de ella en el almacén. El desplegable dice qué es, y
 * de lo que está fuera, quién lo tiene y por qué.
 */
export function ToolBoxRowCard({
  name,
  summary,
  responsible,
  members,
  onRemove,
}: ToolBoxRowCardProps) {
  const [open, setOpen] = useState(false);
  const inside = members.filter((member) => member.inside);
  const outside = members.length - inside.length;

  return (
    <div className="rounded-md border border-l-4 border-l-violet-500/50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <PackageOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {[summary, responsible ? `Responsable: ${responsible}` : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          aria-label="Quitar caja"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="mt-2 flex w-full items-center gap-1.5 text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180",
          )}
        />
        Sale con la caja: {inside.length} de {members.length}
        {outside > 0 && ` · ${outside} fuera`}
      </button>

      {open && (
        <ul className="mt-2 space-y-1 border-t pt-2">
          {members.map((member) => (
            <li
              key={member.key}
              className={cn(
                "flex items-start gap-2 text-xs",
                !member.inside && "text-muted-foreground",
              )}
            >
              {member.inside ? (
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
              ) : (
                <Clock className="mt-0.5 size-3 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className={cn("truncate", member.inside && "font-medium")}>
                  {member.label}
                  {member.detail && (
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      · {member.detail}
                    </span>
                  )}
                </p>
                {member.holder && (
                  <p className="truncate italic">{member.holder}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
