"use client"

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronDown, ChevronRight, Folder, FolderOpen, MinusCircle, PlusCircle, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePartValue, PART_TYPES, POSITION_TYPES } from "./constants";
import IdentificationFields from "./IdentificationFields";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers";

export default function PartSection({
    form,
    index,
    path,
    level,
    onRemove,
    onReactivate,
    onToggleExpand,
    isExpanded,
    onAddSubpart,
    expandedParts,
}: any) {
    const isRemoved = usePartValue<string | null>(form.control, `${path}.removed_date`, null);
    const hassub_parts = usePartValue<boolean>(form.control, `${path}.is_father`, false);
    const sub_parts = usePartValue<any[]>(form.control, `${path}.sub_parts`, []);
    const partType = usePartValue<string>(form.control, `${path}.type`, "");
    const partNumber = usePartValue<string>(form.control, `${path}.part_number`, "");
    const timeSinceNew = usePartValue(form.control, `${path}.time_since_new`, null);
    const timeSinceOverhaul = usePartValue(form.control, `${path}.time_since_overhaul`, null);
    const cyclesSinceNew = usePartValue(form.control, `${path}.cycles_since_new`, null);
    const cyclesSinceOverhaul = usePartValue(form.control, `${path}.cycles_since_overhaul`, null);

    const { selectedCompany } = useCompanyStore();
    const { data: manufacturers, isLoading: isManufacturersLoading } = useGetManufacturers(selectedCompany?.slug);

    const tsNotApplicable = timeSinceNew === null && timeSinceOverhaul === null;
    const csNotApplicable = cyclesSinceNew === null && cyclesSinceOverhaul === null;

    const toggleTSNotApplicable = (checked: boolean) => {
        if (checked) {
            form.setValue(`${path}.time_since_new`, null);
            form.setValue(`${path}.time_since_overhaul`, null);
        } else {
            form.setValue(`${path}.time_since_new`, 0);
            form.setValue(`${path}.time_since_overhaul`, 0);
        }
    };

    const toggleCSNotApplicable = (checked: boolean) => {
        if (checked) {
            form.setValue(`${path}.cycles_since_new`, null);
            form.setValue(`${path}.cycles_since_overhaul`, null);
        } else {
            form.setValue(`${path}.cycles_since_new`, 0);
            form.setValue(`${path}.cycles_since_overhaul`, 0);
        }
    };

    return (
        <Card className={`overflow-hidden ${level > 0 ? "ml-6" : ""} ${isRemoved ? "opacity-60 bg-muted/50" : ""}`}>
            <Collapsible open={isExpanded && !isRemoved} onOpenChange={() => !isRemoved && onToggleExpand(path)}>
                <div className="flex items-center justify-between p-4 bg-muted/30">
                    <div className="flex items-center gap-2">
                        <CollapsibleTrigger asChild disabled={!!isRemoved}>
                            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                                {isExpanded && !isRemoved ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                        </CollapsibleTrigger>

                        <div className="flex items-center gap-2">
                            {hassub_parts ? (
                                isExpanded && !isRemoved ? <FolderOpen className="h-4 w-4 text-blue-500" /> : <Folder className="h-4 w-4 text-blue-500" />
                            ) : (
                                <div className="h-4 w-4 rounded-full bg-primary/20"></div>
                            )}

                            <div className="flex flex-col">
                                <span className={`text-sm font-medium ${isRemoved ? "line-through text-muted-foreground" : ""}`}>
                                    {partType || `Parte ${index + 1}`}
                                    {partNumber && <Badge variant="outline" className="ml-2">{partNumber}</Badge>}
                                </span>
                                {isRemoved ? (
                                    <span className="text-[10px] text-destructive font-bold uppercase tracking-wider mt-0.5">Removida el: {isRemoved}</span>
                                ) : (
                                    <span className="text-xs text-muted-foreground">{level === 0 ? "Parte principal" : `Subparte ${index + 1}`}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isRemoved ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onReactivate(path)}
                                className="h-8 text-xs border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                            >
                                <RefreshCw size={14} className="mr-1" />
                                Reactivar {level === 0 && "Sistema"}
                            </Button>
                        ) : (
                            <>
                                {hassub_parts && sub_parts.length > 0 && (
                                    <Badge variant="secondary" className="mr-2">{sub_parts.length} subparte{sub_parts.length !== 1 ? 's' : ''}</Badge>
                                )}
                                <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(path)} className="h-8 w-8 text-destructive">
                                    <MinusCircle size={16} />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <CollapsibleContent>
                    <div className="p-4 space-y-4 border-t">
                        <div className="grid grid-cols-1 gap-4">
                            <FormField
                                control={form.control}
                                name={`${path}.ata_chapter`}
                                render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel>ATA</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: 90" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* 2da fila: Tipo + Número de parte */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name={`${path}.type`}
                                render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel>Tipo</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona un tipo de parte" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {PART_TYPES.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
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
                                name={`${path}.part_number`}
                                render={({ field }: any) => (
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

                        {/* Serial + Fabricante */}
                        <IdentificationFields form={form} path={path} />

                        {/* 3era fila: Orden + Posición */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name={`${path}.part_order`}
                                render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel>Orden de Parte</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-2 items-center">
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4].map((num) => (
                                                        <Button
                                                            key={num}
                                                            type="button"
                                                            variant={field.value === num ? "default" : "outline"}
                                                            className="w-10 h-10"
                                                            onClick={() => field.onChange(num)}
                                                        >
                                                            {num}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={`${path}.position`}
                                render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel>Posición</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona posición" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {POSITION_TYPES.map((pos) => (
                                                    <SelectItem key={pos.value} value={pos.value}>
                                                        {pos.label}
                                                    </SelectItem>
                                                ))}
                                                {field.value && !POSITION_TYPES.some((p) => p.value === field.value) && (
                                                    <SelectItem key={field.value} value={field.value}>{field.value}</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox checked={tsNotApplicable} onCheckedChange={(checked) => toggleTSNotApplicable(!!checked)} />
                            <FormLabel>No Aplica TSN / TSO</FormLabel>
                        </div>

                        {!tsNotApplicable && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name={`${path}.time_since_new`} render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel>TSN</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: 1500" {...field} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name={`${path}.time_since_overhaul`} render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel>TSO</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: 1500" {...field} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        )}

                        <div className="flex items-center space-x-2">
                            <Checkbox checked={csNotApplicable} onCheckedChange={(checked) => toggleCSNotApplicable(!!checked)} />
                            <FormLabel>No aplica (CSN / CSO)</FormLabel>
                        </div>

                        {!csNotApplicable && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name={`${path}.cycles_since_new`} render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel>CSN</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: 1500" {...field} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name={`${path}.cycles_since_overhaul`} render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel>CSO</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: 300" {...field} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name={`${path}.condition_type`} render={({ field }: any) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Condición</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
                                            <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="NEW" /></FormControl><FormLabel className="font-normal">Nueva</FormLabel></FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="OVERHAULED" /></FormControl><FormLabel className="font-normal">Reacondicionada</FormLabel></FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name={`${path}.is_father`} render={({ field }: any) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Esta parte contiene subpartes</FormLabel>
                                        <p className="text-xs text-muted-foreground">Marque si necesita agregar componentes dentro de esta parte</p>
                                    </div>
                                </FormItem>
                            )} />
                        </div>

                        {hassub_parts && (
                            <div className="pt-4 border-t">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-medium">Subpartes</h4>
                                    <Button type="button" variant="outline" size="sm" onClick={() => onAddSubpart(path)}>
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
                                                onReactivate={onReactivate}
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
                                            <Button type="button" variant="ghost" size="sm" onClick={() => onAddSubpart(path)} className="mt-2">
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
