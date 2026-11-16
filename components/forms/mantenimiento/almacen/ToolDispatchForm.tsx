"use client";

import {
  DispatchRequestSection,
  DispatchResponsibleSection,
} from "@/components/forms/mantenimiento/almacen/_components/DispatchSections";
import { ConversionPanel } from "@/components/forms/mantenimiento/almacen/_components/ConversionPanel";
import { GeneralArticleRow } from "@/components/forms/mantenimiento/almacen/_components/GeneralArticleRow";
import { SearchAwareGroup } from "@/components/forms/mantenimiento/almacen/_components/SearchAwareGroup";
import { SectionHeader } from "@/components/forms/mantenimiento/almacen/_components/SectionHeader";
import { ToolRowCard } from "@/components/forms/mantenimiento/almacen/_components/ToolRowCard";
import { truncateText } from "@/components/forms/mantenimiento/almacen/_components/truncate";
import {
  aeroKey,
  genKey,
  useDispatchForm,
} from "@/components/forms/mantenimiento/almacen/_hooks/useDispatchForm";
import EvidenceCapture from "@/components/misc/EvidenceCapture";
import { TagBadge } from "@/components/misc/TagBadge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronsUpDown,
  Loader2,
  PackagePlus,
  Wrench,
  X,
} from "lucide-react";
import { useMemo } from "react";

interface FormProps {
  onClose: () => void;
}

