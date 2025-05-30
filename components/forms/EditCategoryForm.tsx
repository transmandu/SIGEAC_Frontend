"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "../ui/command";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Separator } from "../ui/separator";
import { useUpdateCategory } from "@/actions/aerolinea/categorias/actions";
import { useGetCategoryById } from "@/hooks/aerolinea/categorias_cuentas/useGetCategoryById";
import { useGetAccountant } from "@/hooks/aerolinea/cuentas_contables/useGetAccountant";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z
    .string()
    .max(40)
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      "No se permiten caracteres especiales, solo letras"
    )
    .min(2, {
      message: "El nombre debe tener al menos 2 caracteres y maximo 40.",
    })
    .optional(),
  accountant_id: z
    .string({
      message: "Debe elegir una cuenta.",
    })
    .optional(),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface EditCategoryFormProps {
  id: string;
  onClose: () => void;
}

export function EditCategoryForm({ id, onClose }: EditCategoryFormProps) {
  const { data: categoryDetails, isLoading } = useGetCategoryById(id);
  const { updateCategory } = useUpdateCategory();
  const { data: accounts, isLoading: isAccountLoading } = useGetAccountant();
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: categoryDetails?.name,
      accountant_id: categoryDetails?.accountant?.id.toString(),
    },
  });

  const OnSubmit = async (formData: FormSchemaType) => {
    const data = {
      name: formData.name,
      accountant_id: formData.accountant_id,
    };
    await updateCategory.mutate({ id, data });
    onClose();
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(OnSubmit)}>
        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nombre de la Categoría</FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese el nuevo nombre" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="accountant_id"
            render={({ field }) => (
              <FormItem className="w-full flex flex-col space-y-3">
                <FormLabel>Cuenta</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        disabled={isAccountLoading}
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {isAccountLoading && (
                          <Loader2 className="size-4 animate-spin mr-2" />
                        )}
                        {field.value
                          ? accounts?.find(
                              (account) => account.id.toString() === field.value
                            )?.name
                          : "Seleccione una cuenta"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                    <Command>
                      <CommandInput placeholder="Busque una cuenta..." />
                      <CommandList>
                        <CommandEmpty className="text-sm p-2 text-center">
                          No se ha encontrado ninguna cuenta.
                        </CommandEmpty>
                        <CommandGroup>
                          {accounts?.map((account) => (
                            <CommandItem
                              value={account.name}
                              key={account.id}
                              onSelect={() => {
                                form.setValue(
                                  "accountant_id",
                                  account.id.toString()
                                );
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  account.id.toString() === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {account.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>
        <Button type="submit" disabled={updateCategory.isPending}>
          {updateCategory.isPending ? "Actualizando..." : "Actualizar"}
        </Button>
      </form>
    </Form>
  );
}
