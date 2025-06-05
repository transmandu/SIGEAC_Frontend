"use client";

import { useCreateAccount, useUpdateAccount, useGetAccount } from "@/actions/aerolinea/cuentas/actions";
import { useEffect, useState, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Accountant } from "@/types";
import { toast } from "sonner";
import { Checkbox } from "../ui/checkbox";
import { Loader2, MinusCircle, PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

const getFormSchema = (hasCategories: boolean) => z.object({
  name: z
    .string()
    .max(40)
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      "No se permiten caracteres especiales, solo letras"
    )
    .min(2, {
      message: "El nombre debe tener al menos 2 caracteres y maximo 40.",
    }),
    category: z
    .string()
    .superRefine((value, ctx) => {
      if (!hasCategories) return true;

      if (!value || value.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe ingresar al menos una categoría cuando está marcado el checkbox.",
        });
        return false;
      }

      const category = value.split(",").map((l) => l.trim());
      if (!category.every((l) => l.length >= 3)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cada categoría debe tener al menos 3 caracteres.",
        });
      }
    })
    .optional(),
});

interface FormProps {
  onClose: () => void;
  isEditing?: boolean;
  id?: string;
}

type categoryField = {
  id: number;
  value: string;
};

const AccountForm = ({ id, onClose, isEditing = false }: FormProps) => {
  const [initialValues, setInitialValues] = useState<Accountant | null>(null);
    const [checked, setChecked] = useState(false);
    const { updateAccount } = useUpdateAccount();
    const { createAccount } = useCreateAccount();
    const { data } = useGetAccount(id ?? null);

  const formSchema = useMemo(() => getFormSchema(checked), [checked]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      category: initialValues?.category?.name ?? undefined,
    },
  });

  const [categoryFields, setCategoryFields] = useState<categoryField[]>([
    {
      id: Date.now(),
      value: "",
    },
  ]);

  useEffect(() => {
    if (data) {
      setInitialValues(data);
      form.setValue("name", data.name);

      const hasCategory = !!data.category;
      setChecked(hasCategory);

      if (hasCategory) {
        form.setValue("category", data.category?.name ?? undefined);

        const initialCategory = data.category.name.split(",").map(l => l.trim());
        setCategoryFields(
          initialCategory.map((category, index) => ({
            id: Date.now() + index,
            value: category,
          }))
        );
      } else {
        form.setValue("category", undefined);
        setCategoryFields([{ id: Date.now(), value: "" }]);
      }
    }
  }, [data, form]);

  const onAddInput = () => {
    setCategoryFields([...categoryFields, { id: Date.now(), value: "" }]);
  };

  const onRemoveInput = (index: number) => {
    if (categoryFields.length > 1) {
      setCategoryFields((prevFields) => prevFields.filter((_, i) => i !== index));
    }
  };

  const handleInputChange = (id: number, value: string) => {
    setCategoryFields((prevFields) => {
      const updatedFields = prevFields.map((field) =>
        field.id === id ? { ...field, value } : field
      );
      const categoryValues = updatedFields
        .map((field) => field.value)
        .filter(Boolean);
      form.setValue("category", categoryValues.join(", "));

      return updatedFields;
    });
  };

  useEffect(() => {
    form.trigger('category');
  }, [checked, form]);

  const onSubmitAccount = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditing && initialValues) {
        await updateAccount.mutateAsync({
          id: initialValues.id.toString(),
          name: values.name,
          category: checked ? values.category : undefined,
        });
      } else {
        await createAccount.mutateAsync({
          ...values,
          category: checked ? values.category : undefined,
        });
      }
      form.reset();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar la cuenta", {
        description: "Ocurrió un error, por favor intenta nuevamente.",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmitAccount)}
        className="flex flex-col space-y-3"
      >
        <div className="grid gap-4">
          <div className="flex flex-col gap-4 w-full justify-center">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={checked}
                onCheckedChange={() => setChecked(!checked)}
                id="category"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="category"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  ¿Tiene categorías?
                </label>
              </div>
            </div>
          </div>

          <div
            className={cn("flex gap-2 items-center", checked ? "flex-col" : "")}
          >
            <div className="flex gap-2 items-center justify-center">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese la cuenta" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            {checked && (
              <>
                <div className="flex gap-2 items-center p-2">
                  <MinusCircle
                    className="size-4 cursor-pointer hover:category-125 transition-all ease-in duration-100"
                    onClick={() => onRemoveInput(categoryFields.length - 1)}
                  />
                  <Label>Categoría(s)</Label>
                  <PlusCircle
                    className="size-4 cursor-pointer hover:category-125 transition-all ease-in duration-100"
                    onClick={onAddInput}
                  />
                </div>
                <div
                  className={cn(
                    "grid grid-cols-1 gap-2",
                    categoryFields.length > 1 ? "grid-cols-2" : ""
                  )}
                >
                  {categoryFields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name="category"
                      render={() => (
                        <FormItem className="w-auto">
                          <FormControl>
                            <Input
                              placeholder="Ingrese la Categoría"
                              value={field.value}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                            />
                          </FormControl>
                          {form.formState.errors.category && index === 0 && (
                            <FormMessage>
                              {form.formState.errors.category.message}
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
            disabled={createAccount.isPending || updateAccount.isPending}
            type="submit" className="w-full">
            {createAccount.isPending || updateAccount.isPending ?  (
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

export default AccountForm;
