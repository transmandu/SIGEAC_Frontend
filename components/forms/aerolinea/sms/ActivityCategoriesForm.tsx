"use client";

import {
  useCreateActivityCategory,
  useDeleteActivityCategory,
  useUpdateActivityCategory,
} from "@/actions/sms/activity_categories/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useGetActivityCategories } from "@/hooks/sms/useGetActivityCategories";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { ActivityCategory } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(80, "Máximo 80 caracteres."),
});

type FormSchemaType = z.infer<typeof formSchema>;

export function ActivityCategoriesForm() {
  const { selectedCompany } = useCompanyStore();
  const { data: categories, isLoading } = useGetActivityCategories();
  const { createActivityCategory } = useCreateActivityCategory();
  const { updateActivityCategory } = useUpdateActivityCategory();
  const { deleteActivityCategory } = useDeleteActivityCategory();

  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ActivityCategory | null>(null);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name,
      });
      return;
    }

    form.reset({
      name: "",
    });
  }, [editingCategory, form]);

  const closeDialog = () => {
    setOpen(false);
    setEditingCategory(null);
  };

  // Se remueve el parámetro 'e' ya que se detiene antes de entrar aquí
  const onSubmit = async (values: FormSchemaType) => {
    if (!selectedCompany?.slug) return;

    if (editingCategory) {
      await updateActivityCategory.mutateAsync({
        company: selectedCompany.slug,
        id: editingCategory.id,
        data: values,
      });
    } else {
      await createActivityCategory.mutateAsync({
        company: selectedCompany.slug,
        data: values,
      });
    }

    setEditingCategory(null);
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        className="h-7 px-2 text-xs font-medium"
        onClick={() => setOpen(true)}
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        Categorías
      </Button>

      <Dialog open={open} onOpenChange={(value) => (value ? setOpen(true) : closeDialog())}>
        <DialogContent className="max-w-4xl gap-0 p-0">
          <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
            <div className="border-b border-border/60 p-5 md:border-b-0 md:border-r">
              <DialogHeader className="mb-4">
                <DialogTitle>
                  {editingCategory ? "Editar categoría de actividad" : "Crear categoría de actividad"}
                </DialogTitle>
                <DialogDescription>
                  Administre las categorías usadas por las actividades SMS.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                {/* Se intercepta el evento del submit para detener la propagación */}
                <form
                  onSubmit={(e) => {
                    e.stopPropagation();
                    form.handleSubmit((values) => onSubmit(values))(e);
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
                          <Input placeholder="Nombre de la categoría" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingCategory(null);
                        form.reset({ name: "" });
                      }}
                      className="flex-1"
                    >
                      Limpiar
                    </Button>

                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={
                        createActivityCategory.isPending || updateActivityCategory.isPending
                      }
                    >
                      {createActivityCategory.isPending || updateActivityCategory.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : editingCategory ? (
                        "Actualizar"
                      ) : (
                        "Crear"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>

            <div className="p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold">Categorías existentes</h3>
                <p className="text-xs text-muted-foreground">
                  {isLoading
                    ? "Cargando categorías..."
                    : `${categories?.length || 0} categorías registradas`}
                </p>
              </div>

              <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {categories?.map((category) => (
                  <div
                    key={category.id}
                    className={cn(
                      "rounded-lg border border-border/60 p-3 transition-colors",
                      editingCategory?.id === category.id && "border-primary/60 bg-primary/5",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{category.name}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingCategory(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          disabled={deleteActivityCategory.isPending}
                          onClick={async () => {
                            const confirmed = window.confirm(
                              `¿Eliminar la categoría "${category.name}"?`,
                            );

                            if (!confirmed) return;

                            await deleteActivityCategory.mutateAsync(category.id);
                            if (editingCategory?.id === category.id) {
                              setEditingCategory(null);
                              form.reset({ name: "" });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {!isLoading && (categories?.length || 0) === 0 && (
                  <div className="rounded-lg border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
                    No hay categorías de actividad registradas.
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
