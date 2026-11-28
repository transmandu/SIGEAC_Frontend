"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { fieldClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { FolderAccessCandidate } from "@/lib/libraryService";
import { cn } from "@/lib/utils";

interface FolderMemberPickerProps {
  candidates: FolderAccessCandidate[];
  value: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
}

/** Lista con buscador para elegir qué empleados ven una carpeta. */
export default function FolderMemberPicker({
  candidates,
  value,
  onChange,
  disabled,
}: FolderMemberPickerProps) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter((c) =>
      [c.name, c.job_title, c.department].some((part) =>
        part?.toLowerCase().includes(q),
      ),
    );
  }, [candidates, query]);

  const toggle = (id: number) =>
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
    );

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-2.5 top-1/2 z-10 size-3.5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre, cargo o departamento"
          aria-label="Buscar personas"
          disabled={disabled}
          className={cn(fieldClass, "pl-8")}
        />
      </div>

      <div className="max-h-56 divide-y divide-border/60 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 dark:border-slate-700/60">
        {visible.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            {candidates.length === 0
              ? "No hay personas asignables."
              : "Sin resultados."}
          </p>
        ) : (
          visible.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/40"
            >
              <Checkbox
                checked={value.includes(c.id)}
                onCheckedChange={() => toggle(c.id)}
                disabled={disabled}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {c.name}
                </span>
                <span className="block truncate text-xs text-slate-600 dark:text-slate-400">
                  {[c.job_title, c.department].filter(Boolean).join(" · ")}
                </span>
              </span>
            </label>
          ))
        )}
      </div>

      <p className="text-[13px] text-muted-foreground">
        Solo aparecen empleados con un usuario activo: el acceso es para quien
        inicia sesión. Para alguien sin cuenta use «Compartir enlace».
      </p>

      <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
        {value.length === 0
          ? "Nadie seleccionado: solo la verá el director del departamento."
          : `${value.length} ${value.length === 1 ? "persona seleccionada" : "personas seleccionadas"}`}
      </p>
    </div>
  );
}
