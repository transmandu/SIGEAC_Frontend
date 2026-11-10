"use client";
import { flattenDepartments } from "@/lib/departments";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronsUpDown,
  MinusCircle,
  Package,
  PackagePlus,
} from "lucide-react";
import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
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
import type {
  Department,
  Employee,
  GeneralArticle,
  ThirdParty,
  Unit,
} from "@/types";
import type { ExternalEmployee } from "@/hooks/ajustes/convenios/types";
import type { RequisitionGeneralArticleForm } from "@/types/purchase";
import { ArticleImageAttachment } from "./ArticleImageAttachment";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import { ActiveRequisitionWarning } from "./ActiveRequisitionWarning";
import { getRequisitionArticleKey } from "@/hooks/mantenimiento/compras/useGetActiveGeneralArticleRequisitions";
import type { ActiveGeneralArticleRequisition } from "@/types/purchase";
import { toCalendarPayload } from "@/lib/date";
import { SearchableSelect } from "@/components/misc/SearchableSelect";
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
  departments?: Department[];
  isDepartmentsLoading: boolean;
  destinationEmployees?: Employee[];
  isDestinationEmployeesLoading: boolean;
  thirdParties?: ThirdParty[];
  isThirdPartiesLoading: boolean;
  authorizedEmployees?: ExternalEmployee[];
  isAuthorizedEmployeesLoading: boolean;
  showDestinationFields?: boolean;
  handleGeneralArticleSelect: (article: GeneralArticle) => void;
  handleGeneralArticleChange: (
    index: number,
    field: keyof RequisitionGeneralArticleForm,
    value: any,
  ) => void;
  removeGeneralArticle: (index: number) => void;
  enableCreateGeneralArticle?: boolean;
  addManualGeneralArticle?: () => void;
  size?: "default" | "lg";
  /** Indexadas por getRequisitionArticleKey(). Sin esto no se muestra el aviso de "ya solicitado". */
  activeRequisitionsByArticle?: Map<string, ActiveGeneralArticleRequisition[]>;
}

// Autorizados y terceros comparten un solo combobox pero viven en tablas
// distintas, así que sus ids pueden coincidir: se prefijan ("auth:" / "third:")
// para distinguirlos.
const AUTH_PREFIX = "auth:";
const THIRD_PREFIX = "third:";

// requested_date es una columna `date`: se manda el día tal cual se eligió. Ya
// no hace falta pegarle la hora actual para que no se corriera al convertir.

interface DestinationFieldsRowProps {
  article: RequisitionGeneralArticleForm;
  index: number;
  departments?: Department[];
  isDepartmentsLoading: boolean;
  destinationEmployees?: Employee[];
  isDestinationEmployeesLoading: boolean;
  thirdParties?: ThirdParty[];
  isThirdPartiesLoading: boolean;
  authorizedEmployees?: ExternalEmployee[];
  isAuthorizedEmployeesLoading: boolean;
  handleGeneralArticleChange: (
    index: number,
    field: keyof RequisitionGeneralArticleForm,
    value: any,
  ) => void;
  labelTextClass: string;
  dateColClass: string;
}

