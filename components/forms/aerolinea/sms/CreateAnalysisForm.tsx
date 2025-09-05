"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  useCreateAnalysis,
  useUpdateAnalyses,
} from "@/actions/sms/analisis/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Analysis } from "@/types";
import { Separator } from "@radix-ui/react-select";
import RiskMatrix from "../../../misc/RiskMatrix";
import { useRouter } from "next/navigation";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useEffect, useState } from "react";

const FormSchema = z.object({
  severity: z.string(),
  probability: z.string(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  id: string | number;
  name: string;
  onClose: () => void;
  initialData?: Analysis;
  isEditing?: boolean;
}

export default function CreateAnalysisForm({
  onClose,
  id,
  name,
  isEditing,
  initialData,
}: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { createAnalysis } = useCreateAnalysis();
  const { updateAnalyses } = useUpdateAnalyses();
  const router = useRouter();
  const SEVERITY = [
    { name: "CATASTROFICO", value: "A" },
    { name: "PELIGROSO", value: "B" },
    { name: "GRAVE", value: "C" },
    { name: "LEVE", value: "D" },
    { name: "INSIGNIFICANTE", value: "E" },
  ];

  const PROBABILITY = [
    { name: "FRECUENTE", value: "5" },
    { name: "OCASIONAL", value: "4" },
    { name: "REMOTO", value: "3" },
    { name: "IMPROBABLE", value: "2" },
    { name: "EXTREMADAMENTE_IMPROBABLE", value: "1" },
  ];

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialData
      ? {
          probability: initialData.probability,
          severity: initialData.severity,
        }
      : { probability: "", severity: "" },
  });

  const [currentSelection, setCurrentSelection] = useState("");

  // Actualizar la selección actual cuando cambian los valores
  useEffect(() => {
    const probability = form.watch("probability");
    const severity = form.watch("severity");

    if (probability && severity) {
      setCurrentSelection(`${probability}${severity}`);
    } else {
      setCurrentSelection("");
    }
  }, [form.watch("probability"), form.watch("severity")]);

  const handleCellClick = (probability: string, severity: string) => {
    form.setValue("probability", probability);
    form.setValue("severity", severity);
  };

  const onSubmit = async (data: FormSchemaType) => {
    if (isEditing && initialData) {
      const value = {
        company: selectedCompany!.slug,
        id: initialData.id.toString(),
        data: {
          ...data,
          result: data.probability + data.severity,
        },
      };
      await updateAnalyses.mutateAsync(value);
    } else {
      id = id.toString();
      if (name === "mitigacion") {
        const values = {
          company: selectedCompany!.slug,
          data: {
            ...data,
            result: data.probability + data.severity,
            mitigation_plan_id: id,
          },
        };
        await createAnalysis.mutateAsync(values);
      } else {
        const values = {
          company: selectedCompany!.slug,
          data: {
            ...data,
            result: data.probability + data.severity,
            danger_identification_id: id,
          },
        };
        try {
          await createAnalysis.mutateAsync(values);
          router.push(
            `/${selectedCompany?.slug}/sms/gestion_reportes/planes_de_mitigacion`
          );
        } catch (error) {
          console.error("Error al crear el análisis:", error);
        }
      }
    }

    onClose();
  };

  // Obtener valores actuales del formulario
  const currentProbability = form.watch("probability");
  const currentSeverity = form.watch("severity");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        <FormLabel className="text-lg text-center m-2"></FormLabel>

        <FormField
          control={form.control}
          name="probability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Probabilidad del riesgo</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setCurrentSelection(value + (currentSeverity || ""));
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger
                    className={field.value ? "bg-blue-50 border-blue-300" : ""}
                  >
                    <SelectValue placeholder="Seleccionar probabilidad de riesgo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PROBABILITY.map((probability, index) => (
                    <SelectItem key={index} value={probability.value}>
                      {probability.name} ({probability.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Elegir la probabilidad del riesgo
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="severity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Severidad del riesgo</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setCurrentSelection((currentProbability || "") + value);
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger
                    className={field.value ? "bg-blue-50 border-blue-300" : ""}
                  >
                    <SelectValue placeholder="Seleccionar severidad del peligro" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SEVERITY.map((severity, index) => (
                    <SelectItem key={index} value={severity.value}>
                      {severity.name} ({severity.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Elegir la severidad del riesgo</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <RiskMatrix
          onCellClick={handleCellClick}
          selectedProbability={currentProbability}
          selectedSeverity={currentSeverity}
        />

        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>
        <Button type="submit">Enviar</Button>
      </form>
    </Form>
  );
}
