"use client";
import { useCreateBank, useUpdateBank } from "@/actions/ajustes/banca/bancos/actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bank } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../ui/button";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 carácteres.",
  }),
  type: z.string().min(1, {
    message: "Debe seleccionar un tipo.",
  }),
});

interface FormProps {
  onClose: () => void;
  /** Si se pasa un banco, el formulario pasa a modo edición. */
  bank?: Bank;
}

export default function CreateBankForm({ onClose, bank }: FormProps) {
  const { createBank } = useCreateBank();
  const { updateBank } = useUpdateBank();
  const isEditing = !!bank;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: bank?.name ?? "",
      type: bank?.type ?? "",
    },
  });
  const { control } = form;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isEditing) {
      await updateBank.mutateAsync({ id: bank.id, data: values });
    } else {
      await createBank.mutateAsync(values);
    }
    onClose();
  };

  const isPending = createBank.isPending || updateBank.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="EJ: Banesco, BOFA, etc..." {...field} />
              </FormControl>
              <FormDescription>
                Nombre de la institución bancaria.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Banco</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="NACIONAL">Nacional</SelectItem>
                  <SelectItem value="EXTRANJERO">Extranjero</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Nacional o extranjero.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70"
          disabled={isPending}
          type="submit"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <p>{isEditing ? "Actualizar" : "Crear"}</p>
          )}
        </Button>
      </form>
    </Form>
  );
}
