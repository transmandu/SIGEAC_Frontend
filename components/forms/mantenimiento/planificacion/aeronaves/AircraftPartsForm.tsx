"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDown, ChevronRight, Folder, FolderOpen, Layers, Layers2, MinusCircle, PlusCircle } from "lucide-react"
import { useState } from "react"
import { Control, useFieldArray, useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { ScrollArea } from "../../../ui/scroll-area"

// Esquema recursivo para partes/subpartes
const PartSchema: any = z.object({
  part_name: z.string().min(1, "Nombre obligatorio").max(50),
  part_number: z.string().min(1, "Número obligatorio").regex(/^[A-Za-z0-9\-]+$/),
  total_flight_hours: z.number().min(0).max(100000).optional(),
  total_flight_cycles: z.number().min(0).max(50000).optional(),
  condition_type: z.enum(["NEW", "OVERHAULED"]),
  is_father: z.boolean().default(false),
  sub_parts: z.array(z.lazy(() => PartSchema)).optional()
});

const PartsFormSchema = z.object({
  parts: z.array(PartSchema).min(1)
});

type PartsFormType = z.infer<typeof PartsFormSchema>;

// Función auxiliar para obtener valores de forma segura
const usePartValue = <T,>(control: Control<PartsFormType>, path: string, defaultValue?: T): T => {
  return useWatch({
    control,
    name: path as any,
    defaultValue
  });
};

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

  const [expandedParts, setExpandedParts] = useState<Record<string, boolean>>({});

  const toggleExpand = (path: string) => {
    setExpandedParts(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const addSubpart = (partPath: string) => {
    const currentSubparts = form.getValues(`${partPath}.sub_parts` as any) || [];
    form.setValue(`${partPath}.sub_parts` as any, [
      ...currentSubparts,
      { condition_type: "NEW" }
    ]);

    // Expandir la parte padre al agregar una subparte
    if (!expandedParts[partPath]) {
      toggleExpand(partPath);
    }
  };

  const removeItem = (fullPath: string) => {
    const pathParts = fullPath.split('.');
    const indexToRemove = Number(pathParts.pop());
    const parentPath = pathParts.join('.') || 'parts';

    const currentArray = form.getValues(parentPath as any) || [];
    if (currentArray.length <= 1 && parentPath === 'parts') {
      toast({
        title: "Error",
        description: "Debe haber al menos una parte principal",
        variant: "destructive",
      });
      return;
    }

    form.setValue(parentPath as any, [
      ...currentArray.slice(0, indexToRemove),
      ...currentArray.slice(indexToRemove + 1)
    ]);

    // Limpiar el estado expandido para la parte eliminada
    setExpandedParts(prev => {
      const newState = { ...prev };
      delete newState[fullPath];
      return newState;
    });
  };



  const onSubmit = (data: PartsFormType) => {
    onNext(data);
  };

  // Expandir/contraer todas las partes
  const toggleAll = (expand: boolean) => {
    const newState: Record<string, boolean> = {};

    const processParts = (basePath: string, parts: any[]) => {
      parts.forEach((_, index) => {
        const currentPath = basePath ? `${basePath}.sub_parts.${index}` : `parts.${index}`;
        newState[currentPath] = expand;

        const subParts = form.getValues(`${currentPath}.sub_parts` as any) || [];
        if (subParts.length > 0) {
          processParts(currentPath, subParts);
        }
      });
    };

    processParts('', form.getValues().parts);
    setExpandedParts(newState);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Partes de Aeronave</h2>
          <div className="flex gap-2">
            <Button className="flex gap-2" type="button" variant="ghost" size="sm" onClick={() => toggleAll(true)}>
              <Layers2 className="size-4" /> Expandir Todo
            </Button>
            <Button className="flex gap-2" type="button" variant="ghost" size="sm" onClick={() => toggleAll(false)}>
              <Layers className="size-4" />Contraer Todo
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <ScrollArea className={fields.length > 2 ? "h-[500px]" : "h-auto"}>
              <div className="p-4 space-y-4">
                {fields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Folder className="mx-auto h-12 w-12 mb-2 opacity-50" />
                    <p>No hay partes agregadas</p>
                  </div>
                ) : (
                  fields.map((field, index) => (
                    <PartSection
                      key={field.id}
                      form={form}
                      index={index}
                      path={`parts.${index}`}
                      level={0}
                      onRemove={removeItem}
                      onToggleExpand={toggleExpand}
                      isExpanded={expandedParts[`parts.${index}`] || false}
                      onAddSubpart={addSubpart}
                      expandedParts={expandedParts}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

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

function PartSection({ form, index, path, level, onRemove, onToggleExpand, isExpanded, onAddSubpart, expandedParts }: {
  form: any;
  index: number;
  path: string;
  level: number;
  onRemove: (fullPath: string) => void;
  onToggleExpand: (path: string) => void;
  isExpanded: boolean;
  onAddSubpart: (path: string) => void;
  expandedParts: Record<string, boolean>;
}) {
  // Usar la función auxiliar para obtener los valores de forma segura
  const hassub_parts = usePartValue<boolean>(form.control, `${path}.is_father`, false);
  const sub_parts = usePartValue<any[]>(form.control, `${path}.sub_parts`, []);
  const partName = usePartValue<string>(form.control, `${path}.part_name`, "");
  const partNumber = usePartValue<string>(form.control, `${path}.part_number`, "");

  return (
    <Card className={`overflow-hidden ${level > 0 ? 'ml-6' : ''}`}>
      <Collapsible open={isExpanded} onOpenChange={() => onToggleExpand(path)}>
        <div className="flex items-center justify-between p-4 bg-muted/30">
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>

            <div className="flex items-center gap-2">
              {hassub_parts ? (
                isExpanded ? <FolderOpen className="h-4 w-4 text-blue-500" /> : <Folder className="h-4 w-4 text-blue-500" />
              ) : (
                <div className="h-4 w-4 rounded-full bg-primary/20"></div>
              )}

              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {partName || `Parte ${index + 1}`}
                  {partNumber && <Badge variant="outline" className="ml-2">{partNumber}</Badge>}
                </span>
                <span className="text-xs text-muted-foreground">
                  {level === 0 ? 'Parte principal' : `Subparte ${index + 1}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hassub_parts && sub_parts.length > 0 && (
              <Badge variant="secondary" className="mr-2">
                {sub_parts.length} subparte{sub_parts.length !== 1 ? 's' : ''}
              </Badge>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(path)}
              className="h-8 w-8 text-destructive"
            >
              <MinusCircle size={16} />
            </Button>
          </div>
        </div>

        <CollapsibleContent>
          <div className="p-4 space-y-4 border-t">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`${path}.part_name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la parte</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Motor, Ala, Tren de aterrizaje" {...field} />
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
                      <Input placeholder="Ej: ENG-001, WNG-202" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Horas y Ciclos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`${path}.total_flight_hours`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horas de Vuelo (opcional)</FormLabel>
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
                name={`${path}.total_flight_cycles`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciclos (opcional)</FormLabel>
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

            {/* Condición y Subpartes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        className="flex flex-col space-y-1"
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
                          <FormLabel className="font-normal">Reacondicionada</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`${path}.is_father`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Esta parte contiene subpartes</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Marque si necesita agregar componentes dentro de esta parte
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Subpartes */}
            {hassub_parts && (
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Subpartes</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onAddSubpart(path)}
                  >
                    <PlusCircle className="size-3.5 mr-2" /> Agregar Subparte
                  </Button>
                </div>

                <div className="space-y-3">
                  {sub_parts.map((_: any, subIndex: number) => {
                    const subPartPath = `${path}.sub_parts.${subIndex}`;
                    return (
                      <PartSection
                        key={subIndex}
                        form={form}
                        index={subIndex}
                        path={subPartPath}
                        level={level + 1}
                        onRemove={onRemove}
                        onToggleExpand={onToggleExpand}
                        isExpanded={expandedParts[subPartPath] || false}
                        onAddSubpart={onAddSubpart}
                        expandedParts={expandedParts}
                      />
                    );
                  })}

                  {sub_parts.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      <p>No hay subpartes agregadas</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddSubpart(path)}
                        className="mt-2"
                      >
                        <PlusCircle className="size-3.5 mr-2" /> Agregar la primera subparte
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}