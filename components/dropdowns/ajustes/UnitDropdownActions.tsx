"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useDeleteUnit, useUpdateUnit } from "@/actions/ajustes/unidades/actions";
import { Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
    },
  });

  // Al reabrir el diálogo se vuelve a partir de lo que hay guardado: si el
  // usuario editó y canceló, no debe reaparecer lo que dejó a medias.
  useEffect(() => {
    if (editOpen) {
      form.reset({ label: unit.label ?? "", value: unit.value ?? "" });
    }
  }, [editOpen, unit.label, unit.value, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateUnit.mutateAsync({ id: unit.id, ...values });
      setEditOpen(false);
    } catch (error) {}
  };

  const handleDelete = async (id: number | string) => {
    try {
      await deleteUnit.mutateAsync(id);
      setDeleteOpen(false);
    } catch (error) {}
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" data-tour="unidades-primary-actions">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onSelect={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Editar ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Editar Unidad Primaria</DialogTitle>
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
                        <Input placeholder="EJ: Kilogramo, Litro, Mililitro" {...field} />
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
              </div>
              <Button
                className="bg-primary mt-4 text-white hover:bg-blue-900 disabled:bg-primary/70"
                disabled={updateUnit?.isPending}
                type="submit"
              >
                {updateUnit?.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <p>Guardar cambios</p>
                )}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── Eliminar ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">¿Seguro que desea eliminar esta unidad primaria?</DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Esta acción es irreversible y estaría eliminando por completo la unidad seleccionada.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 md:gap-0">
            <Button className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black" onClick={() => setDeleteOpen(false)} type="button">Cancelar</Button>
            <Button disabled={deleteUnit.isPending} className="hover:bg-white hover:text-black hover:border hover:border-black transition-all" onClick={() => handleDelete(unit.id)}>{deleteUnit.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Confirmar</p>}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UnitDropdownActions;
