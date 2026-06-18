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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useUpdateUniformItem } from "@/actions/sms/uniforms/actions";
import { UniformItem } from "@/hooks/sms/useGetUniforms";
import { getUniformTypeIcon } from "@/components/sms/uniform-meta";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  min_stock: z.coerce.number().int().min(0),
  active: z.boolean(),
});

interface Props {
  item: UniformItem;
  onClose: () => void;
}

export const EditUniformItemForm = ({ item, onClose }: Props) => {
  const { selectedCompany } = useCompanyStore();
  const updateItem = useUpdateUniformItem();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      min_stock: item.min_stock,
      active: item.active,
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    updateItem.mutate(
      { company: selectedCompany!.slug, id: item.id, data },
      { onSuccess: () => onClose() }
    );
  };

  const TypeIcon = getUniformTypeIcon(item.uniform_type, item.type_label);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-y-4"
      >
        <div className="flex items-center gap-2.5 rounded-md border bg-muted/40 px-3 py-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <TypeIcon className="size-4" />
          </span>
          <span className="text-sm font-medium">
            {item.type_label} · Talla {item.size} · {item.company_label}
          </span>
        </div>

        <FormField
          control={form.control}
          name="min_stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock mínimo</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormDescription>
                Se mostrará alerta cuando el stock baje de este valor.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Activo</FormLabel>
                <FormDescription>
                  Los artículos inactivos no aparecen para nuevos movimientos.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={updateItem.isPending}
          className="bg-primary mt-2 gap-2 text-white hover:bg-blue-900 disabled:bg-primary/70"
        >
          {updateItem.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Save className="size-4" />
              Guardar cambios
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};
