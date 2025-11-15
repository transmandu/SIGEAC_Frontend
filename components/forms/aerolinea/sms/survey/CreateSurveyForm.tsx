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
import {
  Loader2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Circle,
  CheckSquare,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useRef, useEffect } from "react";
import { useCreateSurvey } from "@/actions/sms/survey/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormProps {
  onClose: () => void;
}

// Esquema para las opciones de preguntas
const OptionSchema = z.object({
  text: z.string().min(1, "La opción no puede estar vacía"),
  is_correct: z.boolean().optional(),
});

// Esquema para las preguntas - CORREGIDO
const QuestionSchema = z
  .object({
    text: z.string().min(3, "La pregunta debe tener al menos 3 caracteres"),
    type: z.enum(["SINGLE", "MULTIPLE", "OPEN"]),
    is_required: z.boolean(),
    options: z.array(OptionSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.type === "OPEN") {
        return true; // Las preguntas abiertas no necesitan opciones
      }

      // Para preguntas de selección, validar opciones
      if (!data.options || data.options.length === 0) {
        return false;
      }

      // Validar que todas las opciones tengan texto
      const emptyOptions = data.options.filter((opt) => !opt.text.trim());
      if (emptyOptions.length > 0) {
        return false;
      }

      return true;
    },
    {
      message:
        "Las preguntas de selección deben tener al menos una opción con texto",
      path: ["options"],
    }
  );

// Esquema principal del formulario - SIMPLIFICADO
const FormSchema = z.object({
  title: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  description: z.string().min(3, "La descripción es obligatoria."),
  type: z.enum(["QUIZ", "SURVEY"]),
  questions: z
    .array(QuestionSchema)
    .min(1, "Debe agregar al menos una pregunta"),
});

type FormSchemaType = z.infer<typeof FormSchema>;

// Componente para el input de opción con manejo de Enter
interface OptionInputProps {
  questionIndex: number;
  optionIndex: number;
  form: any;
  onRemove: () => void;
  onAddOption: () => void;
  isLastOption: boolean;
  surveyType: "QUIZ" | "SURVEY";
  questionType: "SINGLE" | "MULTIPLE" | "OPEN";
  onCorrectOptionChange: (checked: boolean) => void;
  isCorrect: boolean;
}

function OptionInput({
  questionIndex,
  optionIndex,
  form,
  onRemove,
  onAddOption,
  isLastOption,
  surveyType,
  questionType,
  onCorrectOptionChange,
  isCorrect,
}: OptionInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const currentValue = form.getValues(
        `questions.${questionIndex}.options.${optionIndex}.text`
      );
      if (currentValue.trim() !== "") {
        onAddOption();
      }
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Checkbox/Radio para respuesta correcta (solo en QUIZ) */}
      {surveyType === "QUIZ" && questionType !== "OPEN" && (
        <div className="flex items-center">
          {questionType === "SINGLE" ? (
            <RadioGroup
              value={isCorrect ? "correct" : ""}
              onValueChange={() => onCorrectOptionChange(true)}
            >
              <FormControl>
                <RadioGroupItem value="correct" checked={isCorrect} />
              </FormControl>
            </RadioGroup>
          ) : (
            <Checkbox
              checked={isCorrect}
              onCheckedChange={onCorrectOptionChange}
            />
          )}
        </div>
      )}

      <FormField
        control={form.control}
        name={`questions.${questionIndex}.options.${optionIndex}.text`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input
                {...field}
                ref={inputRef}
                placeholder={`Opción ${optionIndex + 1}`}
                onKeyDown={handleKeyDown}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch(`questions.${questionIndex}.options`)?.length > 1 && (
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      )}
    </div>
  );
}

// Componente individual para cada pregunta
interface QuestionItemProps {
  questionIndex: number;
  field: FieldArrayWithId<FormSchemaType, "questions", "id">;
  form: any;
  remove: (index: number) => void;
  fieldsLength: number;
  surveyType: "QUIZ" | "SURVEY";
}

