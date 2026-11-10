"use client";

import { useMemo } from "react";
import { BriefcaseBusiness } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";

import {
  useCreateJobTitle,
  useUpdateJobTitle,
} from "@/actions/general/cargo/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import {
  fieldClass,
  hintClass,
  textareaClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { PanelFieldLabel, PanelSection } from "@/components/forms/PanelSection";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGetJobTitles } from "@/hooks/ajustes/cargo/useGetJobTitles";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import { JobTitle } from "@/types";

const NAME_MAX = 255;
const DESCRIPTION_MAX = 500;

const FIELD_LABELS: Record<string, string> = {
  name: "Nombre",
  description: "Descripción",
};

const sameName = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

/** El nombre no puede repetirse entre los cargos ya cargados; el servidor lo vuelve a comprobar. */
const buildSchema = (existing: JobTitle[], current?: JobTitle) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: "Ingrese el nombre del cargo." })
      .max(NAME_MAX, {
        message: `No puede superar los ${NAME_MAX} caracteres.`,
      })
      .refine(
        (value) =>
          !existing.some(
            (job) => job.id !== current?.id && sameName(job.name, value),
          ),
        { message: "Ya existe un cargo con ese nombre." },
      ),
    description: z
      .string()
      .trim()
      .max(DESCRIPTION_MAX, {
        message: `No puede superar los ${DESCRIPTION_MAX} caracteres.`,
      }),
  });

type JobTitleFormValues = z.infer<ReturnType<typeof buildSchema>>;

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
  /** Recibe el cargo recién creado, para que un selector lo deje elegido. */
  onCreated?: (jobTitle: JobTitle) => void;
  /** Con cargo, el formulario edita en lugar de crear. */
  jobTitle?: JobTitle;
}

export function CreateJobTitleForm({
  onSuccess,
  onCancel,
  onCreated,
  jobTitle,
}: Props) {
  const { selectedCompany } = useCompanyStore();
  const { data: jobTitles } = useGetJobTitles(selectedCompany?.slug);
  const { createJobTitle } = useCreateJobTitle();
  const { updateJobTitle } = useUpdateJobTitle();
  const mutation = jobTitle ? updateJobTitle : createJobTitle;

  const schema = useMemo(
    () => buildSchema(jobTitles ?? [], jobTitle),
    [jobTitles, jobTitle],
  );

  const form = useForm<JobTitleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: jobTitle?.name ?? "",
      description: jobTitle?.description ?? "",
    },
  });

  const description =
    useWatch({ control: form.control, name: "description" }) ?? "";

  const onSubmit = async (values: JobTitleFormValues) => {
    const company = selectedCompany?.slug;
    if (!company) return;

    try {
      if (jobTitle) {
        // Solo lo que cambió; una descripción vaciada viaja vacía y el
        // servidor la guarda como "sin descripción".
        const data: { name?: string; description?: string } = {};
        if (values.name !== jobTitle.name) data.name = values.name;
        if (values.description !== (jobTitle.description ?? "")) {
          data.description = values.description;
        }

        if (Object.keys(data).length > 0) {
          await updateJobTitle.mutateAsync({
            company,
            id: String(jobTitle.id),
            data,
          });
        }
      } else {
        const response = await createJobTitle.mutateAsync({
          company,
          data: values,
        });
        form.reset();
        onCreated?.(response.data as JobTitle);
      }
      onSuccess?.();
    } catch (error) {
      const errors = serverFieldErrors(error);
      if (errors) applyServerFieldErrors(form.setError, errors, FIELD_LABELS);
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        busy={mutation.isPending}
        canSave={jobTitle ? form.formState.isDirty : true}
        isEditing={!!jobTitle}
        submitLabel={jobTitle ? "Guardar cambios" : "Crear cargo"}
        onCancel={onCancel}
        // stopPropagation: el formulario puede montarse dentro de otro y el
        // submit subiría por el árbol de React hasta el formulario padre.
        onSubmit={(event) => {
          event.stopPropagation();
          form.handleSubmit(onSubmit, invalidFormHandler(FIELD_LABELS))(event);
        }}
      >
        <PanelSection
          icon={BriefcaseBusiness}
          title="Cargo"
          hint="Cómo se llama el puesto y qué hace."
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <PanelFieldLabel>
                    Nombre
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </PanelFieldLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Analista de Sistemas"
                      autoComplete="off"
                      maxLength={NAME_MAX}
                      className={fieldClass}
                      {...field}
                    />
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
                  <PanelFieldLabel>Descripción</PanelFieldLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Qué hace quien ocupa este cargo (opcional)"
                      rows={3}
                      maxLength={DESCRIPTION_MAX}
                      className={textareaClass}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className={`${hintClass} text-right`}>
                    {description.length}/{DESCRIPTION_MAX}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </PanelSection>
      </ArticleFormShell>
    </Form>
  );
}
