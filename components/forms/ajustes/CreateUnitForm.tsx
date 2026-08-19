'use client';
import { useCreateUnit } from "@/actions/ajustes/unidades/actions";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../ui/button";
import type { Unit } from "@/types";


const formSchema = z.object({
  label: z.string().min(3, {
    message: "El nombre debe tener al menos 3 carácters.",
  }),
  value: z.string().min(1, {
    message: "El Simbolo de la unidad debe tener al menos 1 carácters.",
  }),
  is_dimensional: z.boolean().default(false),
})


interface FormProps {
  onClose: () => void;
  onSuccess?: (unitData: { value: string; label: string }) => void;
  /** Called with the full created unit (incl. id) after a successful creation. */
  onCreated?: (unit: Unit) => void;
}

export default function CreateUnitForm({ onClose, onSuccess, onCreated }: FormProps) {
  const { createUnit } = useCreateUnit();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      value: "",
      is_dimensional: false,
    },
  })
  const { control } = form;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const unit = await createUnit.mutateAsync(values);
    if (onSuccess) {
      onSuccess(values);
    }
    if (unit && onCreated) {
      onCreated(unit);
    }
    onClose()
  }
  return (
    <Form {...form}>
      {/* stopPropagation: este form se renderiza dentro de otros formularios
          (ej. cotización). React propaga el submit por su árbol aunque el
          Dialog viva en un portal, y dispararía el submit del form padre. */}
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(onSubmit)(e);
        }}
      >
        <FormField
          control={control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="EJ: Kilogramo, Litro, Mililitro" {...field} />
              </FormControl>
              <FormDescription>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Simbolo de la Unidad</FormLabel>
              <FormControl>
                <Input placeholder="EJ: Kg, L, mL" {...field} />
              </FormControl>
              <FormDescription>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="is_dimensional"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-3 rounded-md border p-3 mt-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="cursor-pointer">
                  Sirve para declarar medidas
                </FormLabel>
                <p className="text-xs text-muted-foreground">
                  Habilita esta unidad para dimensionar artículos que se
                  despachan en trazos (láminas, telas, rollos).
                </p>
              </div>
            </FormItem>
          )}
        />
        <Button className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70" disabled={createUnit?.isPending} type="submit">
          {createUnit?.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Crear</p>}
        </Button>
      </form>
    </Form>
  )
}
