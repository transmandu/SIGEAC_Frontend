"use client";

import { useState } from "react";
import { Loader2, Pencil, Tags, Trash2 } from "lucide-react";

import {
  useCreateDepartmentType,
  useDeleteDepartmentType,
  useUpdateDepartmentType,
} from "@/actions/ajustes/departamento/tipos/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  fieldClass,
  hintClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { PanelSection } from "@/components/forms/PanelSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useGetDepartmentTypes } from "@/hooks/ajustes/departamento/useGetDepartmentTypes";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { DepartmentType } from "@/types";
import { DialogShell } from "./DialogShell";
import { toneFor } from "./tones";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sameName = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

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
  const [toDelete, setToDelete] = useState<DepartmentType | null>(null);

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

  const duplicated = (types ?? []).some(
    (type) => type.id !== editing?.id && sameName(type.name, name),
  );
  const unchanged =
    !!editing &&
    editing.name === name.trim() &&
    (editing.connector ?? "") === connector.trim();
  const pending = createDepartmentType.isPending || updateDepartmentType.isPending;
  const canSave = !!name.trim() && !duplicated && !unchanged && !pending;

  const save = async () => {
    if (!slug || !canSave) return;

    const payload = { name: name.trim(), connector: connector.trim() || null };

    try {
      if (editing) {
        await updateDepartmentType.mutateAsync({ company: slug, id: editing.id, ...payload });
      } else {
        await createDepartmentType.mutateAsync({ company: slug, ...payload });
      }
      reset();
    } catch {
      // El aviso lo muestra la mutación; lo escrito se conserva.
    }
  };

  // Cerrar por cualquier camino descarta lo que se estaba editando.
  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  return (
    <DialogShell
      open={open}
      onOpenChange={handleOpenChange}
      icon={Tags}
      title="Tipos de departamento"
      description="El tipo se antepone al nombre: «Jefatura» + «de» + «Soporte Técnico» da «Jefatura de Soporte Técnico»."
      footer={
        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
          Cerrar
        </Button>
      }
    >
      <div className="space-y-4">
        <PanelSection
          icon={Tags}
          title={editing ? "Editar tipo" : "Nuevo tipo"}
          hint="Sin conector solo se antepone el tipo."
        >
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
              <div>
                <PanelStaticField htmlFor="type-name">Nombre</PanelStaticField>
                <Input
                  id="type-name"
                  className={fieldClass}
                  placeholder="Dirección, Jefatura…"
                  autoComplete="off"
                  maxLength={100}
                  aria-invalid={duplicated || undefined}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
                {duplicated && (
                  <p className="mt-1 text-[13px] text-destructive">
                    Ya existe un tipo con ese nombre.
                  </p>
                )}
              </div>

              <div>
                <PanelStaticField htmlFor="type-connector">Conector</PanelStaticField>
                <Input
                  id="type-connector"
                  className={fieldClass}
                  placeholder="de"
                  autoComplete="off"
                  maxLength={20}
                  value={connector}
                  onChange={(event) => setConnector(event.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 max-sm:flex-col-reverse max-sm:[&>button]:w-full">
              {editing && (
                <Button type="button" variant="outline" onClick={reset} disabled={pending}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={!canSave} className="min-w-35">
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : editing ? (
                  "Guardar cambios"
                ) : (
                  "Agregar tipo"
                )}
              </Button>
            </div>
          </form>
        </PanelSection>

        <PanelSection
          icon={Tags}
          title="Tipos existentes"
          hint="Un tipo desactivado deja de ofrecerse al crear departamentos."
          flush
        >
          {isLoading ? (
            <div className="space-y-2 p-3">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>
          ) : !types?.length ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Aún no hay tipos. Agregue el primero arriba.
            </p>
          ) : (
            <ul className="max-h-72 divide-y divide-border/60 overflow-y-auto">
              {types.map((type) => {
                const count = type.departments_count ?? 0;

                return (
                  <li
                    key={type.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5",
                      editing?.id === type.id && "bg-primary/5",
                    )}
                  >
                    <span className={cn("size-2.5 shrink-0 rounded-full", toneFor(type.id).dot)} />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {type.name}
                        {type.connector && (
                          <span className="font-normal text-muted-foreground">
                            {" "}
                            · «{type.connector}»
                          </span>
                        )}
                      </p>
                      <p className={hintClass}>
                        {count} {count === 1 ? "departamento" : "departamentos"}
                      </p>
                    </div>

                    <Switch
                      checked={type.is_active}
                      aria-label={`Tipo ${type.name} activo`}
                      disabled={updateDepartmentType.isPending}
                      onCheckedChange={(checked) =>
                        slug &&
                        updateDepartmentType.mutate({ company: slug, id: type.id, is_active: checked })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 max-sm:size-10"
                      aria-label={`Editar el tipo ${type.name}`}
                      onClick={() => startEdit(type)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-red-600 hover:text-red-600 max-sm:size-10"
                      aria-label={`Eliminar el tipo ${type.name}`}
                      title={count > 0 ? "Tiene departamentos: desactívelo en vez de eliminarlo" : undefined}
                      disabled={count > 0}
                      onClick={() => setToDelete(type)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </PanelSection>
      </div>

      <ConfirmDeleteDialog
        open={toDelete !== null}
        onOpenChange={(next) => !next && setToDelete(null)}
        title="Eliminar tipo de departamento"
        entityName={toDelete?.name}
        isPending={deleteDepartmentType.isPending}
        onConfirm={async () => {
          if (!slug || !toDelete) return;
          await deleteDepartmentType.mutateAsync({ company: slug, id: toDelete.id });
          if (editing?.id === toDelete.id) reset();
        }}
      />
    </DialogShell>
  );
}

function PanelStaticField({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex min-h-4 items-center gap-2 pb-1.5 text-[13px] font-medium text-muted-foreground"
    >
      {children}
      <span className="h-px flex-1 bg-border/60" />
    </label>
  );
}
