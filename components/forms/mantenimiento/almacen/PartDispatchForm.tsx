"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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

import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2, PackagePlus, X } from "lucide-react";

import { useMemo } from "react";
import { SectionHeader } from "./_components/SectionHeader";
import {
  DispatchRequestSection,
  DispatchResponsibleSection,
  WAREHOUSE_ASSET_DESTINATIONS,
} from "./_components/DispatchSections";
import { ConversionPanel } from "./_components/ConversionPanel";
import EvidenceCapture from "@/components/misc/EvidenceCapture";
import { ArticleRowCard } from "./_components/ArticleRowCard";
import { GeneralArticleRow } from "./_components/GeneralArticleRow";
import { truncateText } from "./_components/truncate";
import { SearchAwareGroup } from "./_components/SearchAwareGroup";
import { aeroKey, genKey, useDispatchForm } from "./_hooks/useDispatchForm";

interface FormProps {
  onClose: () => void;
}

export function PartDispatchForm({ onClose }: FormProps) {
  const ctx = useDispatchForm(onClose, "part");

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
    getAeroMax,
    getGenMax,
    qtyByKey,
    setQtyByKey,
    msgByKey,
    convByKey,
    cutByKey,
    updateCut,
    evidenceByKey,
    setEvidence,
    commitAeroQty,
    commitGenQty,
    setToMaxAero,
    setToMaxGen,
    setQuantityAero,
    setQuantityGen,
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
  } = ctx;

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
        <div className="space-y-4">
          <DispatchResponsibleSection ctx={ctx} />
        </div>

        <div className="space-y-4">
          <DispatchRequestSection
            ctx={ctx}
            types={WAREHOUSE_ASSET_DESTINATIONS}
          />
        </div>

        <div className="space-y-4">
          <SectionHeader label="Artículos a Retirar" />

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center justify-between">
              Agregar artículo
              <span className="text-xs text-muted-foreground">
                Partes: {aeronauticalCount} · General/Ferretería: {generalCount}
              </span>
            </label>

            <Popover
              open={openAdd}
              onOpenChange={(v) => {
                setOpenAdd(v);
                if (v) setAddTab("aero");
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
                {/* La X va absoluta para que los tabs queden
                                    centrados en el desplegable y no desplazados
                                    por el ancho del botón de cerrar. */}
                <div className="relative border-b p-2">
                  <div className="flex flex-wrap items-center justify-center gap-2 px-10">
                    <Button
                      type="button"
                      variant={addTab === "aero" ? "default" : "outline"}
                      className="h-8"
                      onClick={() => setAddTab("aero")}
                    >
                      Partes{" "}
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

                {/* key por tab: sin remontar, el texto buscado
                                    sigue filtrando la otra lista al cambiar. */}
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
                Use el selector de arriba para agregar material aeronáutico o
                artículos generales.
              </p>
            </div>
          )}

          {aeroFA.fields.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Partes
              </p>
              {aeroFA.fields.map((f, index) => {
                const key = aeroKey(f.id);
                const item = watchedAero[index];
                const articleId = Number(item?.article_id || 0);
                const article = articleId ? aeroById.get(articleId) : undefined;
                const max = articleId ? getAeroMax(articleId) : 0;

                return (
                  <ArticleRowCard
                    key={f.id}
                    title={
                      article?.part_number ??
                      (articleId ? `ID: ${articleId}` : "Artículo")
                    }
                    subtitle={[
                      aeroBatchNameById.get(articleId) ?? "Sin lote",
                      article?.serial ? `Serial: ${article.serial}` : null,
                      `Disponible: ${article?.quantity ?? 0} ${article?.unit ?? ""}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    qty={qtyByKey[key] ?? ""}
                    max={max}
                    rowMsg={msgByKey[key]}
                    disabled={!article}
                    canConvert={!!article && article.unit !== "u"}
                    showConversionPanel={
                      convState.target === "aero" &&
                      convState.rowFieldId === f.id &&
                      !!article &&
                      article.unit !== "u"
                    }
                    conversionPanelNode={conversionPanelNode}
                    accentClass="border-l-blue-500/50"
                    evidenceNode={
                      <EvidenceCapture
                        files={evidenceByKey[key] ?? []}
                        onChange={(files) => setEvidence(key, files)}
                        label={article?.part_number ?? "el artículo"}
                      />
                    }
                    onQtyChange={(val) =>
                      setQtyByKey((p) => ({ ...p, [key]: val }))
                    }
                    onCommit={() => commitAeroQty(index, f.id)}
                    onSetMax={() => setToMaxAero(index, f.id)}
                    onSetQuantity={(value) =>
                      setQuantityAero(index, f.id, value)
                    }
                    onOpenConversion={() =>
                      openConversionForAero(index, f.id, articleId)
                    }
                    onRemove={() => removeAeroRow(index, f.id)}
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
                    onCommit={() => commitGenQty(index, f.id)}
                    onSetMax={() => setToMaxGen(index, f.id)}
                    onSetQuantity={(value) =>
                      setQuantityGen(index, f.id, value)
                    }
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
                    placeholder="Ej: Se requiere para reemplazo o mantenimiento..."
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
            className="min-w-25 h-10"
          >
            Cancelar
          </Button>
          <Button
            className="bg-primary text-white hover:bg-primary/90 disabled:bg-primary/70 min-w-30 h-10"
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
                <Loader2 className="size-4 animate-spin mr-2" />
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
