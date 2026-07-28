'use client'

import { useEffect, useMemo, useState } from 'react'
import { Boxes, Loader2 } from 'lucide-react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useGetModules } from '@/hooks/sistema/useGetModules'
import { useSyncCompanyModules } from '@/actions/sistema/empresas/actions'
import { Company } from '@/types'

interface Props {
    company: Company
    open: boolean
    onOpenChange: (open: boolean) => void
}

const ManageCompanyModulesDialog = ({
    company,
    open,
    onOpenChange,
}: Props) => {
    const { data: modules, isLoading, isError } = useGetModules()
    const { syncCompanyModules } = useSyncCompanyModules()

    const assignedIds = useMemo(
        () => (company.modules ?? []).map((m) => m.id),
        [company.modules]
    )

    const [selected, setSelected] = useState<number[]>(assignedIds)

    // Al reabrir, la selección parte de lo que la compañía tiene guardado: sin
    // esto el diálogo conservaría los checkboxes de una edición cancelada.
    useEffect(() => {
        if (open) setSelected(assignedIds)
    }, [open, assignedIds])

    const toggle = (id: number) => {
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        )
    }

    const isDirty =
        selected.length !== assignedIds.length ||
        selected.some((id) => !assignedIds.includes(id))

    const handleSubmit = async () => {
        await syncCompanyModules.mutateAsync({
            slug: company.slug,
            module_ids: selected,
        })

        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Boxes className="size-5" />
                        Módulos de {company.name}
                    </DialogTitle>

                    <DialogDescription>
                        Seleccione los módulos habilitados para esta empresa. Al
                        quitar un módulo también se retira el acceso que los
                        usuarios tuvieran a él en esta empresa.
                    </DialogDescription>
                </DialogHeader>

                {isLoading && (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                )}

                {isError && (
                    <p className="py-10 text-center text-sm text-muted-foreground">
                        Ha ocurrido un error al cargar los módulos.
                    </p>
                )}

                {modules && (
                    <ScrollArea className="max-h-72 pr-3">
                        <div className="flex flex-col gap-1">
                            {modules.map((module) => (
                                <label
                                    key={module.id}
                                    htmlFor={`module-${module.id}`}
                                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-border/70 hover:bg-muted/40"
                                >
                                    <Checkbox
                                        id={`module-${module.id}`}
                                        checked={selected.includes(module.id)}
                                        onCheckedChange={() => toggle(module.id)}
                                    />

                                    <div className="flex flex-col leading-tight">
                                        <span className="text-sm font-medium">
                                            {module.label}
                                        </span>

                                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                            {module.value}
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </ScrollArea>
                )}

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={syncCompanyModules.isPending}
                    >
                        Cancelar
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        disabled={!isDirty || syncCompanyModules.isPending}
                    >
                        {syncCompanyModules.isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            'Guardar'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ManageCompanyModulesDialog
