"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateMaintenanceProvider } from "@/actions/mantenimiento/planificacion/maintenance_providers/actions";
import { useCompanyStore } from "@/stores/CompanyStore";
import { MaintenanceProvider } from "@/types";

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 carácteres."),
});

interface FormProps {
  onClose: () => void;
  onSuccess?: (provider: MaintenanceProvider) => void;
}

export default function CreateMaintenanceProviderForm({ onClose, onSuccess }: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { createMaintenanceProvider } = useCreateMaintenanceProvider();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const provider = await createMaintenanceProvider.mutateAsync({
      name: values.name,
      company: selectedCompany!.slug,
    });
    onSuccess?.(provider);
    onClose();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(onSubmit)(e);
        }}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Entidad</FormLabel>
              <FormControl>
                <Input placeholder="EJ: Corporate Flight Management, Inc" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="bg-primary text-white hover:bg-blue-900 disabled:bg-primary/70"
          disabled={createMaintenanceProvider.isPending}
          type="submit"
        >
          {createMaintenanceProvider.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <p>Crear</p>
          )}
        </Button>
      </form>
    </Form>
  );
}
