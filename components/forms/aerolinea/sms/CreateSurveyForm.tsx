"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, FieldArrayWithId } from "react-hook-form";
import { z } from "zod";

import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { useCreateSurvey } from "@/actions/sms/survey/actions";

interface FormProps {
  onClose: () => void;
}

// Esquema para las opciones de preguntas
const OptionSchema = z.object({
  option: z.string().min(1, "La opción no puede estar vacía"),
});

// Esquema para las preguntas - CORREGIDO
const QuestionSchema = z
  .object({
    question: z.string().min(3, "La pregunta debe tener al menos 3 caracteres"),
    type: z.enum(["SINGLE", "MULTIPLE", "OPEN"]),
    is_required: z.boolean(),
    options: z.array(OptionSchema).optional(), // Hacer opcional para todas
  })
  .refine(
    (data) => {
      // Para preguntas SINGLE y MULTIPLE, debe haber al menos una opción
      if (data.type !== "OPEN") {
        return (
          data.options &&
          data.options.length > 0 &&
          data.options.every((opt) => opt.option.trim() !== "")
        );
      }
      // Para preguntas OPEN, no validamos opciones
      return true;
    },
    {
      message:
        "Las preguntas de selección deben tener al menos una opción válida",
      path: ["options"],
    }
  );

// Esquema principal del formulario
const FormSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  description: z.string().min(3, "La descripción es obligatoria."),
  questions: z
    .array(QuestionSchema)
    .min(1, "Debe agregar al menos una pregunta"),
});

type FormSchemaType = z.infer<typeof FormSchema>;

// Componente individual para cada pregunta
interface QuestionItemProps {
  questionIndex: number;
  field: FieldArrayWithId<FormSchemaType, "questions", "id">;
  form: any;
  remove: (index: number) => void;
  fieldsLength: number;
}

