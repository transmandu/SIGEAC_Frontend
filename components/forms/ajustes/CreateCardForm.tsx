"use client";
import { useCreateCard, useUpdateCard } from "@/actions/general/banco_cuentas/tarjetas/actions";
import { CompanyMultiSelect } from "@/components/misc/CompanyMultiSelect";
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
import { useGetBankAccounts } from "@/hooks/general/cuentas_bancarias/useGetBankAccounts";
import { Card } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../ui/button";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 carácteres.",
  }),
  card_number: z.string().min(4, {
    message: "Debe ingresar un número de tarjeta válido.",
  }),
  bank_account_id: z.string().min(1, {
    message: "Debe elegir una cuenta bancaria.",
  }),
  payment_method_id: z.string().min(1, {
    message: "Debe elegir un método de pago.",
  }),
  company_ids: z.array(z.number()),
});

interface FormProps {
  onClose: () => void;
  /** Si se pasa una tarjeta, el formulario pasa a modo edición. */
  card?: Card;
}

export default function CreateCardForm({ onClose, card }: FormProps) {
  const { data: accounts, isLoading: isAccLoading } = useGetBankAccounts();
  const { createCard } = useCreateCard();
  const { updateCard } = useUpdateCard();
  const isEditing = !!card;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: card?.name ?? "",
      card_number: card?.card_number ?? "",
      bank_account_id: card ? card.bank_account_id.toString() : "",
      payment_method_id: card ? card.payment_method_id.toString() : "",
      company_ids: card?.companies?.map((company) => company.id) ?? [],
    },
  });
  const { control } = form;

  const selectedAccountId = form.watch("bank_account_id");

  // El método de pago debe estar habilitado para la cuenta elegida
  // (pivote bank_account_payment_method).
  const accountMethods = useMemo(() => {
    const account = accounts?.find((acc) => acc.id.toString() === selectedAccountId);
    return account?.payment_methods ?? [];
  }, [accounts, selectedAccountId]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // El tipo de la tarjeta lo define el método de pago elegido.
    const data = {
      ...values,
      bank_account_id: Number(values.bank_account_id),
      payment_method_id: Number(values.payment_method_id),
    };

    if (isEditing) {
      await updateCard.mutateAsync({ id: card.id, data });
    } else {
      await createCard.mutateAsync(data);
    }
    onClose();
  };

  const isPending = createCard.isPending || updateCard.isPending;

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
                  Nombre identificador de la tarjeta.
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
                  Últimos dígitos de la tarjeta.
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
                <FormLabel>Cuenta bancaria</FormLabel>
                <Select
                  disabled={isAccLoading}
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Cambiar de cuenta invalida el método elegido.
                    form.setValue("payment_method_id", "");
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={isAccLoading ? "Cargando..." : "Seleccione una cuenta..."}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts &&
                      accounts.map((acc) => (
                        <SelectItem value={acc.id.toString()} key={acc.id}>
                          {acc.name} ({acc.account_number}) — {acc.bank.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Cuenta a la que pertenece la tarjeta.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="payment_method_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Método de pago</FormLabel>
                <Select
                  disabled={!selectedAccountId}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          selectedAccountId
                            ? "Seleccione un método..."
                            : "Elija una cuenta primero"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accountMethods.length === 0 && (
                      <p className="p-2 text-xs text-muted-foreground">
                        La cuenta no tiene métodos de pago habilitados.
                      </p>
                    )}
                    {accountMethods.map((method) => (
                      <SelectItem value={method.id.toString()} key={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Método (habilitado para la cuenta) bajo el que se usa la
                  tarjeta; define el tipo de la tarjeta.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
                La tarjeta será válida solo para las compañías seleccionadas.
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
            <p>{isEditing ? "Actualizar" : "Registrar"}</p>
          )}
        </Button>
      </form>
    </Form>
  );
}
