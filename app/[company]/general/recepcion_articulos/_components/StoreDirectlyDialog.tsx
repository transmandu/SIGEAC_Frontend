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
import { useGetEmployeesByCompany } from '@/hooks/ajustes/empleados/useGetEmployees'
import { cn } from '@/lib/utils'
import { useCompanyStore } from '@/stores/CompanyStore'
import type { TransitArticle } from '@/types/purchase/in-transit'
import { AlertTriangle, Check, ChevronsUpDown, Loader2, PackageCheck } from 'lucide-react'
import { useMemo, useState } from 'react'

// Quien autoriza suele ser un empleado, pero puede ser alguien externo (un
// inspector, un representante del cliente) que no está en la nómina.
type AuthorizerTab = 'employee' | 'external'

export function StoreDirectlyDialog({ article }: { article: TransitArticle }) {
    const [open, setOpen] = useState(false)
    const [tab, setTab] = useState<AuthorizerTab>('employee')
    const [employeeId, setEmployeeId] = useState<number | null>(null)
    const [employeeSearch, setEmployeeSearch] = useState('')
    const [externalName, setExternalName] = useState('')
    const [reason, setReason] = useState('')

    const { selectedCompany } = useCompanyStore()
    const { data: employees, isLoading: employeesLoading } = useGetEmployeesByCompany(
        selectedCompany?.slug
    )
    const { storeArticleDirectly } = useStoreArticleDirectly()

    const selectedEmployee = employees?.find((e) => e.id === employeeId)

    const filteredEmployees = useMemo(() => {
        if (!employees) return []
        const query = employeeSearch.toLowerCase().trim()
        if (!query) return employees
        return employees.filter((emp) =>
            `${emp.first_name} ${emp.last_name} ${emp.dni}`.toLowerCase().includes(query)
        )
    }, [employees, employeeSearch])

    const authorizedBy =
        tab === 'employee'
            ? selectedEmployee
                ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
                : ''
            : externalName.trim()

    const reset = () => {
        setTab('employee')
        setEmployeeId(null)
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
                // Solo cuando el autorizante es de la nómina: del externo únicamente
                // queda el nombre que se escribió.
                authorized_by_employee_id: tab === 'employee' ? employeeId : null,
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
                                            !selectedEmployee && 'text-muted-foreground'
                                        )}
                                    >
                                        {selectedEmployee
                                            ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
                                            : employeesLoading
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
                                                {employeesLoading
                                                    ? 'Cargando...'
                                                    : 'No se ha encontrado ningún empleado.'}
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {filteredEmployees.map((employee) => (
                                                    <CommandItem
                                                        key={employee.id}
                                                        value={`${employee.dni} ${employee.first_name} ${employee.last_name}`}
                                                        onSelect={() => setEmployeeId(employee.id)}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                'mr-2 size-4',
                                                                employee.id === employeeId
                                                                    ? 'opacity-100'
                                                                    : 'opacity-0'
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
