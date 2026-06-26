"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, Hash, Layers, MinusCircle, PackagePlus, Plane, Plus, Ruler, Tag } from "lucide-react"
import { useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Aircraft, Batch, Unit } from "@/types"
import type { RequisitionBatchForm } from "@/types/purchase"
import { CreateBatchForm } from "@/components/forms/mantenimiento/almacen/CreateBatchForm"
import { ArticleImageAttachment } from "./ArticleImageAttachment"
import { RequiredIndicator } from "./RequiredIndicator"

interface BatchArticlesSectionProps {
  form: UseFormReturn<any>;
  batches?: Batch[];
  isBatchesLoading: boolean;
  selectedBatches: RequisitionBatchForm[];
  filteredBatches: Batch[];
  batchSearch: string;
  setBatchSearch: (v: string) => void;
  units?: Unit[];
  isUnitsLoading: boolean;
  aircrafts?: Aircraft[];
  isAircraftsLoading: boolean;
  filteredAircrafts: Aircraft[];
  aircraftSearch: string;
  setAircraftSearch: (v: string) => void;
  handleBatchSelect: (batchName: string, batchId: string, batch_category: string) => void;
  handleBatchArticleChange: (batchId: string, index: number, field: string, value: string | number | File | undefined) => void;
  addBatchArticle: (batchId: string) => void;
  removeBatchArticle: (batchId: string, articleIndex: number) => void;
  removeBatch: (batchId: string) => void;
  enableCreateBatch?: boolean;
  onBatchCreated?: (batchName: string) => void;
  size?: "default" | "lg";
}

