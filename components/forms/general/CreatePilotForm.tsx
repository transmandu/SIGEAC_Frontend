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

import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Loader2 } from "lucide-react";

import { Separator } from "@/components/ui/separator";

import { Pilot } from "@/types";
import {
  useCreatePilot,
  useUpdatePilot,
} from "@/actions/ajustes/globales/piloto/actions";

const FormSchema = z.object({
  dni: z.string(),
  license_number: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string(),
  email: z.string().email(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  onClose: () => void;
  initialData?: Pilot;
  isEditing?: boolean;
}
// { onClose }: FormProps
// lo de arriba va en prop
export function CreatePilotForm({
  onClose,
  initialData,
  isEditing,
}: FormProps) {
  const { createPilot } = useCreatePilot();
  const { updatePilot } = useUpdatePilot();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      dni: initialData?.dni || "",
      license_number: initialData?.license_number || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
    },
  });

  const onSubmit = async (data: FormSchemaType) => {
    if (isEditing && initialData) {
      const formattedData = {
        ...data,
        id: initialData.id,
      };
      console.log("formattedData is the next one ", formattedData);
      await updatePilot.mutateAsync(formattedData);
    } else {
      await createPilot.mutateAsync(data);
    }

    onClose();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        <FormLabel className="text-lg text-center">Formulario Piloto</FormLabel>

        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nombre del Piloto</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Apellido del Piloto</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="dni"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Cédula de Identidad</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="license_number"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nº de Licencia de Piloto</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className=" flex gap-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nº de Telefono</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Correo Elecrónico</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>
        <Button disabled={createPilot.isPending}>
          {createPilot.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Enviar"
          )}
        </Button>
      </form>
    </Form>
  );
}
