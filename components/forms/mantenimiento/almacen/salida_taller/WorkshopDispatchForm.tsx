"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Check,
  ChevronsUpDown,
  Loader2,
  PackagePlus,
  Plus,
  X,
} from "lucide-react";
import { useMemo } from "react";
import { SectionHeader } from "../_components/SectionHeader";
import { ConversionPanel } from "../_components/ConversionPanel";
import { ConsumableArticleRow } from "../_components/ConsumableArticleRow";
import { GeneralArticleRow } from "../_components/GeneralArticleRow";
import { truncateText } from "../_components/truncate";
import { SearchAwareGroup } from "../_components/SearchAwareGroup";
import { WorkshopCombobox } from "@/components/forms/general/WorkshopCombobox";
import { CreateWorkshopDialog } from "@/components/dialogs/general/CreateWorkshopDialog";
import {
  useWorkshopDispatchForm,
  aeroKey,
  genKey,
  type ItemCategory,
} from "./_hooks/useWorkshopDispatchForm";

interface FormProps {
  onClose: () => void;
}

const CATEGORY_TABS: { value: ItemCategory; label: string }[] = [
  { value: "component", label: "Componentes" },
  { value: "part", label: "Partes" },
  { value: "tool", label: "Herramientas" },
  { value: "consumable", label: "Consumibles" },
];

