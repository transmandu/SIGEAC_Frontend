"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateCarrier } from "@/actions/cargo/carrierActions";
import { useParams } from "next/navigation";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 carácteres")
    .max(100),
  last_name: z
    .string()
    .min(2, "El apellido debe tener al menos 2 carácteres")
    .max(100),
  middle_name: z.string().max(100).optional().or(z.literal("")),
  second_last_name: z.string().max(100).optional().or(z.literal("")),
  dni: z
    .string()
    .min(2, "El documento debe tener al menos 2 carácteres")
    .max(20),
  phone: z.string().max(20).optional().or(z.literal("")),
});

interface Props {
  onClose: () => void;
  onCreated?: (carrier: { id: number; name: string }) => void;
}

export function CreateCarrierForm({ onClose, onCreated }: Props) {
  const params = useParams();
  const company = params.company as string;
  const { createCarrier } = useCreateCarrier();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      middle_name: "",
      last_name: "",
      second_last_name: "",
      dni: "",
      phone: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    createCarrier.mutate(
      { company, data: values },
      {
        onSuccess: (newCarrier) => {
          onCreated?.(newCarrier);
          onClose();
        },
      },
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-4"
      >
        {/* NOMBRES */}
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Primer nombre</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Juan"
                    className="uppercase"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="middle_name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Segundo nombre</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Carlos"
                    className="uppercase"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* APELLIDOS */}
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Primer apellido</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Pérez"
                    className="uppercase"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="second_last_name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Segundo apellido</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: González"
                    className="uppercase"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* DOCUMENTO Y TELÉFONO */}
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="dni"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Cédula</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: 12345678"
                    className="uppercase"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 0412-1234567" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>

          <Button type="submit" disabled={createCarrier.isPending}>
            {createCarrier.isPending ? "Guardando..." : "Guardar Transportista"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
