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

import { zodResolver } from "@/lib/zod-resolver";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { es } from "date-fns/locale";
import { CalendarIcon, Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  useCreateMitigationPlan,
  useUpdateMitigationPlan,
} from "@/actions/sms/planes_de_mitigation/actions";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCompanyStore } from "@/stores/CompanyStore";
import { MitigationPlan } from "@/types";

const RESPONSIBLE_OPTIONS = [
  { value: "SMS", label: "DIRECCIÓN DE SMS" },
  { value: "OPERACIONES", label: "OPERACIONES" },
  { value: "MANTENIMIENTO", label: "MANTENIMIENTO" },
  { value: "ADMINISTRACION_RRHH", label: "ADMINISTRACION Y RRHH" },
  { value: "CONTROL_CALIDAD", label: "CONTROL DE CALIDAD" },
  { value: "IT", label: "TECNOLOGIA E INFORMACION" },
  { value: "AVSEC", label: "AVSEC" },
];

const toResponsibleValues = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        const raw = String(item).trim();
        return (
          RESPONSIBLE_OPTIONS.find((o) => o.value === raw || o.label === raw)
            ?.value ?? raw
        );
      })
      .filter(Boolean);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const FormSchema = z.object({
  description: z
    .string()
    .min(5, { message: "La descripción debe tener al menos 5 caracteres" })
    .max(1000, {
      message: "La descripción no puede exceder los 1000 caracteres",
    }),

  responsible: z
    .array(z.string().min(1))
    .min(1, { message: "Seleccione al menos un área responsable" }),

  start_date: z
    .date()
    .refine((val) => !isNaN(val.getTime()), { message: "Fecha Invalida" }),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  onClose: () => void;
  id: number;
  isEditing?: boolean;
  initialData?: MitigationPlan;
}

export default function CreateMitigationPlanForm({
  onClose,
  id,
  initialData,
  isEditing,
}: FormProps) {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      description: initialData?.description,
      responsible: toResponsibleValues(initialData?.responsible),
      start_date: initialData?.start_date
        ? new Date(initialData?.start_date)
        : new Date(),
    },
  });
  const { selectedCompany } = useCompanyStore();
  const { createMitigationPlan } = useCreateMitigationPlan();
  const { updateMitigationPlan } = useUpdateMitigationPlan();
  const [responsibleOpen, setResponsibleOpen] = useState(false);

  const onSubmit = async (data: FormSchemaType) => {
    if (isEditing && initialData) {
      const value = {
        company: selectedCompany!.slug,
        id: initialData.id.toString(),
        data: {
          ...data,
        },
      };
      await updateMitigationPlan.mutateAsync(value);
    } else {
      const value = {
        company: selectedCompany!.slug,
        data: {
          ...data,
          danger_identification_id: id,
        },
      };
      await createMitigationPlan.mutateAsync(value);
    }
    onClose();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        <FormLabel className="text-lg text-center m-2">
          Plan de Mitigacion
        </FormLabel>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripcion del Plan</FormLabel>
              <FormControl>
                <Textarea placeholder="" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="responsible"
            render={({ field }) => {
              const selectedValues = toResponsibleValues(field.value);

              return (
                <FormItem className="w-full">
                  <FormLabel>Áreas Responsables</FormLabel>
                  <Popover
                    open={responsibleOpen}
                    onOpenChange={setResponsibleOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between font-normal",
                            selectedValues.length === 0 &&
                              "text-muted-foreground",
                          )}
                        >
                          {selectedValues.length > 0 ? (
                            <span className="truncate">
                              {selectedValues.length}{" "}
                              {selectedValues.length === 1
                                ? "área seleccionada"
                                : "áreas seleccionadas"}
                            </span>
                          ) : (
                            <span>Seleccionar áreas</span>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandList>
                          <CommandEmpty>
                            No se encontraron resultados.
                          </CommandEmpty>
                          <CommandGroup>
                            {RESPONSIBLE_OPTIONS.map((option) => {
                              const isSelected = selectedValues.includes(
                                option.value,
                              );
                              return (
                                <CommandItem
                                  key={option.value}
                                  value={option.label}
                                  onSelect={() =>
                                    field.onChange(
                                      isSelected
                                        ? selectedValues.filter(
                                            (v) => v !== option.value,
                                          )
                                        : [...selectedValues, option.value],
                                    )
                                  }
                                >
                                  <Check
                                    className={cn(
                                      "h-4 w-4 shrink-0",
                                      isSelected ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  <span className="flex-1 truncate">
                                    {option.label}
                                  </span>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedValues.length > 0 && (
                    <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto rounded-md border border-dashed border-input p-2">
                      {selectedValues.map((value) => {
                        const option = RESPONSIBLE_OPTIONS.find(
                          (o) => o.value === value,
                        );
                        return (
                          <Badge
                            key={value}
                            variant="secondary"
                            className="gap-1 py-1 pl-2 pr-1 font-normal"
                          >
                            {option?.label ?? value}
                            <button
                              type="button"
                              onClick={() =>
                                field.onChange(
                                  selectedValues.filter((v) => v !== value),
                                )
                              }
                              className="ml-1 rounded-full p-0.5 hover:bg-background/80"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem className="flex flex-col mt-2.5 w-full">
              <FormLabel>Fecha de Estimada de Ejecución</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", {
                          locale: es,
                        })
                      ) : (
                        <span>Seleccione una fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    autoFocus
                    startMonth={new Date(2000, 0)} // Año mínimo que se mostrará
                    endMonth={new Date(new Date().getFullYear(), 11)} // Año máximo (actual)
                    captionLayout="dropdown" // Selectores de año/mes
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>
        <Button
          type="submit"
          disabled={
            createMitigationPlan.isPending || updateMitigationPlan.isPending
          }
        >
          {isEditing ? "Actualizar" : "Crear"}
        </Button>
      </form>
    </Form>
  );
}
