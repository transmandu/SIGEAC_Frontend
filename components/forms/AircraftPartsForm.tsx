"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDown, ChevronRight, MinusCircle, PlusCircle } from "lucide-react"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { ScrollArea } from "../ui/scroll-area"

// Esquema recursivo para partes/subpartes
const PartSchema: any = z.object({
  part_name: z.string().min(1, "Nombre obligatorio").max(50),
  part_number: z.string().min(1, "Número obligatorio").regex(/^[A-Za-z0-9\-]+$/),
  part_hours: z.number().min(0).max(100000).optional(),
  part_cycles: z.number().min(0).max(50000).optional(),
  condition_type: z.enum(["NEW", "OVERHAULED"]),
  is_father: z.boolean().default(false),
  sub_parts: z.array(z.lazy(() => PartSchema)).optional()
});

const PartsFormSchema = z.object({
  parts: z.array(PartSchema).min(1)
});

type PartsFormType = z.infer<typeof PartsFormSchema>;

export function AircraftPartsInfoForm({ onNext, onBack, initialData }: {
  onNext: (data: PartsFormType) => void,
  onBack: () => void,
  initialData?: PartsFormType
}) {
  const { toast } = useToast();
  const form = useForm<PartsFormType>({
    resolver: zodResolver(PartsFormSchema),
    defaultValues: initialData || { parts: [{ condition_type: "NEW" }] }
  });

  const { fields, append } = useFieldArray({
    control: form.control,
    name: "parts"
  });

  const [expandedParts, setExpandedParts] = useState<Record<number, boolean>>({});

  const toggleExpand = (index: number) => {
    setExpandedParts(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const addSubpart = (partPath: string) => {
    form.setValue(`${partPath}.sub_parts` as any, [
      ...(form.getValues(`${partPath}.sub_parts` as any) || []),
      { condition_type: "NEW" }
    ]);
  };

  const removeItem = (fullPath: string) => {
    const pathParts = fullPath.split('.');
    const indexToRemove = Number(pathParts.pop());
    const parentPath = pathParts.join('.') || 'parts'; // Default to 'parts' if empty

    const currentArray = form.getValues(parentPath as any) || [];
    if (currentArray.length <= 1) {
      toast({
        title: "Error",
        description: "Debe haber al menos un elemento",
        variant: "destructive",
      });
      return;
    }

    form.setValue(parentPath as any, [
      ...currentArray.slice(0, indexToRemove),
      ...currentArray.slice(indexToRemove + 1)
    ]);
  };

  const onSubmit = (data: PartsFormType) => {
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ScrollArea className={fields.length > 3 ? "h-[530px]" : "h-[360px]"}>
          {fields.map((field, index) => (
            <PartSection
              key={field.id}
              form={form}
              index={index}
              path={`parts.${index}`}
              onRemove={removeItem}
              onToggleExpand={() => toggleExpand(index)}
              isExpanded={expandedParts[index]}
              onAddSubpart={addSubpart}
            />
          ))}
        </ScrollArea>

        <div className="flex flex-col space-y-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ condition_type: "NEW" })}
            className="self-start"
          >
            <PlusCircle className="size-4 mr-2" />
            Agregar Parte Principal
          </Button>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Anterior
            </Button>
            <Button type="submit">Siguiente</Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

function PartSection({ form, index, path, onRemove, onToggleExpand, isExpanded, onAddSubpart }: {
  form: any;
  index: number;
  path: string;
  onRemove: (fullPath: string) => void;
  onToggleExpand: () => void;
  isExpanded: boolean;
  onAddSubpart: (path: string) => void;
}) {
  const hassub_parts = form.watch(`${path}.is_father`);
  const sub_parts = form.watch(`${path}.sub_parts`) || [];

  return (
    <div className="mb-6 border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <button type="button" onClick={onToggleExpand} className="text-muted-foreground">
            {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
          <h3 className="font-medium">Parte {index + 1}</h3>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(path)} // path será "parts.0" o "parts.0.sub_parts.1", etc.
          className="text-destructive hover:text-destructive"
        >
          <MinusCircle className="size-4" />
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-4 pl-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`${path}.part_name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Motor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${path}.part_number`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Parte</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: ENG-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name={`${path}.condition_type`}
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Condición</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="NEW" />
                      </FormControl>
                      <FormLabel className="font-normal">Nueva</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="OVERHAULED" />
                      </FormControl>
                      <FormLabel className="font-normal">Overhauled</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`${path}.part_hours`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horas de Vuelo</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ej: 1500"
                      {...field}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${path}.part_cycles`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciclos</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ej: 300"
                      {...field}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name={`${path}.is_father`}
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mt-0">Contiene subpartes</FormLabel>
              </FormItem>
            )}
          />

          {hassub_parts && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200">
              <h4 className="font-medium text-sm mb-3">Subpartes</h4>

              {hassub_parts && sub_parts.map((_: any, subIndex: number) => (
                <div key={subIndex} className="mt-4 pl-4 border-l-2 border-gray-200">
                  <PartSection
                    form={form}
                    index={subIndex}
                    path={`${path}.sub_parts.${subIndex}`}
                    onRemove={onRemove} // Pasamos la misma función
                    onToggleExpand={() => { }}
                    isExpanded={true}
                    onAddSubpart={onAddSubpart}
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAddSubpart(path)}
                className="mt-2"
              >
                <PlusCircle className="size-3.5 mr-2" />
                Agregar Subparte
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
