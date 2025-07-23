"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "../../ui/command";
import { Input } from "@/components/ui/input";
import { useGetAccountant } from "@/hooks/aerolinea/cuentas_contables/useGetAccountant";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useCreateModule } from "@/actions/sistema/modulos/actions";
import { useGetModules } from "@/hooks/sistema/useGetModules";

const formSchema = z.object({
  label: z
    .string()
    .max(40)
    .min(2, {
      message: "El nombre debe tener al menos 2 caracteres y maximo 40.",
    }),
  value: z
    .string()
    .max(40)
    .min(2, {
      message: "El nombre debe tener al menos 2 caracteres y maximo 40.",
    }),
});

interface FormProps {
  onClose: () => void;
}

export function CreateModuleForm({ onClose }: FormProps) {
  const { createModule } = useCreateModule();
  const { data: accounts, isLoading: isModuleLoading } = useGetModules();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    createModule.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Etiqueta</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingrese la etiqueta del modulo"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Valor</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingrese el valor del modulo"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={createModule.isPending}>
          {createModule.isPending ? "Enviando..." : "Enviar"}
        </Button>
      </form>
    </Form>
  );
}
