"use client";

import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { Check, ChevronsUpDown, Loader2, Plus, Trash2 } from "lucide-react";
import {
  useCreateSmsTrainingModulePattern,
  useUpdateSmsTrainingModulePattern,
} from "@/actions/general/cursos/training-modules";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useGetSmsTrainingModules } from "@/hooks/curso/useGetSmsTrainingModules";
import { zodResolver } from "@/lib/zod-resolver";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { SmsTrainingModulePattern } from "@/types";

const patternSchema = z
  .object({
    name: z.string().min(1, "El nombre es obligatorio"),
    description: z.string().optional(),
    modules: z
      .array(
        z.object({
          module_id: z.number(),
          initial_hours: z.coerce.number().min(0, "Mínimo 0"),
          sort_order: z.number().optional(),
        }),
      )
      .min(1, "Seleccione al menos un módulo"),
  })
  .refine(
    (data) => {
      const total = data.modules.reduce(
        (sum, module) => sum + Number(module.initial_hours || 0),
        0,
      );
      return [40, 16, 8].includes(Math.round(total * 100) / 100);
    },
    {
      message: "El total de horas debe ser 40, 16 u 8",
      path: ["modules"],
    },
  );

type PatternForm = z.infer<typeof patternSchema>;

interface Props {
  onSuccess?: () => void;
  pattern?: SmsTrainingModulePattern;
}

export function CreateSmsTrainingModulePatternForm({
  onSuccess,
  pattern,
}: Props) {
  const [openModules, setOpenModules] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const { data: modules, isLoading: isLoadingModules } =
    useGetSmsTrainingModules(selectedCompany?.slug);
  const { createSmsTrainingModulePattern } =
    useCreateSmsTrainingModulePattern();
  const { updateSmsTrainingModulePattern } =
    useUpdateSmsTrainingModulePattern();
  const mutation = pattern
    ? updateSmsTrainingModulePattern
    : createSmsTrainingModulePattern;

  const form = useForm<PatternForm>({
    resolver: zodResolver(patternSchema),
    defaultValues: {
      name: pattern?.name ?? "",
      description: pattern?.description ?? "",
      modules:
        pattern?.modules.map((module) => ({
          module_id: module.id,
          initial_hours: Number(module.pivot.initial_hours),
          sort_order: Number(module.pivot.sort_order),
        })) ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "modules",
  });

  const watchedModules =
    useWatch({ control: form.control, name: "modules" }) ?? [];
  const totalInitial = watchedModules.reduce(
    (sum, module) => sum + Number(module.initial_hours || 0),
    0,
  );
  const totalRecurrent = totalInitial / 2;
  const totalIsValid = [40, 16, 8].includes(
    Math.round(totalInitial * 100) / 100,
  );

  const modulesError = form.formState.errors.modules as
    { message?: string } | Array<{ message?: string }> | undefined;
  const modulesErrorMessage = Array.isArray(modulesError)
    ? modulesError[0]?.message
    : modulesError?.message;

  const selectedIds = fields.map((field) => field.module_id);
  const availableModules =
    modules?.filter((module) => !selectedIds.includes(module.id)) ?? [];

  const onSubmit = async (data: PatternForm) => {
    const company = selectedCompany!.slug;
    const payload = {
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      modules: data.modules.map((module, index) => ({
        module_id: module.module_id,
        initial_hours: Number(module.initial_hours),
        sort_order: module.sort_order ?? index + 1,
      })),
    };

    try {
      if (pattern) {
        await updateSmsTrainingModulePattern.mutateAsync({
          company,
          id: pattern.id,
          data: payload,
        });
      } else {
        await createSmsTrainingModulePattern.mutateAsync({
          company,
          data: payload,
        });
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del patrón</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Patrón Gerencial" {...field} />
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
              <FormLabel>Descripción (opcional)</FormLabel>
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

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Módulos del patrón</p>
            <Popover open={openModules} onOpenChange={setOpenModules}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isLoadingModules || availableModules.length === 0}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar módulo
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <Command>
                  <CommandInput placeholder="Buscar módulo..." />
                  <CommandList>
                    <CommandEmpty>No hay módulos disponibles.</CommandEmpty>
                    <CommandGroup>
                      {availableModules.map((module) => (
                        <CommandItem
                          key={module.id}
                          value={`${module.number} ${module.name}`}
                          onSelect={() => {
                            append({
                              module_id: module.id,
                              initial_hours: 0,
                              sort_order: module.number,
                            });
                            setOpenModules(false);
                          }}
                        >
                          <Check className="mr-2 h-4 w-4 opacity-0" />
                          {module.number}. {module.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {fields.length === 0 ? (
            <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              Agrega al menos un módulo al patrón.
            </p>
          ) : (
            <div className="space-y-2">
              {fields.map((field, index) => {
                const moduleItem = modules?.find(
                  (item) => item.id === field.module_id,
                );

                return (
                  <div
                    key={field.id}
                    className="flex items-center gap-2 rounded-md border p-2"
                  >
                    <span className="w-8 text-sm font-semibold text-muted-foreground">
                      {moduleItem?.number ?? "—"}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {moduleItem?.name ?? "Módulo"}
                    </span>
                    <FormField
                      control={form.control}
                      name={`modules.${index}.initial_hours`}
                      render={({ field: hoursField }) => (
                        <FormItem className="w-24">
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step="0.5"
                              className="h-8"
                              {...hoursField}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <span className="text-xs text-muted-foreground">h</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          <div
            className={cn(
              "flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm",
              !totalIsValid && "bg-destructive/10 text-destructive",
            )}
          >
            <span>Total inicial</span>
            <span className="font-semibold">{totalInitial}h</span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
            <span>Total recurrente</span>
            <span className="font-semibold">{totalRecurrent}h</span>
          </div>

          {!totalIsValid && (
            <p className="text-sm font-medium text-destructive">
              El total inicial debe ser 40, 16 u 8 horas. Actual: {totalInitial}
              h
            </p>
          )}

          {modulesErrorMessage && (
            <p className="text-sm font-medium text-destructive">
              {modulesErrorMessage}
            </p>
          )}
        </div>

        <Button
          className="mt-2 w-full bg-primary text-white hover:bg-blue-900 disabled:bg-primary/70"
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : pattern ? (
            "Actualizar patrón"
          ) : (
            "Crear patrón"
          )}
        </Button>
      </form>
    </Form>
  );
}