function QuestionItem({
  questionIndex,
  field,
  form,
  remove,
  fieldsLength,
}: QuestionItemProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  const addOption = (questionIndex: number) => {
    const currentOptions =
      form.getValues(`questions.${questionIndex}.options`) || [];
    form.setValue(`questions.${questionIndex}.options`, [
      ...currentOptions,
      { option: "" },
    ]);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentOptions =
      form.getValues(`questions.${questionIndex}.options`) || [];
    if (currentOptions.length > 1) {
      form.setValue(
        `questions.${questionIndex}.options`,
        currentOptions.filter((_: any, index: number) => index !== optionIndex)
      );
    }
  };

  // Función para manejar cambio de tipo de pregunta
  const handleTypeChange = (value: "SINGLE" | "MULTIPLE" | "OPEN") => {
    form.setValue(`questions.${questionIndex}.type`, value);

    // Si cambia a OPEN, limpiar las opciones
    if (value === "OPEN") {
      form.setValue(`questions.${questionIndex}.options`, undefined);
    } else {
      // Si cambia a SINGLE o MULTIPLE, asegurar que tenga al menos una opción
      const currentOptions = form.getValues(
        `questions.${questionIndex}.options`
      );
      if (!currentOptions || currentOptions.length === 0) {
        form.setValue(`questions.${questionIndex}.options`, [{ option: "" }]);
      }
    }
  };

  const questionValue = form.watch(`questions.${questionIndex}.question`);
  const questionType = form.watch(`questions.${questionIndex}.type`);
  const displayText = questionValue || `Pregunta ${questionIndex + 1}`;

  return (
    <div className="p-4 border rounded-lg space-y-4 bg-white">
      {/* Header de la pregunta - Siempre visible */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 flex-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 h-auto"
          >
            {isMinimized ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
          <h4 className="font-medium truncate flex-1">
            {displayText} {questionType === "OPEN" && "(Abierta)"}
          </h4>
        </div>
        {fieldsLength > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => remove(questionIndex)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        )}
      </div>

      {/* Contenido de la pregunta - Se oculta cuando está minimizado */}
      {!isMinimized && (
        <div className="space-y-4 pl-6">
          {/* Campo: Texto de la Pregunta */}
          <FormField
            control={form.control}
            name={`questions.${questionIndex}.question`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pregunta</FormLabel>
                <Input
                  placeholder="Ej: ¿Qué tan satisfecho está con el servicio?"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo: Tipo de Pregunta */}
          <FormField
            control={form.control}
            name={`questions.${questionIndex}.type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Pregunta</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={handleTypeChange}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="SINGLE" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Selección Simple
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="MULTIPLE" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Selección Múltiple
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="OPEN" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Respuesta Abierta
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo: Requerido */}
          <FormField
            control={form.control}
            name={`questions.${questionIndex}.is_required`}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>¿Esta pregunta es obligatoria?</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {/* Opciones (solo para SINGLE y MULTIPLE) */}
          {questionType !== "OPEN" && (
            <div className="space-y-3">
              <FormLabel>Opciones de Respuesta</FormLabel>
              {form
                .watch(`questions.${questionIndex}.options`)
                ?.map((_: any, optionIndex: number) => (
                  <div
                    key={optionIndex}
                    className="flex items-center space-x-2"
                  >
                    <FormField
                      control={form.control}
                      name={`questions.${questionIndex}.options.${optionIndex}.option`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder={`Opción ${optionIndex + 1}`}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {form.watch(`questions.${questionIndex}.options`)!.length >
                      1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(questionIndex, optionIndex)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addOption(questionIndex)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Opción
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CreateSurveyForm({ onClose }: FormProps) {
  const { selectedStation } = useCompanyStore();
  const { createSurvey } = useCreateSurvey();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
      questions: [
        {
          question: "",
          type: "SINGLE",
          is_required: true,
          options: [{ option: "" }],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const addQuestion = () => {
    append({
      question: "",
      type: "SINGLE",
      is_required: true,
      options: [{ option: "" }],
    });
  };

  const onSubmit = async (data: FormSchemaType) => {
    if (!selectedStation) {
      console.error(
        "ERROR: No se pudo determinar el location_id (selectedStation)."
      );
      return;
    }

    // Preparar el payload en la estructura requerida - CORREGIDO
    const formPayload = {
      name: data.name,
      description: data.description,
      location_id: selectedStation,
      questions: data.questions.map((question) => {
        // Para preguntas OPEN, no enviar el campo options en absoluto
        if (question.type === "OPEN") {
          const { options, ...questionWithoutOptions } = question;
          return questionWithoutOptions;
        }

        // Para SINGLE y MULTIPLE, filtrar opciones vacías
        return {
          ...question,
          options:
            question.options?.filter((opt) => opt.option.trim() !== "") || [],
        };
      }),
    };

    //console.log("Payload final:", formPayload);

    try {
      await createSurvey.mutateAsync(formPayload);
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error al crear la encuesta:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-6xl mx-auto p-6 space-y-6" // Cambiado a max-w-6xl para más espacio
      >
        <FormLabel className="text-2xl font-bold text-center w-full block">
          Creación de Encuesta
        </FormLabel>

        <div className="space-y-6">
          {/* Campo: Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Encuesta</FormLabel>
                <Input
                  placeholder="Ej: Encuesta Trimestral de Satisfacción"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo: Description (Textarea) */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <Textarea
                  placeholder="Describa brevemente el objetivo de esta encuesta."
                  className="resize-none"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sección de Preguntas - EN DOS COLUMNAS */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <FormLabel className="text-lg font-semibold">Preguntas</FormLabel>
              <Button
                type="button"
                onClick={addQuestion}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Pregunta
              </Button>
            </div>

            {/* Contenedor de dos columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field, questionIndex: number) => (
                <QuestionItem
                  key={field.id}
                  questionIndex={questionIndex}
                  field={field}
                  form={form}
                  remove={remove}
                  fieldsLength={fields.length}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>

        {/* Botón de Envío */}
        <Button
          type="submit"
          disabled={createSurvey.isPending || !selectedStation}
          className="w-full"
        >
          {createSurvey.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Crear Encuesta"
          )}
        </Button>
      </form>
    </Form>
  );
}
