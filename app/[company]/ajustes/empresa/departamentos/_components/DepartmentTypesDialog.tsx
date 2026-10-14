"use client";

import {
  useCreateDepartmentType,
  useDeleteDepartmentType,
  useUpdateDepartmentType,
} from "@/actions/ajustes/departamento/tipos/actions";
import {
  FieldLabelRow,
  fieldClass,
  hintClass,
  labelClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useGetDepartmentTypes } from "@/hooks/ajustes/departamento/useGetDepartmentTypes";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { DepartmentType } from "@/types";
import { Loader2, Pencil, Tags, Trash2 } from "lucide-react";
import { useState } from "react";
import { DialogShell } from "./DialogShell";
import { listRowClass } from "./theme";
import { toneFor } from "./tones";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DepartmentTypesDialog({ open, onOpenChange }: Props) {
  const { selectedCompany } = useCompanyStore();
  const slug = selectedCompany?.slug;

  const { data: types, isLoading } = useGetDepartmentTypes(slug, {
    includeInactive: true,
    enabled: open,
  });
  const { createDepartmentType } = useCreateDepartmentType();
  const { updateDepartmentType } = useUpdateDepartmentType();
  const { deleteDepartmentType } = useDeleteDepartmentType();

  const [editing, setEditing] = useState<DepartmentType | null>(null);
  const [name, setName] = useState("");
  const [connector, setConnector] = useState("");

  const reset = () => {
    setEditing(null);
    setName("");
    setConnector("");
  };

  const startEdit = (type: DepartmentType) => {
    setEditing(type);
    setName(type.name);
    setConnector(type.connector ?? "");
  };

  const save = async () => {
    if (!slug || !name.trim()) return;

    const payload = { name: name.trim(), connector: connector.trim() || null };

    if (editing) {
      await updateDepartmentType.mutateAsync({ company: slug, id: editing.id, ...payload });
    } else {
      await createDepartmentType.mutateAsync({ company: slug, ...payload });
    }

    reset();
  };

  const pending = createDepartmentType.isPending || updateDepartmentType.isPending;

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      icon={Tags}
      title="Tipos de departamento"
      eyebrow="Organigrama"
      description="El tipo se antepone al nombre: «Jefatura» + «de» + «Soporte Técnico» da «Jefatura de Soporte Técnico»."
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <div className="space-y-1.5">
            <FieldLabelRow>
              <label className={labelClass} htmlFor="type-name">
                {editing ? "Editar tipo" : "Nuevo tipo"}
              </label>
            </FieldLabelRow>
            <Input
              id="type-name"
              className={fieldClass}
              placeholder="Dirección, Jefatura…"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <FieldLabelRow>
              <label className={labelClass} htmlFor="type-connector">
                Conector
              </label>
            </FieldLabelRow>
            <Input
              id="type-connector"
              className={fieldClass}
              placeholder="de"
              maxLength={20}
              value={connector}
              onChange={(event) => setConnector(event.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className={hintClass}>Sin conector solo se antepone el tipo.</p>
          <div className="flex gap-2">
            {editing && (
              <Button variant="outline" onClick={reset}>
                Cancelar
              </Button>
            )}
            <Button onClick={save} disabled={!name.trim() || pending} className="min-w-35">
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editing ? (
                "Actualizar"
              ) : (
                "Agregar tipo"
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2 border-t pt-4">
          {isLoading ? (
            <>
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
            </>
          ) : (
            <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {(types ?? []).map((type) => (
                <li key={type.id} className={cn(listRowClass, "flex items-center gap-3 p-3")}>
                  <span className={cn("size-2.5 shrink-0 rounded-full", toneFor(type.id).dot)} />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {type.name}
                      {type.connector && (
                        <span className="text-muted-foreground font-normal">
                          {" "}
                          · «{type.connector}»
                        </span>
                      )}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {type.departments_count ?? 0}{" "}
                      {type.departments_count === 1 ? "departamento" : "departamentos"}
                    </p>
                  </div>

                  <Switch
                    checked={type.is_active}
                    aria-label={`Tipo ${type.name} activo`}
                    onCheckedChange={(checked) =>
                      slug &&
                      updateDepartmentType.mutate({ company: slug, id: type.id, is_active: checked })
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Editar tipo"
                    onClick={() => startEdit(type)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Eliminar tipo"
                    disabled={(type.departments_count ?? 0) > 0}
                    onClick={() =>
                      slug && deleteDepartmentType.mutate({ company: slug, id: type.id })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DialogShell>
  );
}
