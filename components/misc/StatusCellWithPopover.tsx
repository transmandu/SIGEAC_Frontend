'use client';

import { useUpdateToolArticleStatus } from '@/actions/mantenimiento/almacen/inventario/articulos/actions';
import { IArticleSimple } from '@/app/[company]/almacen/inventario_articulos/_tables/warehouse-columns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { CalendarIcon } from 'lucide-react';
import { es } from 'date-fns/locale';

// Types
type ToolStatus = 'CALIBRADO' | 'EN CALIBRACION' | 'VENCIDO' | 'N/A' | string;

type Tool = {
    id: string | number;
    status?: ToolStatus;
    calibration_date?: string | null;
};

type Props = {
    tool?: IArticleSimple | null;
    globalStatus?: string | null;
};

// Form schema
const calibratedSchema = z.object({
    calibration_date: z.date(),
});

type CalibratedForm = z.infer<typeof calibratedSchema>;

// Función auxiliar para obtener las clases del badge según el estado
const getBadgeStyle = (status?: string | null) => {
    switch (status) {
        case 'CALIBRADO':
            return 'bg-green-500 hover:bg-green-600 text-white';
        case 'EN CALIBRACION':
            return 'bg-yellow-500 hover:bg-yellow-600 text-white';
        case 'VENCIDO':
            return 'bg-red-500 hover:bg-red-600 text-white';
        case 'N/A':
            return 'bg-white text-black border border-gray-300 hover:bg-gray-100';
        default:
            return 'bg-gray-200 text-gray-800'; // Fallback por defecto
    }
};

export default function StatusCellWithPopover({ tool }: Props) {
    const status = tool?.tool?.status;

    // Agrupamos la lógica para saber si necesita el popover o solo el badge
    const isInteractiveAction = status === 'VENCIDO' || status === 'EN CALIBRACION';
    const isStaticAction = status === 'CALIBRADO' || status === 'N/A';

    // Blanco con texto oscuro y borde para que no se pierda en fondos claros
    const { updateToolArticleStatus } = useUpdateToolArticleStatus();

    const form = useForm<CalibratedForm>({
        resolver: zodResolver(calibratedSchema),
    });

    async function handleSendToCalibration() {
        if (!tool) return;
        await updateToolArticleStatus.mutateAsync({ id: Number(tool.id), status: 'EN CALIBRACION' });
    }

    async function handleMarkCalibrated(values: CalibratedForm) {
        if (!tool) return;
        await updateToolArticleStatus.mutateAsync({
            id: Number(tool.id),
            status: 'CALIBRADO',
            calibration_date: format(values.calibration_date, 'yyyy-MM-dd'),
        });
    }

    // Extraemos el elemento Badge para no repetir código
    const StatusBadge = (
        <Badge className={cn('text-xs text-center', getBadgeStyle(status))}>
            {status || 'DESCONOCIDO'}
        </Badge>
    );

    return (
        <div className="flex flex-col justify-center items-center space-y-2">
            {/* Si es CALIBRADO o N/A, mostramos solo el Badge sin interacción */}
            {isStaticAction && (
                <div className="flex items-center gap-2">
                    {StatusBadge}
                </div>
            )}

            {/* Si es VENCIDO o EN CALIBRACION, mostramos el Popover */}
            {isInteractiveAction && (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-sm p-0 h-auto">
                            {StatusBadge}
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-72">
                        {status === 'VENCIDO' && (
                            <div className="space-y-3 flex flex-col justify-center items-center">
                                <div className="text-sm">La herramienta está vencida.</div>
                                <Button size="sm" onClick={handleSendToCalibration} disabled={updateToolArticleStatus.isPending}>
                                    {updateToolArticleStatus.isPending ? 'Enviando...' : 'Enviar a calibración'}
                                </Button>
                            </div>
                        )}

                        {status === 'EN CALIBRACION' && (
                            <div className="">
                                <div className="text-xs text-center mb-2">Herramienta en calibración. Marca como calibrado:</div>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleMarkCalibrated)} className="flex flex-col space-y-2">
                                        <div>
                                            <FormField
                                                control={form.control}
                                                name="calibration_date"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col w-full mt-1.5 space-y-3">
                                                        <FormLabel>Fecha de calibración</FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant="outline"
                                                                        className={cn(
                                                                            'w-full pl-3 text-left font-normal',
                                                                            !field.value && 'text-muted-foreground',
                                                                        )}
                                                                    >
                                                                        {field.value ? (
                                                                            format(field.value, 'PPP', { locale: es })
                                                                        ) : (
                                                                            <span>Seleccione una fecha</span>
                                                                        )}
                                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <Calendar
                                                                    locale={es}
                                                                    mode="single"
                                                                    selected={field.value}
                                                                    onSelect={(d) => form.setValue('calibration_date', d!)}
                                                                    initialFocus
                                                                    month={field.value}
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {form.formState.errors.calibration_date && (
                                                <p className="text-xs text-red-600 mt-1">{form.formState.errors.calibration_date.message}</p>
                                            )}
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" onClick={() => form.reset()} type="button">
                                                Cancelar
                                            </Button>
                                            <Button type="submit" size="sm" disabled={updateToolArticleStatus.isPending}>
                                                {updateToolArticleStatus.isPending ? 'Guardando...' : 'Marcar calibrado'}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
}
