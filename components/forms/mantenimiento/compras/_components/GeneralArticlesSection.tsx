"use client"
import { Button } from "@/components/ui/button"
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Building2, Calendar as CalendarIcon, Check, ChevronsUpDown, Layers, MinusCircle, PackagePlus, Ruler, Tag, User, UserCog } from "lucide-react"
import { useMemo } from "react"
import type { UseFormReturn } from "react-hook-form"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Department, Employee, GeneralArticle, ThirdParty, Unit } from "@/types"
import type { AuthorizedEmployeeResponse } from "@/hooks/sistema/autorizados/useGetAuthorizedEmployees"
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
  departments?: Department[];
  isDepartmentsLoading: boolean;
  destinationEmployees?: Employee[];
  isDestinationEmployeesLoading: boolean;
  thirdParties?: ThirdParty[];
  isThirdPartiesLoading: boolean;
  authorizedEmployees?: AuthorizedEmployeeResponse[];
  isAuthorizedEmployeesLoading: boolean;
  showDestinationFields?: boolean;
  handleGeneralArticleSelect: (article: GeneralArticle) => void;
  handleGeneralArticleChange: (index: number, field: keyof RequisitionGeneralArticleForm, value: any) => void;
  removeGeneralArticle: (index: number) => void;
  enableCreateGeneralArticle?: boolean;
  addManualGeneralArticle?: () => void;
  size?: "default" | "lg";
}

// Authorized employees and third parties are mutually exclusive in a single
// combobox, so selections are namespaced ("auth:<id>" / "third:<id>") to tell
// them apart without colliding ids from the two different tables.
const AUTH_PREFIX = "auth:";
const THIRD_PREFIX = "third:";

interface DestinationFieldsRowProps {
  article: RequisitionGeneralArticleForm;
  index: number;
  departments?: Department[];
  isDepartmentsLoading: boolean;
  destinationEmployees?: Employee[];
  isDestinationEmployeesLoading: boolean;
  thirdParties?: ThirdParty[];
  isThirdPartiesLoading: boolean;
  authorizedEmployees?: AuthorizedEmployeeResponse[];
  isAuthorizedEmployeesLoading: boolean;
  handleGeneralArticleChange: (index: number, field: keyof RequisitionGeneralArticleForm, value: any) => void;
  labelTextClass: string;
  dateColClass: string;
}

