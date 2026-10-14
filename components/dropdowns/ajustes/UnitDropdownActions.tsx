"use client";

import {
  useDeleteUnit,
  useUpdateUnit,
} from "@/actions/ajustes/unidades/actions";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Unit } from "@/types";

// Mismas reglas que CreateUnitForm: editar no puede dejar una unidad en un
// estado que el formulario de creación habría rechazado.
const formSchema = z.object({
  label: z.string().min(3, {
    message: "El nombre debe tener al menos 3 carácters.",
  }),
  value: z.string().min(1, {
    message: "El Simbolo de la unidad debe tener al menos 1 carácters.",
  }),
  is_dimensional: z.boolean().default(false),
});

const UnitDropdownActions = ({ unit }: { unit: Unit }) => {
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const { deleteUnit } = useDeleteUnit();
  const { updateUnit } = useUpdateUnit();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: unit.label ?? "",
      value: unit.value ?? "",
      is_dimensional: unit.is_dimensional ?? false,
    },
  });

  // Al reabrir el diálogo se vuelve a partir de lo que hay guardado: si el
  // usuario editó y canceló, no debe reaparecer lo que dejó a medias.
  useEffect(() => {
    if (editOpen) {
      form.reset({
        label: unit.label ?? "",
        value: unit.value ?? "",
        is_dimensional: unit.is_dimensional ?? false,
      });
    }
  }, [editOpen, unit.label, unit.value, unit.is_dimensional, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateUnit.mutateAsync({ id: unit.id, ...values });
      setEditOpen(false);
    } catch {
      // El aviso lo muestra la mutación; el diálogo queda abierto.
    }
  };

  const actions: RowAction[] = [
    {
      key: "edit",
      label: "Editar unidad",
      icon: Pencil,
      tone: "blue",
      onSelect: () => setEditOpen(true),
    },
    {
      key: "delete",
      label: "Eliminar unidad",
      icon: Trash2,
      tone: "red",
      onSelect: () => setDeleteOpen(true),
    },
  ];

  return (
    <>
      <SettingsRowActions actions={actions} tourId="unidades-primary-actions" />

      {/* ── Editar ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-105">
          <DialogHeader>
            <DialogTitle>Editar unidad</DialogTitle>
            <DialogDescription>
              Actualice el nombre o el símbolo de la unidad.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-2">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="EJ: Kilogramo, Litro, Mililitro"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Simbolo de la Unidad</FormLabel>
                      <FormControl>
                        <Input placeholder="EJ: Kg, L, mL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_dimensional"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 rounded-md border p-3 mt-1">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">
                          Sirve para declarar medidas
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Habilita esta unidad para dimensionar artículos que se
                          despachan en trazos (láminas, telas, rollos).
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <Button
                className="bg-primary mt-4 text-white hover:bg-blue-900 disabled:bg-primary/70"
                disabled={updateUnit?.isPending}
                type="submit"
              >
                {updateUnit?.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <p>Actualizar</p>
                )}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar unidad"
        entityName={unit.label}
        isPending={deleteUnit.isPending}
        onConfirm={() => deleteUnit.mutateAsync(unit.id)}
      />
    </>
  );
};

export default UnitDropdownActions;
