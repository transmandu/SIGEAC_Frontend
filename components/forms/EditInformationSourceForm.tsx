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

import { useUpdateInformationSource } from "@/actions/ajustes/globales/tipos_fuente/actions";
import { Input } from "@/components/ui/input";
import { InformationSource } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";

const FormSchema = z.object({
  name: z.string(),
  type: z.string(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  onClose: () => void;
  initialData: InformationSource;
}

export function EditInformationSourceForm({ onClose, initialData }: FormProps) {
  const { updateInformationSource } = useUpdateInformationSource();
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: initialData.name || "",
      type: initialData.type || "",
    },
  });

  const onSubmit = async (data: FormSchemaType) => {
    const formattedData = {
      ...data,
      id: initialData.id.toString(),
    };
    await updateInformationSource.mutateAsync(formattedData);
    onClose();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Fuente</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Seleccionar Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PROACTIVO">PROACTIVO</SelectItem>
                  <SelectItem value="REACTIVO">REACTIVO</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>
        <Button disabled={updateInformationSource.isPending}>
          {updateInformationSource.isPending ? (
            <Loader2 className="animate-spin size-4" />
          ) : (
            "Actualizar Fuente "
          )}
        </Button>
      </form>
    </Form>
  );
}