function QuestionItem({
  questionIndex,
  field,
  form,
  remove,
  fieldsLength,
  surveyType,
}: QuestionItemProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  const addOption = (questionIndex: number) => {
    const currentOptions =
      form.getValues(`questions.${questionIndex}.options`) || [];

    form.setValue(`questions.${questionIndex}.options`, [
      ...currentOptions,
      { text: "", is_correct: false },
    ]);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentOptions =
      form.getValues(`questions.${questionIndex}.options`) || [];
    if (currentOptions.length > 1) {
      const newOptions = currentOptions.filter(
        (_: any, index: number) => index !== optionIndex
      );
      form.setValue(`questions.${questionIndex}.options`, newOptions);

      if (surveyType === "QUIZ") {
        const questionType = form.watch(`questions.${questionIndex}.type`);
        if (questionType === "SINGLE") {
          const hasCorrectOption = newOptions.some(
            (opt: any) => opt.is_correct
          );
          if (!hasCorrectOption && newOptions.length > 0) {
            form.setValue(
              `questions.${questionIndex}.options.0.is_correct`,
              true
            );
          }
        }
      }
    }
  };

  const handleTypeChange = (value: "SINGLE" | "MULTIPLE" | "OPEN") => {
    form.setValue(`questions.${questionIndex}.type`, value);

    if (value === "OPEN") {
      form.setValue(`questions.${questionIndex}.options`, undefined);
    } else {
      const currentOptions = form.getValues(
        `questions.${questionIndex}.options`
      );
      if (!currentOptions || currentOptions.length === 0) {
        form.setValue(`questions.${questionIndex}.options`, [
          { text: "", is_correct: false },
          { text: "", is_correct: false },
        ]);
      } else if (surveyType === "QUIZ" && value === "SINGLE") {
        const hasCorrectOption = currentOptions.some(
          (opt: any) => opt.is_correct
        );
        if (!hasCorrectOption && currentOptions.length > 0) {
          form.setValue(
            `questions.${questionIndex}.options.0.is_correct`,
            true
          );
        } else {
          const firstCorrectIndex = currentOptions.findIndex(
            (opt: any) => opt.is_correct
          );
          if (firstCorrectIndex !== -1) {
            const updatedOptions = currentOptions.map(
              (opt: any, index: number) => ({
                ...opt,
                is_correct: index === firstCorrectIndex,
              })
            );
            form.setValue(`questions.${questionIndex}.options`, updatedOptions);
          }
        }
      }
    }
  };

  const handleSingleCorrectOption = (
    questionIndex: number,
    optionIndex: number
  ) => {
    const currentOptions =
      form.getValues(`questions.${questionIndex}.options`) || [];
    const updatedOptions = currentOptions.map((opt: any, index: number) => ({
      ...opt,
      is_correct: index === optionIndex,
    }));
    form.setValue(`questions.${questionIndex}.options`, updatedOptions);
  };

  const handleMultipleCorrectOption = (
    questionIndex: number,
    optionIndex: number,
    checked: boolean
  ) => {
    const currentOptions =
      form.getValues(`questions.${questionIndex}.options`) || [];
    const updatedOptions = currentOptions.map((opt: any, index: number) => ({
      ...opt,
      is_correct: index === optionIndex ? checked : opt.is_correct,
    }));
    form.setValue(`questions.${questionIndex}.options`, updatedOptions);
  };

  const questionText = form.watch(`questions.${questionIndex}.text`);
  const questionType = form.watch(`questions.${questionIndex}.type`);
  const displayText = questionText || `Pregunta ${questionIndex + 1}`;
  const options = form.watch(`questions.${questionIndex}.options`) || [];

  const correctOptionsCount = options.filter(
    (opt: any) => opt.is_correct
  ).length;

  return (
    <div className="p-4 border rounded-lg space-y-4 bg-white">
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

      {!isMinimized && (
        <div className="space-y-4 pl-6">
          <FormField
            control={form.control}
            name={`questions.${questionIndex}.text`}
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
                        Pregunta Abierta
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          {questionType !== "OPEN" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <FormLabel>Opciones de Respuesta</FormLabel>
                <span className="text-sm text-gray-500">
                  {options.filter((opt: any) => opt.text.trim() !== "").length}{" "}
                  de {options.length} completa
                  {surveyType === "QUIZ" &&
                    ` • ${correctOptionsCount} correcta(s)`}
                </span>
              </div>

              {options.map((option: any, optionIndex: number) => (
                <OptionInput
                  key={optionIndex}
                  questionIndex={questionIndex}
                  optionIndex={optionIndex}
                  form={form}
                  onRemove={() => removeOption(questionIndex, optionIndex)}
                  onAddOption={() => addOption(questionIndex)}
                  isLastOption={optionIndex === options.length - 1}
                  surveyType={surveyType}
                  questionType={questionType}
                  onCorrectOptionChange={(checked) => {
                    if (questionType === "SINGLE") {
                      handleSingleCorrectOption(questionIndex, optionIndex);
                    } else {
                      handleMultipleCorrectOption(
                        questionIndex,
                        optionIndex,
                        checked
                      );
                    }
                  }}
                  isCorrect={option.is_correct}
                />
              ))}

              {surveyType === "QUIZ" && questionType !== "OPEN" && (
                <div className="flex items-center gap-2 text-xs p-2 rounded border">
                  {questionType === "SINGLE" ? (
                    <>
                      <Circle className="h-3 w-3 text-blue-600" />
                      <span className="text-blue-600">
                        Debe tener exactamente 1 respuesta correcta
                      </span>
                      {correctOptionsCount !== 1 && (
                        <span className="text-red-500 ml-auto">
                          {correctOptionsCount === 0
                            ? "Selecciona la respuesta correcta"
                            : correctOptionsCount > 1
                              ? "Solo puede haber una respuesta correcta"
                              : ""}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-3 w-3 text-blue-600" />
                      <span className="text-blue-600">
                        Marca todas las opciones correctas
                      </span>
                      {(correctOptionsCount === 0 ||
                        correctOptionsCount === options.length) && (
                        <span className="text-red-500 ml-auto">
                          {correctOptionsCount === 0
                            ? "Debe haber al menos una correcta"
                            : "Debe haber al menos una incorrecta"}
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}

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
  const { createSurvey } = useCreateSurvey();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "SURVEY",
      questions: [
        {
          text: "",
          type: "SINGLE",
          is_required: true,
          options: [{ text: "", is_correct: false }],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const surveyType = form.watch("type");

  const addQuestion = () => {
    append({
      text: "",
      type: "SINGLE",
      is_required: true,
      options: [
        { text: "", is_correct: false },
        { text: "", is_correct: false },
      ],
    });
  };

  const onSubmit = async (data: FormSchemaType) => {
    console.log("Datos del formulario a enviar:", data);

    // Preparar los datos para enviar
    const formPayload = {
      title: data.title,
      type: data.type,
      description: data.description,
      questions: data.questions.map((question) => {
        if (question.type === "OPEN") {
          // Para preguntas abiertas, no enviar options
          const { options, ...questionWithoutOptions } = question;
          return questionWithoutOptions;
        }

        // Para preguntas de selección, enviar options filtradas
        return {
          ...question,
          options:
            question.options
              ?.filter((opt) => opt.text.trim() !== "")
              .map((opt) => ({
                text: opt.text,
                is_correct: data.type === "QUIZ" ? opt.is_correct : false,
              })) || [],
        };
      }),
    };

    console.log("Payload final:", formPayload);

    try {
      await createSurvey.mutateAsync(formPayload);
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error al crear la encuesta:", error);
    }
  };

  useEffect(() => {
    if (surveyType === "SURVEY") {
      const questions = form.getValues("questions");
      const updatedQuestions = questions.map((question) => {
        if (question.type !== "OPEN" && question.options) {
          return {
            ...question,
            options: question.options.map((opt) => ({
              ...opt,
              is_correct: false,
            })),
          };
        }
        return question;
      });
      form.setValue("questions", updatedQuestions);
    }
  }, [surveyType, form]);

  // Agregar console.log para debug
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log("Form values:", value);
      console.log("Form errors:", form.formState.errors);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, form.formState.errors]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-6xl mx-auto p-6 space-y-6"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold">Creación de Encuesta</h1>
          <p className="text-gray-600 mt-2">
            Complete la información requerida para crear una nueva encuesta
          </p>
        </div>

        <div className="space-y-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Encuesta</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo de encuesta" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SURVEY">ENCUESTA</SelectItem>
                    <SelectItem value="QUIZ">TRIVIA</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
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

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <FormLabel className="text-lg font-semibold">
                  Preguntas
                </FormLabel>
                <p className="text-sm text-gray-600">
                  {fields.length} pregunta(s) -{" "}
                  {surveyType === "QUIZ" ? "Trivia" : "Encuesta"}
                </p>
              </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field, questionIndex: number) => (
                <QuestionItem
                  key={field.id}
                  questionIndex={questionIndex}
                  field={field}
                  form={form}
                  remove={remove}
                  fieldsLength={fields.length}
                  surveyType={surveyType}
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

        <Button
          type="submit"
          disabled={createSurvey.isPending}
          className="w-full"
        >
          {createSurvey.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            `Crear ${surveyType === "QUIZ" ? "Trivia" : "Encuesta"}`
          )}
        </Button>

        {/* Debug info */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>Estado: {form.formState.isValid ? "VÁLIDO" : "INVÁLIDO"}</div>
          <div>
            Errores:{" "}
            {Object.keys(form.formState.errors).length > 0
              ? JSON.stringify(form.formState.errors, null, 2)
              : "Ninguno"}
          </div>
        </div>
      </form>
    </Form>
  );
}