export function BatchArticlesSection({
  form,
  batches,
  isBatchesLoading,
  selectedBatches,
  filteredBatches,
  batchSearch,
  setBatchSearch,
  units,
  isUnitsLoading,
  aircrafts,
  isAircraftsLoading,
  filteredAircrafts,
  aircraftSearch,
  setAircraftSearch,
  handleBatchSelect,
  handleBatchArticleChange,
  addBatchArticle,
  removeBatchArticle,
  removeBatch,
  enableCreateBatch = false,
  onBatchCreated,
  size = "default",
}: BatchArticlesSectionProps) {
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const isLg = size === "lg";
  const labelTextClass = cn(
    isLg ? "text-sm text-foreground/80" : "text-[10px] text-muted-foreground",
    "whitespace-nowrap"
  );
  const priorityColClass = isLg ? "w-40" : "w-28";

  return (
    <FormField
      control={form.control}
      name="articles"
      render={() => (
        <FormItem className="flex flex-col">
          <div className="flex gap-4 items-end">
            <div className="flex gap-4 items-end w-full">
              <FormItem className="flex flex-col w-[200px]">
                <FormLabel
                  className="flex items-center gap-1.5 select-none"
                  onClick={(e) => e.preventDefault()}
                >
                  <Layers className="size-3.5 text-muted-foreground" />
                  Lote/Renglón
                </FormLabel>
                <div className="flex items-center gap-1.5">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={isBatchesLoading}
                        role="combobox"
                        className={cn(
                          "justify-between w-full",
                          selectedBatches.length === 0 && "text-muted-foreground"
                        )}
                      >
                        {selectedBatches.length > 0
                          ? `${selectedBatches.length} reng. seleccionados`
                          : "Selec. un renglón..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" matchTriggerWidth>
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Buscar..."
                          value={batchSearch}
                          onValueChange={setBatchSearch}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {batchSearch ? "No existen renglones..." : "Escriba para buscar..."}
                          </CommandEmpty>
                          <CommandGroup>
                            {filteredBatches.map((batch) => (
                              <CommandItem
                                key={batch.name}
                                value={`${batch.name} ${batch.category ?? ""}`}
                                onSelect={() => handleBatchSelect(batch.name, batch.id.toString(), batch.category ?? "")}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedBatches.some((b) => b.batch === batch.id.toString())
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {batch.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {enableCreateBatch && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          type="button"
                          size="icon"
                          onClick={() => setIsCreateBatchOpen(true)}
                          className="text-muted-foreground hover:text-foreground shrink-0"
                        >
                          <PackagePlus className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs px-2 py-1">
                        <p>Crear nuevo renglón</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </FormItem>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <ScrollArea className={cn(selectedBatches.length > 1 ? "h-[280px]" : "")}>
              {selectedBatches.map((batch) => (
                <div
                  key={batch.batch}
                  className="rounded-md border bg-muted/30 p-3 mb-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm select-none">{batch.batch_name}</h4>
                      {(() => {
                        const category = batches?.find((b) => b.id.toString() === batch.batch)?.category;
                        return category ? (
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-300 select-none dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600">
                            {category}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          type="button"
                          size="icon"
                          onClick={() => removeBatch(batch.batch)}
                          className="h-6 w-6 hover:text-destructive"
                        >
                          <MinusCircle className="size-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs px-2 py-1">
                        <p>Quitar renglón</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <ScrollArea className={cn(batch.batch_articles.length > 1 ? "h-[260px]" : "")}>
                    {batch.batch_articles.map((article, index) => {
                      const selectedAircraft = aircrafts?.find((a) => a.id.toString() === article.aircraft_id);
                      return (
                        <div key={index} className="flex items-center gap-2 mt-1.5 rounded-md border bg-background/60 p-2">
                          <div className="flex-1 space-y-2">
                            {/* Row 1: Part Number, Quantity, Unit */}
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col gap-1 flex-1">
                                <label className={cn("flex items-center gap-1 font-medium select-none", labelTextClass)}>
                                  <Hash className="size-3" />
                                  P/N
                                  <RequiredIndicator />
                                </label>
                                <Input
                                  placeholder="Ej: 123-456-789"
                                  className="text-xs h-8"
                                  onChange={(e) => handleBatchArticleChange(batch.batch, index, "part_number", e.target.value)}
                                />
                              </div>

                              <div className="flex flex-col gap-1 w-28 shrink-0">
                                <label className={cn("flex items-center gap-1 font-medium select-none", labelTextClass)}>
                                  <Tag className="size-3" />
                                  Cant.
                                  <RequiredIndicator />
                                </label>
                                <Input
                                  placeholder="Ej: 4"
                                  min="0"
                                  step="0.1"
                                  inputMode="decimal"
                                  className="text-xs h-8"
                                  onChange={(e) => handleBatchArticleChange(batch.batch, index, "quantity", Number(e.target.value))}
                                />
                              </div>

                              <div className="flex flex-col gap-1 w-36 shrink-0">
                                <label className={cn("flex items-center gap-1 font-medium select-none", labelTextClass)}>
                                  <Ruler className="size-3" />
                                  Unidad.
                                  <RequiredIndicator />
                                </label>
                                <Select
                                  value={article.unit}
                                  onValueChange={(value) => handleBatchArticleChange(batch.batch, index, "unit", value)}
                                  disabled={isUnitsLoading}
                                >
                                  <SelectTrigger className={cn("text-xs h-8", !article.unit && "text-muted-foreground")}>
                                    <SelectValue placeholder="Ej: Unidad" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {units?.map((secU) => (
                                      <SelectItem key={secU.id} value={secU.id.toString()}>
                                        {secU.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Row 2: Alternative Part Number, Aircraft, Priority */}
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col gap-1 flex-1">
                                <label className={cn("flex items-center gap-1 font-medium select-none", labelTextClass)}>
                                  <Hash className="size-3" />
                                  P/N Alterno.
                                </label>
                                <Input
                                  placeholder="Ej: ABC-123-X Opcional..."
                                  className="text-xs h-8"
                                  onChange={(e) => handleBatchArticleChange(batch.batch, index, "alt_part_number", e.target.value)}
                                />
                              </div>

                              <div className={cn("flex flex-col gap-1 shrink-0", priorityColClass)}>
                                <label className={cn("flex items-center gap-1 font-medium select-none", labelTextClass)}>
                                  <Tag className="size-3" />
                                  Prioridad.
                                  <RequiredIndicator />
                                </label>
                                <Select
                                  value={article.priority || "MEDIUM"}
                                  onValueChange={(value: "HIGH" | "MEDIUM" | "LOW") =>
                                    handleBatchArticleChange(batch.batch, index, "priority", value)
                                  }
                                >
                                  <SelectTrigger className="text-xs h-8">
                                    <SelectValue placeholder="Ej: Media" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="HIGH">Alta</SelectItem>
                                    <SelectItem value="MEDIUM">Media</SelectItem>
                                    <SelectItem value="LOW">Baja</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex flex-col gap-1 w-36 shrink-0">
                                <label className={cn("flex items-center gap-1 font-medium select-none", labelTextClass)}>
                                  <Plane className="size-3" />
                                  Aeronave.
                                </label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      type="button"
                                      disabled={isAircraftsLoading}
                                      variant="outline"
                                      role="combobox"
                                      className={cn(
                                        "w-full justify-between text-xs h-8 px-2 font-normal text-muted-foreground",
                                        selectedAircraft && "text-foreground"
                                      )}
                                    >
                                      <span className="truncate">
                                        {selectedAircraft ? selectedAircraft.acronym : "Opcional"}
                                      </span>
                                      <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="p-0" matchTriggerWidth>
                                    <Command shouldFilter={false}>
                                      <CommandInput
                                        placeholder="Busque una aeronave..."
                                        value={aircraftSearch}
                                        onValueChange={setAircraftSearch}
                                      />
                                      <CommandList>
                                        <CommandEmpty className="text-sm p-2 text-center text-muted-foreground">
                                          {aircraftSearch ? "No se ha encontrado ninguna aeronave." : "Escriba para buscar..."}
                                        </CommandEmpty>
                                        {article.aircraft_id && (
                                          <CommandGroup>
                                            <CommandItem
                                              value="clear"
                                              onSelect={() => handleBatchArticleChange(batch.batch, index, "aircraft_id", undefined)}
                                            >
                                              Sin aeronave
                                            </CommandItem>
                                          </CommandGroup>
                                        )}
                                        <CommandGroup>
                                          {filteredAircrafts.map((aircraft) => (
                                            <CommandItem
                                              value={`${aircraft.id} ${aircraft.acronym}`}
                                              key={aircraft.id}
                                              onSelect={(currentValue: string) => {
                                                const id = currentValue.split(" ")[0];
                                                handleBatchArticleChange(batch.batch, index, "aircraft_id", id);
                                              }}
                                            >
                                              <Check
                                                className={cn(
                                                  "mr-2 h-4 w-4",
                                                  aircraft.id.toString() === article.aircraft_id ? "opacity-100" : "opacity-0"
                                                )}
                                              />
                                              {aircraft.acronym}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center gap-1 shrink-0 self-stretch ml-2 pl-2">
                            <ArticleImageAttachment
                              article={article}
                              onChangeImage={(file) => handleBatchArticleChange(batch.batch, index, "image", file)}
                            />

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  type="button"
                                  size="icon"
                                  onClick={() => removeBatchArticle(batch.batch, index)}
                                  className="h-7 w-7 hover:text-destructive shrink-0"
                                >
                                  <MinusCircle className="size-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs px-2 py-1">
                                <p>Quitar artículo</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      );
                    })}
                  </ScrollArea>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addBatchArticle(batch.batch)}
                    className="mt-2 h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                  >
                    <Plus className="size-3" />
                    Agregar artículo
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </div>
          <FormMessage />

          {enableCreateBatch && (
            <Dialog open={isCreateBatchOpen} onOpenChange={setIsCreateBatchOpen}>
              <DialogContent className="w-full max-w-2xl">
                <DialogHeader className="px-4">
                  <DialogTitle>Crear Renglón</DialogTitle>
                  <DialogDescription>
                    Cree un nuevo renglón para utilizarlo en esta requisición.
                  </DialogDescription>
                </DialogHeader>
                <CreateBatchForm
                  onClose={() => setIsCreateBatchOpen(false)}
                  onSuccess={(batchName) => {
                    setIsCreateBatchOpen(false);
                    onBatchCreated?.(batchName);
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </FormItem>
      )}
    />
  );
}