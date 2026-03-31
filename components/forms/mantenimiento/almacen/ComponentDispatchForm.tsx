"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
    Building2,
    CalendarIcon,
    Check,
    ChevronsUpDown,
    Loader2,
    PackagePlus,
    Plane,
    UserCheck,
    Users,
    X,
} from "lucide-react"

import { useMemo } from "react"
import { SectionHeader } from "./_components/SectionHeader"
import { ConversionPanel } from "./_components/ConversionPanel"
import { ArticleRowCard } from "./_components/ArticleRowCard"
import { aeroKey, genKey, useDispatchForm } from "./_hooks/useDispatchForm"

// ⚠️ Ajusta las rutas de importación de _components y _hooks según tu proyecto

interface FormProps {
    onClose: () => void
}

const DISPATCH_TYPES = [
    { value: "aircraft" as const, label: "Aeronave", icon: Plane },
    { value: "department" as const, label: "Departamento", icon: Building2 },
    { value: "authorized" as const, label: "Autorizados", icon: UserCheck },
    { value: "third_party" as const, label: "Terceros", icon: Users },
]

export function ComponentDispatchForm({ onClose }: FormProps) {
    // Inicializamos el hook indicando que este formulario es de "component"
    const {
        form, user, onSubmit, createDispatchRequest,
        openAdd, setOpenAdd, addTab, setAddTab,
        openEmployee, setOpenEmployee, openThirdParty, setOpenThirdParty,
        setSelectedDepartment,
        departments, isDepartmentsLoading,
        aircrafts, isAircraftsLoading,
        authorizedEmployees, isAuthorizedEmployeesLoading,
        thirdParties, isThirdPartiesLoading,
        batches, isBatchesLoading,
        employees, employeesLoading,
        hardwareArticles, isHardwareLoading,
        dispatchType, internalReceiverRequired,
        selectedThirdParty, groupedThirdParties,
        aeroFA, genFA,
        watchedAero, watchedGen,
        aeroSelectedSet, genSelectedSet,
        aeroById, genById,
        getAeroMax, getGenMax,
        qtyByKey, setQtyByKey, msgByKey,
        commitAeroQty, commitGenQty,
        setToMaxAero, setToMaxGen,
        convState, setConvState,
        activeConversions, isActiveConversionLoading,
        closeConversion, openConversionForAero, openConversionForGeneral, applyConversion,
        handleAddAeronautical, handleAddGeneral,
        removeAeroRow, removeGenRow,
        handleDispatchTypeChange,
        hasBlockingQtyError, hasInvalidQty,
        aeronauticalCount, generalCount, disabledAdd,
    } = useDispatchForm(onClose, "component")

    const conversionPanelNode = useMemo(() => (
        <ConversionPanel
            conversions={activeConversions}
            isLoading={isActiveConversionLoading}
            selectedConversion={convState.selected}
            conversionInput={convState.input}
            onConversionChange={(conv) => setConvState((p) => ({ ...p, selected: conv, input: "" }))}
            onInputChange={(val) => setConvState((p) => ({ ...p, input: val }))}
            onApply={applyConversion}
            onClose={closeConversion}
        />
    ), [activeConversions, isActiveConversionLoading, convState.selected, convState.input, applyConversion, closeConversion, setConvState])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-6 w-full">

                {/* === Personal Responsable === */}
                <div className="space-y-4">
                    <SectionHeader label="Personal Responsable" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Entregado por</label>
                            <Input className="h-10" disabled value={`${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()} />
                            <p className="text-xs text-muted-foreground">Usuario actual que registra la entrega.</p>
                        </div>

                        {internalReceiverRequired ? (
                            <FormField
                                control={form.control}
                                name="requested_by"
                                render={({ field }) => {
                                    const items = employees ?? []
                                    const selected = items.find((e: any) => `${e.dni}` === field.value)
                                    return (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-medium">Recibe</FormLabel>
                                            <Popover open={openEmployee} onOpenChange={setOpenEmployee}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline" role="combobox" aria-expanded={openEmployee}
                                                            className={cn("h-10 w-full justify-between font-normal", !field.value && "text-muted-foreground")}
                                                        >
                                                            {selected ? `${selected.first_name} ${selected.last_name}` : "Seleccione el responsable..."}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0" align="start">
                                                    {employeesLoading ? (
                                                        <div className="flex items-center justify-center py-6">
                                                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                                        </div>
                                                    ) : (
                                                        <Command>
                                                            <CommandInput placeholder="Buscar empleado..." />
                                                            <CommandList>
                                                                <CommandEmpty>No se encontraron empleados.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {items.map((e: any) => (
                                                                        <CommandItem
                                                                            key={e.id}
                                                                            value={`${e.first_name} ${e.last_name} ${e.job_title?.name ?? ""}`}
                                                                            onSelect={() => { field.onChange(`${e.dni}`); setOpenEmployee(false) }}
                                                                        >
                                                                            <Check className={cn("mr-2 h-4 w-4 shrink-0", field.value === `${e.dni}` ? "opacity-100" : "opacity-0")} />
                                                                            <div className="flex flex-col min-w-0">
                                                                                <span className="font-medium truncate">{e.first_name} {e.last_name}</span>
                                                                                <span className="text-xs text-muted-foreground truncate">{e.job_title?.name ?? ""}</span>
                                                                            </div>
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    )}
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                            <p className="text-xs text-muted-foreground">Listado general de empleados.</p>
                                        </FormItem>
                                    )
                                }}
                            />
                        ) : (
                            <div className="mt-3 text-center items-center rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                                Para <span className="font-medium">{dispatchType === "authorized" ? "Autorizados" : "Terceros"}</span>{" "}no se
                                selecciona responsable interno en esta sección.
                            </div>
                        )}
                    </div>
                </div>

                {/* === Información de la Solicitud === */}
                <div className="space-y-4">
                    <SectionHeader label="Información de la Solicitud" />

                    <div className="flex justify-center">
                        <FormField
                            control={form.control}
                            name="dispatch_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex justify-center mb-2">Tipo de Despacho</FormLabel>
                                    <FormControl>
                                        <div className="inline-flex rounded-lg border bg-muted/30 p-1 gap-1">
                                            {DISPATCH_TYPES.map(({ value, label, icon: Icon }) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => handleDispatchTypeChange(value, field.onChange)}
                                                    className={cn(
                                                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                                        field.value === value
                                                            ? "bg-background text-foreground shadow-sm"
                                                            : "text-muted-foreground hover:text-foreground"
                                                    )}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="work_order"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">Ord. de Trabajo</FormLabel>
                                    <FormControl>
                                        <Input className="h-10 w-full" placeholder="Ej: OT-000123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="submission_date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col mt-1">
                                    <FormLabel className="text-sm font-medium">Fecha de Solicitud</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn("h-10 w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                >
                                                    {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccione una fecha...</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                initialFocus
                                                locale={es}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {dispatchType === "department" && (
                            <FormField
                                control={form.control}
                                name="department_id"
                                render={({ field }) => (
                                    <FormItem className="mt-1">
                                        <FormLabel className="text-sm font-medium">Departamento</FormLabel>
                                        <Select
                                            value={field.value ?? ""}
                                            onValueChange={(val) => {
                                                field.onChange(val)
                                                const dep = departments?.find((d: any) => d.id.toString() === val)
                                                if (dep) setSelectedDepartment(dep)
                                            }}
                                            disabled={isDepartmentsLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Seleccione un departamento..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {isDepartmentsLoading && (
                                                    <div className="flex items-center justify-center py-4">
                                                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                                    </div>
                                                )}
                                                {departments?.map((d: any) => (
                                                    <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {dispatchType === "aircraft" && (
                            <FormField
                                control={form.control}
                                name="aircraft_id"
                                render={({ field }) => (
                                    <FormItem className="mt-1">
                                        <FormLabel className="text-sm font-medium">Aeronave</FormLabel>
                                        <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={isAircraftsLoading}>
                                            <FormControl>
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Seleccione una aeronave..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {isAircraftsLoading && (
                                                    <div className="flex items-center justify-center py-4">
                                                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                                    </div>
                                                )}
                                                {aircrafts?.map((a: any) => (
                                                    <SelectItem key={a.id} value={a.id.toString()}>{a.acronym}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {dispatchType === "authorized" && (
                            <FormField
                                control={form.control}
                                name="authorized_employee_id"
                                render={({ field }) => (
                                    <FormItem className="mt-1">
                                        <FormLabel className="text-sm font-medium">Empleado Autorizado</FormLabel>
                                        <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={isAuthorizedEmployeesLoading}>
                                            <FormControl>
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Seleccione un empleado..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {isAuthorizedEmployeesLoading && (
                                                    <div className="flex items-center justify-center py-4">
                                                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                                    </div>
                                                )}
                                                {authorizedEmployees?.map((a: any) => (
                                                    <SelectItem key={a.id} value={a.id.toString()}>
                                                        {a.employee_name} - {a.from_company_db.toUpperCase()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {dispatchType === "third_party" && (
                            <FormField
                                control={form.control}
                                name="third_party_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">Tercero</FormLabel>
                                        <Popover open={openThirdParty} onOpenChange={setOpenThirdParty}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline" role="combobox" aria-expanded={openThirdParty}
                                                        className={cn("h-10 w-full justify-between font-normal", !field.value && "text-muted-foreground")}
                                                    >
                                                        {selectedThirdParty?.name ?? "Selecc. un tercero..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0" align="start">
                                                {isThirdPartiesLoading ? (
                                                    <div className="flex items-center justify-center py-6">
                                                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                                    </div>
                                                ) : (
                                                    <Command>
                                                        <CommandInput placeholder="Buscar tercero..." />
                                                        <CommandList>
                                                            <CommandEmpty>No se encontraron terceros.</CommandEmpty>
                                                            {groupedThirdParties.map(([type, items]) => (
                                                                <CommandGroup key={type} heading={type === "CLIENT_COMPANY" ? "EMPRESA" : "PERSONA"}>
                                                                    {items.map((party) => (
                                                                        <CommandItem
                                                                            key={party.id}
                                                                            value={`${party.name} ${party.type}`}
                                                                            onSelect={() => {
                                                                                field.onChange(party.id.toString())
                                                                                form.setValue("requested_by", party.name, { shouldDirty: true, shouldValidate: true })
                                                                                setOpenThirdParty(false)
                                                                            }}
                                                                        >
                                                                            <Check className={cn("mr-2 h-4 w-4 shrink-0", field.value === party.id.toString() ? "opacity-100" : "opacity-0")} />
                                                                            <div className="flex min-w-0 flex-col">
                                                                                <span className="font-medium truncate">{party.name}</span>
                                                                                <span className="text-xs text-muted-foreground truncate">
                                                                                    {party.type === "CLIENT_COMPANY" ? "EMPRESA" : "PERSONA"}
                                                                                </span>
                                                                            </div>
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            ))}
                                                        </CommandList>
                                                    </Command>
                                                )}
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>

                    {dispatchType === "third_party" && (
                        <div className="flex gap-2 items-center">
                            <FormField
                                control={form.control}
                                name="third_party_requested_by"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel className="text-sm font-medium">Solicitado Por</FormLabel>
                                        <FormControl>
                                            <Input className="h-10 w-full" placeholder="Nombre..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="third_party_receiver"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel className="text-sm font-medium">Recibirá</FormLabel>
                                        <FormControl>
                                            <Input className="h-10 w-full" placeholder="Nombre..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="third_party_authorizer"
                                render={({ field }) => (
                                    <FormItem className="mt-1 w-full">
                                        <FormLabel className="text-sm font-medium w-full">Autorizado Por</FormLabel>
                                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger className="h-10 w-full">
                                                    <SelectValue placeholder="Seleccione..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Julian Rodriguez">Julián Rodriguez</SelectItem>
                                                <SelectItem value="Ali Ugueto">Ali Ugueto</SelectItem>
                                                <SelectItem value="Freddy Guerrero">Freddy Guerrero</SelectItem>
                                                <SelectItem value="Fernanda Hernandez">Fernanda Hernandez</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </div>

                {/* === Artículos a Retirar === */}
                <div className="space-y-4">
                    <SectionHeader label="Artículos a Retirar" />

                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center justify-between">
                            Agregar artículo
                            <span className="text-xs text-muted-foreground">
                                Componentes: {aeronauticalCount} · Ferretería: {generalCount}
                            </span>
                        </label>

                        <Popover open={openAdd} onOpenChange={(v) => { setOpenAdd(v); if (v) setAddTab("aero") }}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline" role="combobox" aria-expanded={openAdd}
                                    className="w-full justify-between h-10"
                                    disabled={disabledAdd}
                                >
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        {disabledAdd ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />}
                                        Seleccione un componente...
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-full p-0" align="start">
                                <div className="p-2 border-b flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Button type="button" variant={addTab === "aero" ? "default" : "outline"} className="h-8" onClick={() => setAddTab("aero")}>
                                            Componentes <span className="ml-2 text-xs opacity-80">({aeronauticalCount})</span>
                                        </Button>
                                        <Button type="button" variant={addTab === "general" ? "default" : "outline"} className="h-8" onClick={() => setAddTab("general")}>
                                            Ferretería <span className="ml-2 text-xs opacity-80">({generalCount})</span>
                                        </Button>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpenAdd(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                <Command>
                                    <CommandInput placeholder={addTab === "aero" ? "Buscar por lote, parte, serial o descripción..." : "Buscar por descripción, modelo o tipo..."} />
                                    <CommandList>
                                        <CommandEmpty>No se han encontrado artículos...</CommandEmpty>

                                        {addTab === "aero" ? (
                                            isBatchesLoading ? (
                                                <div className="flex items-center justify-center py-6"><Loader2 className="size-4 animate-spin" /></div>
                                            ) : (
                                                batches?.map((batch: any) => (
                                                    <CommandGroup key={`aero-${batch.batch_id}`} heading={batch.name}>
                                                        {batch.articles.map((article: any) => {
                                                            const already = aeroSelectedSet.has(Number(article.id))
                                                            return (
                                                                <CommandItem
                                                                    key={`a-${article.id}-${batch.batch_id}`}
                                                                    value={`${batch.name} ${article.part_number} ${article.serial ?? ""} ${article.description ?? ""}`}
                                                                    onSelect={() => handleAddAeronautical(article)}
                                                                >
                                                                    <Check className={cn("mr-2 h-4 w-4", already ? "opacity-100" : "opacity-0")} />
                                                                    <div className="flex flex-col flex-1 min-w-0">
                                                                        <span className="font-medium truncate">
                                                                            {article.part_number} {article.serial ? `· ${article.serial}` : ""}
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground truncate">
                                                                            {article.description ?? "Sin descripción"} · Disp: {article.quantity} {article.unit}
                                                                        </span>
                                                                    </div>
                                                                </CommandItem>
                                                            )
                                                        })}
                                                    </CommandGroup>
                                                ))
                                            )
                                        ) : isHardwareLoading ? (
                                            <div className="flex items-center justify-center py-6"><Loader2 className="size-4 animate-spin" /></div>
                                        ) : (
                                            <CommandGroup heading="Inventario general">
                                                {hardwareArticles.map((ga) => {
                                                    const already = genSelectedSet.has(Number(ga.id))
                                                    return (
                                                        <CommandItem
                                                            key={`g-${ga.id}`}
                                                            value={`${ga.description ?? ""} ${ga.brand_model ?? ""} ${ga.variant_type ?? ""}`}
                                                            onSelect={() => handleAddGeneral(ga)}
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4", already ? "opacity-100" : "opacity-0")} />
                                                            <div className="flex flex-col flex-1 min-w-0">
                                                                <span className="font-medium truncate">{ga.description ?? "N/A"}</span>
                                                                <span className="text-xs text-muted-foreground truncate">
                                                                    {ga.brand_model ?? "N/A"} · {ga.variant_type ?? "N/A"} · Disp: {ga.quantity ?? 0} {ga.general_primary_unit?.label ?? ""}
                                                                </span>
                                                            </div>
                                                        </CommandItem>
                                                    )
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
                            <p className="text-xs opacity-70">Use el selector de arriba para agregar componentes.</p>
                        </div>
                    )}

                    {aeroFA.fields.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Componentes</p>
                            {aeroFA.fields.map((f, index) => {
                                const key = aeroKey(f.id)
                                const item = watchedAero[index]
                                const articleId = Number(item?.article_id || 0)
                                const article = articleId ? aeroById.get(articleId) : undefined
                                const max = articleId ? getAeroMax(articleId) : 0
                                return (
                                    <ArticleRowCard
                                        key={f.id}
                                        title={article?.part_number ?? (articleId ? `ID: ${articleId}` : "Artículo")}
                                        subtitle={`${article?.description ?? "Sin descripción"} · Disponible: ${article?.quantity ?? 0} ${article?.unit ?? ""}`}
                                        qty={qtyByKey[key] ?? ""}
                                        max={max}
                                        rowMsg={msgByKey[key]}
                                        disabled={!article}
                                        canConvert={!!article && article.unit !== "u"} // Si no se puede, el hook también lo deshabilitó internamente
                                        showConversionPanel={convState.target === "aero" && convState.rowFieldId === f.id && !!article && article.unit !== "u"}
                                        conversionPanelNode={conversionPanelNode}
                                        accentClass="border-l-blue-500/50"
                                        onQtyChange={(val) => setQtyByKey((p) => ({ ...p, [key]: val }))}
                                        onCommit={() => commitAeroQty(index, f.id)}
                                        onSetMax={() => setToMaxAero(index, f.id)}
                                        onOpenConversion={() => openConversionForAero(index, f.id, articleId)}
                                        onRemove={() => removeAeroRow(index, f.id)}
                                    />
                                )
                            })}
                        </div>
                    )}

                    {genFA.fields.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ferretería</p>
                            {genFA.fields.map((f, index) => {
                                const key = genKey(f.id)
                                const item = watchedGen[index]
                                const generalId = Number(item?.general_article_id || 0)
                                const ga = generalId ? genById.get(generalId) : undefined
                                const max = generalId ? getGenMax(generalId) : 0
                                return (
                                    <ArticleRowCard
                                        key={f.id}
                                        title={ga?.description ?? (generalId ? `ID: ${generalId}` : "Artículo")}
                                        subtitle={`${ga?.brand_model ?? "N/A"} · ${ga?.variant_type ?? "N/A"} · Disponible: ${ga?.quantity ?? 0} ${ga?.general_primary_unit?.label ?? ""}`}
                                        qty={qtyByKey[key] ?? ""}
                                        max={max}
                                        rowMsg={msgByKey[key]}
                                        disabled={!ga}
                                        canConvert={!!ga}
                                        showConversionPanel={convState.target === "general" && convState.rowFieldId === f.id && !!ga}
                                        conversionPanelNode={conversionPanelNode}
                                        accentClass="border-l-amber-500/50"
                                        onQtyChange={(val) => setQtyByKey((p) => ({ ...p, [key]: val }))}
                                        onCommit={() => commitGenQty(index, f.id)}
                                        onSetMax={() => setToMaxGen(index, f.id)}
                                        onOpenConversion={() => openConversionForGeneral(index, f.id, generalId)}
                                        onRemove={() => removeGenRow(index, f.id)}
                                    />
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* === Justificación === */}
                <div className="space-y-4">
                    <SectionHeader label="Justificación" />
                    <FormField
                        control={form.control}
                        name="justification"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea rows={4} className="w-full resize-none" placeholder="Ej: Se necesita para el reemplazo del componente principal..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Separator className="my-2" />

                {/* === Acciones === */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button" variant="outline" onClick={onClose}
                        disabled={createDispatchRequest?.isPending}
                        className="min-w-[100px] h-10"
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="bg-primary text-white hover:bg-primary/90 disabled:bg-primary/70 min-w-[120px] h-10"
                        disabled={
                            createDispatchRequest?.isPending ||
                            aeronauticalCount + generalCount === 0 ||
                            hasBlockingQtyError ||
                            hasInvalidQty
                        }
                        type="submit"
                    >
                        {createDispatchRequest?.isPending ? (
                            <><Loader2 className="size-4 animate-spin mr-2" />Creando...</>
                        ) : "Crear Salida"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
