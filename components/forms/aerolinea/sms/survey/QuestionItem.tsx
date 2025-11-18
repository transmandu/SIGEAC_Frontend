// components/survey/QuestionItem.tsx
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface QuestionItemProps {
  question: any;
  index: number;
  form: UseFormReturn<any>;
}

// Función auxiliar (puede ir en este archivo o en uno de utils)
function isAnswerProvided(answer: any, questionType: string): boolean {
  if (!answer) return false;

  if (questionType === "OPEN") {
    return answer.text && answer.text.trim().length > 0;
  } else {
    return answer.option_ids && answer.option_ids.length > 0;
  }
}

export function QuestionItem({ question, index, form }: QuestionItemProps) {
  const { type, text, is_required, options, id } = question;

  // Verificar si esta pregunta tiene error de validación
  const formErrors = form.formState.errors.responses;
  const hasError =
    formErrors &&
    is_required &&
    !isAnswerProvided(form.watch(`responses.${index}.answer`), type);

  return (
    <div
      className={`p-4 border rounded-lg space-y-3 bg-white ${hasError ? "border-red-300 bg-red-50" : ""}`}
    >
      <div>
        <h3 className="font-medium">
          {index + 1}. {text}
          {is_required && <span className="text-red-500 ml-1">*</span>}
        </h3>
        {type !== "OPEN" && (
          <p className="text-sm text-gray-500 mt-1">
            {type === "SINGLE"
              ? "Selecciona una opción"
              : "Selecciona una o más opciones"}
          </p>
        )}

        {/* Mensaje de error específico para esta pregunta */}
        {hasError && (
          <p className="text-red-600 text-sm mt-1">
            Esta pregunta es obligatoria
          </p>
        )}
      </div>

      <FormField
        control={form.control}
        name={`responses.${index}.answer`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              {type === "OPEN" ? (
                <Textarea
                  placeholder="Tu respuesta..."
                  className={`min-h-[80px] ${hasError ? "border-red-300" : ""}`}
                  value={field.value?.text || ""}
                  onChange={(e) =>
                    field.onChange({ ...field.value, text: e.target.value })
                  }
                />
              ) : type === "SINGLE" ? (
                <RadioGroup
                  value={field.value?.option_ids?.[0]?.toString() || ""}
                  onValueChange={(value) =>
                    field.onChange({
                      ...field.value,
                      option_ids: [parseInt(value)],
                    })
                  }
                  className="space-y-2"
                >
                  {options.map((option: any) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={option.id.toString()} />
                      <FormLabel className="font-normal cursor-pointer">
                        {option.text}
                      </FormLabel>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  {options.map((option: any) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        checked={
                          field.value?.option_ids?.includes(option.id) || false
                        }
                        onCheckedChange={(checked) => {
                          const current = field.value?.option_ids || [];
                          const newOptionIds = checked
                            ? [...current, option.id]
                            : current.filter((id: number) => id !== option.id);

                          field.onChange({
                            ...field.value,
                            option_ids: newOptionIds,
                          });
                        }}
                      />
                      <FormLabel className="font-normal cursor-pointer">
                        {option.text}
                      </FormLabel>
                    </div>
                  ))}
                </div>
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
