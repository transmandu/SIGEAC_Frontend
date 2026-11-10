"use client";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Boxes,
  Check,
  ChevronsUpDown,
  MinusCircle,
  PackagePlus,
  Package,
  Plus,
} from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AeronauticalAircraft, Batch, Unit } from "@/types";
import type { RequisitionBatchForm } from "@/types/purchase";
import type { BatchWithArticles } from "@/hooks/mantenimiento/almacen/renglones/useSearchBatchesWithArticles";
import { CreateBatchForm } from "@/components/forms/mantenimiento/almacen/CreateBatchForm";
import { ArticleDocumentTypesAttachment } from "./ArticleDocumentTypesAttachment";
import { ArticleImageAttachment } from "./ArticleImageAttachment";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import { SearchableSelect } from "@/components/misc/SearchableSelect";
import { useCanManageCatalog } from "@/hooks/helpers/useCanManageCatalog";
import {
  FieldLabel,
  RequisitionSection,
  requisitionIconButtonClass,
  requisitionTriggerClass,
  rowFieldClass,
  rowTriggerClass,
} from "./RequisitionSection";
import { PriorityChoice } from "./PriorityChoice";
import { labelClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";

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
  aircrafts?: AeronauticalAircraft[];
  isAircraftsLoading: boolean;
  filteredAircrafts: AeronauticalAircraft[];
  aircraftSearch: string;
  setAircraftSearch: (v: string) => void;
  handleBatchSelect: (
    batchName: string,
    batchId: string,
    batch_category: string,
  ) => void;
  handleBatchArticleChange: (
    batchId: string,
    index: number,
    field: string,
    value: string | number | number[] | File | undefined,
  ) => void;
  addBatchArticle: (batchId: string) => void;
  removeBatchArticle: (batchId: string, articleIndex: number) => void;
  removeBatch: (batchId: string) => void;
  enableCreateBatch?: boolean;
  onBatchCreated?: (batchName: string) => void;
  size?: "default" | "lg";
  // Part number selector: finds an article by part_number/alt_part_number and
  // loads its associated batch, prefilling the article row with its data.
  filteredArticleResults?: BatchWithArticles[];
  isArticleResultsLoading?: boolean;
  articleSearch?: string;
  setArticleSearch?: (v: string) => void;
  handleArticleSelect?: (
    batch: BatchWithArticles["batch"],
    article: BatchWithArticles["articles"][number],
  ) => void;
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
  filteredArticleResults,
  isArticleResultsLoading = false,
  articleSearch = "",
  setArticleSearch,
  handleArticleSelect,
}: BatchArticlesSectionProps) {
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  // Crear renglones es de almacén: sin ese rol no se ofrece, aunque el formulario lo habilite.
  const canCreateBatch = useCanManageCatalog("batches") && enableCreateBatch;
  const isLg = size === "lg";
  const labelTextClass = cn(labelClass, "whitespace-nowrap");
  const priorityColClass = isLg ? "sm:w-40" : "sm:w-28";

  // Refleja la regla de zod: cada artículo necesita al menos un tipo de
  // documento. El rojo aparece solo tras intentar enviar, para que una fila
  // recién agregada no se vea como error antes de que la llenen.
  const isSubmitted = form.formState.isSubmitted;
  const isDocumentTypesInvalid = (article: { document_type_ids?: number[] }) =>
    isSubmitted &&
    !(article.document_type_ids && article.document_type_ids.length > 0);

  return (
    <FormField
      control={form.control}
      name="articles"
      render={() => (
        <RequisitionSection
          icon={Package}
          title="Artículos"
          description="Elija los renglones o busque por número de parte, y detalle cada artículo."
        >
          <FormItem className="flex flex-col">
            <div className="flex">
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
                <FormItem className="flex w-full flex-col sm:w-80">
                  <FieldLabel preventClick>Lote/Renglón</FieldLabel>
                  <div className="flex items-center gap-1.5">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={isBatchesLoading}
                          role="combobox"
                          className={cn(
                            requisitionTriggerClass,
                            selectedBatches.length === 0 &&
                              "text-muted-foreground",
                          )}
                        >
                          <span className="truncate">
                            {selectedBatches.length > 0
                              ? `${selectedBatches.length} reng. seleccionados`
                              : "Selec. un renglón..."}
                          </span>
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
                              {batchSearch
                                ? "No existen renglones..."
                                : "Escriba para buscar..."}
                            </CommandEmpty>
                            <CommandGroup>
                              {filteredBatches.map((batch) => (
                                <CommandItem
                                  key={batch.id}
                                  value={`${batch.name} ${batch.category ?? ""} ${batch.id}`}
                                  onSelect={() =>
                                    handleBatchSelect(
                                      batch.name,
                                      batch.id.toString(),
                                      batch.category ?? "",
                                    )
                                  }
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedBatches.some(
                                        (b) => b.batch === batch.id.toString(),
                                      )
                                        ? "opacity-100"
                                        : "opacity-0",
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

                    {canCreateBatch && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            type="button"
                            size="icon"
                            onClick={() => setIsCreateBatchOpen(true)}
                            className={requisitionIconButtonClass}
                          >
                            <PackagePlus className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="text-xs px-2 py-1"
                        >
                          <p>Crear nuevo renglón</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </FormItem>

                {handleArticleSelect && (
                  <FormItem className="flex w-full flex-col sm:w-55">
                    <FieldLabel preventClick>Buscar por P/N</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            requisitionTriggerClass,
                            "text-muted-foreground",
                          )}
                        >
                          Buscar artículo...
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" matchTriggerWidth>
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="P/N o P/N alterno..."
                            value={articleSearch}
                            onValueChange={setArticleSearch}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {isArticleResultsLoading
                                ? "Buscando..."
                                : articleSearch
                                  ? "No se encontraron artículos..."
                                  : "Escriba para buscar..."}
                            </CommandEmpty>
                            <CommandGroup>
                              {filteredArticleResults?.flatMap((result) =>
                                result.articles.map((article) => (
                                  <CommandItem
                                    key={article.id}
                                    value={`${article.id}`}
                                    onSelect={() =>
                                      handleArticleSelect(result.batch, article)
                                    }
                                  >
                                    <div className="flex flex-col">
                                      <span>{article.part_number}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {result.batch.name}
                                        {/* alternative_part_number puede llegar como string suelto en
                                          registros antiguos de la BD (ver backfill de datos); el tipo
                                          declara string[] pero no está garantizado en runtime. */}
                                        {Array.isArray(
                                          article.alternative_part_number,
                                        ) &&
                                        article.alternative_part_number.length >
                                          0
                                          ? ` · Alt: ${article.alternative_part_number.join(", ")}`
                                          : ""}
                                      </span>
                                    </div>
                                  </CommandItem>
                                )),
                              )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <ScrollArea
                className={cn(
                  selectedBatches.length > 1 ? "h-70 max-sm:h-auto" : "",
                )}
              >
                {selectedBatches.map((batch) => (
                  <div
                    key={batch.batch}
                    className="rounded-md border bg-muted/30 p-3 mb-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm select-none">
                          {batch.batch_name}
                        </h4>
                        {(() => {
                          const category = batches?.find(
                            (b) => b.id.toString() === batch.batch,
                          )?.category;
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
                            className="h-6 w-6 hover:text-destructive max-sm:size-9"
                          >
                            <MinusCircle className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="text-xs px-2 py-1"
                        >
                          <p>Quitar renglón</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <ScrollArea
                      className={cn(
                        batch.batch_articles.length > 1
                          ? "h-65 max-sm:h-auto"
                          : "",
                      )}
                    >
                      {batch.batch_articles.map((article, index) => {
                        const selectedAircraft = aircrafts?.find(
                          (a) => a.id.toString() === article.aircraft_id,
                        );
                        return (
                          <div
                            key={index}
                            className="mt-1.5 flex flex-col gap-2 rounded-md border bg-background/60 p-2 sm:flex-row sm:items-center"
                          >
                            <div className="min-w-0 flex-1 space-y-2">
                              {/* Row 1: Part Number, Quantity, Unit */}
                              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                                <div className="flex min-w-0 flex-col gap-1 max-sm:col-span-2 sm:flex-1">
                                  <label
                                    className={cn(
                                      "flex items-center gap-1 font-medium select-none",
                                      labelTextClass,
                                    )}
                                  >
                                    P/N
                                    <RequiredIndicator />
                                  </label>
                                  <Input
                                    placeholder="Ej: 123-456-789"
                                    className={rowFieldClass}
                                    value={article.part_number}
                                    onChange={(e) =>
                                      handleBatchArticleChange(
                                        batch.batch,
                                        index,
                                        "part_number",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>

                                <div className="flex min-w-0 flex-col gap-1 sm:w-28 sm:shrink-0">
                                  <label
                                    className={cn(
                                      "flex items-center gap-1 font-medium select-none",
                                      labelTextClass,
                                    )}
                                  >
                                    Cant.
                                    <RequiredIndicator />
                                  </label>
                                  <Input
                                    placeholder="Ej: 4"
                                    min="0"
                                    step="0.1"
                                    inputMode="decimal"
                                    className={rowFieldClass}
                                    onChange={(e) =>
                                      handleBatchArticleChange(
                                        batch.batch,
                                        index,
                                        "quantity",
                                        Number(e.target.value),
                                      )
                                    }
                                  />
                                </div>

                                <div className="flex min-w-0 flex-col gap-1 sm:w-36 sm:shrink-0">
                                  <label
                                    className={cn(
                                      "flex items-center gap-1 font-medium select-none",
                                      labelTextClass,
                                    )}
                                  >
                                    Unidad
                                    <RequiredIndicator />
                                  </label>
                                  <SearchableSelect
                                    value={article.unit}
                                    onChange={(value) =>
                                      handleBatchArticleChange(
                                        batch.batch,
                                        index,
                                        "unit",
                                        value,
                                      )
                                    }
                                    loading={isUnitsLoading}
                                    placeholder="Ej: Unidad"
                                    searchPlaceholder="Buscar unidad..."
                                    triggerClassName={cn(
                                      rowFieldClass,
                                      !article.unit && "text-muted-foreground",
                                    )}
                                    options={(units ?? []).map((unit) => ({
                                      value: unit.id.toString(),
                                      label: unit.label,
                                    }))}
                                  />
                                </div>
                              </div>

                              {/* Row 2: Alternative Part Number, AeronauticalAircraft, Priority */}
                              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                                <div className="flex min-w-0 flex-col gap-1 max-sm:col-span-2 sm:flex-1">
                                  <label
                                    className={cn(
                                      "flex items-center gap-1 font-medium select-none",
                                      labelTextClass,
                                    )}
                                  >
                                    P/N alterno
                                  </label>
                                  <Input
                                    placeholder="Ej: ABC-123-X Opcional..."
                                    className={rowFieldClass}
                                    value={article.alt_part_number || ""}
                                    onChange={(e) =>
                                      handleBatchArticleChange(
                                        batch.batch,
                                        index,
                                        "alt_part_number",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>

                                <div
                                  className={cn(
                                    "flex min-w-0 flex-col gap-1 sm:shrink-0",
                                    priorityColClass,
                                  )}
                                >
                                  <label
                                    className={cn(
                                      "flex items-center gap-1 font-medium select-none",
                                      labelTextClass,
                                    )}
                                  >
                                    Prioridad
                                    <RequiredIndicator />
                                  </label>
                                  <PriorityChoice
                                    size="sm"
                                    label="Prioridad del artículo"
                                    value={article.priority || "MEDIUM"}
                                    onChange={(value) =>
                                      handleBatchArticleChange(
                                        batch.batch,
                                        index,
                                        "priority",
                                        value,
                                      )
                                    }
                                  />
                                </div>

                                <div className="flex min-w-0 flex-col gap-1 sm:w-36 sm:shrink-0">
                                  <label
                                    className={cn(
                                      "flex items-center gap-1 font-medium select-none",
                                      labelTextClass,
                                    )}
                                  >
                                    Aeronave
                                  </label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        type="button"
                                        disabled={isAircraftsLoading}
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                          rowTriggerClass,
                                          "text-muted-foreground",
                                          selectedAircraft && "text-foreground",
                                        )}
                                      >
                                        <span className="truncate">
                                          {selectedAircraft
                                            ? selectedAircraft.acronym
                                            : "Opcional"}
                                        </span>
                                        <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="p-0"
                                      matchTriggerWidth
                                    >
                                      <Command shouldFilter={false}>
                                        <CommandInput
                                          placeholder="Busque una aeronave..."
                                          value={aircraftSearch}
                                          onValueChange={setAircraftSearch}
                                        />
                                        <CommandList>
                                          <CommandEmpty className="text-sm p-2 text-center text-muted-foreground">
                                            {aircraftSearch
                                              ? "No se ha encontrado ninguna aeronave."
                                              : "Escriba para buscar..."}
                                          </CommandEmpty>
                                          {article.aircraft_id && (
                                            <CommandGroup>
                                              <CommandItem
                                                value="clear"
                                                onSelect={() =>
                                                  handleBatchArticleChange(
                                                    batch.batch,
                                                    index,
                                                    "aircraft_id",
                                                    undefined,
                                                  )
                                                }
                                              >
                                                Sin aeronave
                                              </CommandItem>
                                            </CommandGroup>
                                          )}
                                          <CommandGroup>
                                            {filteredAircrafts.map(
                                              (aircraft) => (
                                                <CommandItem
                                                  value={`${aircraft.id} ${aircraft.acronym}`}
                                                  key={aircraft.id}
                                                  onSelect={(
                                                    currentValue: string,
                                                  ) => {
                                                    const id =
                                                      currentValue.split(
                                                        " ",
                                                      )[0];
                                                    handleBatchArticleChange(
                                                      batch.batch,
                                                      index,
                                                      "aircraft_id",
                                                      id,
                                                    );
                                                  }}
                                                >
                                                  <Check
                                                    className={cn(
                                                      "mr-2 h-4 w-4",
                                                      aircraft.id.toString() ===
                                                        article.aircraft_id
                                                        ? "opacity-100"
                                                        : "opacity-0",
                                                    )}
                                                  />
                                                  {aircraft.acronym}
                                                </CommandItem>
                                              ),
                                            )}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-center gap-1 max-sm:justify-end max-sm:border-t max-sm:pt-2 sm:ml-2 sm:flex-col sm:shrink-0 sm:self-stretch sm:pl-2">
                              <ArticleDocumentTypesAttachment
                                selectedIds={article.document_type_ids}
                                onChange={(ids) =>
                                  handleBatchArticleChange(
                                    batch.batch,
                                    index,
                                    "document_type_ids",
                                    ids,
                                  )
                                }
                                invalid={isDocumentTypesInvalid(article)}
                              />

                              <ArticleImageAttachment
                                article={article}
                                onChangeImage={(file) =>
                                  handleBatchArticleChange(
                                    batch.batch,
                                    index,
                                    "image",
                                    file,
                                  )
                                }
                              />

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    type="button"
                                    size="icon"
                                    onClick={() =>
                                      removeBatchArticle(batch.batch, index)
                                    }
                                    className="h-7 w-7 shrink-0 hover:text-destructive max-sm:size-9"
                                  >
                                    <MinusCircle className="size-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="text-xs px-2 py-1"
                                >
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
                      className="mt-2 h-7 gap-1 text-xs text-muted-foreground hover:text-foreground max-sm:h-10"
                    >
                      <Plus className="size-3" />
                      Agregar artículo
                    </Button>
                  </div>
                ))}
              </ScrollArea>
            </div>
            <FormMessage />

            {canCreateBatch && (
              <Dialog
                open={isCreateBatchOpen}
                onOpenChange={setIsCreateBatchOpen}
              >
                <FormDialogContent
                  className="sm:max-w-2xl"
                  icon={Boxes}
                  title="Crear renglón"
                  description="Cree un nuevo renglón para utilizarlo en esta requisición."
                >
                  <CreateBatchForm
                    onClose={() => setIsCreateBatchOpen(false)}
                    onSuccess={(batchName) => {
                      setIsCreateBatchOpen(false);
                      onBatchCreated?.(batchName);
                    }}
                  />
                </FormDialogContent>
              </Dialog>
            )}
          </FormItem>
        </RequisitionSection>
      )}
    />
  );
}
