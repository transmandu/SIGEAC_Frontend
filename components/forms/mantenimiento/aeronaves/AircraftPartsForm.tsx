"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDown, ChevronRight, MinusCircle, PlusCircle, Cog, Zap, Fan, Plane, Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"
import { useFieldArray, useForm, UseFormReturn, FieldArrayWithId } from "react-hook-form"
import { z } from "zod"
import { ScrollArea } from "../../../ui/scroll-area"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../../ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover"
import { cn } from "@/lib/utils"
import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers"
import { useCompanyStore } from "@/stores/CompanyStore"
import { ManufacturerCombobox } from "./ManufacturerCombobox"

// Función para formatear números según el separador decimal detectado
const fmtNumber = (n: unknown): string => {
  if (n == null || n === "") return ""
  
  const str = String(n).trim()
  if (!str) return ""
  
  const lastDot = str.lastIndexOf(".")
  const lastComma = str.lastIndexOf(",")
  
  // Determinar locale y parsear según posición de separadores
  const isEuropean = lastComma > lastDot || (lastComma !== -1 && lastDot === -1)
  const num = isEuropean 
    ? Number(str.replace(/\./g, "").replace(",", "."))
    : Number(str.replace(/,/g, ""))
  
  if (isNaN(num)) return ""
  
  return num.toLocaleString(isEuropean ? "de-DE" : "en-US", { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })
}

// Tipos de categoría para las partes
export const PART_CATEGORIES = {
  ENGINE: "Fuentes de Poder",
  APU: "APU",
  PROPELLER: "Hélice"
} as const;

export type PartCategory = keyof typeof PART_CATEGORIES;

// Iconos y colores para cada categoría
const CATEGORY_CONFIG = {
  ENGINE: {
    icon: Cog,
    colorName: "blue" as const
  },
  APU: {
    icon: Zap,
    colorName: "amber" as const
  },
  PROPELLER: {
    icon: Fan,
    colorName: "green" as const
  }
} as const;

// Helper para generar clases de Tailwind dinámicamente
const getColorClasses = (color: "blue" | "amber" | "green") => ({
  color: `text-${color}-600 dark:text-${color}-400`,
  bgColor: `bg-${color}-50 dark:bg-${color}-950/30`,
  borderColor: `border-${color}-200 dark:border-${color}-800`,
  hoverBg: `hover:bg-${color}-100 dark:hover:bg-${color}-900/40`
});