// Hoisted to module scope so it isn't redefined as a new component identity
// on every parent render — that would force React to remount this subtree
// (dropping Popover state) on every keystroke elsewhere in the form.
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
  // Combined value for the authorized-employee / third-party combobox: the
  // two tables don't share an id space, so selections are namespaced and
  // decoded back into the two distinct article fields on select.
  const getAuthorizedOrThirdPartyValue = (article: RequisitionGeneralArticleForm) => {
    if (article.authorized_employee_id) return `${AUTH_PREFIX}${article.authorized_employee_id}`;
    if (article.third_party_id) return `${THIRD_PREFIX}${article.third_party_id}`;
    return undefined;
  };

  const getAuthorizedOrThirdPartyLabel = (article: RequisitionGeneralArticleForm) => {
    if (article.authorized_employee_id) {
      return authorizedEmployees?.find((a) => a.id.toString() === article.authorized_employee_id)?.employee_name;
    }
    if (article.third_party_id) {
      return thirdParties?.find((t) => t.id.toString() === article.third_party_id)?.name;
    }
    return undefined;
  };

  const handleAuthorizedOrThirdPartySelect = (index: number, value: string) => {
    if (value.startsWith(AUTH_PREFIX)) {
      handleGeneralArticleChange(index, "authorized_employee_id", value.slice(AUTH_PREFIX.length));
      handleGeneralArticleChange(index, "third_party_id", undefined);
    } else if (value.startsWith(THIRD_PREFIX)) {
      handleGeneralArticleChange(index, "third_party_id", value.slice(THIRD_PREFIX.length));
      handleGeneralArticleChange(index, "authorized_employee_id", undefined);
    }
  };

  const clearAuthorizedOrThirdParty = (index: number) => {
    handleGeneralArticleChange(index, "authorized_employee_id", undefined);
    handleGeneralArticleChange(index, "third_party_id", undefined);
  };

  const selectedDepartment = departments?.find((d) => d.id.toString() === article.department_id);
  const selectedEmployee = destinationEmployees?.find((e) => e.id.toString() === article.employee_id);
  const authorizedOrThirdPartyValue = getAuthorizedOrThirdPartyValue(article);
  const authorizedOrThirdPartyLabel = getAuthorizedOrThirdPartyLabel(article);
  const requestedDate = article.requested_date ? parseISO(article.requested_date) : undefined;

  return (
    <div className="flex items-center justify-center gap-2 mt-1.5">
      <div className={cn("flex flex-col gap-1 shrink-0", dateColClass)}>
        <label className={cn("flex items-center gap-1 font-medium select-none", labelTextClass)}>
          <CalendarIcon className="size-3" />
          Fecha Solicitud
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-start text-xs h-8 px-2 font-normal text-muted-foreground",
                requestedDate && "text-foreground"
              )}
            >
              <CalendarIcon className="mr-1 h-3 w-3 shrink-0 opacity-50" />
              <span className="truncate">
                {requestedDate ? format(requestedDate, "dd MMM yyyy", { locale: es }) : "Opcional"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={requestedDate}
              onSelect={(date) =>
                handleGeneralArticleChange(index, "requested_date", date ? format(date, "yyyy-MM-dd") : undefined)
              }
              locale={es}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-1 w-48 shrink-0">
        <label className={cn("flex items-center gap-1 font-medium select-none", labelTextClass)}>
          <Building2 className="size-3" />
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
                "w-full justify-between text-xs h-8 px-2 font-normal text-muted-foreground",
                selectedDepartment && "text-foreground"
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
                    <CommandItem value="clear" onSelect={() => handleGeneralArticleChange(index, "department_id", undefined)}>
                      Sin departamento
                    </CommandItem>
                  </CommandGroup>
                )}
                <CommandGroup>
                  {departments?.map((department) => (
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
                          department.id.toString() === article.department_id ? "opacity-100" : "opacity-0"
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

      <div className="flex flex-col gap-1 w-48 shrink-0">
        <label className={cn("flex items-center gap-1 font-medium select-none", labelTextClass)}>
          <User className="size-3" />
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
                "w-full justify-between text-xs h-8 px-2 font-normal text-muted-foreground",
                selectedEmployee && "text-foreground"
              )}
            >
              <span className="truncate">
                {selectedEmployee ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : "Opcional"}
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
                    <CommandItem value="clear" onSelect={() => handleGeneralArticleChange(index, "employee_id", undefined)}>
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
                          employee.id.toString() === article.employee_id ? "opacity-100" : "opacity-0"
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

      <div className="flex flex-col gap-1 w-48 shrink-0">
        <label className={cn("flex items-center gap-1 font-medium select-none", labelTextClass)}>
          <UserCog className="size-3" />
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
                "w-full justify-between text-xs h-8 px-2 font-normal text-muted-foreground",
                authorizedOrThirdPartyLabel && "text-foreground"
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
              <CommandInput placeholder="Busque un autorizado o tercero..." />
              <CommandList>
                <CommandEmpty className="text-sm p-2 text-center text-muted-foreground">
                  No se han encontrado resultados.
                </CommandEmpty>
                {authorizedOrThirdPartyValue && (
                  <CommandGroup>
                    <CommandItem value="clear" onSelect={() => clearAuthorizedOrThirdParty(index)}>
                      Sin selección
                    </CommandItem>
                  </CommandGroup>
                )}
                <CommandGroup heading="--- Autorizados ---">
                  {authorizedEmployees?.map((authorizedEmployee) => {
                    const value = `${AUTH_PREFIX}${authorizedEmployee.id}`;
                    return (
                      <CommandItem
                        value={`${value} ${authorizedEmployee.employee_name}`}
                        key={value}
                        onSelect={() => handleAuthorizedOrThirdPartySelect(index, value)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            authorizedOrThirdPartyValue === value ? "opacity-100" : "opacity-0"
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
                        onSelect={() => handleAuthorizedOrThirdPartySelect(index, value)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            authorizedOrThirdPartyValue === value ? "opacity-100" : "opacity-0"
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
}: GeneralArticlesSectionProps) {
  const isLg = size === "lg";
  const labelTextClass = cn(
    isLg ? "text-sm text-foreground/80" : "text-[10px] text-muted-foreground",
    "whitespace-nowrap"
  );
  const dateColClass = isLg ? "w-40" : "w-32";
  const priorityColClass = isLg ? "w-28" : "w-[80px]";

  // Identity of a general article is description + variant_type together:
  // two entries can share a description but differ by variant_type (and
  // must be treated as distinct), so every comparison/key below must use
  // both fields, never description alone.
  const getArticleKey = (description: string, variantType?: string | null) =>
    `${description}__${variantType ?? ""}`;

  const getArticleLabel = (article: { description: string; variant_type?: string | null }) =>
    article.variant_type
      ? `${article.description} - ${article.variant_type}`
      : article.description;

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

  // The catalog can contain multiple rows (different ids) for the same
  // description + variant_type combination; collapse them to one entry so
  // the dropdown never lists the same article twice.
  const dedupedGeneralArticles = useMemo(() => {
    const seen = new Set<string>();
    return filteredGeneralArticles.filter((article) => {
      const key = getArticleKey(article.description, article.variant_type);
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
                <div className="flex items-center gap-1.5">
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
                            {dedupedGeneralArticles.map((article) => (
                              <CommandItem
                                key={getArticleKey(article.description, article.variant_type)}
                                value={`${article.description} ${article.variant_type ?? ""}`}
                                onSelect={() => handleGeneralArticleSelect(article)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedGeneralArticles.some(
                                      (a) => getArticleKey(a.description, a.variant_type) === getArticleKey(article.description, article.variant_type)
                                    )
                                      ? "opacity-100"
                                      : "opacity-0"
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
                          className="text-muted-foreground hover:text-foreground shrink-0"
                        >
                          <PackagePlus className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs px-2 py-1">
                        <p>Solicitar artículo no registrado</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </FormItem>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <ScrollArea className={cn(selectedGeneralArticles.length > 1 ? "h-[280px]" : "")}>
              {selectedGeneralArticles.map((article, index) => {
                const isUnregistered = !generalArticles?.some(
                  (a) => getArticleKey(a.description, a.variant_type) === getArticleKey(article.description, article.variant_type)
                );
                return (
                <div
                  key={index}
                  className="rounded-md border bg-muted/30 p-3 mb-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    {isUnregistered ? (
                      <h4 className="font-medium text-sm select-none">Solicitar Artículo No Registrado</h4>
                    ) : (
                      <h4 className="font-medium text-sm select-none">{getArticleLabel(article) || "Sin descripción"}</h4>
                    )}
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

                  {isUnregistered ? (
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="flex flex-col gap-1">
                          <label className={cn(
                            "flex items-center gap-1 font-medium select-none",
                            labelTextClass,
                            isDescriptionInvalid(article) && "text-destructive"
                          )}>
                            <Tag className="size-3" />
                            Descripción
                            <RequiredIndicator invalid={isDescriptionInvalid(article)} />
                          </label>
                          <Input
                            placeholder="Ej: ALCOHOL ANTISEPTICO"
                            className={cn("text-xs h-8", isDescriptionInvalid(article) && "border-destructive focus-visible:ring-destructive")}
                            value={article.description || ""}
                            onChange={(e) => handleGeneralArticleChange(index, "description", e.target.value)}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-1 flex-1">
                            <label className={cn("flex items-center gap-1 font-medium select-none", labelTextClass)}>
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
                            <label className={cn(
                              "flex items-center gap-1 font-medium select-none",
                              labelTextClass,
                              isQuantityInvalid(article) && "text-destructive"
                            )}>
                              <Tag className="size-3" />
                              Cant.
                              <RequiredIndicator invalid={isQuantityInvalid(article)} />
                            </label>
                            <Input
                              placeholder="Ej: 4"
                              min="0"
                              step="0.1"
                              inputMode="decimal"
                              className={cn("text-xs h-8", isQuantityInvalid(article) && "border-destructive focus-visible:ring-destructive")}
                              value={article.quantity || ""}
                              onChange={(e) => handleGeneralArticleChange(index, "quantity", Number(e.target.value))}
                            />
                          </div>

                          <div className="flex flex-col gap-1 w-36 shrink-0">
                            <label className={cn(
                              "flex items-center gap-1 font-medium select-none",
                              labelTextClass,
                              isUnitInvalid(article) && "text-destructive"
                            )}>
                              <Ruler className="size-3" />
                              Unidad.
                              <RequiredIndicator invalid={isUnitInvalid(article)} />
                            </label>
                            <Select
                              value={article.unit_id || ""}
                              onValueChange={(value) => handleGeneralArticleChange(index, "unit_id", value)}
                              disabled={isUnitsLoading}
                            >
                              <SelectTrigger className={cn(
                                "text-xs h-8",
                                !article.unit_id && "text-muted-foreground",
                                isUnitInvalid(article) && "border-destructive focus-visible:ring-destructive"
                              )}>
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

                          <div className={cn("flex flex-col gap-1 shrink-0", priorityColClass)}>
                            <label className={cn("flex items-center gap-1 font-medium select-none", labelTextClass)}>
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
                        </div>

                        {showDestinationFields && (
                          <DestinationFieldsRow
                            article={article}
                            index={index}
                            departments={departments}
                            isDepartmentsLoading={isDepartmentsLoading}
                            destinationEmployees={destinationEmployees}
                            isDestinationEmployeesLoading={isDestinationEmployeesLoading}
                            thirdParties={thirdParties}
                            isThirdPartiesLoading={isThirdPartiesLoading}
                            authorizedEmployees={authorizedEmployees}
                            isAuthorizedEmployeesLoading={isAuthorizedEmployeesLoading}
                            handleGeneralArticleChange={handleGeneralArticleChange}
                            labelTextClass={labelTextClass}
                            dateColClass={dateColClass}
                          />
                        )}
                      </div>

                      <div className="flex items-center self-stretch shrink-0">
                        <ArticleImageAttachment
                          article={article}
                          onChangeImage={(file) => handleGeneralArticleChange(index, "image", file)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-1 flex-1">
                            <label className={cn("flex items-center gap-1 font-medium select-none", labelTextClass)}>
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
                            <label className={cn(
                              "flex items-center gap-1 font-medium select-none",
                              labelTextClass,
                              isQuantityInvalid(article) && "text-destructive"
                            )}>
                              <Tag className="size-3" />
                              Cant.
                              <RequiredIndicator invalid={isQuantityInvalid(article)} />
                            </label>
                            <Input
                              placeholder="Ej: 4"
                              min="0"
                              step="0.1"
                              inputMode="decimal"
                              className={cn("text-xs h-8", isQuantityInvalid(article) && "border-destructive focus-visible:ring-destructive")}
                              value={article.quantity || ""}
                              onChange={(e) => handleGeneralArticleChange(index, "quantity", Number(e.target.value))}
                            />
                          </div>

                          <div className="flex flex-col gap-1 w-36 shrink-0">
                            <label className={cn(
                              "flex items-center gap-1 font-medium select-none",
                              labelTextClass,
                              isUnitInvalid(article) && "text-destructive"
                            )}>
                              <Ruler className="size-3" />
                              Unidad.
                              <RequiredIndicator invalid={isUnitInvalid(article)} />
                            </label>
                            <Select
                              value={article.unit_id || ""}
                              onValueChange={(value) => handleGeneralArticleChange(index, "unit_id", value)}
                              disabled={isUnitsLoading}
                            >
                              <SelectTrigger className={cn(
                                "text-xs h-8",
                                !article.unit_id && "text-muted-foreground",
                                isUnitInvalid(article) && "border-destructive focus-visible:ring-destructive"
                              )}>
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

                          <div className={cn("flex flex-col gap-1 shrink-0", priorityColClass)}>
                            <label className={cn("flex items-center gap-1 font-medium select-none", labelTextClass)}>
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
                        </div>

                        {showDestinationFields && (
                          <DestinationFieldsRow
                            article={article}
                            index={index}
                            departments={departments}
                            isDepartmentsLoading={isDepartmentsLoading}
                            destinationEmployees={destinationEmployees}
                            isDestinationEmployeesLoading={isDestinationEmployeesLoading}
                            thirdParties={thirdParties}
                            isThirdPartiesLoading={isThirdPartiesLoading}
                            authorizedEmployees={authorizedEmployees}
                            isAuthorizedEmployeesLoading={isAuthorizedEmployeesLoading}
                            handleGeneralArticleChange={handleGeneralArticleChange}
                            labelTextClass={labelTextClass}
                            dateColClass={dateColClass}
                          />
                        )}
                      </div>

                      <div className="self-stretch flex items-center">
                        <ArticleImageAttachment
                          article={article}
                          onChangeImage={(file) => handleGeneralArticleChange(index, "image", file)}
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
      )}
    />
  );
}
