"use client";

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

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { useCreateJobTitle } from "@/actions/general/cargo/actions";
import { useCompanyStore } from "@/stores/CompanyStore";

const jobTitleSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
});

type JobTitleForm = z.infer<typeof jobTitleSchema>;

export function CreateJobTitleForm({ onSuccess }: { onSuccess?: () => void }) {
  const form = useForm<JobTitleForm>({
    resolver: zodResolver(jobTitleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { selectedCompany } = useCompanyStore();
  const { createJobTitle } = useCreateJobTitle();

  const onSubmit = async (data: JobTitleForm) => {
    const formattedData = {
      company: selectedCompany!.slug,
      data: { ...data },
    };

    await createJobTitle.mutateAsync(formattedData);

    onSuccess?.();
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Analista de Sistemas" {...field} />
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
                <Input placeholder="Descripción del cargo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Form>
  );
}