export function WorkshopDispatchForm({ onClose }: FormProps) {
  const {
    form,
    user,
    onSubmit,
    createWorkshopDispatch,
    openAdd,
    setOpenAdd,
    addCategory,
    setAddCategory,
    workshops,
    isWorkshopsLoading,
    batches,
    isBatchesLoading,
    hardwareArticles,
    isHardwareLoading,
    aeroFA,
    genFA,
    watchedAero,
    watchedGen,
    aeroSelectedSet,
    genSelectedSet,
    aeroById,
    genById,
    aeroBatchNameById,
    getAeroMax,
    getGenMax,
    isAeroConsumable,
    qtyByKey,
    setQtyByKey,
    msgByKey,
    convByKey,
    cutByKey,
    updateCut,
    updateAeroCut,
    commitAeroQty,
    commitGenQty,
    setToMaxAero,
    setToMaxGen,
    convState,
    setConvState,
    activeConversions,
    isActiveConversionLoading,
    activeBaseUnitLabel,
    closeConversion,
    openConversionForAero,
    openConversionForGeneral,
    applyConversion,
    handleAddAeronautical,
    handleAddGeneral,
    removeAeroRow,
    removeGenRow,
    hasBlockingQtyError,
    hasInvalidQty,
    aeronauticalCount,
    generalCount,
    disabledAdd,
  } = useWorkshopDispatchForm(onClose);

  const conversionPanelNode = useMemo(
    () => (
      <ConversionPanel
        conversions={activeConversions}
        isLoading={isActiveConversionLoading}
        selectedConversion={convState.selected}
        conversionInput={convState.input}
        baseUnitLabel={activeBaseUnitLabel}
        convertibleType={
          convState.target === "general" ? "general-articles" : "consumables"
        }
        convertibleId={
          convState.target === "general"
            ? convState.generalArticleId
            : convState.articleId
        }
        onConversionChange={(conv) =>
          setConvState((p) => ({ ...p, selected: conv, input: "" }))
        }
        onInputChange={(val) => setConvState((p) => ({ ...p, input: val }))}
        onApply={applyConversion}
        onClose={closeConversion}
      />
    ),
    [
      activeConversions,
      isActiveConversionLoading,
      activeBaseUnitLabel,
      convState,
      applyConversion,
      closeConversion,
      setConvState,
    ],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full min-w-0 flex-col space-y-6"
      >
        {/* Datos del taller */}
        <div className="space-y-4">
          <SectionHeader label="Datos del Taller" />
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 *:min-w-0">
            <div className="space-y-2">
              <div className="flex min-h-6 items-center">
                <label className="text-sm font-medium">Entregado por</label>
              </div>
              <Input
                className="h-10"
                disabled
                value={`${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()}
              />
              <p className="text-xs text-muted-foreground">
                Usuario actual que registra la salida.
              </p>
            </div>

            <FormField
              control={form.control}
              name="workshop_id"
              render={({ field }) => (
                <FormItem>
                  <div className="flex min-h-6 items-center justify-between gap-2">
                    <FormLabel className="text-sm font-medium">
                      Taller
                    </FormLabel>
                    <CreateWorkshopDialog
                      onSuccess={(workshop) =>
                        field.onChange(workshop.id.toString())
                      }
                      triggerButton={
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1.5 text-xs"
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Crear
                        </Button>
                      }
                    />
                  </div>
                  <WorkshopCombobox
                    value={field.value}
                    onChange={field.onChange}
                    workshops={workshops}
                    disabled={isWorkshopsLoading}
                    invalid={!!form.formState.errors.workshop_id}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 *:min-w-0">
            <FormField
              control={form.control}
              name="requested_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Solicitado por
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-10 w-full"
                      placeholder="Quién solicita la salida"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="receiver"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Recibe en el taller
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-10 w-full"
                      placeholder="Persona que recibe en el taller"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="authorizer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Autorizado por
                  </FormLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Julian Rodriguez">
                        Julián Rodriguez
                      </SelectItem>
                      <SelectItem value="Ali Ugueto">Ali Ugueto</SelectItem>
                      <SelectItem value="Freddy Guerrero">
                        Freddy Guerrero
                      </SelectItem>
                      <SelectItem value="Fernanda Hernandez">
                        Fernanda Hernandez
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Artículos a enviar */}
        <div className="space-y-4">
          <SectionHeader label="Artículos a Enviar" />

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center justify-between">
              Agregar artículo
              <span className="text-xs text-muted-foreground">
                Aeronáuticos: {aeronauticalCount} · General/Ferretería:{" "}
                {generalCount}
              </span>
            </label>

            <Popover
              open={openAdd}
              onOpenChange={(v) => {
                setOpenAdd(v);
                if (v) setAddCategory("component");
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openAdd}
                  className="w-full justify-between h-10"
                  disabled={disabledAdd}
                >
                  <span className="text-muted-foreground flex items-center gap-2">
                    {disabledAdd ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <PackagePlus className="h-4 w-4" />
                    )}
                    Seleccione un artículo...
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0" align="start" matchTriggerWidth>
                <div className="relative border-b p-2">
                  <div className="flex flex-wrap items-center justify-center gap-2 px-10">
                    {CATEGORY_TABS.map(({ value, label }) => (
                      <Button
                        key={value}
                        type="button"
                        variant={addCategory === value ? "default" : "outline"}
                        className="h-8"
                        onClick={() => setAddCategory(value)}
                      >
                        {label}
                      </Button>
                    ))}
                    <Button
                      type="button"
                      variant={
                        (addCategory as string) === "general"
                          ? "default"
                          : "outline"
                      }
                      className="h-8"
                      onClick={() => setAddCategory("general" as ItemCategory)}
                    >
                      General/Ferretería{" "}
                      <span className="ml-2 text-xs opacity-80">
                        ({generalCount})
                      </span>
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8"
                    onClick={() => setOpenAdd(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <Command key={addCategory}>
                  <CommandInput placeholder="Buscar por lote, parte, serial o descripción..." />
                  <CommandList className="scrollbar-thin">
                    <CommandEmpty>
                      No se han encontrado artículos...
                    </CommandEmpty>

                    {(addCategory as string) === "general" ? (
                      isHardwareLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="size-4 animate-spin" />
                        </div>
                      ) : (
                        <CommandGroup heading="Inventario general">
                          {hardwareArticles.map((ga) => {
                            const already = genSelectedSet.has(Number(ga.id));
                            return (
                              <CommandItem
                                key={`g-${ga.id}`}
                                value={`${ga.description ?? ""} ${ga.brand_model ?? ""} ${ga.variant_type ?? ""}`}
                                className="max-w-full"
                                onSelect={() => handleAddGeneral(ga)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    already ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                                  <span className="font-medium truncate">
                                    {truncateText(ga.description) || "N/A"}
                                  </span>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {ga.brand_model ?? "N/A"} ·{" "}
                                    {ga.variant_type ?? "N/A"} · Disp:{" "}
                                    {ga.quantity ?? 0}{" "}
                                    {ga.general_primary_unit?.label ?? ""}
                                  </span>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      )
                    ) : isBatchesLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="size-4 animate-spin" />
                      </div>
                    ) : (
                      batches?.map((batch: any) => (
                        <SearchAwareGroup
                          key={`aero-${batch.batch_id}`}
                          heading={batch.name}
                        >
                          {batch.articles.map((article: any) => {
                            const already = aeroSelectedSet.has(
                              Number(article.id),
                            );
                            return (
                              <CommandItem
                                key={`a-${article.id}-${batch.batch_id}`}
                                value={`${batch.name} ${article.part_number} ${article.serial ?? ""} ${article.description ?? ""}`}
                                className="max-w-full"
                                onSelect={() =>
                                  handleAddAeronautical(article, batch.batch_id)
                                }
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    already ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                                  <span className="font-medium truncate">
                                    {article.part_number}{" "}
                                    {article.serial
                                      ? `· ${article.serial}`
                                      : ""}
                                  </span>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {truncateText(article.description) ||
                                      "Sin nota"}{" "}
                                    · Disp: {article.quantity} {article.unit}
                                  </span>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </SearchAwareGroup>
                      ))
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {aeronauticalCount === 0 && generalCount === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center text-muted-foreground">
              <PackagePlus className="h-8 w-8 opacity-40" />
              <p className="text-sm">Ningún artículo seleccionado.</p>
              <p className="text-xs opacity-70">
                Use el selector de arriba para agregar artículos.
              </p>
            </div>
          )}

          {aeroFA.fields.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Aeronáuticos
              </p>
              {aeroFA.fields.map((f, index) => {
                const key = aeroKey(f.id);
                const item = watchedAero[index];
                const articleId = Number(item?.article_id || 0);
                const article = articleId ? aeroById.get(articleId) : undefined;
                const max = articleId ? getAeroMax(articleId) : 0;
                return (
                  <ConsumableArticleRow
                    key={f.id}
                    article={article}
                    articleId={articleId}
                    batchName={aeroBatchNameById.get(articleId)}
                    qty={qtyByKey[key] ?? ""}
                    max={max}
                    rowMsg={msgByKey[key]}
                    conversion={convByKey[key]}
                    showConversionPanel={
                      convState.target === "aero" &&
                      convState.rowFieldId === f.id &&
                      !!article &&
                      isAeroConsumable(f.id)
                    }
                    conversionPanelNode={conversionPanelNode}
                    cut={cutByKey[key]}
                    onQtyChange={(val) =>
                      setQtyByKey((p) => ({ ...p, [key]: val }))
                    }
                    onCommit={() => commitAeroQty(index, f.id)}
                    onSetMax={() => setToMaxAero(index, f.id)}
                    onOpenConversion={() =>
                      openConversionForAero(index, f.id, articleId)
                    }
                    onRemove={() => removeAeroRow(index, f.id)}
                    onCutChange={(next) => updateAeroCut(index, f.id, next)}
                  />
                );
              })}
            </div>
          )}

          {genFA.fields.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                General/Ferretería
              </p>
              {genFA.fields.map((f, index) => {
                const key = genKey(f.id);
                const item = watchedGen[index];
                const generalId = Number(item?.general_article_id || 0);
                const ga = generalId ? genById.get(generalId) : undefined;
                const max = generalId ? getGenMax(generalId) : 0;
                return (
                  <GeneralArticleRow
                    key={f.id}
                    article={ga}
                    generalId={generalId}
                    qty={qtyByKey[key] ?? ""}
                    max={max}
                    rowMsg={msgByKey[key]}
                    conversion={convByKey[key]}
                    showConversionPanel={
                      convState.target === "general" &&
                      convState.rowFieldId === f.id &&
                      !!ga
                    }
                    conversionPanelNode={conversionPanelNode}
                    cut={cutByKey[key]}
                    onQtyChange={(val) =>
                      setQtyByKey((p) => ({ ...p, [key]: val }))
                    }
                    onCommit={() => commitGenQty(index, f.id)}
                    onSetMax={() => setToMaxGen(index, f.id)}
                    onOpenConversion={() =>
                      openConversionForGeneral(index, f.id, generalId)
                    }
                    onRemove={() => removeGenRow(index, f.id)}
                    onCutChange={(next) => updateCut(index, f.id, next)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Justificación */}
        <div className="space-y-4">
          <SectionHeader label="Justificación" />
          <FormField
            control={form.control}
            name="justification"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    rows={4}
                    className="w-full resize-none"
                    placeholder="Ej: Se envía a overhaul por..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="my-2" />

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={createWorkshopDispatch?.isPending}
            className="min-w-25 h-10"
          >
            Cancelar
          </Button>
          <Button
            className="bg-primary text-white hover:bg-primary/90 disabled:bg-primary/70 min-w-30 h-10"
            disabled={
              createWorkshopDispatch?.isPending ||
              aeronauticalCount + generalCount === 0 ||
              hasBlockingQtyError ||
              hasInvalidQty
            }
            type="submit"
          >
            {createWorkshopDispatch?.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Creando...
              </>
            ) : (
              "Crear Salida a Taller"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
