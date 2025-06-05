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

import { Separator } from "@/components/ui/separator";
import { ObligatoryReport } from "@/types";
import { Loader2 } from "lucide-react";
import { useAcceptObligatoryReport } from "@/actions/sms/reporte_obligatorio/actions";
import { format, parse } from "date-fns";

function timeFormat(date: Date) {
  const timeString = date.toString();
  const parsedTime = parse(timeString, "HH:mm:ss", new Date());
  return parsedTime;
}

interface FormProps {
  onClose: () => void;
  initialData: ObligatoryReport;
}
// { onClose }: FormProps
// lo de arriba va en prop
export function AcceptObligatoryReport({ onClose, initialData }: FormProps) {
  const { acceptObligatoryReport } = useAcceptObligatoryReport();

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
    if (initialData) {
      const value = {
        report_number: data.report_number,
        id: initialData?.id,
        status: "ABIERTO",
        image: undefined, // USO ESTO PORQUE EN INITIAL DATA VIENE EL NOMBRE DEL ARCHIVO Y SOLO NECESITL NUMERO DE REPORTE.
        document: undefined,
        danger_identification_id: initialData.danger_identification.id,
        description: initialData.description,
        incident_location: initialData.incident_location,
        aircraft_id: initialData.aircraft.id,
        pilot_id: initialData.pilot.id,
        copilot_id: initialData.copilot.id,
        flight_alt_destiny: initialData.flight_alt_destiny,
        flight_destiny: initialData.flight_destiny,
        flight_number: initialData.flight_number,
        flight_origin: initialData.flight_origin,
        incidents: initialData.incidents
          ? JSON.parse(initialData.incidents)
          : [],
        other_incidents: initialData.other_incidents ?? "",
        report_date: new Date(initialData.report_date),
        incident_date: new Date(initialData.incident_date),
        incident_time: format(timeFormat(initialData?.incident_time), "HH:mm:ss"),
        flight_time: format(timeFormat(initialData?.flight_time), "HH:mm:ss"),
      };
      try {
        await acceptObligatoryReport.mutateAsync(value);
      } catch (error) {
        console.error("Error al aceptar el reporte:", error);
      }
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
              <FormLabel>Código del Reporte Obligatorio</FormLabel>
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
        <Button disabled={acceptObligatoryReport.isPending}>
          {acceptObligatoryReport.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Aceptar"
          )}
        </Button>
      </form>
    </Form>
  );
}
