"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  useDeleteSecondaryUnit,
  useUpdateSecondaryUnit,
} from "@/actions/ajustes/unidades/actions";
import { Check, ChevronsUpDown, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { useCompanyStore } from "@/stores/CompanyStore";
import { cn } from "@/lib/utils";
import { Convertion, Unit } from "@/types";

// Mismas reglas que CreateSecondaryUnitForm.
const formSchema = z.object({
  equivalence: z.coerce.number({ invalid_type_error: "Debe ser un número válido." }),
  primary_unit: z.number().min(1, "Debe seleccionar la unidad primaria."),
  secondary_unit: z.number().min(1, "Debe seleccionar la unidad secundaria.").optional(),
});

/** Combobox de unidades reutilizado por los dos campos del formulario. */
const UnitCombobox = ({
  units,
  isLoading,
  value,
  onSelect,
  placeholder,
}: {
  units?: Unit[];
  isLoading: boolean;
  value?: number;
  onSelect: (id: number) => void;
  placeholder: string;
}) => {
  const [open, setOpen] = useState(false);
  const selected = units?.find((unit) => unit.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={isLoading}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected
            ? selected.label
            : isLoading
              ? "Cargando unidades..."
              : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar unidad..." />
          <CommandList>
            <CommandEmpty>No se encontraron unidades.</CommandEmpty>
            <CommandGroup>
              {units && units.length > 0 ? (
                units.map((unit) => (
                  <CommandItem
                    key={unit.id}
                    value={`${unit.label} ${unit.value}`}
                    onSelect={() => {
                      onSelect(unit.id);
                      setOpen(false);
                    }}
                  >
                    {unit.label}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === unit.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))
              ) : (
                <CommandItem disabled>No hay unidades disponibles</CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const SecondaryUnitDropdownActions = ({ conversion }: { conversion: Convertion }) => {
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const { selectedCompany } = useCompanyStore();
  const { deleteSecondaryUnit } = useDeleteSecondaryUnit();
  const { updateSecondaryUnit } = useUpdateSecondaryUnit();
  const { data: units, isLoading: unitsLoading } = useGetUnits(selectedCompany?.slug);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equivalence: conversion.equivalence,
      primary_unit: conversion.primary_unit?.id,
      secondary_unit: conversion.secondary_unit?.id,
    },
  });

  // Al reabrir el diálogo se vuelve a partir de lo que hay guardado: si el
  // usuario editó y canceló, no debe reaparecer lo que dejó a medias.
  useEffect(() => {
    if (editOpen) {
      form.reset({
        equivalence: conversion.equivalence,
        primary_unit: conversion.primary_unit?.id,
        secondary_unit: conversion.secondary_unit?.id,
      });
    }
  }, [editOpen, conversion, form]);

  const primaryUnitId = form.watch("primary_unit");
  const secondaryUnitId = form.watch("secondary_unit");
  const selectedPrimaryUnit = units?.find((unit) => unit.id === primaryUnitId);
  const selectedSecondaryUnit = units?.find((unit) => unit.id === secondaryUnitId);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateSecondaryUnit.mutateAsync({ id: conversion.id, ...values });
      setEditOpen(false);
    } catch (error) {}
  };

  const handleDelete = async (id: number | string) => {
    try {
      await deleteSecondaryUnit.mutateAsync(id);
      setDeleteOpen(false);
    } catch (error) {}
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" data-tour="unidades-secondary-actions">
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
            <DialogTitle>Editar Conversión</DialogTitle>
            <DialogDescription>
              Actualice las unidades o el valor de conversión.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="primary_unit"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">
                      Unidad Primaria de Referencia
                    </FormLabel>
                    <FormControl>
                      <UnitCombobox
                        units={units}
                        isLoading={unitsLoading}
                        value={field.value}
                        onSelect={(id) => field.onChange(id)}
                        placeholder="Seleccione una unidad primaria..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="equivalence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Valor de conversión por unidad
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        onChange={(e) => field.onChange(e.target.value.replace(/,/g, "."))}
                        value={
                          field.value === undefined || field.value === null
                            ? ""
                            : field.value.toString()
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      {selectedPrimaryUnit && selectedSecondaryUnit && (
                        <span className="block mt-1 text-sm text-muted-foreground italic">
                          Ejemplo: 1 {selectedSecondaryUnit.label} = {field.value || 0}{" "}
                          {selectedPrimaryUnit.label}
                        </span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondary_unit"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">Unidad Secundaria</FormLabel>
                    <FormControl>
                      <UnitCombobox
                        units={units}
                        isLoading={unitsLoading}
                        value={field.value}
                        onSelect={(id) => field.onChange(id)}
                        placeholder="Seleccione una unidad secundaria..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                className="w-full bg-primary text-white hover:bg-blue-900 disabled:bg-primary/70"
                disabled={updateSecondaryUnit?.isPending}
                type="submit"
              >
                {updateSecondaryUnit?.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar cambios"
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
            <DialogTitle className="text-center">¿Seguro que desea eliminar esta conversión?</DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Esta acción es irreversible y estaría eliminando por completo la conversión seleccionada.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 md:gap-0">
            <Button className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black" onClick={() => setDeleteOpen(false)} type="button">Cancelar</Button>
            <Button disabled={deleteSecondaryUnit.isPending} className="hover:bg-white hover:text-black hover:border hover:border-black transition-all" onClick={() => handleDelete(conversion.id)}>{deleteSecondaryUnit.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Confirmar</p>}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SecondaryUnitDropdownActions;
