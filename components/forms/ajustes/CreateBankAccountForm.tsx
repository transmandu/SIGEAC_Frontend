"use client";
import {
  useCreateBankAccount,
  useUpdateBankAccount,
} from "@/actions/ajustes/banca/cuentas/actions";
import { CompanyMultiSelect } from "@/components/misc/CompanyMultiSelect";
import { PaymentMethodMultiSelect } from "@/components/misc/PaymentMethodMultiSelect";
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
import { useGetBanks } from "@/hooks/general/bancos/useGetBanks";
import { BankAccount } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../ui/button";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 carácteres.",
  }),
  account_number: z.string().min(1, {
    message: "Debe ingresar el número de cuenta.",
  }),
  account_owner: z.string().min(1, { message: "Debe seleccionar un tipo." }),
  account_type: z.string().min(1, { message: "Debe seleccionar un tipo." }),
  bank_id: z.string().min(1, { message: "Debe seleccionar un banco." }),
  company_ids: z.array(z.number()),
  payment_method_ids: z.array(z.number()),
});

interface FormProps {
  onClose: () => void;
  /** Si se pasa una cuenta, el formulario pasa a modo edición. */
  account?: BankAccount;
}

export default function CreateBankAccountForm({ onClose, account }: FormProps) {
  const { createBankAccount } = useCreateBankAccount();
  const { updateBankAccount } = useUpdateBankAccount();
  const { data: banks, isLoading: isBanksLoading } = useGetBanks();
  const isEditing = !!account;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: account?.name ?? "",
      account_number: account?.account_number ?? "",
      account_owner: account?.account_owner ?? "",
      account_type: account?.account_type ?? "",
      bank_id: account?.bank ? account.bank.id.toString() : "",
      company_ids: account?.companies?.map((company) => company.id) ?? [],
      payment_method_ids: account?.payment_methods?.map((method) => method.id) ?? [],
    },
  });
  const { control } = form;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const data = {
      ...values,
      bank_id: Number(values.bank_id),
    };

    if (isEditing) {
      await updateBankAccount.mutateAsync({ id: account.id, data });
    } else {
      await createBankAccount.mutateAsync(data);
    }
    onClose();
  };

  const isPending = createBankAccount.isPending || updateBankAccount.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="EJ: Cuenta de TMD, etc..." {...field} />
                </FormControl>
                <FormDescription>
                  Nombre identificador de la cuenta.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bank_id"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Banco</FormLabel>
                <Select
                  disabled={isBanksLoading}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un banco..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {banks &&
                      banks.map((bank) => (
                        <SelectItem value={bank.id.toString()} key={bank.id}>
                          {bank.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Banco al que pertenece la cuenta.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="account_number"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nro. de Cuenta</FormLabel>
                <FormControl>
                  <Input placeholder="EJ: 0713 - XXXX, etc..." {...field} />
                </FormControl>
                <FormDescription>
                  Número de la cuenta (últimos 4 dígitos).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="account_type"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Tipo de Cuenta</FormLabel>
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
                    <SelectItem value="AHORRO">Ahorro</SelectItem>
                    <SelectItem value="CORRIENTE">Corriente</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Ahorro o corriente.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="account_owner"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Titular</FormLabel>
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
                    <SelectItem value={"NATURAL"}>Natural</SelectItem>
                    <SelectItem value={"JURIDICA"}>Jurídica</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Tipo de titular de la cuenta.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="payment_method_ids"
          render={({ field }) => (
            <FormItem className="mt-2">
              <FormLabel>Métodos de pago habilitados</FormLabel>
              <FormControl>
                <PaymentMethodMultiSelect value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormDescription>
                Esta cuenta podrá usar estos métodos de pago.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company_ids"
          render={({ field }) => (
            <FormItem className="mt-2">
              <FormLabel>Compañías habilitadas</FormLabel>
              <FormControl>
                <CompanyMultiSelect value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormDescription>
                Compañías que podrán operar con esta cuenta (una o varias).
              </FormDescription>
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
