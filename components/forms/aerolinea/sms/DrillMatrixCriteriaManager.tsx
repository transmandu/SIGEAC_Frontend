"use client";

import {
  useCreateDrillMatrixCriterion,
  useDeleteDrillMatrixCriterion,
  useReorderDrillMatrixCriteria,
  useUpdateDrillMatrixCriterion,
} from "@/actions/sms/drill_matrix_criteria/actions";
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
import { Textarea } from "@/components/ui/textarea";
import { useGetDrillMatrixCriteria } from "@/hooks/sms/drill_evaluations/useGetDrillMatrixCriteria";
import { cn } from "@/lib/utils";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { DrillMatrixCriterion } from "@/types/sms/drill-evaluation";
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  criterion: z
    .string()
    .trim()
    .min(3, "El criterio debe tener al menos 3 caracteres."),
  performance_indicator: z
    .string()
    .trim()
    .min(3, "El indicador de desempeño es obligatorio."),
});

type FormSchemaType = z.infer<typeof formSchema>;

const emptyValues: FormSchemaType = {
  criterion: "",
  performance_indicator: "",
};

/**
 * Administración de la plantilla de la matriz de los simulacros de mesa.
 *
 * Los cambios aplican a las evaluaciones que se registren desde ese momento.
 * Las evaluaciones ya guardadas conservan su copia de criterios e indicadores.
 */
export function DrillMatrixCriteriaManager() {
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany?.slug ?? "";

  const { data: criteria = [], isLoading } = useGetDrillMatrixCriteria({
    company,
  });
  const { createCriterion } = useCreateDrillMatrixCriterion();
  const { updateCriterion } = useUpdateDrillMatrixCriterion();
  const { deleteCriterion } = useDeleteDrillMatrixCriterion();
  const { reorderCriteria } = useReorderDrillMatrixCriteria();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DrillMatrixCriterion | null>(null);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        criterion: editing.criterion,
        performance_indicator: editing.performance_indicator,
      });
      return;
    }

    form.reset(emptyValues);
  }, [editing, form]);

  const closeDialog = () => {
    setOpen(false);
    setEditing(null);
  };

  const onSubmit = async (values: FormSchemaType) => {
    if (!company) return;

    if (editing) {
      await updateCriterion.mutateAsync({
        company,
        id: editing.id,
        data: values,
      });
    } else {
      await createCriterion.mutateAsync({ company, data: values });
    }

    closeDialog();
  };

  const move = async (index: number, direction: -1 | 1) => {
    if (!company) return;

    const target = index + direction;
    if (target < 0 || target >= criteria.length) return;

    const ids = criteria.map((criterion) => criterion.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];

    await reorderCriteria.mutateAsync({ company, ids });
  };

  const isSaving = createCriterion.isPending || updateCriterion.isPending;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <section className="rounded-lg border border-border/60 p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">
              {editing ? "Editar criterio" : "Nuevo criterio"}
            </h2>
            <p className="text-xs text-muted-foreground">
              La matriz es común a todos los simulacros de mesa.
            </p>
          </div>

          {editing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setEditing(null);
                form.reset(emptyValues);
              }}
            >
              Cancelar edición
            </Button>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="criterion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Criterio evaluado</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Ej. RESPUESTA DEL PERSONAL"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="performance_indicator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Indicador de desempeño técnico</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Describa qué se espera observar en el ejercicio."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : editing ? (
                "Guardar cambios"
              ) : (
                <>
                  <Plus className="mr-1 size-4" /> Agregar criterio
                </>
              )}
            </Button>
          </form>
        </Form>
      </section>

      <section className="rounded-lg border border-border/60 p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold">Criterios de la matriz</h2>
          <p className="text-xs text-muted-foreground">
            {isLoading
              ? "Cargando criterios..."
              : `${criteria.length} criterios configurados`}
          </p>
        </div>

        <div className="space-y-2">
          {criteria.map((criterion, index) => (
            <div
              key={criterion.id}
              className={cn(
                "rounded-lg border border-border/60 p-3 transition-colors",
                editing?.id === criterion.id &&
                  "border-primary/60 bg-primary/5",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{criterion.criterion}</p>
                  <p className="text-xs text-muted-foreground">
                    {criterion.performance_indicator}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={index === 0 || reorderCriteria.isPending}
                    onClick={() => move(index, -1)}
                    title="Subir"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={
                      index === criteria.length - 1 || reorderCriteria.isPending
                    }
                    onClick={() => move(index, 1)}
                    title="Bajar"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditing(criterion)}
                    title="Editar"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    disabled={deleteCriterion.isPending}
                    title="Eliminar"
                    onClick={async () => {
                      const confirmed = window.confirm(
                        `¿Eliminar el criterio "${criterion.criterion}"?\n\nLas evaluaciones ya registradas conservarán este criterio.`,
                      );

                      if (!confirmed) return;

                      await deleteCriterion.mutateAsync(criterion.id);
                      if (editing?.id === criterion.id) {
                        setEditing(null);
                        form.reset(emptyValues);
                      }
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {!isLoading && criteria.length === 0 && (
            <div className="rounded-lg border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
              No hay criterios configurados. Sin criterios no se puede registrar
              una evaluación de mesa.
            </div>
          )}
        </div>

        <p className="mt-4 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
          Los cambios se aplican a las próximas evaluaciones. Las evaluaciones
          ya registradas conservan los criterios e indicadores con los que
          fueron creadas.
        </p>
      </section>
    </div>
  );
}
