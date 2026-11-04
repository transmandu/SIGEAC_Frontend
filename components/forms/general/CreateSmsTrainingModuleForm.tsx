"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import {
  useCreateSmsTrainingModule,
  useUpdateSmsTrainingModule,
} from "@/actions/general/cursos/training-modules";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import { SmsTrainingModule } from "@/types";

const moduleSchema = z.object({
  number: z.coerce
    .number({ error: "El número es obligatorio" })
    .int()
    .min(1, "El número debe ser mayor a 0"),
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

type ModuleForm = z.infer<typeof moduleSchema>;

interface Props {
  onSuccess?: () => void;
  module?: SmsTrainingModule;
}

export function CreateSmsTrainingModuleForm({ onSuccess, module }: Props) {
  const { selectedCompany } = useCompanyStore();
  const { createSmsTrainingModule } = useCreateSmsTrainingModule();
  const { updateSmsTrainingModule } = useUpdateSmsTrainingModule();
  const mutation = module ? updateSmsTrainingModule : createSmsTrainingModule;

  const form = useForm<ModuleForm>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      number: module?.number ?? 1,
      name: module?.name ?? "",
      description: module?.description ?? "",
      is_active: module?.is_active ?? true,
    },
  });

  const onSubmit = async (data: ModuleForm) => {
    const company = selectedCompany!.slug;
    const payload = {
      number: data.number,
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      is_active: data.is_active,
    };

    try {
      if (module) {
        await updateSmsTrainingModule.mutateAsync({
          company,
          id: module.id,
          data: payload,
        });
      } else {
        await createSmsTrainingModule.mutateAsync({ company, data: payload });
        form.reset();
      }
      onSuccess?.();
    } catch {
      // El aviso lo muestra la mutación.
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(onSubmit)(e);
        }}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del módulo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Introducción al SMS" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descripción opcional"
                  className="min-h-20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-md border p-3">
              <FormLabel className="m-0">Activo</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          className="mt-2 w-full bg-primary text-white hover:bg-blue-900 disabled:bg-primary/70"
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : module ? (
            "Actualizar módulo"
          ) : (
            "Crear módulo"
          )}
        </Button>
      </form>
    </Form>
  );
}
