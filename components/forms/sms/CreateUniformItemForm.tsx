"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ComboboxField } from "@/components/ui/ComboboxField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetUniformOptions } from "@/hooks/sms/useGetUniforms";
import { useCreateUniformItem } from "@/actions/sms/uniforms/actions";
import { UniformBrandForm } from "@/components/forms/sms/UniformBrandForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  uniform_article_type_id: z
    .string()
    .min(1, { message: "Seleccione un tipo." }),
  uniform_brand_id: z.string().min(1, { message: "Seleccione una marca." }),
  size: z.string().min(1, { message: "Seleccione una talla." }),
  company: z.string().min(1, { message: "Seleccione una empresa." }),
  gender: z.string().min(1, { message: "Seleccione un género." }),
  min_stock: z.coerce.number().int().min(0).default(0),
  initial_quantity: z.coerce.number().int().min(0).default(0),
});

interface Props {
  onClose: () => void;
}

export const CreateUniformItemForm = ({ onClose }: Props) => {
  const { selectedCompany } = useCompanyStore();
  const { data: options, isLoading: loadingOptions } = useGetUniformOptions(
    selectedCompany?.slug
  );
  const createItem = useCreateUniformItem();
  const [brandModalOpen, setBrandModalOpen] = useState(false);

  const brandOptions = useMemo(
    () =>
      (options?.brands ?? []).map((b) => ({
        value: String(b.value),
        label: b.label,
      })),
    [options?.brands]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      uniform_article_type_id: "",
      uniform_brand_id: "",
      size: "",
      company: "",
      gender: "UNISEX",
      min_stock: 0,
      initial_quantity: 0,
    },
  });

  const selectedType = form.watch("uniform_article_type_id");
  const availableSizes =
    options?.types.find((t) => String(t.value) === selectedType)?.sizes ?? [];

  // Reset the size when the type changes so an invalid size can't linger.
  useEffect(() => {
    form.setValue("size", "");
  }, [selectedType]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createItem.mutate(
      {
        company: selectedCompany!.slug,
        data: {
          uniform_article_type_id: Number(data.uniform_article_type_id),
          uniform_brand_id: Number(data.uniform_brand_id),
          size: data.size,
          company: data.company,
          gender: data.gender,
          min_stock: data.min_stock,
          initial_quantity: data.initial_quantity,
        },
      },
      { onSuccess: () => onClose() }
    );
  };

  if (loadingOptions) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-y-4"
      >
        <FormField
          control={form.control}
          name="uniform_article_type_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de artículo</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {options?.types.length ? (
                    options.types.map((t) => (
                      <SelectItem key={t.value} value={String(t.value)}>
                        {t.label}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No hay tipos. Créelos en la pestaña “Tipos”.
                    </div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <ComboboxField
          form={form}
          name="uniform_brand_id"
          label="Marca"
          placeholder="Seleccione una marca"
          searchPlaceholder="Buscar marca..."
          emptyText="No se encontraron marcas."
          options={brandOptions}
          onCreateNew={() => setBrandModalOpen(true)}
          createNewLabel="Nueva marca"
        />

        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Talla</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!selectedType}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        selectedType
                          ? "Seleccione una talla"
                          : "Seleccione primero el tipo"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableSizes.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Empresa</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Empresa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {options?.companies.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
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
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Género</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Género" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {options?.genders.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="min_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock mínimo</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormDescription>Para la alerta de bajo stock.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="initial_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad inicial</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormDescription>Registra una entrada inicial.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={createItem.isPending}
          className="bg-primary mt-2 gap-2 text-white hover:bg-blue-900 disabled:bg-primary/70"
        >
          {createItem.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Plus className="size-4" />
              Crear artículo
            </>
          )}
        </Button>
      </form>
      </Form>

      {/* Crear marca al vuelo desde el combobox */}
      <Dialog open={brandModalOpen} onOpenChange={setBrandModalOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              Nueva marca
            </DialogTitle>
          </DialogHeader>
          <UniformBrandForm
            onClose={() => setBrandModalOpen(false)}
            onCreated={(brandId) =>
              form.setValue("uniform_brand_id", String(brandId), {
                shouldValidate: true,
              })
            }
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
