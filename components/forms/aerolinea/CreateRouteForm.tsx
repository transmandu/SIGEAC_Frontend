 import { useCreateRoute, useGetRoute, useUpdateRoute, } from "@/actions/aerolinea/rutas/actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Route } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MinusCircle, PlusCircle } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

const getFormSchema = (hasLayovers: boolean) =>
  z.object({
    from: z.string(),
    to: z.string(),
    layover: z.array(z.string()).superRefine((values, ctx) => {
      if (!hasLayovers) return true;

      if (values.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe ingresar al menos una escala cuando está marcado el checkbox.",
        });
        return false;
      }

      values.forEach((value, index) => {
        if (!value || value.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `La escala ${index + 1} no puede estar vacía.`,
            path: [index]
          });
        }

        if (/^\d+$/.test(value.trim())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `La escala ${index + 1} no puede contener solo números.`,
            path: [index]
          });
        }

        if (value.length < 3) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `La escala ${index + 1} debe tener al menos 3 caracteres.`,
            path: [index]
          });
        }
      });
    }).optional()
  });

interface FormProps {
  onClose: () => void;
  isEditing?: boolean;
  id?: string;
}

type layoverField = {
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
    },
  });

    const layover = form.watch("layover") || [];
  console.log(layover);
  const [layoverFields, setScaleFields] = useState<layoverField[]>([
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
      form.setValue("layover", data.layover ?? undefined);
      setChecked(!!data.layover);
    }
  }, [data, form]);

  const onAddInput = () => {
    form.setValue("layover", [...layover, ""]);
  };

  const onRemoveInput = (index: number) => {
    if (layover.length > 1) {
      const newLayovers = [...layover];
      newLayovers.splice(index, 1);
      form.setValue("layover", newLayovers);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    const newLayovers = [...layover];
    newLayovers[index] = value;
    form.setValue("layover", newLayovers);
  };

  // Modificación en el useEffect de inicialización
  useEffect(() => {
    if (data) {
      setInitialValues(data);
      form.reset({
        from: data.from,
        to: data.to,
        layover: [],
      });
      setChecked(!!data.layover);
    }
  }, [data, form]);

  const onSubmitRoute = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditing && initialValues) {
        await updateRoute.mutateAsync({
          id: initialValues.id.toString(),
          from: values.from,
          to: values.to,
          layover: checked ? values.layover : undefined,
        });
      } else {
        await createRoute.mutateAsync({
          ...values,
          layover: checked ? values.layover : undefined,
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
                id="layover"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="layover"
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
                    className="size-4 cursor-pointer hover:layover-125 transition-all ease-in duration-100"
                    onClick={() => onRemoveInput(layover.length - 1)}
                  />
                  <Label>Escala(s)</Label>
                  <PlusCircle
                    className="size-4 cursor-pointer hover:layover-125 transition-all ease-in duration-100"
                    onClick={onAddInput}
                  />
                </div>
                <div
                  className={cn(
                    "grid gap-2",
                    layover.length > 1 ? "grid-cols-2" : "grid-cols-1"
                  )}
                >
                  {layover.map((value, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="Ingrese la escala"
                        value={value}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                      />
                      {form.formState.errors.layover?.[index] && (
                        <FormMessage>
                          {form.formState.errors.layover[index]?.message}
                        </FormMessage>
                      )}
                    </div>
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
