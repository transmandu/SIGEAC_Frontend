'use client'

import { useStoreArticleDirectly } from '@/actions/mantenimiento/almacen/inventario/articulos/actions'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useGetAuthorizedEmployees } from '@/hooks/ajustes/autorizados/useGetAuthorizedEmployees'
import { useGetEmployeesByCompany } from '@/hooks/ajustes/empleados/useGetEmployees'
import { cn } from '@/lib/utils'
import { useCompanyStore } from '@/stores/CompanyStore'
import type { TransitArticle } from '@/types/purchase/in-transit'
import { AlertTriangle, Check, ChevronsUpDown, Loader2, PackageCheck } from 'lucide-react'
import { useMemo, useState } from 'react'

// Quien autoriza suele ser un empleado, pero puede ser alguien externo (un
// inspector, un representante del cliente) que no está en la nómina.
type AuthorizerTab = 'employee' | 'external'

// La nómina propia y los empleados que otra empresa autorizó ante ésta se
// presentan como una sola lista: para quien recibe son igual de válidos. La
// diferencia solo importa al guardar, porque el id de empleado del movimiento
// apunta a la tabla local y el autorizado de otra empresa no está en ella.
type Authorizer = {
    key: string
    name: string
    dni: string
    employeeId: number | null
}

export function StoreDirectlyDialog({ article }: { article: TransitArticle }) {
    const [open, setOpen] = useState(false)
    const [tab, setTab] = useState<AuthorizerTab>('employee')
    const [authorizerKey, setAuthorizerKey] = useState<string | null>(null)
    const [employeeSearch, setEmployeeSearch] = useState('')
    const [externalName, setExternalName] = useState('')
    const [reason, setReason] = useState('')

    const { selectedCompany } = useCompanyStore()
    const { data: employees, isLoading: employeesLoading } = useGetEmployeesByCompany(
        selectedCompany?.slug
    )
    const { data: authorized, isLoading: authorizedLoading } = useGetAuthorizedEmployees(
        selectedCompany?.slug
    )
    const { storeArticleDirectly } = useStoreArticleDirectly()

    const authorizersLoading = employeesLoading || authorizedLoading

    const authorizers = useMemo<Authorizer[]>(() => {
        const own = (employees ?? []).map((emp) => ({
            key: `employee-${emp.id}`,
            name: `${emp.first_name} ${emp.last_name}`,
            dni: emp.dni ?? '',
            employeeId: emp.id,
        }))

        const ownDnis = new Set(own.map((a) => a.dni).filter(Boolean))

        // Un mismo DNI puede venir por ambas vías; gana la nómina propia, que sí
        // trae el id que necesita el movimiento.
        const external = (authorized ?? [])
            .filter((auth) => !ownDnis.has(auth.dni_employee))
            .map((auth) => ({
                key: `authorized-${auth.id}`,
                name: auth.employee_name ?? '',
                dni: auth.dni_employee ?? '',
                employeeId: null,
            }))
            .filter((auth) => auth.name)

        return [...own, ...external].sort((a, b) => a.name.localeCompare(b.name))
    }, [employees, authorized])

    const selectedAuthorizer = authorizers.find((a) => a.key === authorizerKey)

    const filteredAuthorizers = useMemo(() => {
        const query = employeeSearch.toLowerCase().trim()
        if (!query) return authorizers
        return authorizers.filter((auth) =>
            `${auth.name} ${auth.dni}`.toLowerCase().includes(query)
        )
    }, [authorizers, employeeSearch])

    const authorizedBy =
        tab === 'employee'
            ? selectedAuthorizer?.name ?? ''
            : externalName.trim()

    const reset = () => {
        setTab('employee')
        setAuthorizerKey(null)
        setEmployeeSearch('')
        setExternalName('')
        setReason('')
    }

    const handleOpenChange = (next: boolean) => {
        setOpen(next)
        if (!next) reset()
    }

    const handleSubmit = async () => {
        if (!authorizedBy) return

        try {
            await storeArticleDirectly.mutateAsync({
                id: article.id,
                authorized_by: authorizedBy,
                // Solo cuando el autorizante es de la nómina propia: del externo
                // —y del autorizado de otra empresa— queda únicamente el nombre.
                authorized_by_employee_id:
                    tab === 'employee' ? selectedAuthorizer?.employeeId ?? null : null,
                authorization_reason: reason.trim() || null,
            })

            handleOpenChange(false)
        } catch {
            // El toast de error ya lo emite la mutación. El diálogo se queda
            // abierto: el rechazo (documentación pendiente, estado inválido) se
            // corrige y se reintenta sin volver a cargar los datos.
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-500 dark:hover:bg-emerald-950/40"
                            onClick={() => setOpen(true)}
                        >
                            <PackageCheck className="size-3.5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Pasar directo al inventario</TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <DialogContent className="sm:max-w-md flex flex-col max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle className="text-center">
                        Pasar directo al inventario
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        El artículo pasará a almacenado sin la inspección de incoming.
                    </DialogDescription>
                </DialogHeader>

                {/* El padding vertical es del área de scroll, no del contenido:
                    sin él el anillo de foco del último campo se corta al borde. */}
                <div className="flex-1 overflow-y-auto space-y-4 px-1 py-1">
                    <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/60 dark:bg-amber-950/40">
                        <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-500" />
                        <p className="text-xs text-amber-800 dark:text-amber-400">
                            Se salta el proceso de incoming. Debe indicar quién autorizó
                            el pase: queda registrado en el historial del artículo.
                        </p>
                    </div>

                    <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Artículo
                        </p>
                        <p className="text-sm font-medium">
                            {article.batch?.name ?? 'N/A'}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                            {article.part_number}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs">
                            Autorizado por <span className="text-destructive">*</span>
                        </Label>

                        <Tabs value={tab} onValueChange={(v) => setTab(v as AuthorizerTab)}>
                            {/* La altura del trigger se baja junto con la de la lista:
                                el py por defecto no cabe en una TabsList más corta. */}
                            <TabsList className="grid w-full grid-cols-2 h-9">
                                <TabsTrigger value="employee" className="h-7 py-0 text-xs">
                                    Empleado
                                </TabsTrigger>
                                <TabsTrigger value="external" className="h-7 py-0 text-xs">
                                    Externo
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {tab === 'employee' ? (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            'w-full justify-between font-normal',
                                            !selectedAuthorizer && 'text-muted-foreground'
                                        )}
                                    >
                                        {selectedAuthorizer
                                            ? selectedAuthorizer.name
                                            : authorizersLoading
                                                ? 'Cargando empleados...'
                                                : 'Elija al empleado que autorizó...'}
                                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0" matchTriggerWidth>
                                    <Command shouldFilter={false}>
                                        <CommandInput
                                            placeholder="Busque un empleado..."
                                            value={employeeSearch}
                                            onValueChange={setEmployeeSearch}
                                        />
                                        <CommandList>
                                            <CommandEmpty className="p-2 text-center text-sm">
                                                {authorizersLoading
                                                    ? 'Cargando...'
                                                    : 'No se ha encontrado ningún empleado.'}
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {filteredAuthorizers.map((authorizer) => (
                                                    <CommandItem
                                                        key={authorizer.key}
                                                        value={`${authorizer.dni} ${authorizer.name}`}
                                                        onSelect={() => setAuthorizerKey(authorizer.key)}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                'mr-2 size-4',
                                                                authorizer.key === authorizerKey
                                                                    ? 'opacity-100'
                                                                    : 'opacity-0'
                                                            )}
                                                        />
                                                        {authorizer.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        ) : (
                            <Input
                                placeholder="Nombre de quien autorizó..."
                                value={externalName}
                                onChange={(e) => setExternalName(e.target.value)}
                                maxLength={255}
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs">
                            Motivo del pase{' '}
                            <span className="text-muted-foreground">(opcional)</span>
                        </Label>
                        <Textarea
                            placeholder="Por qué no requiere inspección de incoming..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            maxLength={1000}
                            rows={3}
                            className="resize-none text-sm"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={storeArticleDirectly.isPending}
                    >
                        Cancelar
                    </Button>
                    {authorizedBy && (
                        <Button
                            onClick={handleSubmit}
                            disabled={storeArticleDirectly.isPending}
                        >
                            {storeArticleDirectly.isPending ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                'Confirmar pase'
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