export function ToolDispatchForm({ onClose }: FormProps) {
  const ctx = useDispatchForm(onClose, "tool");

  const {
    form,
    onSubmit,
    createDispatchRequest,
    openAdd,
    setOpenAdd,
    addTab,
    setAddTab,
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
    getGenMax,
    qtyByKey,
    setQtyByKey,
    msgByKey,
    convByKey,
    cutByKey,
    updateCut,
    evidenceByKey,
    setEvidence,
    commitGenQty,
    setToMaxGen,
    setQuantityGen,
    convState,
    setConvState,
    activeConversions,
    isActiveConversionLoading,
    activeBaseUnitLabel,
    closeConversion,
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
  } = ctx;

  const conversionPanelNode = useMemo(
    () => (
      <ConversionPanel
        conversions={activeConversions}
        isLoading={isActiveConversionLoading}
        selectedConversion={convState.selected}
        conversionInput={convState.input}
        baseUnitLabel={activeBaseUnitLabel}
        convertibleType="general-articles"
        convertibleId={convState.generalArticleId}
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
        <div className="space-y-4">
          <DispatchResponsibleSection ctx={ctx} />
        </div>

        <div className="space-y-4">
          <DispatchRequestSection ctx={ctx} />
        </div>

        <div className="space-y-4">
          <SectionHeader label="Artículos a Retirar" />

          <div className="space-y-2">
            <label className="flex items-center justify-between text-sm font-medium">
              Agregar artículo
              <span className="text-xs text-muted-foreground">
                Herramientas: {aeronauticalCount} · General/Ferretería:{" "}
                {generalCount}
              </span>
            </label>

            <Popover
              open={openAdd}
              onOpenChange={(open) => {
                setOpenAdd(open);
                if (open) setAddTab("aero");
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={openAdd}
                  className="h-10 w-full justify-between"
                  disabled={disabledAdd}
                >
                  <span className="flex items-center gap-2 text-muted-foreground">
                    {disabledAdd ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <PackagePlus className="h-4 w-4" />
                    )}
                    Seleccione una herramienta o artículo...
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0" align="start" matchTriggerWidth>
                {/* La X va absoluta para que los tabs queden centrados en el
                    desplegable y no desplazados por el botón de cerrar. */}
                <div className="relative border-b p-2">
                  <div className="flex flex-wrap items-center justify-center gap-2 px-10">
                    <Button
                      type="button"
                      variant={addTab === "aero" ? "default" : "outline"}
                      className="h-8"
                      onClick={() => setAddTab("aero")}
                    >
                      Herramientas{" "}
                      <span className="ml-2 text-xs opacity-80">
                        ({aeronauticalCount})
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant={addTab === "general" ? "default" : "outline"}
                      className="h-8"
                      onClick={() => setAddTab("general")}
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

                {/* key por tab: sin remontar, el texto buscado sigue
                    filtrando la otra lista al cambiar. */}
                <Command key={addTab}>
                  <CommandInput
                    placeholder={
                      addTab === "aero"
                        ? "Buscar por lote, parte, serial o descripción..."
                        : "Buscar por descripción, modelo o tipo..."
                    }
                  />
                  <CommandList>
                    <CommandEmpty>
                      No se han encontrado artículos...
                    </CommandEmpty>

                    {addTab === "aero" ? (
                      isBatchesLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="size-4 animate-spin" />
                        </div>
                      ) : (
                        batches?.map((batch) => (
                          <SearchAwareGroup
                            key={`tool-${batch.batch_id}`}
                            heading={batch.name}
                          >
                            {batch.articles.map((article) => {
                              const already = aeroSelectedSet.has(
                                Number(article.id),
                              );
                              // Una herramienta vencida se avisa pero se deja
                              // elegir: por ahora no se bloquea la salida.
                              const isExpired =
                                article.tool_status === "EXPIRED";

                              return (
                                <CommandItem
                                  key={`t-${article.id}-${batch.batch_id}`}
                                  value={`${batch.name} ${article.part_number} ${article.serial ?? ""} ${article.description ?? ""}`}
                                  className="max-w-full"
                                  onSelect={() =>
                                    handleAddAeronautical(
                                      article,
                                      batch.batch_id,
                                    )
                                  }
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      already ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                                    <span className="truncate font-medium">
                                      {article.part_number}
                                      {article.serial
                                        ? ` · SN: ${article.serial}`
                                        : ""}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                      {truncateText(article.description) ||
                                        "Sin nota"}
                                    </span>
                                  </div>
                                  {isExpired && (
                                    <TagBadge tone="rose" className="ml-2">
                                      Calibración vencida
                                    </TagBadge>
                                  )}
                                </CommandItem>
                              );
                            })}
                          </SearchAwareGroup>
                        ))
                      )
                    ) : isHardwareLoading ? (
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
                                <span className="truncate font-medium">
                                  {truncateText(ga.description) || "N/A"}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
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
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {aeronauticalCount === 0 && generalCount === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center text-muted-foreground">
              <Wrench className="h-8 w-8 opacity-40" />
              <p className="text-sm">Ningún artículo seleccionado.</p>
              <p className="text-xs opacity-70">
                Use el selector de arriba para agregar herramientas.
              </p>
            </div>
          )}

          {aeroFA.fields.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Herramientas
              </p>
              {aeroFA.fields.map((field, index) => {
                const key = aeroKey(field.id);
                const articleId = Number(watchedAero[index]?.article_id || 0);
                const article = articleId ? aeroById.get(articleId) : undefined;

                return (
                  <ToolRowCard
                    key={field.id}
                    title={
                      article?.part_number ??
                      (articleId ? `ID: ${articleId}` : "Herramienta")
                    }
                    subtitle={[
                      article?.serial ? `SN: ${article.serial}` : null,
                      aeroBatchNameById.get(articleId) ?? "Sin lote",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    toolStatus={article?.tool_status}
                    evidenceNode={
                      <EvidenceCapture
                        files={evidenceByKey[key] ?? []}
                        onChange={(files) => setEvidence(key, files)}
                        label={article?.part_number ?? "la herramienta"}
                      />
                    }
                    onRemove={() => removeAeroRow(index, field.id)}
                  />
                );
              })}
            </div>
          )}

          {genFA.fields.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                General/Ferretería
              </p>
              {genFA.fields.map((field, index) => {
                const key = genKey(field.id);
                const generalId = Number(
                  watchedGen[index]?.general_article_id || 0,
                );
                const ga = generalId ? genById.get(generalId) : undefined;

                return (
                  <GeneralArticleRow
                    key={field.id}
                    article={ga}
                    generalId={generalId}
                    qty={qtyByKey[key] ?? ""}
                    max={generalId ? getGenMax(generalId) : 0}
                    rowMsg={msgByKey[key]}
                    conversion={convByKey[key]}
                    showConversionPanel={
                      convState.target === "general" &&
                      convState.rowFieldId === field.id &&
                      !!ga
                    }
                    conversionPanelNode={conversionPanelNode}
                    cut={cutByKey[key]}
                    evidenceNode={
                      <EvidenceCapture
                        files={evidenceByKey[key] ?? []}
                        onChange={(files) => setEvidence(key, files)}
                        label={ga?.description ?? "el artículo"}
                      />
                    }
                    onQtyChange={(val) =>
                      setQtyByKey((p) => ({ ...p, [key]: val }))
                    }
                    onCommit={() => commitGenQty(index, field.id)}
                    onSetMax={() => setToMaxGen(index, field.id)}
                    onSetQuantity={(value) =>
                      setQuantityGen(index, field.id, value)
                    }
                    onOpenConversion={() =>
                      openConversionForGeneral(index, field.id, generalId)
                    }
                    onRemove={() => removeGenRow(index, field.id)}
                    onCutChange={(next) => updateCut(index, field.id, next)}
                  />
                );
              })}
            </div>
          )}
        </div>

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
                    placeholder="Ej: Se necesita para la limpieza de..."
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
            disabled={createDispatchRequest?.isPending}
            className="h-10 min-w-25"
          >
            Cancelar
          </Button>
          <Button
            className="h-10 min-w-30 bg-primary text-white hover:bg-primary/90 disabled:bg-primary/70"
            disabled={
              createDispatchRequest?.isPending ||
              aeronauticalCount + generalCount === 0 ||
              hasBlockingQtyError ||
              hasInvalidQty
            }
            type="submit"
          >
            {createDispatchRequest?.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Salida"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
