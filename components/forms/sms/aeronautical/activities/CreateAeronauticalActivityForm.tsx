"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { FileText, Image as ImageIcon, Loader2, X } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelectCombobox } from "@/components/ui/MultiSelectCombobox";
import FolderSelect from "@/components/library/FolderSelect";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import { useGetActivityCategories } from "@/hooks/sms/useGetActivityCategories";
import { useGetNextAeronauticalActivityNumber } from "@/hooks/sms/aeronautical/useGetNextAeronauticalActivityNumber";
import {
  useCreateAeronauticalActivity,
  useUpdateAeronauticalActivity,
} from "@/actions/sms/aeronautical/activities/actions";
import {
  AERONAUTICAL_ACTIVITY_STATUSES,
  AeronauticalActivity,
} from "@/types/sms/aeronautical/activity";

const FormSchema = z.object({
  activity_name: z
    .string()
    .trim()
    .min(1, "El nombre de la actividad es obligatorio.")
    .max(255, "El nombre no puede superar los 255 caracteres."),
  activity_number: z
    .string()
    .trim()
    .min(1, "El número de actividad es obligatorio.")
    .max(255, "El número no puede superar los 255 caracteres."),
  place: z
    .string()
    .trim()
    .min(1, "El lugar de la actividad es obligatorio.")
    .max(255, "El lugar no puede superar los 255 caracteres."),
  description: z
    .string()
    .trim()
    .min(1, "La descripción es obligatoria.")
    .max(400, "La descripción no puede superar los 400 caracteres."),
  categories: z.array(z.string()).min(1, "Seleccione al menos una categoría."),
  status: z.enum(AERONAUTICAL_ACTIVITY_STATUSES).optional(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  company: string;
  initialData?: AeronauticalActivity;
  isEditing?: boolean;
  onSuccess?: (activity: AeronauticalActivity) => void;
  onCancel?: () => void;
}

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <FormLabel className="flex items-center gap-0.5">
      {children}
      <RequiredIndicator show />
    </FormLabel>
  );
}

function FilePicker({
  label,
  hint,
  accept,
  file,
  currentFile,
  onFile,
}: {
  label: string;
  hint: string;
  accept: string;
  file: File | null;
  currentFile?: string | null;
  onFile: (file: File | null) => void;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>

        <label className="cursor-pointer rounded-md border bg-background px-3 py-1.5 text-xs font-medium shadow-xs transition-colors hover:bg-muted">
          Seleccionar
          <input
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(event) => {
              onFile(event.target.files?.[0] ?? null);
              event.target.value = "";
            }}
          />
        </label>
      </div>

      {file ? (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-md bg-muted/40 px-2 py-1.5 text-xs">
          <span className="truncate">{file.name}</span>
          <button
            type="button"
            onClick={() => onFile(null)}
            className="text-muted-foreground hover:text-destructive"
            aria-label={`Quitar ${file.name}`}
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : currentFile ? (
        <p className="mt-3 truncate rounded-md bg-muted/40 px-2 py-1.5 text-xs text-muted-foreground">
          Actual: {currentFile.split("/").pop()}
        </p>
      ) : null}
    </div>
  );
}

export function CreateAeronauticalActivityForm({
  company,
  initialData,
  isEditing = false,
  onSuccess,
  onCancel,
}: FormProps) {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [document, setDocument] = useState<File | null>(null);
  const [libraryFolders, setLibraryFolders] = useState<string[]>(
    initialData?.library_folder_paths ?? [],
  );

  const { data: categories, isLoading: isCategoriesLoading } =
    useGetActivityCategories();
  const { data: nextNumber } = useGetNextAeronauticalActivityNumber(
    isEditing ? null : company,
  );

  const { createAeronauticalActivity } = useCreateAeronauticalActivity();
  const { updateAeronauticalActivity } = useUpdateAeronauticalActivity();

  const isPending =
    createAeronauticalActivity.isPending ||
    updateAeronauticalActivity.isPending;

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      activity_name: initialData?.activity_name ?? "",
      activity_number: initialData?.activity_number ?? "",
      place: initialData?.place ?? "",
      description: initialData?.description ?? "",
      categories: (initialData?.categories ?? []).map((category) =>
        String(category.id),
      ),
      status: (initialData?.status as FormSchemaType["status"]) ?? undefined,
    },
  });

  useEffect(() => {
    if (!isEditing && nextNumber?.next_number) {
      form.setValue("activity_number", nextNumber.next_number, {
        shouldValidate: true,
      });
    }
  }, [form, isEditing, nextNumber?.next_number]);

  const handleSubmit = async (data: FormSchemaType) => {
    const payload = {
      ...data,
      status: isEditing ? (data.status ?? undefined) : undefined,
    };

    try {
      if (isEditing && initialData) {
        await updateAeronauticalActivity.mutateAsync({
          company,
          id: String(initialData.id),
          data: payload,
          image,
          document,
          libraryFolderPaths: libraryFolders,
        });

        if (onSuccess) {
          onSuccess(initialData);
        } else {
          router.push(`/${company}/sms/promocion/actividades`);
        }
        return;
      }

      const response = await createAeronauticalActivity.mutateAsync({
        company,
        data: payload,
        image,
        document,
        libraryFolderPaths: libraryFolders,
      });

      const created = response?.data as AeronauticalActivity | undefined;

      if (onSuccess) {
        onSuccess(created as AeronauticalActivity);
      } else {
        router.push(`/${company}/sms/promocion/actividades`);
      }
    } catch (error) {
      console.error("Error al guardar la actividad", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-5"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="activity_number"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel>Número de actividad</RequiredLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="001-2026"
                    className="font-mono"
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Correlativo sugerido a partir del último registro.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="activity_name"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel>Nombre de la actividad</RequiredLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Charla de seguridad operacional"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="place"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel>Lugar</RequiredLabel>
                <FormControl>
                  <Input {...field} placeholder="Sala de capacitación" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isEditing ? (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AERONAUTICAL_ACTIVITY_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
        </div>

        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <RequiredLabel>Categorías</RequiredLabel>
              <FormControl>
                <MultiSelectCombobox
                  options={(categories ?? []).map((category) => ({
                    value: String(category.id),
                    label: category.name,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Seleccionar categorías..."
                  searchPlaceholder="Buscar categoría..."
                  emptyText={
                    isCategoriesLoading
                      ? "Cargando categorías..."
                      : "No hay categorías disponibles."
                  }
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
              <RequiredLabel>Descripción</RequiredLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder="Descripción de la actividad..."
                />
              </FormControl>
              <p className="text-right text-xs text-muted-foreground">
                {field.value.length} / 400
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FilePicker
            label="Imagen"
            hint="JPG, PNG o WEBP"
            accept="image/*"
            file={image}
            currentFile={initialData?.image}
            onFile={setImage}
          />

          <FilePicker
            label="Documento"
            hint="PDF"
            accept="application/pdf"
            file={document}
            currentFile={initialData?.document}
            onFile={setDocument}
          />
        </div>

        {document ? (
          <div className="flex flex-col gap-2">
            <FormLabel>Carpeta en Librería</FormLabel>
            <FolderSelect
              company={company}
              single
              value={libraryFolders}
              onChange={setLibraryFolders}
            />
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => (onCancel ? onCancel() : router.back())}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Guardando...
              </>
            ) : isEditing ? (
              <>
                <FileText className="mr-2 size-4" />
                Guardar cambios
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 size-4" />
                Crear actividad
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