// Vive fuera del componente padre a propósito: si se definiera dentro, React
// lo trataría como un componente nuevo en cada render y remontaría el subárbol,
// perdiendo el estado del Popover con cada tecla que se escriba en el formulario.
function DestinationFieldsRow({
  article,
  index,
  departments,
  isDepartmentsLoading,
  destinationEmployees,
  isDestinationEmployeesLoading,
  thirdParties,
  isThirdPartiesLoading,
  authorizedEmployees,
  isAuthorizedEmployeesLoading,
  handleGeneralArticleChange,
  labelTextClass,
  dateColClass,
}: DestinationFieldsRowProps) {
  // Valor combinado del combobox: se guarda con prefijo y se decodifica de
  // vuelta a los dos campos distintos del artículo al seleccionar.
  const getAuthorizedOrThirdPartyValue = (
    article: RequisitionGeneralArticleForm,
  ) => {
    if (article.authorized_employee_id)
      return `${AUTH_PREFIX}${article.authorized_employee_id}`;
    if (article.third_party_id)
      return `${THIRD_PREFIX}${article.third_party_id}`;
    return undefined;
  };

  const getAuthorizedOrThirdPartyLabel = (
    article: RequisitionGeneralArticleForm,
  ) => {
    if (article.authorized_employee_id) {
      return authorizedEmployees?.find(
        (a) => a.id.toString() === article.authorized_employee_id,
      )?.employee_name;
    }
    if (article.third_party_id) {
      return thirdParties?.find(
        (t) => t.id.toString() === article.third_party_id,
      )?.name;
    }
    return undefined;
  };

  const handleAuthorizedOrThirdPartySelect = (index: number, value: string) => {
    if (value.startsWith(AUTH_PREFIX)) {
      handleGeneralArticleChange(
        index,
        "authorized_employee_id",
        value.slice(AUTH_PREFIX.length),
      );
      handleGeneralArticleChange(index, "third_party_id", undefined);
    } else if (value.startsWith(THIRD_PREFIX)) {
      handleGeneralArticleChange(
        index,
        "third_party_id",
        value.slice(THIRD_PREFIX.length),
      );
      handleGeneralArticleChange(index, "authorized_employee_id", undefined);
    }
  };

  const clearAuthorizedOrThirdParty = (index: number) => {
    handleGeneralArticleChange(index, "authorized_employee_id", undefined);
    handleGeneralArticleChange(index, "third_party_id", undefined);
  };

  // Los departamentos llegan como árbol (con `descendants` anidados); se
  // aplanan para poder elegir cualquiera, no solo los de primer nivel.
  const allDepartments = departments ? flattenDepartments(departments) : [];

  const selectedDepartment = allDepartments.find(
    (d) => d.id.toString() === article.department_id,
  );
  const selectedEmployee = destinationEmployees?.find(
    (e) => e.id.toString() === article.employee_id,
  );
  const authorizedOrThirdPartyValue = getAuthorizedOrThirdPartyValue(article);
  const authorizedOrThirdPartyLabel = getAuthorizedOrThirdPartyLabel(article);
  const requestedDate = article.requested_date
    ? parseISO(article.requested_date)
    : undefined;

  return (
    <div className="mt-1.5 grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-center">
      <div
        className={cn("flex min-w-0 flex-col gap-1 sm:shrink-0", dateColClass)}
      >
        <label
          className={cn(
            "flex items-center gap-1 font-medium select-none",
            labelTextClass,
          )}
        >
          Fecha de solicitud
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                rowTriggerClass,
                "justify-start text-muted-foreground",
                requestedDate && "text-foreground",
              )}
            >
              <CalendarIcon className="mr-1 h-3 w-3 shrink-0 opacity-50" />
              <span className="truncate">
                {requestedDate
                  ? format(requestedDate, "dd MMM yyyy", { locale: es })
                  : "Opcional"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={requestedDate}
              onSelect={(date) =>
                handleGeneralArticleChange(
                  index,
                  "requested_date",
                  toCalendarPayload(date),
                )
              }
              locale={es}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex min-w-0 flex-col gap-1 sm:w-48 sm:shrink-0">
        <label
          className={cn(
            "flex items-center gap-1 font-medium select-none",
            labelTextClass,
          )}
        >
          Depto.
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              disabled={isDepartmentsLoading}
              variant="outline"
              role="combobox"
              className={cn(
                rowTriggerClass,
                "text-muted-foreground",
                selectedDepartment && "text-foreground",
              )}
            >
              <span className="truncate">
                {selectedDepartment ? selectedDepartment.name : "Opcional"}
              </span>
              <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" matchTriggerWidth>
            <Command>
              <CommandInput placeholder="Busque un departamento..." />
              <CommandList>
                <CommandEmpty className="text-sm p-2 text-center text-muted-foreground">
                  No se ha encontrado ningún departamento.
                </CommandEmpty>
                {article.department_id && (
                  <CommandGroup>
                    <CommandItem
                      value="clear"
                      onSelect={() =>
                        handleGeneralArticleChange(
                          index,
                          "department_id",
                          undefined,
                        )
                      }
                    >
                      Sin departamento
                    </CommandItem>
                  </CommandGroup>
                )}
                <CommandGroup>
                  {allDepartments.map((department) => (
                    <CommandItem
                      value={`${department.id} ${department.name}`}
                      key={department.id}
                      onSelect={(currentValue: string) => {
                        const id = currentValue.split(" ")[0];
                        handleGeneralArticleChange(index, "department_id", id);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          department.id.toString() === article.department_id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {department.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex min-w-0 flex-col gap-1 sm:w-48 sm:shrink-0">
        <label
          className={cn(
            "flex items-center gap-1 font-medium select-none",
            labelTextClass,
          )}
        >
          Solicitante
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              disabled={isDestinationEmployeesLoading}
              variant="outline"
              role="combobox"
              className={cn(
                rowTriggerClass,
                "text-muted-foreground",
                selectedEmployee && "text-foreground",
              )}
            >
              <span className="truncate">
                {selectedEmployee
                  ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
                  : "Opcional"}
              </span>
              <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" matchTriggerWidth>
            <Command>
              <CommandInput placeholder="Busque un empleado..." />
              <CommandList>
                <CommandEmpty className="text-sm p-2 text-center text-muted-foreground">
                  No se ha encontrado ningún empleado.
                </CommandEmpty>
                {article.employee_id && (
                  <CommandGroup>
                    <CommandItem
                      value="clear"
                      onSelect={() =>
                        handleGeneralArticleChange(
                          index,
                          "employee_id",
                          undefined,
                        )
                      }
                    >
                      Sin empleado
                    </CommandItem>
                  </CommandGroup>
                )}
                <CommandGroup>
                  {destinationEmployees?.map((employee) => (
                    <CommandItem
                      value={`${employee.id} ${employee.first_name} ${employee.last_name}`}
                      key={employee.id}
                      onSelect={(currentValue: string) => {
                        const id = currentValue.split(" ")[0];
                        handleGeneralArticleChange(index, "employee_id", id);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          employee.id.toString() === article.employee_id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {employee.first_name} {employee.last_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex min-w-0 flex-col gap-1 sm:w-48 sm:shrink-0">
        <label
          className={cn(
            "flex items-center gap-1 font-medium select-none",
            labelTextClass,
          )}
        >
          Autoriz.
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              disabled={isAuthorizedEmployeesLoading || isThirdPartiesLoading}
              variant="outline"
              role="combobox"
              className={cn(
                rowTriggerClass,
                "text-muted-foreground",
                authorizedOrThirdPartyLabel && "text-foreground",
              )}
            >
              <span className="truncate">
                {authorizedOrThirdPartyLabel ?? "Opcional"}
              </span>
              <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" matchTriggerWidth>
            <Command>
              <CommandInput placeholder="Busque un autorizado externo o tercero..." />
              <CommandList>
                <CommandEmpty className="text-sm p-2 text-center text-muted-foreground">
                  No se han encontrado resultados.
                </CommandEmpty>
                {authorizedOrThirdPartyValue && (
                  <CommandGroup>
                    <CommandItem
                      value="clear"
                      onSelect={() => clearAuthorizedOrThirdParty(index)}
                    >
                      Sin selección
                    </CommandItem>
                  </CommandGroup>
                )}
                <CommandGroup heading="--- Autorizados externos ---">
                  {authorizedEmployees?.map((authorizedEmployee) => {
                    const value = `${AUTH_PREFIX}${authorizedEmployee.id}`;
                    return (
                      <CommandItem
                        value={`${value} ${authorizedEmployee.employee_name}`}
                        key={value}
                        onSelect={() =>
                          handleAuthorizedOrThirdPartySelect(index, value)
                        }
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            authorizedOrThirdPartyValue === value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {authorizedEmployee.employee_name}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                <CommandGroup heading="--- Terceros ---">
                  {thirdParties?.map((thirdParty) => {
                    const value = `${THIRD_PREFIX}${thirdParty.id}`;
                    return (
                      <CommandItem
                        value={`${value} ${thirdParty.name}`}
                        key={value}
                        onSelect={() =>
                          handleAuthorizedOrThirdPartySelect(index, value)
                        }
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            authorizedOrThirdPartyValue === value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {thirdParty.name}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export function GeneralArticlesSection({
  form,
  generalArticles,
  isGeneralArticlesLoading,
  selectedGeneralArticles,
  filteredGeneralArticles,
  generalArticleSearch,
  setGeneralArticleSearch,
  units,
  isUnitsLoading,
  departments,
  isDepartmentsLoading,
  destinationEmployees,
  isDestinationEmployeesLoading,
  thirdParties,
  isThirdPartiesLoading,
  authorizedEmployees,
  isAuthorizedEmployeesLoading,
  showDestinationFields = false,
  handleGeneralArticleSelect,
  handleGeneralArticleChange,
  removeGeneralArticle,
  enableCreateGeneralArticle = false,
  addManualGeneralArticle,
  size = "default",
  activeRequisitionsByArticle,
}: GeneralArticlesSectionProps) {
  const isLg = size === "lg";
  const labelTextClass = cn(labelClass, "whitespace-nowrap");
  const dateColClass = isLg ? "sm:w-40" : "sm:w-32";
  const priorityColClass = isLg ? "sm:w-32" : "sm:w-28";

  // La identidad de un artículo general es descripción + variante + marca:
  // dos entradas pueden compartir las dos primeras y diferir solo en la marca,
  // así que toda comparación de aquí abajo usa los tres campos.
  const getArticleKey = (
    description: string,
    variantType?: string | null,
    brandModel?: string | null,
  ) => `${description}__${variantType ?? ""}__${brandModel ?? ""}`;

  const getArticleLabel = (article: {
    description: string;
    variant_type?: string | null;
    brand_model?: string | null;
  }) => {
    const parts = [
      article.description,
      article.variant_type,
      article.brand_model,
    ].filter(Boolean);
    return parts.join(" - ");
  };

  // Required-field checks mirror the zod rules in the parent form's
  // general_articles schema (description min 1, quantity min 1, unit_id
  // required). Red styling only kicks in after a submit attempt, so a
  // freshly-added blank row doesn't look broken before the user has typed
  // anything.
  const isSubmitted = form.formState.isSubmitted;
  const isDescriptionInvalid = (article: RequisitionGeneralArticleForm) =>
    isSubmitted && !article.description?.trim();
  const isQuantityInvalid = (article: RequisitionGeneralArticleForm) =>
    isSubmitted && !(article.quantity > 0);
  const isUnitInvalid = (article: RequisitionGeneralArticleForm) =>
    isSubmitted && !article.unit_id;

  // El catálogo puede traer varias filas (ids distintos) con la misma
  // descripción + variante + marca; se colapsan para no listar el mismo
  // artículo dos veces en el desplegable.
  const dedupedGeneralArticles = useMemo(() => {
    const seen = new Set<string>();
    return filteredGeneralArticles.filter((article) => {
      const key = getArticleKey(
        article.description,
        article.variant_type,
        article.brand_model,
      );
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [filteredGeneralArticles]);

  return (
    <FormField
      control={form.control}
      name="general_articles"
      render={() => (
        <RequisitionSection
          icon={Package}
          title="Artículos"
          description="Elija los artículos del catálogo o solicite uno no registrado, y detalle cada uno."
        >
          <FormItem className="flex flex-col">
            <div className="flex">
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
                <FormItem className="flex w-full flex-col sm:w-80">
                  <FieldLabel preventClick>Artículo general</FieldLabel>
                  <div className="flex items-center gap-1.5">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={isGeneralArticlesLoading}
                          role="combobox"
                          className={cn(
                            requisitionTriggerClass,
                            selectedGeneralArticles.length === 0 &&
                              "text-muted-foreground",
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
                              {generalArticleSearch
                                ? "No existen artículos generales..."
                                : "Escriba para buscar..."}
                            </CommandEmpty>
                            <CommandGroup>
                              {dedupedGeneralArticles.map((article) => (
                                <CommandItem
                                  key={getArticleKey(
                                    article.description,
                                    article.variant_type,
                                    article.brand_model,
                                  )}
                                  value={`${article.description} ${article.variant_type ?? ""} ${article.brand_model ?? ""}`}
                                  onSelect={() =>
                                    handleGeneralArticleSelect(article)
                                  }
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedGeneralArticles.some(
                                        (a) =>
                                          getArticleKey(
                                            a.description,
                                            a.variant_type,
                                            a.brand_model,
                                          ) ===
                                          getArticleKey(
                                            article.description,
                                            article.variant_type,
                                            article.brand_model,
                                          ),
                                      )
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {getArticleLabel(article)}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {enableCreateGeneralArticle && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            type="button"
                            size="icon"
                            onClick={() => addManualGeneralArticle?.()}
                            className={requisitionIconButtonClass}
                          >
                            <PackagePlus className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="text-xs px-2 py-1"
                        >
                          <p>Solicitar artículo no registrado</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </FormItem>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <ScrollArea
                className={cn(
                  selectedGeneralArticles.length > 1
                    ? "h-70 max-sm:h-auto"
                    : "",
                )}
              >
                {selectedGeneralArticles.map((article, index) => {
                  const isUnregistered = !generalArticles?.some(
                    (a) =>
                      getArticleKey(
                        a.description,
                        a.variant_type,
                        a.brand_model,
                      ) ===
                      getArticleKey(
                        article.description,
                        article.variant_type,
                        article.brand_model,
                      ),
                  );
                  // Se resuelve con lo escrito en la fila, así que también atrapa
                  // los artículos tecleados a mano.
                  const activeRequisitions =
                    activeRequisitionsByArticle?.get(
                      getRequisitionArticleKey(
                        article.description,
                        article.variant_type,
                      ),
                    ) ?? [];
                  return (
                    <div
                      key={index}
                      className="rounded-md border bg-muted/30 p-3 mb-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        {isUnregistered ? (
                          <h4 className="font-medium text-sm select-none">
                            Solicitar artículo no registrado
                          </h4>
                        ) : (
                          <h4 className="font-medium text-sm select-none">
                            {getArticleLabel(article) || "Sin descripción"}
                          </h4>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              type="button"
                              size="icon"
                              onClick={() => removeGeneralArticle(index)}
                              className="h-6 w-6 hover:text-destructive max-sm:size-9"
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

                      {activeRequisitions.length > 0 && (
                        <ActiveRequisitionWarning
                          entries={activeRequisitions}
                          compact
                          className="mb-2"
                        />
                      )}

                      {isUnregistered ? (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <div className="flex min-w-0 flex-col gap-1.5 sm:flex-1">
                            <div className="flex flex-col gap-1">
                              <label
                                className={cn(
                                  "flex items-center gap-1 font-medium select-none",
                                  labelTextClass,
                                  isDescriptionInvalid(article) &&
                                    "text-destructive",
                                )}
                              >
                                Descripción
                                <RequiredIndicator
                                  invalid={isDescriptionInvalid(article)}
                                />
                              </label>
                              <Input
                                placeholder="Ej: ALCOHOL ANTISEPTICO"
                                className={cn(
                                  rowFieldClass,
                                  isDescriptionInvalid(article) &&
                                    "border-destructive focus-visible:ring-destructive",
                                )}
                                value={article.description || ""}
                                onChange={(e) =>
                                  handleGeneralArticleChange(
                                    index,
                                    "description",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                              <div className="flex min-w-0 flex-col gap-1 max-sm:col-span-2 sm:flex-1">
                                <label
                                  className={cn(
                                    "flex items-center gap-1 font-medium select-none",
                                    labelTextClass,
                                  )}
                                >
                                  Present. / Especif.
                                </label>
                                <Input
                                  placeholder="Ej: Auto Taladrante / Negro"
                                  className={rowFieldClass}
                                  value={article.variant_type || ""}
                                  onChange={(e) =>
                                    handleGeneralArticleChange(
                                      index,
                                      "variant_type",
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
                                    isQuantityInvalid(article) &&
                                      "text-destructive",
                                  )}
                                >
                                  Cant.
                                  <RequiredIndicator
                                    invalid={isQuantityInvalid(article)}
                                  />
                                </label>
                                <Input
                                  placeholder="Ej: 4"
                                  min="0"
                                  step="0.1"
                                  inputMode="decimal"
                                  className={cn(
                                    rowFieldClass,
                                    isQuantityInvalid(article) &&
                                      "border-destructive focus-visible:ring-destructive",
                                  )}
                                  value={article.quantity || ""}
                                  onChange={(e) =>
                                    handleGeneralArticleChange(
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
                                    isUnitInvalid(article) &&
                                      "text-destructive",
                                  )}
                                >
                                  Unidad
                                  <RequiredIndicator
                                    invalid={isUnitInvalid(article)}
                                  />
                                </label>
                                <SearchableSelect
                                  value={article.unit_id || ""}
                                  onChange={(value) =>
                                    handleGeneralArticleChange(
                                      index,
                                      "unit_id",
                                      value,
                                    )
                                  }
                                  loading={isUnitsLoading}
                                  placeholder="Ej: Unidad"
                                  searchPlaceholder="Buscar unidad..."
                                  triggerClassName={cn(
                                    rowFieldClass,
                                    !article.unit_id && "text-muted-foreground",
                                    isUnitInvalid(article) &&
                                      "border-destructive focus-visible:ring-destructive",
                                  )}
                                  options={(units ?? []).map((unit) => ({
                                    value: unit.id.toString(),
                                    label: unit.label,
                                  }))}
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
                                    handleGeneralArticleChange(
                                      index,
                                      "priority",
                                      value,
                                    )
                                  }
                                />
                              </div>
                            </div>

                            {showDestinationFields && (
                              <DestinationFieldsRow
                                article={article}
                                index={index}
                                departments={departments}
                                isDepartmentsLoading={isDepartmentsLoading}
                                destinationEmployees={destinationEmployees}
                                isDestinationEmployeesLoading={
                                  isDestinationEmployeesLoading
                                }
                                thirdParties={thirdParties}
                                isThirdPartiesLoading={isThirdPartiesLoading}
                                authorizedEmployees={authorizedEmployees}
                                isAuthorizedEmployeesLoading={
                                  isAuthorizedEmployeesLoading
                                }
                                handleGeneralArticleChange={
                                  handleGeneralArticleChange
                                }
                                labelTextClass={labelTextClass}
                                dateColClass={dateColClass}
                              />
                            )}
                          </div>

                          <div className="flex items-center max-sm:justify-end sm:shrink-0 sm:self-stretch">
                            <ArticleImageAttachment
                              article={article}
                              onChangeImage={(file) =>
                                handleGeneralArticleChange(index, "image", file)
                              }
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-center">
                          <div className="flex min-w-0 flex-col gap-1.5 sm:flex-1">
                            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                              <div className="flex min-w-0 flex-col gap-1 max-sm:col-span-2 sm:flex-1">
                                <label
                                  className={cn(
                                    "flex items-center gap-1 font-medium select-none",
                                    labelTextClass,
                                  )}
                                >
                                  Present. / Especif.
                                </label>
                                <Input
                                  placeholder="Ej: Auto Taladrante / Negro"
                                  className={rowFieldClass}
                                  value={article.variant_type || ""}
                                  onChange={(e) =>
                                    handleGeneralArticleChange(
                                      index,
                                      "variant_type",
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
                                    isQuantityInvalid(article) &&
                                      "text-destructive",
                                  )}
                                >
                                  Cant.
                                  <RequiredIndicator
                                    invalid={isQuantityInvalid(article)}
                                  />
                                </label>
                                <Input
                                  placeholder="Ej: 4"
                                  min="0"
                                  step="0.1"
                                  inputMode="decimal"
                                  className={cn(
                                    rowFieldClass,
                                    isQuantityInvalid(article) &&
                                      "border-destructive focus-visible:ring-destructive",
                                  )}
                                  value={article.quantity || ""}
                                  onChange={(e) =>
                                    handleGeneralArticleChange(
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
                                    isUnitInvalid(article) &&
                                      "text-destructive",
                                  )}
                                >
                                  Unidad
                                  <RequiredIndicator
                                    invalid={isUnitInvalid(article)}
                                  />
                                </label>
                                <SearchableSelect
                                  value={article.unit_id || ""}
                                  onChange={(value) =>
                                    handleGeneralArticleChange(
                                      index,
                                      "unit_id",
                                      value,
                                    )
                                  }
                                  loading={isUnitsLoading}
                                  placeholder="Ej: Unidad"
                                  searchPlaceholder="Buscar unidad..."
                                  triggerClassName={cn(
                                    rowFieldClass,
                                    !article.unit_id && "text-muted-foreground",
                                    isUnitInvalid(article) &&
                                      "border-destructive focus-visible:ring-destructive",
                                  )}
                                  options={(units ?? []).map((unit) => ({
                                    value: unit.id.toString(),
                                    label: unit.label,
                                  }))}
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
                                    handleGeneralArticleChange(
                                      index,
                                      "priority",
                                      value,
                                    )
                                  }
                                />
                              </div>
                            </div>

                            {showDestinationFields && (
                              <DestinationFieldsRow
                                article={article}
                                index={index}
                                departments={departments}
                                isDepartmentsLoading={isDepartmentsLoading}
                                destinationEmployees={destinationEmployees}
                                isDestinationEmployeesLoading={
                                  isDestinationEmployeesLoading
                                }
                                thirdParties={thirdParties}
                                isThirdPartiesLoading={isThirdPartiesLoading}
                                authorizedEmployees={authorizedEmployees}
                                isAuthorizedEmployeesLoading={
                                  isAuthorizedEmployeesLoading
                                }
                                handleGeneralArticleChange={
                                  handleGeneralArticleChange
                                }
                                labelTextClass={labelTextClass}
                                dateColClass={dateColClass}
                              />
                            )}
                          </div>

                          <div className="flex items-center max-sm:justify-end sm:self-stretch">
                            <ArticleImageAttachment
                              article={article}
                              onChangeImage={(file) =>
                                handleGeneralArticleChange(index, "image", file)
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </ScrollArea>
            </div>
            <FormMessage />
          </FormItem>
        </RequisitionSection>
      )}
    />
  );
}
