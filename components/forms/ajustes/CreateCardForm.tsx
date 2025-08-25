"use client";
import { useCreateCard } from "@/actions/general/banco_cuentas/tarjetas/actions";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../ui/button";
import { useGetBankAccounts } from "@/hooks/general/cuentas_bancarias/useGetBankAccounts";
import { generateSlug } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 carácteres.",
  }),
  card_number: z.string().min(4, {
    message: "Debe ingresar un numero de tarjeta valido.",
  }),
  type: z.string().min(1, {
    message: "El tipo debe ser valido.",
  }),
  bank_account_id: z.string({
    message: "Debe elegir una cuenta.",
  }),
});

interface FormProps {
  onClose: () => void;
}

export default function CreateCardForm({ onClose }: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: accounts, isLoading: isAccLoading } = useGetBankAccounts();
  const { createCard } = useCreateCard();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
    },
  });
  const { control } = form;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createCard.mutateAsync({
      ...values,
      slug: generateSlug(values.name),
    });
    onClose();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="EJ: Tarjeta de TMD, etc..." {...field} />
                </FormControl>
                <FormDescription>
                  Este será el nombre de su banco.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="card_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nro. de Tarjeta</FormLabel>
                <Input placeholder="EJ: 7184769" {...field} />
                <FormDescription>
                  Este sera el tipo de su banco.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bank_account_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cuenta</FormLabel>
                <Select
                  disabled={isAccLoading}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isAccLoading ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            "Seleccione un tipo..."
                          )
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts &&
                      accounts.map((acc) => (
                        <SelectItem value={acc.id.toString()} key={acc.id}>
                          {acc.name} - {acc.bank.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Este sera la cuenta a la que pertenece la tarjeta.
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
                <FormLabel>Tipo de Tarjeta</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un tipo..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DEBITO">Debito</SelectItem>
                    <SelectItem value="CREDITO">Credito</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Este sera el tipo de su tarjeta.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70"
          disabled={createCard?.isPending}
          type="submit"
        >
          {createCard?.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <p>Registrar</p>
          )}
        </Button>
      </form>
    </Form>
  );
}
