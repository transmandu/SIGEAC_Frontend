"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import {
  useCreateSmsTrainingGroup,
  useUpdateSmsTrainingGroup,
} from "@/actions/general/cursos/training-groups";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGetJobTitles } from "@/hooks/ajustes/cargo/useGetJobTitles";
import { useGetSmsTrainingModulePatterns } from "@/hooks/curso/useGetSmsTrainingModulePatterns";
import { zodResolver } from "@/lib/zod-resolver";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { SmsTrainingGroup } from "@/types";

const groupSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  sms_training_module_pattern_id: z.coerce
    .number({ error: "Seleccione un patrón" })
    .int()
    .positive("Seleccione un patrón"),
  job_title_ids: z.array(z.number()).min(1, "Seleccione al menos un cargo"),
});

type GroupForm = z.infer<typeof groupSchema>;

interface Props {
  onSuccess?: () => void;
  group?: SmsTrainingGroup;
}

export function CreateSmsTrainingGroupForm({ onSuccess, group }: Props) {
  const [open, setOpen] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const { data: jobTitles, isLoading: isLoadingJobTitles } = useGetJobTitles(
    selectedCompany?.slug,
  );
  const { data: patterns, isLoading: isLoadingPatterns } =
    useGetSmsTrainingModulePatterns(selectedCompany?.slug);
  const { createSmsTrainingGroup } = useCreateSmsTrainingGroup();
  const { updateSmsTrainingGroup } = useUpdateSmsTrainingGroup();
  const mutation = group ? updateSmsTrainingGroup : createSmsTrainingGroup;

  const form = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: group?.name ?? "",
      description: group?.description ?? "",
      sms_training_module_pattern_id:
        group?.sms_training_module_pattern_id ?? undefined,
      job_title_ids: group?.job_titles?.map((jobTitle) => jobTitle.id) ?? [],
    },
  });

  const selectedIds =
    useWatch({ control: form.control, name: "job_title_ids" }) ?? [];
  const selectedJobTitles =
    jobTitles?.filter((jobTitle) => selectedIds.includes(jobTitle.id)) ?? [];

  const toggleJobTitle = (jobTitleId: number) => {
    const current = form.getValues("job_title_ids") ?? [];
    form.setValue(
      "job_title_ids",
      current.includes(jobTitleId)
        ? current.filter((id) => id !== jobTitleId)
        : [...current, jobTitleId],
      { shouldValidate: true, shouldDirty: true },
    );
  };

  const onSubmit = async (data: GroupForm) => {
    const company = selectedCompany!.slug;
    const payload = {
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      sms_training_module_pattern_id: data.sms_training_module_pattern_id,
      job_title_ids: data.job_title_ids,
    };

    try {
      if (group) {
        await updateSmsTrainingGroup.mutateAsync({
          company,
          id: group.id,
          data: payload,
        });
      } else {
        await createSmsTrainingGroup.mutateAsync({ company, data: payload });
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
              <FormLabel>Nombre del grupo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Gerencial" {...field} />
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
                  placeholder="Descripción opcional del grupo"
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
          name="sms_training_module_pattern_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patrón de módulos</FormLabel>
              <Select
                value={field.value ? String(field.value) : undefined}
                onValueChange={(value) => field.onChange(Number(value))}
                disabled={isLoadingPatterns}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingPatterns
                          ? "Cargando patrones..."
                          : "Seleccionar patrón"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patterns?.map((pattern) => (
                    <SelectItem key={pattern.id} value={String(pattern.id)}>
                      {pattern.name} — {pattern.initial_total_hours}h inicial /{" "}
                      {pattern.recurrent_total_hours}h recurrente
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="job_title_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cargos incluidos</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      disabled={isLoadingJobTitles}
                      className="w-full justify-between font-normal"
                    >
                      {selectedJobTitles.length > 0
                        ? `${selectedJobTitles.length} cargo(s) seleccionado(s)`
                        : isLoadingJobTitles
                          ? "Cargando cargos..."
                          : "Seleccionar cargos"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-(--radix-popover-trigger-width) p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Buscar cargo..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron cargos.</CommandEmpty>
                      <CommandGroup>
                        {jobTitles?.map((jobTitle) => {
                          const isSelected = selectedIds.includes(jobTitle.id);
                          return (
                            <CommandItem
                              key={jobTitle.id}
                              value={jobTitle.name}
                              onSelect={() => toggleJobTitle(jobTitle.id)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  isSelected ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {jobTitle.name}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {selectedJobTitles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedJobTitles.map((jobTitle) => (
                    <span
                      key={jobTitle.id}
                      className="rounded-full border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {jobTitle.name}
                    </span>
                  ))}
                </div>
              )}

              <FormMessage />
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
          ) : group ? (
            "Actualizar grupo"
          ) : (
            "Crear grupo"
          )}
        </Button>
      </form>
    </Form>
  );
}
