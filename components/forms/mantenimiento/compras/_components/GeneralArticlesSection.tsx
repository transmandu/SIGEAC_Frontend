"use client"
import { Button } from "@/components/ui/button"
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, Layers, MinusCircle, Ruler, Tag } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { GeneralArticle, Unit } from "@/types"
import type { RequisitionGeneralArticleForm } from "@/types/purchase"
import { ArticleImageAttachment } from "./ArticleImageAttachment"
import { RequiredIndicator } from "./RequiredIndicator"

interface GeneralArticlesSectionProps {
  form: UseFormReturn<any>;
  generalArticles?: GeneralArticle[];
  isGeneralArticlesLoading: boolean;
  selectedGeneralArticles: RequisitionGeneralArticleForm[];
  filteredGeneralArticles: GeneralArticle[];
  generalArticleSearch: string;
  setGeneralArticleSearch: (v: string) => void;
  units?: Unit[];
  isUnitsLoading: boolean;
  handleGeneralArticleSelect: (article: GeneralArticle) => void;
  handleGeneralArticleChange: (index: number, field: keyof RequisitionGeneralArticleForm, value: any) => void;
  removeGeneralArticle: (index: number) => void;
}

export function GeneralArticlesSection({
  form,
  isGeneralArticlesLoading,
  selectedGeneralArticles,
  filteredGeneralArticles,
  generalArticleSearch,
  setGeneralArticleSearch,
  units,
  isUnitsLoading,
  handleGeneralArticleSelect,
  handleGeneralArticleChange,
  removeGeneralArticle,
}: GeneralArticlesSectionProps) {
  return (
    <FormField
      control={form.control}
      name="general_articles"
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
                  Artículo General
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={isGeneralArticlesLoading}
                      role="combobox"
                      className={cn(
                        "justify-between w-full",
                        selectedGeneralArticles.length === 0 && "text-muted-foreground"
                      )}
                    >
                      {selectedGeneralArticles.length > 0
                        ? `${selectedGeneralArticles.length} arts. seleccionados`
                        : "Selec. un artículo..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" matchTriggerWidth>
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Buscar..."
                        value={generalArticleSearch}
                        onValueChange={setGeneralArticleSearch}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {generalArticleSearch ? "No existen artículos generales..." : "Escriba para buscar..."}
                        </CommandEmpty>
                        <CommandGroup>
                          {filteredGeneralArticles.map((article) => (
                            <CommandItem
                              key={article.id}
                              value={`${article.description} ${article.variant_type ?? ""}`}
                              onSelect={() => handleGeneralArticleSelect(article)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedGeneralArticles.some((a) => a.description === article.description)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {article.description}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormItem>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <ScrollArea className={cn(selectedGeneralArticles.length > 1 ? "h-[280px]" : "")}>
              {selectedGeneralArticles.map((article, index) => (
                <div
                  key={index}
                  className="rounded-md border bg-muted/30 p-3 mb-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm select-none">{article.description || "Sin descripción"}</h4>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          type="button"
                          size="icon"
                          onClick={() => removeGeneralArticle(index)}
                          className="h-6 w-6 hover:text-destructive"
                        >
                          <MinusCircle className="size-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs px-2 py-1">
                        <p>Quitar artículo</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground select-none">
                        Present. / Especif.
                      </label>
                      <Input
                        placeholder="Ej: Auto Taladrante / Negro"
                        className="text-xs h-8"
                        value={article.variant_type || ""}
                        onChange={(e) => handleGeneralArticleChange(index, "variant_type", e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1 w-28 shrink-0">
                      <label className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground select-none">
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
                        value={article.quantity || ""}
                        onChange={(e) => handleGeneralArticleChange(index, "quantity", Number(e.target.value))}
                      />
                    </div>

                    <div className="flex flex-col gap-1 w-36 shrink-0">
                      <label className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground select-none">
                        <Ruler className="size-3" />
                        Unidad.
                        <RequiredIndicator />
                      </label>
                      <Select
                        value={article.unit_id || ""}
                        onValueChange={(value) => handleGeneralArticleChange(index, "unit_id", value)}
                        disabled={isUnitsLoading}
                      >
                        <SelectTrigger className={cn("text-xs h-8", !article.unit_id && "text-muted-foreground")}>
                          <SelectValue placeholder="Ej: Unidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {units?.map((u) => (
                            <SelectItem key={u.id} value={u.id.toString()}>
                              {u.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1 w-[80px] shrink-0">
                      <label className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground select-none">
                        <Tag className="size-3" />
                        Prioridad.
                        <RequiredIndicator />
                      </label>
                      <Select
                        value={article.priority || "MEDIUM"}
                        onValueChange={(value: "HIGH" | "MEDIUM" | "LOW") =>
                          handleGeneralArticleChange(index, "priority", value)
                        }
                      >
                        <SelectTrigger className="text-xs h-8">
                          <SelectValue placeholder="Prior." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HIGH">Alta</SelectItem>
                          <SelectItem value="MEDIUM">Media</SelectItem>
                          <SelectItem value="LOW">Baja</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="self-end">
                      <ArticleImageAttachment
                        article={article}
                        onChangeImage={(file) => handleGeneralArticleChange(index, "image", file)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
