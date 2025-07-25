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

import { useAcceptVoluntaryReport } from "@/actions/sms/reporte_voluntario/actions";
import { Separator } from "@/components/ui/separator";
import { VoluntaryReport } from "@/types";
import { Loader2 } from "lucide-react";

interface FormProps {
  onClose: () => void;
  initialData: VoluntaryReport;
}
// { onClose }: FormProps
// lo de arriba va en prop
export function AcceptVoluntaryReport({ onClose, initialData }: FormProps) {
  const { acceptVoluntaryReport } = useAcceptVoluntaryReport();

  const FormSchema = z.object({
    report_number: z.string().refine((val) => !isNaN(Number(val)), {
      message: "El valor debe ser un número",
    }),
  });

  type FormSchemaType = z.infer<typeof FormSchema>;

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {},
  });

  const onSubmit = async (data: FormSchemaType) => {
    const value = {
      ...initialData,
      report_number: data.report_number, // Sobrescribe solo report_number
      image: undefined,
      document: undefined,
      status: "ABIERTO"
    };
    try {
      await acceptVoluntaryReport.mutateAsync(value);
    } catch (error) {
      console.error("Error al aceptar el reporte:", error);
    }

    onClose();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3 "
      >
        <FormLabel className="text-lg text-center">
          Aceptacion de Reporte
        </FormLabel>

        <FormField
          control={form.control}
          name="report_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código del Reporte Voluntario</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} maxLength={4} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>
        <Button disabled={acceptVoluntaryReport.isPending}>
          {acceptVoluntaryReport.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Aceptar"
          )}
        </Button>
      </form>
    </Form>
  );
}
