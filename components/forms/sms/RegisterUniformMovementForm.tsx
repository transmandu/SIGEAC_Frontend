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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  useGetUniformItems,
  useGetUniformOptions,
} from "@/hooks/sms/useGetUniforms";
import { useCreateUniformMovement } from "@/actions/sms/uniforms/actions";
import { MOVEMENT_TYPE_META } from "@/components/sms/uniform-meta";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2, PackagePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const ISSUANCE = "ISSUANCE";
const ADJUSTMENT = "ADJUSTMENT";

const formSchema = z
  .object({
    uniform_item_id: z.string().min(1, { message: "Seleccione un artículo." }),
    movement_type: z.string().min(1, { message: "Seleccione un tipo." }),
    quantity: z.coerce.number().int().min(1, { message: "Mínimo 1." }),
    date: z.string().min(1, { message: "Seleccione una fecha." }),
    recipient_name: z.string().optional(),
    direction: z.enum(["increase", "decrease"]).optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.movement_type === ISSUANCE && !data.recipient_name?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recipient_name"],
        message: "El receptor es obligatorio para una entrega.",
      });
    }
    if (data.movement_type === ADJUSTMENT) {
      if (!data.direction) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["direction"],
          message: "Indique si aumenta o disminuye.",
        });
      }
      if (!data.notes?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["notes"],
          message: "El motivo del ajuste es obligatorio.",
        });
      }
    }
  });

interface Props {
  onClose: () => void;
  itemId?: number;
}

export const RegisterUniformMovementForm = ({ onClose, itemId }: Props) => {
  const { selectedCompany } = useCompanyStore();
  const { data: items, isLoading: loadingItems } = useGetUniformItems(
    selectedCompany?.slug,
    true
  );
  const { data: options, isLoading: loadingOptions } = useGetUniformOptions(
    selectedCompany?.slug
  );
  const createMovement = useCreateUniformMovement();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      uniform_item_id: itemId ? String(itemId) : "",
      movement_type: "",
      quantity: 1,
      date: new Date().toISOString().slice(0, 10),
      recipient_name: "",
      direction: undefined,
      notes: "",
    },
  });

  const movementType = form.watch("movement_type");
  const selectedItemId = form.watch("uniform_item_id");
  const selectedItem = items?.find((i) => String(i.id) === selectedItemId);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createMovement.mutate(
      {
        company: selectedCompany!.slug,
        data: {
          uniform_item_id: Number(data.uniform_item_id),
          movement_type: data.movement_type,
          quantity: data.quantity,
          date: data.date,
          recipient_name:
            data.movement_type === ISSUANCE ? data.recipient_name : undefined,
          direction:
            data.movement_type === ADJUSTMENT ? data.direction : undefined,
          notes: data.notes || undefined,
        },
      },
      { onSuccess: () => onClose() }
    );
  };

  if (loadingItems || loadingOptions) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-y-4"
      >
        <FormField
          control={form.control}
          name="uniform_item_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Artículo</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!!itemId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un artículo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {items?.map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      {i.type_label} · {i.size} · {i.company_label} (stock:{" "}
                      {i.current_stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedItem && (
                <div className="mt-1 flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
                  <span className="text-sm text-muted-foreground">
                    Stock actual:{" "}
                    <span className="font-semibold tabular-nums text-foreground">
                      {selectedItem.current_stock}
                    </span>
                  </span>
                  {selectedItem.is_low_stock && (
                    <Badge variant="destructive" className="gap-1 text-[10px]">
                      <AlertTriangle className="size-3" />
                      Bajo stock
                    </Badge>
                  )}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="movement_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de movimiento</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {options?.movement_types.map((m) => {
                    const Icon = MOVEMENT_TYPE_META[m.value]?.Icon;
                    return (
                      <SelectItem key={m.value} value={m.value}>
                        <span className="flex items-center gap-2">
                          {Icon && (
                            <Icon className="size-4 text-muted-foreground" />
                          )}
                          {m.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {movementType === ISSUANCE && (
          <FormField
            control={form.control}
            name="recipient_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Receptor</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre de quien recibe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {movementType === ADJUSTMENT && (
          <FormField
            control={form.control}
            name="direction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección del ajuste</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Aumentar o disminuir" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="increase">Aumentar (+)</SelectItem>
                    <SelectItem value="decrease">Disminuir (−)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(movementType === ADJUSTMENT || movementType === ISSUANCE) && (
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {movementType === ADJUSTMENT ? "Motivo" : "Notas"}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={
                      movementType === ADJUSTMENT
                        ? "Motivo del ajuste"
                        : "Observaciones (opcional)"
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button
          type="submit"
          disabled={createMovement.isPending}
          className="bg-primary mt-2 gap-2 text-white hover:bg-blue-900 disabled:bg-primary/70"
        >
          {createMovement.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <PackagePlus className="size-4" />
              Registrar movimiento
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};
