"use client";

import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  useCreateJobTitle,
  useUpdateJobTitle,
} from "@/actions/general/cargo/actions";
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
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import { JobTitle } from "@/types";

const jobTitleSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
});

type JobTitleForm = z.infer<typeof jobTitleSchema>;

interface Props {
  onSuccess?: () => void;
  /** Con cargo, el formulario edita en lugar de crear. */
  jobTitle?: JobTitle;
}

export function CreateJobTitleForm({ onSuccess, jobTitle }: Props) {
  const form = useForm<JobTitleForm>({
    resolver: zodResolver(jobTitleSchema),
    defaultValues: {
      name: jobTitle?.name ?? "",
      description: jobTitle?.description ?? "",
    },
  });

  const { selectedCompany } = useCompanyStore();
  const { createJobTitle } = useCreateJobTitle();
  const { updateJobTitle } = useUpdateJobTitle();
  const mutation = jobTitle ? updateJobTitle : createJobTitle;

  const onSubmit = async (data: JobTitleForm) => {
    const company = selectedCompany!.slug;

    try {
      if (jobTitle) {
        await updateJobTitle.mutateAsync({
          company,
          id: String(jobTitle.id),
          data,
        });
      } else {
        await createJobTitle.mutateAsync({ company, data });
        form.reset();
      }
      onSuccess?.();
    } catch {
      // El aviso lo muestra la mutación; el formulario queda abierto.
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

        <Button
          className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70"
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : jobTitle ? (
            "Actualizar"
          ) : (
            "Crear cargo"
          )}
        </Button>
      </form>
    </Form>
  );
}
