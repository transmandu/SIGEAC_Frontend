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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGetInformationSources } from "@/hooks/sms/useGetInformationSource";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { DangerIdentification } from "@/types";
import { Separator } from "@radix-ui/react-select";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const FormSchema = z.object({
  danger: z
    .string()
    .min(3, { message: "El peligro debe tener al menos 3 caracteres" })
    .max(245, { message: "El peligro no debe exceder los 245 caracteres" }),
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
    .min(3, { message: "La descripcion debe tener al menos 3 caracteres" })
    .max(245, { message: "La descripcion no debe exceder los 245 caracteres" }),
  possible_consequences: z
    .string()
    .min(3, {
      message: "Las posibles consecuencias deben tener al menos 3 caracteres",
    })
    .max(245, {
      message: "Las posibles consecuencias no deben exceder los 245 caracteres",
    }),
  consequence_to_evaluate: z
    .string()
    .min(3, {
      message: "La consecuencia a evaluar debe tener al menos 3 caracteres",
    })
    .max(245, {
      message: "La consecuencia a evaluar no debe exceder los 245 caracteres",
    }),
  danger_type: z.string().min(1, "Este campo es obligatorio"),
  root_cause_analysis: z
    .string()
    .min(3, {
      message: "El analisis causa raiz debe tener al menos 3 caracteres",
    })
    .max(900, {
      message: "El analisis causa raiz no debe exceder los 900 caracteres",
    }),
  information_source_id: z.string(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  id: number | string;
  initialData?: DangerIdentification;
  isEditing?: boolean;
  reportType: string;
  onClose: () => void;
}

export default function CreateDangerIdentificationForm({
  onClose,
  id,
  isEditing,
  initialData,
  reportType,
}: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: informationSources, isLoading: isLoadingSources } =
    useGetInformationSources();
  const { createDangerIdentification } = useCreateDangerIdentification();
  const { updateDangerIdentification } = useUpdateDangerIdentification();
  const router = useRouter();

  const [defenses, setDefenses] = useState<string[]>([]);
  const [newDefense, setNewDefense] = useState("");

  const [consequences, setConsequences] = useState<string[]>([]);
  const [newConsequence, setNewConsequence] = useState("");

  const [analyses, setAnalyses] = useState<string[]>([]);
  const [newAnalysis, setNewAnalysis] = useState("");

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

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      danger: initialData?.danger || "",
      information_source_id:
        initialData?.information_source?.id.toString() || "",
      current_defenses: initialData?.current_defenses || "",
      risk_management_start_date: initialData?.risk_management_start_date
        ? addDays(new Date(initialData.risk_management_start_date), 1)
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
    if (initialData) {
      const splitAndFilter = (str: string | undefined) =>
        str
          ? str
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

      setDefenses(splitAndFilter(initialData.current_defenses));
      setConsequences(splitAndFilter(initialData.possible_consequences));
      setAnalyses(splitAndFilter(initialData.root_cause_analysis));
    }
  }, [initialData]);

  // --- DEFENSAS ---
  const addDefense = () => {
    if (newDefense.trim()) {
      const updated = [...defenses, newDefense.trim()];
      setDefenses(updated);
      form.setValue("current_defenses", updated.join(","));
      setNewDefense("");
    }
  };
  const removeDefense = (index: number) => {
    const updated = defenses.filter((_, i) => i !== index);
    setDefenses(updated);
    form.setValue("current_defenses", updated.join(","));
  };
  const handleDefenseKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addDefense();
    }
  };

  // --- CONSECUENCIAS ---
  const addConsequence = () => {
    if (newConsequence.trim()) {
      const updated = [...consequences, newConsequence.trim()];
      setConsequences(updated);
      form.setValue("possible_consequences", updated.join(","));
      setNewConsequence("");
    }
  };
  const removeConsequence = (index: number) => {
    const updated = consequences.filter((_, i) => i !== index);
    setConsequences(updated);
    form.setValue("possible_consequences", updated.join(","));
  };
  const handleConsequenceKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addConsequence();
    }
  };

  // --- ANÁLISIS ---
  const addAnalysis = () => {
    if (newAnalysis.trim()) {
      const updated = [...analyses, newAnalysis.trim()];
      setAnalyses(updated);
      form.setValue("root_cause_analysis", updated.join(","));
      setNewAnalysis("");
    }
  };
  const removeAnalysis = (index: number) => {
    const updated = analyses.filter((_, i) => i !== index);
    setAnalyses(updated);
    form.setValue("root_cause_analysis", updated.join(","));
  };
  const handleAnalysisKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAnalysis();
    }
  };

  // --- ENVÍO ---
  const onSubmit = async (data: FormSchemaType) => {
    try {
      if (initialData && isEditing) {
        // Actualización
        await updateDangerIdentification.mutateAsync({
          company: selectedCompany!.slug,
          id: initialData.id.toString(),
          data,
        });
        onClose();
      } else {
        // Creación
        const response = await createDangerIdentification.mutateAsync({
          company: selectedCompany!.slug,
          id, // id del reporte padre
          reportType,
          data,
        });

        const newId = response.danger_identification_id;

        if (!newId) {
          throw new Error("No se recibió el id de la identificación creada");
        }

        router.push(
          `/${selectedCompany?.slug}/sms/gestion_reportes/peligros_identificados/${response.danger_identification_id}`
        );
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    }

  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-4"
      >
        <FormLabel className="text-lg text-center m-2">
          Identificación de Peligro
        </FormLabel>

        {/* --- CAMPOS PRINCIPALES --- */}
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
                <FormLabel>Fecha de Inicio de Gestión</FormLabel>
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
                        {field.value
                          ? format(field.value, "PPP", { locale: es })
                          : "Seleccione una fecha"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      fromYear={2000}
                      toYear={new Date().getFullYear()}
                      captionLayout="dropdown-buttons"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --- DESCRIPCION --- */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripcion de Identificación de Peligro</FormLabel>
              <FormControl>
                <Textarea placeholder="Breve descripción" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* --- ÁREA --- */}
        <FormField
          control={form.control}
          name="danger_area"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Área de identificación</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Área" />
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

        {/* --- DEFENSAS --- */}
        <FormItem>
          <FormLabel>Defensas Actuales</FormLabel>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Escriba una defensa"
                value={newDefense}
                onChange={(e) => setNewDefense(e.target.value)}
                onKeyPress={handleDefenseKeyPress}
              />
              <Button type="button" onClick={addDefense} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {defenses.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-muted/40 border rounded-md p-2"
                >
                  <span className="text-sm">{item}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => removeDefense(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </FormItem>
        <FormField
          control={form.control}
          name="current_defenses"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input type="hidden" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* --- CONSECUENCIAS --- */}
        <FormItem>
          <FormLabel>Consecuencias</FormLabel>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Escriba una consecuencia"
                value={newConsequence}
                onChange={(e) => setNewConsequence(e.target.value)}
                onKeyPress={handleConsequenceKeyPress}
              />
              <Button type="button" onClick={addConsequence} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {consequences.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-muted/40 border rounded-md p-2"
                >
                  <span className="text-sm">{item}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => removeConsequence(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </FormItem>
        <FormField
          control={form.control}
          name="possible_consequences"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input type="hidden" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* --- CONSECUENCIA A EVALUAR --- */}
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
                  {consequences.filter(Boolean).map((c, idx) => (
                    <SelectItem key={idx} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- FUENTE E IDENTIFICACIÓN --- */}
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
                    <span>Cargando...</span>
                  </div>
                ) : (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingSources}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={"Seleccionar Fuente"} />
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
                    {DANGER_TYPES.map((type, index) => (
                      <SelectItem key={index} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --- ANALISIS CAUSA RAÍZ --- */}
        <FormItem>
          <FormLabel>Análisis Causa Raíz</FormLabel>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Escriba un 'porqué' del análisis"
                value={newAnalysis}
                onChange={(e) => setNewAnalysis(e.target.value)}
                onKeyPress={handleAnalysisKeyPress}
              />
              <Button type="button" onClick={addAnalysis} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {analyses.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-muted/40 border rounded-md p-2"
                >
                  <span className="text-sm">{item}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => removeAnalysis(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </FormItem>
        <FormField
          control={form.control}
          name="root_cause_analysis"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input type="hidden" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* --- FOOTER --- */}
        <div className="flex justify-between items-center gap-x-4 pt-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground text-sm">SIGEAC</p>
          <Separator className="flex-1" />
        </div>

        {/* --- BOTÓN ENVIAR --- */}
        <Button type="submit" disabled={createDangerIdentification.isPending || updateDangerIdentification.isPending}>
          {createDangerIdentification.isPending || updateDangerIdentification.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {isEditing ? "Actualizar" : "Enviar"}
        </Button>
      </form>
    </Form>
  );
}