// Esquema recursivo para partes/subpartes
const PartSchema: any = z.object({
  category: z.enum(["ENGINE", "APU", "PROPELLER"]).optional(), // Solo para frontend
  part_name: z.string().min(1, "Nombre obligatorio").max(50),
  part_number: z.string().min(1, "Número obligatorio").regex(/^[A-Za-z0-9\-]+$/),
  serial: z.string().min(1, "Serial obligatorio").max(50),
  manufacturer_id: z.string().min(1, "Fabricante obligatorio"),
  time_since_new: z.number().min(0).optional(),  // Time Since New
  time_since_overhaul: z.number().min(0).optional(),  // Time Since Overhaul
  cycles_since_new: z.number().int("Debe ser un número entero").min(0).optional(),  // Cycles Since New (entero)
  cycles_since_overhaul: z.number().int("Debe ser un número entero").min(0).optional(),  // Cycles Since Overhaul (entero)
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
  const { selectedCompany } = useCompanyStore();
  const { data: manufacturers } = useGetManufacturers(selectedCompany?.slug);
  
  const form = useForm<PartsFormType>({
    resolver: zodResolver(PartsFormSchema),
    defaultValues: initialData || { parts: [{ condition_type: "NEW" }] }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "parts"
  });

  const [expandedParts, setExpandedParts] = useState<Record<number, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    ENGINE: false,
    APU: false,
    PROPELLER: false
  });


  // Estado para rastrear qué categorías están marcadas como "No Aplica"
  const [notApplicableCategories, setNotApplicableCategories] = useState<Record<string, boolean>>({
    ENGINE: false,
    APU: false,
    PROPELLER: false
  });

  // Función para marcar/desmarcar una categoría como "No Aplica"
  const toggleNotApplicable = (category: string) => {
    setNotApplicableCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleExpand = (index: number) => {
    setExpandedParts(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  // Función para agregar parte con categoría específica
  const addPartWithCategory = (category: keyof typeof PART_CATEGORIES) => {
    append({ 
      condition_type: "NEW",
      category: category,
      is_father: false
    });
    // Expandir la categoría y la nueva parte
    setExpandedCategories(prev => ({ ...prev, [category]: true }));
    setExpandedParts(prev => ({ ...prev, [fields.length]: true }));
  };

  // Agrupar partes por categoría
  const partsByCategory = fields.reduce((acc, field, index) => {
    const category = form.watch(`parts.${index}.category`) || "uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push({ field, index });
    return acc;
  }, {} as Record<string, Array<{ field: FieldArrayWithId<PartsFormType, "parts">; index: number }>>);

  const addSubpart = (partPath: string) => {
    form.setValue(`${partPath}.sub_parts` as any, [
      ...(form.getValues(`${partPath}.sub_parts` as any) || []),
      { condition_type: "NEW" }
    ]);
  };

  const removeItem = (fullPath: string) => {
    const pathParts = fullPath.split('.');
    const indexToRemove = Number(pathParts.pop());
    const parentPath = pathParts.join('.') || 'parts';

    // Si es una subparte
    if (parentPath !== 'parts') {
    const currentArray = form.getValues(parentPath as any) || [];
      form.setValue(parentPath as any, [
        ...currentArray.slice(0, indexToRemove),
        ...currentArray.slice(indexToRemove + 1)
      ]);
      toast({
        title: "Eliminado",
        description: "La subparte ha sido eliminada correctamente",
      });
      return;
    }

    // Si es una parte principal, verificar que no sea la última
    if (fields.length <= 1) {
      toast({
        title: "No se puede eliminar",
        description: "Debe haber al menos una parte registrada en alguna categoría",
        variant: "destructive",
      });
      return;
    }

    // Eliminar la parte principal usando el método remove de useFieldArray
    remove(indexToRemove);
    
    toast({
      title: "Eliminado",
      description: "La parte ha sido eliminada correctamente",
    });
  };

  const onSubmit = (data: PartsFormType) => {
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-8">
        <ScrollArea className="h-[600px]">
          {/* Grid de Categorías - Diseño 2x2 Mejorado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 px-1">
            {Object.entries(PART_CATEGORIES).map(([categoryKey, categoryLabel]) => {
              const categoryParts = partsByCategory[categoryKey] || [];
              const hasContent = categoryParts.length > 0;
              const isNotApplicable = notApplicableCategories[categoryKey];
              const categoryConfig = CATEGORY_CONFIG[categoryKey as keyof typeof CATEGORY_CONFIG];
              const colorClasses = getColorClasses(categoryConfig.colorName);
              const Icon = categoryConfig.icon;

              return (
                <div 
                  key={categoryKey} 
                  className={`
                    relative rounded-xl transition-all duration-300 shadow-sm
                    ${isNotApplicable
                      ? 'border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 opacity-70'
                      : hasContent
                        ? `border-2 ${colorClasses.borderColor} ${colorClasses.bgColor} shadow-md hover:shadow-lg`
                        : `border-2 border-dashed ${colorClasses.borderColor} ${colorClasses.bgColor}`
                    }
                  `}
                >
                  {/* Header de la categoría */}
                  <div 
                    className={`
                      flex items-center justify-between p-4 cursor-pointer rounded-t-xl transition-colors
                      ${!isNotApplicable && colorClasses.hoverBg}
                    `}
                    onClick={() => !isNotApplicable && toggleCategory(categoryKey)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Icono de la categoría */}
                      <div className={`
                        p-2 rounded-lg transition-transform duration-300
                        ${isNotApplicable
                          ? 'bg-gray-200 dark:bg-gray-800'
                          : `${colorClasses.bgColor} ${expandedCategories[categoryKey] ? 'rotate-0' : ''}`
                        }
                      `}>
                        <Icon className={`size-5 ${isNotApplicable ? 'text-gray-400' : colorClasses.color}`} />
                      </div>

                      {/* Título y chevron */}
                      <div className="flex items-center gap-2">
                        {!isNotApplicable && (
                          <div className="transition-transform duration-200">
                            {expandedCategories[categoryKey] ? (
                              <ChevronDown className={`size-4 ${colorClasses.color}`} />
                            ) : (
                              <ChevronRight className={`size-4 ${colorClasses.color}`} />
                            )}
                          </div>
                        )}
                        <h3 className={`
                          font-semibold text-base transition-all
                          ${isNotApplicable
                            ? 'line-through text-gray-400 dark:text-gray-600'
                            : colorClasses.color
                          }
                        `}>
                          {categoryLabel}
                        </h3>
                      </div>
                    </div>

                    {/* Badge contador */}
                    <div className={`
                      flex items-center justify-center min-w-[2.5rem] h-8 px-3 rounded-full font-semibold text-sm
                      transition-all duration-200
                      ${isNotApplicable
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                        : hasContent
                          ? `${colorClasses.color} bg-white dark:bg-gray-950 ring-2 ring-current ring-opacity-20`
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                      }
                    `}>
                      {isNotApplicable ? 'N/A' : categoryParts.length}
                    </div>
                  </div>

                  {/* Divider */}
                  {!isNotApplicable && (
                    <div className={`h-px ${colorClasses.bgColor} opacity-60`} />
                  )}

                  {/* Contenido de la categoría */}
                  <div className="p-4 pt-3">
                    {/* Checkbox "No Aplica" */}
                    <div className={`
                      flex items-center space-x-2 mb-3 p-2 rounded-lg transition-colors
                      ${isNotApplicable ? 'bg-gray-100 dark:bg-gray-800/50' : 'hover:bg-white/50 dark:hover:bg-gray-900/30'}
                    `}>
                      <Checkbox
                        id={`not-applicable-${categoryKey}`}
                        checked={isNotApplicable}
                        onCheckedChange={() => toggleNotApplicable(categoryKey)}
                        className={isNotApplicable ? 'border-gray-400' : ''}
                      />
                      <label
                        htmlFor={`not-applicable-${categoryKey}`}
                        className={`
                          text-sm font-medium cursor-pointer select-none transition-colors
                          ${isNotApplicable ? 'text-gray-500' : 'text-gray-700 dark:text-gray-300'}
                        `}
                      >
                        No Aplica para esta aeronave
                      </label>
                    </div>

                    {!isNotApplicable && expandedCategories[categoryKey] && (
                      <>
                        {hasContent && (
                          <div className="space-y-3 mb-4">
                            {categoryParts.map(({ field, index }: { field: FieldArrayWithId<PartsFormType, "parts">; index: number }) => (
                              <PartSection
                                key={field.id}
                                form={form}
                                index={index}
                                path={`parts.${index}`}
                                onRemove={removeItem}
                                onToggleExpand={() => toggleExpand(index)}
                                isExpanded={expandedParts[index]}
                                onAddSubpart={addSubpart}
                                manufacturers={manufacturers}
                              />
                            ))}
                          </div>
                        )}

                        {!hasContent && (
                          <div className="text-center py-6 mb-3">
                            <div className={`inline-flex p-3 rounded-full ${colorClasses.bgColor} mb-2`}>
                              <Icon className={`size-6 ${colorClasses.color} opacity-40`} />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              No hay {categoryLabel.toLowerCase()}s registrados
                            </p>
                          </div>
                        )}

                        {/* Botón para agregar parte */}
                         <Button
                           type="button"
                           variant="outline"
                               size="sm"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 addPartWithCategory(categoryKey as keyof typeof PART_CATEGORIES);
                               }}
                               className={`
                                 w-full transition-all duration-200 font-medium
                                 ${colorClasses.borderColor} ${colorClasses.hoverBg}
                                 hover:shadow-md
                               `}
                             >
                               <PlusCircle className={`size-4 mr-2 ${colorClasses.color}`} />
                               <span className={colorClasses.color}>Agregar {categoryLabel}</span>
                           </Button>
                      </>
                    )}

                    {isNotApplicable && (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic flex items-center justify-center gap-2">
                          <span className="text-lg">✓</span>
                          Esta categoría no aplica
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Partes sin categoría */}
          {partsByCategory["uncategorized"] && partsByCategory["uncategorized"].length > 0 && (
            <div className="border-2 border-dashed border-yellow-400 dark:border-yellow-600 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950/20">
              <h3 className="font-semibold text-base mb-3 text-yellow-800 dark:text-yellow-200">
                ⚠️ Partes Sin Categoría Asignada
              </h3>
              <div className="space-y-2">
                {partsByCategory["uncategorized"].map(({ field, index }: { field: FieldArrayWithId<PartsFormType, "parts">; index: number }) => (
                  <PartSection
                    key={field.id}
                    form={form}
                    index={index}
                    path={`parts.${index}`}
                    onRemove={removeItem}
                    onToggleExpand={() => toggleExpand(index)}
                    isExpanded={expandedParts[index]}
                    onAddSubpart={addSubpart}
                    manufacturers={manufacturers}
                  />
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

          <div className="flex justify-between pt-8 mt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Anterior
            </Button>
            <Button type="submit">Siguiente</Button>
        </div>
      </form>
    </Form>
  );
}

function PartSection({ form, index, path, onRemove, onToggleExpand, isExpanded, onAddSubpart, manufacturers }: {
  form: UseFormReturn<PartsFormType>;
  index: number;
  path: string;
  onRemove: (fullPath: string) => void;
  onToggleExpand: () => void;
  isExpanded: boolean;
  onAddSubpart: (path: string) => void;
  manufacturers?: any[];
}) {
  const hassub_parts = form.watch(`${path}.is_father` as `parts.${number}.is_father`);
  const sub_parts = form.watch(`${path}.sub_parts` as `parts.${number}.sub_parts`) || [];
  const category = form.watch(`${path}.category` as `parts.${number}.category`);

  return (
    <div className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <button type="button" onClick={onToggleExpand} className="text-muted-foreground">
            {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
          <h3 className="font-medium">
            Parte {index + 1}
            {category && <span className="text-muted-foreground ml-2">({PART_CATEGORIES[category as keyof typeof PART_CATEGORIES]})</span>}
          </h3>
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
            {/* Usamos 'as any' para paths dinámicos de subpartes - TypeScript no puede inferir paths recursivos */}
            <FormField
              control={form.control}
              name={`${path}.part_name` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Motor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${path}.part_number` as any}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <FormField
              control={form.control}
              name={`${path}.serial` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: PCE-PC0444" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${path}.manufacturer_id` as any}
              render={({ field }) => (
                <ManufacturerCombobox
                  value={field.value}
                  onChange={(value) => form.setValue(`${path}.manufacturer_id` as any, value)}
                  manufacturers={manufacturers}
                  label="Marca"
                  placeholder="Seleccionar o crear marca..."
                  filterType={category || "GENERAL"}
                  showTypeSelector={true}
                />
              )}
            />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <FormField
              control={form.control}
              name={`${path}.time_since_new` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TSN (Time Since New)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Ej: 15377.50"
                      value={field.value !== undefined ? (typeof field.value === 'number' ? fmtNumber(field.value) : String(field.value)) : ""}
                      onChange={e => {
                        if (e.target.value === "") {
                          field.onChange(undefined);
                          return;
                        }
                        // Permitir escribir libremente, solo filtrar caracteres no válidos
                        const value = e.target.value.replace(/[^\d.,]/g, '');
                        field.onChange(value);
                      }}
                      onBlur={(e) => {
                        if (e.target.value === "") {
                          field.onChange(undefined);
                          return;
                        }
                        
                        // Detectar formato y normalizar correctamente
                        const value = e.target.value;
                        const lastDot = value.lastIndexOf('.');
                        const lastComma = value.lastIndexOf(',');
                        
                        let normalized: string;
                        if (lastComma > lastDot) {
                          // Formato europeo: 1.234,50 → eliminar puntos, cambiar coma por punto
                          normalized = value.replace(/\./g, "").replace(",", ".");
                        } else {
                          // Formato US: 1,234.50 → eliminar comas, mantener punto
                          normalized = value.replace(/,/g, "");
                        }
                        
                        const num = parseFloat(normalized);
                        
                        if (!isNaN(num)) {
                          // Redondear a 2 decimales y guardar como número
                          const rounded = Math.round(num * 100) / 100;
                          field.onChange(rounded);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${path}.time_since_overhaul` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TSO (Time Since Overhaul)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Ej: 2496.80"
                      value={field.value !== undefined ? (typeof field.value === 'number' ? fmtNumber(field.value) : String(field.value)) : ""}
                      onChange={e => {
                        if (e.target.value === "") {
                          field.onChange(undefined);
                          return;
                        }
                        // Permitir escribir libremente, solo filtrar caracteres no válidos
                        const value = e.target.value.replace(/[^\d.,]/g, '');
                        field.onChange(value);
                      }}
                      onBlur={(e) => {
                        if (e.target.value === "") {
                          field.onChange(undefined);
                          return;
                        }
                        
                        // Detectar formato y normalizar correctamente
                        const value = e.target.value;
                        const lastDot = value.lastIndexOf('.');
                        const lastComma = value.lastIndexOf(',');
                        
                        let normalized: string;
                        if (lastComma > lastDot) {
                          // Formato europeo: 1.234,50 → eliminar puntos, cambiar coma por punto
                          normalized = value.replace(/\./g, "").replace(",", ".");
                        } else {
                          // Formato US: 1,234.50 → eliminar comas, mantener punto
                          normalized = value.replace(/,/g, "");
                        }
                        
                        const num = parseFloat(normalized);
                        
                        if (!isNaN(num)) {
                          // Redondear a 2 decimales y guardar como número
                          const rounded = Math.round(num * 100) / 100;
                          field.onChange(rounded);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <FormField
              control={form.control}
              name={`${path}.cycles_since_new` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CSN (Cycles Since New)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="Ej: 21228"
                      {...field}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      value={field.value ?? ""}
                      onKeyDown={(e) => {
                        // Prevenir números negativos y decimales
                        if (e.key === '-' || e.key === '.' || e.key === ',') {
                          e.preventDefault();
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${path}.cycles_since_overhaul` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CSO (Cycles Since Overhaul)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="Ej: 3865"
                      {...field}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      value={field.value ?? ""}
                      onKeyDown={(e) => {
                        // Prevenir números negativos y decimales
                        if (e.key === '-' || e.key === '.' || e.key === ',') {
                          e.preventDefault();
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-6">
            <FormField
              control={form.control}
              name={`${path}.is_father` as any}
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
          </div>

          {hassub_parts && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200">
              <h4 className="font-medium text-sm mb-3">Subpartes</h4>

              {hassub_parts && sub_parts.map((_: unknown, subIndex: number) => (
                <div key={subIndex} className="mt-4 pl-4 border-l-2 border-gray-200">
                  <PartSection
                    form={form}
                    index={subIndex}
                    path={`${path}.sub_parts.${subIndex}`}
                    onRemove={onRemove} // Pasamos la misma función
                    onToggleExpand={() => { }}
                    isExpanded={true}
                    onAddSubpart={onAddSubpart}
                    manufacturers={manufacturers}
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
