"use client";

import { useCreateRoute, useGetRoute, useUpdateRoute } from "@/actions/administracion/rutas/actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Route } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MinusCircle, PlusCircle } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const getFormSchema = (hasLayovers: boolean) => z.object({
  from: z
    .string({
      message: "Debe seleccionar un origen.",
    })
    .min(3, {
      message: "El origen debe tener al menos 3 caracteres.",
    })
    .max(30, {
      message: "El origen tiene un máximo 30 caracteres.",
    }),
  to: z
    .string({
      message: "Debe seleccionar un destino.",
    })
    .min(3, {
      message: "El destino debe tener al menos 3 caracteres.",
    })
    .max(30, {
      message: "El destino tiene un máximo 30 caracteres.",
    }),
    layovers: z.array(
      z.object({
        name: z.string().min(3, {
          message: "Cada escala debe tener al menos 3 caracteres.",
        })
      })
    ).superRefine((layovers, ctx) => {
      if (!hasLayovers) return true;
      
      if (layovers.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe ingresar al menos una escala cuando está marcado el checkbox.",
        });
        return false;
      }
  
      layovers.forEach((layover, index) => {
        if (/^\d+$/.test(layover.name)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `La escala ${index + 1} no puede contener solo números.`,
            path: [index, 'name']
          });
        }
      });
    }).optional(),
});

interface FormProps {
  onClose: () => void;
  isEditing?: boolean;
  id?: string;
}

type layoversField = {
  id: number;
  value: string;
};

const RouteForm = ({ id, onClose, isEditing = false }: FormProps) => {
  const [initialValues, setInitialValues] = useState<Route | null>(null);
  const [checked, setChecked] = useState(false);
  const { updateRoute } = useUpdateRoute();
  const { createRoute } = useCreateRoute();
  const { data } = useGetRoute(id ?? null);

  const formSchema = useMemo(() => getFormSchema(checked), [checked]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from: initialValues?.from ?? "",
      to: initialValues?.to ?? "",
      layovers: initialValues?.layovers ?? undefined,
    },
  });

  const [layoversFields, setScaleFields] = useState<layoversField[]>([
    {
      id: Date.now(),
      value: "",
    },
  ]);

  useEffect(() => {
    if (data) {
      setInitialValues(data);
      form.setValue("from", data.from);
      form.setValue("to", data.to);
      setChecked(!!data.layovers);
      
      // If there are layovers when editing, initialize the fields
      if (data.layovers && data.layovers.length > 0) {
        setScaleFields(
          data.layovers.map((layover: {name: string}, index: number) => ({
            id: Date.now() + index,
            value: layover.name,
          }))
        );
        // Set the form value as an array of objects
        form.setValue("layovers", data.layovers);
      } else {
        // Initialize with empty array if no layovers
        form.setValue("layovers", []);
      }
    }
  }, [data, form]);
  

  const onAddInput = () => {
    setScaleFields([...layoversFields, { id: Date.now(), value: "" }]);
  };

  const onRemoveInput = (index: number) => {
    if (layoversFields.length > 1) {
      setScaleFields((prevFields) => prevFields.filter((_, i) => i !== index));
    }
  };

  const handleInputChange = (id: number, value: string) => {
    setScaleFields((prevFields) => {
      const updatedFields = prevFields.map((field) =>
        field.id === id ? { ...field, value } : field
      );
      
      // Convert to the format expected by the form schema
      const layoversValues = updatedFields
        .map((field) => ({ name: field.value }))
        .filter(item => item.name.trim() !== "");
      
      form.setValue("layovers", layoversValues);
      return updatedFields;
    });
  };

  useEffect(() => {
    form.trigger('layovers');
  }, [checked, form]);

  const onSubmitRoute = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditing && initialValues) {
        await updateRoute.mutateAsync({
          id: initialValues.id.toString(),
          from: values.from,
          to: values.to,
          layovers: checked ? values.layovers : undefined,
        });
      } else {
        await createRoute.mutateAsync({
          ...values,
          layovers: checked ? values.layovers : undefined,
        });
      }
      form.reset();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar el vuelo", {
        description: "Ocurrió un error, por favor intenta nuevamente.",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmitRoute)}
        className="mx-auto grid gap-6"
      >
        <div className="grid gap-4">
          <div className="flex flex-col gap-4 w-full justify-center">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={checked}
                onCheckedChange={() => setChecked(!checked)}
                id="layovers"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="layovers"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  ¿Tiene escalas?
                </label>
              </div>
            </div>
          </div>

          <div
            className={cn("flex gap-2 items-center", checked ? "flex-col" : "")}
          >
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="from"
                render={({ field }) => (
                  <FormItem className="w-auto">
                    <FormLabel>Origen</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese la salida" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="to"
                render={({ field }) => (
                  <FormItem className="w-auto">
                    <FormLabel>Destino</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese la llegada" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {checked && (
              <>
                <div className="flex gap-2 items-center p-2">
                  <MinusCircle
                    className="size-4 cursor-pointer hover:layovers-125 transition-all ease-in duration-100"
                    onClick={() => onRemoveInput(layoversFields.length - 1)}
                  />
                  <Label>Escala(s)</Label>
                  <PlusCircle
                    className="size-4 cursor-pointer hover:layovers-125 transition-all ease-in duration-100"
                    onClick={onAddInput}
                  />
                </div>
                <div
                  className={cn(
                    "grid grid-cols-1 gap-2",
                    layoversFields.length > 1 ? "grid-cols-2" : ""
                  )}
                >
                  {layoversFields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name="layovers"
                      render={() => (
                        <FormItem className="w-auto">
                          <FormControl>
                            <Input
                              placeholder="Ingrese la escala"
                              value={field.value}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                            />
                          </FormControl>
                          {form.formState.errors.layovers && index === 0 && (
                            <FormMessage>
                              {form.formState.errors.layovers.message}
                            </FormMessage>
                          )}
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          <Button
            disabled={createRoute.isPending || updateRoute.isPending}
            type="submit"
            className="w-full"
          >
            {createRoute.isPending || updateRoute.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <p>{isEditing ? "Actualizar" : "Registrar"}</p>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RouteForm;