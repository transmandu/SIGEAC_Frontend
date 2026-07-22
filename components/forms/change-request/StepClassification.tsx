import { UseFormReturn } from "react-hook-form";
import {
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
import { StoreChangeRequestPayload, ChangeType } from "@/types";

interface StepClassificationProps {
  form: UseFormReturn<StoreChangeRequestPayload>;
}

const CHANGE_TYPES: { value: ChangeType; label: string }[] = [
  { value: "facilities", label: "Instalaciones" },
  { value: "documentary", label: "Documental" },
  { value: "staff", label: "Personal" },
  { value: "equipment", label: "Equipamiento" },
  { value: "procedures", label: "Procedimientos" },
  { value: "technology", label: "Tecnología" },
  { value: "other", label: "Otro" },
];

export function StepClassification({ form }: StepClassificationProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="change_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tipo de Cambio
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CHANGE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch("change_type") === "other" && (
        <FormField
          control={form.control}
          name="other_type_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Descripción del Tipo
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Describir el tipo de cambio"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Descripción del Cambio
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describa el cambio solicitado..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="scope"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Alcance
            </FormLabel>
            <FormControl>
              <Input placeholder="Alcance del cambio" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="justification"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Justificación
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Justificación del cambio..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
