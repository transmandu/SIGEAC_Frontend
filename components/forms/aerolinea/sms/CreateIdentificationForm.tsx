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

import {
  useCreateDangerIdentification,
  useUpdateDangerIdentification,
} from "@/actions/sms/peligros_identificados/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetInformationSources } from "@/hooks/sms/useGetInformationSource";
import { cn } from "@/lib/utils";
import { DangerIdentification } from "@/types";
import { Separator } from "@radix-ui/react-select";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Calendar } from "../../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import { Textarea } from "../../../ui/textarea";
import { useRouter } from "next/navigation";
import router from "next/router";
import { useCompanyStore } from "@/stores/CompanyStore";
// HAY DATOS QUE VIENEN DEL REPORTE
// COMO FECHA DE REPORTE E IDENTIFICACION
// A LADO DEL CODIGO TENDRA EL TIPO DE REPORTE (RVP-RSO) DETECTADO DEL ORIGEN DEL REPORTE

// NOMBRE DE QUIEN REPORTA (PUEDE SER ANONIMO)

function contCommas(text: string): number {
  return (text.match(/,/g) || []).length;
}

const FormSchema = z.object({
  danger: z
    .string()
    .min(3, {
      message: "El peligro debe tener al menos 3 caracteres",
    })
    .max(245, {
      message: "El peligro no debe exceder los 245 caracteres",
    }),

  danger_area: z.string(),

  risk_management_start_date: z
    .date()
    .refine((val) => !isNaN(val.getTime()), { message: "Invalid Date" }),

  current_defenses: z
    .string()
    .min(3, {
      message: "Las defensas actuales deben tener al menos 3 caracteres",
    })
    .max(245, {
      message: "Las defensas actuales no deben exceder los 245 caracteres",
    }),
  description: z
    .string()
    .min(3, {
      message: "La descripcion debe tener al menos 3 caracteres",
    })
    .max(245, {
      message: "La descripcion deben exceder los 245 caracteres",
    }),

  possible_consequences: z
    .string()
    .min(3, {
      message: "Las posibles consecuencias deben tener almenos 3 caracteres",
    })
    .max(245, {
      message: "Las posibles consecuencias no deben exceder los 245 caracteres",
    })
    .refine((text) => contCommas(text) <= 5, {
      message: "El analisis causa raiz no debe tener mas de 5 comas.",
    })
    .refine(
      (text) => {
        const parts = text.split(",");
        return parts.every((parts) => parts.length <= 130);
      },
      {
        message: "Cada consecuencia no debe exceder los 130 caracteres.",
      }
    ),
  consequence_to_evaluate: z
    .string()
    .min(3, {
      message: "La consecuencia a evaluar debe tener al menos 3 caracteres",
    })
    .max(245, {
      message: "La consecuencia a evaluar no debe exceder los 245 caracteres",
    }),

  danger_type: z.string(),

  root_cause_analysis: z
    .string()
    .min(3, {
      message: "El analisis causa raiz al menos 3 caracteres",
    })
    .max(245, {
      message: "El analisis causa raiz no debe exceder los 245 caracteres",
    })
    .refine((text) => contCommas(text) <= 5, {
      message: "El analisis causa raiz no debe tener mas de 5 comas.",
    })
    .refine(
      (text) => {
        const parts = text.split(",");
        return parts.every((parts) => parts.length <= 120);
      },
      {
        message: "El porque no debe exceder los 120 caracteres.",
      }
    ),

  information_source_id: z.string(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  id: number | string;
  onClose: () => void;
  initialData?: DangerIdentification;
  isEditing?: boolean;
  reportType: string;
}
// { onClose }: FormProps
// lo de arriba va en prop
export default function CreateDangerIdentificationForm({
  onClose,
  id,
  isEditing,
  initialData,
  reportType,
}: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const [consequences, setConsequences] = useState<string[]>([]);
  const { data: informationSources, isLoading: isLoadingSources } =
    useGetInformationSources();
  const { createDangerIdentification } = useCreateDangerIdentification();
  const { updateDangerIdentification } = useUpdateDangerIdentification();
  const [defaultValuesLoaded, setDefaultValuesLoaded] = useState(false);
  const router = useRouter();
  const AREAS = [
    "OPERACIONES",
    "MANTENIMIENTO",
    "ADMINISTRACION",
    "CONTROL_CALIDAD",
    "IT",
    "AVSEC",
    "OTROS",
  ];
  const DANGER_TYPES = ["ORGANIZACIONAL", "TECNICO", "HUMANO", "NATURAL"];
  console.log("estos son los datos iniciales ", initialData);
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      danger: initialData?.danger || "",
      information_source_id: initialData?.information_source.id.toString(),
      current_defenses: initialData?.current_defenses || "",
      risk_management_start_date: initialData?.risk_management_start_date
        ? new Date(initialData.risk_management_start_date)
        : new Date(),
      consequence_to_evaluate: initialData?.consequence_to_evaluate || "",
      danger_area: initialData?.danger_area || "",
      danger_type: initialData?.danger_type || "",
      root_cause_analysis: initialData?.root_cause_analysis || "",
      description: initialData?.description || "",
      possible_consequences: initialData?.possible_consequences || "",
    },
  });

  useEffect(() => {
    if (initialData?.possible_consequences) {
      const initialConsequences = initialData.possible_consequences
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c !== "");
      setConsequences(initialConsequences);
    }
  }, [informationSources, initialData, form, defaultValuesLoaded]);

  const onSubmit = async (data: FormSchemaType) => {
    if (initialData && isEditing) {
      const values = {
        company: selectedCompany,
        id: initialData.id.toString(),
        data: {
          ...data,
        },
      };
      await updateDangerIdentification.mutateAsync(values);
    } else {
      const response = await createDangerIdentification.mutateAsync({
        company: selectedCompany,
        id,
        reportType,
        data,
      });
      router.push(
        `/${selectedCompany}/sms/gestion_reportes/peligros_identificados/${response.danger_identification_id}`
      );
    }
    onClose();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        <FormLabel className="text-lg text-center m-2">
          Identificación de Peligro
        </FormLabel>

        <div className="flex gap-2 justify-center items-center">
          <FormField
            control={form.control}
            name="danger"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Peligro Identificado</FormLabel>
                <FormControl>
                  <Input placeholder="Cual es el peligro" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="risk_management_start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-2.5 w-full">
                <FormLabel>Fecha de Inicio de Gestion</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", {
                            locale: es,
                          })
                        ) : (
                          <span>Seleccione una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()} // Solo deshabilitar fechas futuras
                      initialFocus
                      fromYear={1980} // Año mínimo que se mostrará
                      toYear={new Date().getFullYear()} // Año máximo (actual)
                      captionLayout="dropdown-buttons" // Selectores de año/mes
                      components={{
                        Dropdown: (props) => (
                          <select
                            {...props}
                            className="bg-popover text-popover-foreground"
                          >
                            {props.children}
                          </select>
                        ),
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripcion de identificacion de peligro</FormLabel>
              <FormControl>
                <Textarea placeholder="Breve descripcion " {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-center items-center">
          <FormField
            control={form.control}
            name="danger_area"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Area de identificación</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar Area" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {AREAS.map((area, index) => (
                      <SelectItem key={index} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="current_defenses"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Defensas Actuales</FormLabel>
                <FormControl>
                  <Input placeholder="Separar por una (,) " {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="possible_consequences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Consecuencias</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Consecuencias separadas por una coma (,)"
                  {...field}
                  onChange={(event) => {
                    field.onChange(event); // Actualiza el valor en el formulario (necesario para la librería de formularios)
                    const newConsequences = event.target.value
                      .split(",")
                      .map((consequence) => consequence.trim()); // Separa por comas y elimina espacios en blanco
                    setConsequences(newConsequences);
                    console.log("Consecuencias:", consequences); // Muestra las consecuencias en la consola
                    // Aquí puedes hacer lo que necesites con el array de consecuencias
                  }}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consequence_to_evaluate"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Consecuencia a Evaluar</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Consecuencia a Evaluar" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {consequences &&
                    consequences
                      .filter(
                        (consequence) => consequence && consequence !== ""
                      )
                      .map((consequence, index) => (
                        <SelectItem key={index} value={consequence}>
                          {consequence}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-center items-center">
          <FormField
            control={form.control}
            name="information_source_id"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Método de Identificación</FormLabel>
                {isLoadingSources ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Cargando fuentes...</span>
                  </div>
                ) : (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingSources}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingSources
                              ? "Cargando..."
                              : "Seleccionar Fuente de Información"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {informationSources?.map((source) => (
                        <SelectItem
                          key={source.id}
                          value={source.id.toString()}
                        >
                          {source.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="danger_type"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Tipo de peligro</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo de peligro" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DANGER_TYPES.map((area, index) => (
                      <SelectItem key={index} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="root_cause_analysis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Analisis Causa Raiz</FormLabel>
              <FormControl>
                <Input placeholder="Origen del Peligro" {...field} />
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
        <Button>Enviar</Button>
      </form>
    </Form>
  );
}
