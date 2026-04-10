'use client';

import { useUpdateToolArticleStatus } from '@/actions/mantenimiento/almacen/inventario/articulos/actions';
import { IArticleSimple } from '@/app/[company]/almacen/inventario_articulos/_tables/warehouse-columns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';

/* IMPORTA tu componente Calendar de shadcn.
   En plantillas shadcn suele ser:
   import { Calendar } from '@/components/ui/calendar';
   Si tu proyecto lo nombra distinto, ajústalo.
*/
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { CalendarIcon } from 'lucide-react';
import { es } from 'date-fns/locale';

// Types
type ToolStatus = 'CALIBRADO' | 'EN CALIBRACION' | 'VENCIDO' | string;

type Tool = {
  id: string | number;
  status?: ToolStatus;
  calibration_date?: string | null;
};

type Props = {
  tool?: IArticleSimple | null;
  globalStatus?: string | null; // original row.status
};

// Form schema
const calibratedSchema = z.object({
  calibration_date: z.date(),
});

type CalibratedForm = z.infer<typeof calibratedSchema>;

export default function StatusCellWithPopover({ tool }: Props) {
  const calibrated = tool?.tool?.status === 'CALIBRADO';
  const calibrating = tool?.tool?.status === 'EN CALIBRACION';
  const descalibrated = tool?.tool?.status === 'VENCIDO';
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
    // aquí enviamos la fecha tal como la validó zod (string ISO yyyy-mm-dd)
    await updateToolArticleStatus.mutateAsync({
      id: Number(tool.id),
      status: 'CALIBRADO',
      calibration_date: format(values.calibration_date, 'yyyy-MM-dd'),
    });
  }

  return (
    <div className="flex flex-col justify-center items-center space-y-2">
      {calibrated && (
        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              'text-xs text-center',
              calibrated
                ? 'bg-green-500 hover:bg-green-600'
                : calibrating
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : descalibrated
                    ? 'bg-red-500 hover:bg-red-600'
                    : '',
            )}
          >
            {tool?.tool?.status}
          </Badge>
        </div>
      )}
      {(descalibrated || calibrating) && (
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" className="text-sm">
              <Badge
                className={cn(
                  'text-xs text-center',
                  calibrated
                    ? 'bg-green-500 hover:bg-green-600'
                    : calibrating
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : descalibrated
                        ? 'bg-red-500 hover:bg-red-600'
                        : '',
                )}
              >
                {tool?.tool?.status}
              </Badge>
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-72">
            {descalibrated && (
              <div className="space-y-3 flex flex-col justify-center items-center">
                <div className="text-sm">La herramienta está vencida.</div>
                <Button size="sm" onClick={handleSendToCalibration} disabled={updateToolArticleStatus.isPending}>
                  {updateToolArticleStatus.isPending ? 'Enviando...' : 'Enviar a calibración'}
                </Button>
              </div>
            )}

            {calibrating && (
              <div className="">
                <div className="text-xs text-center mb-2">Herramienta en calibración. Marca como calibrado:</div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleMarkCalibrated)} className="flex flex-col space-y-2">
                    <div>
                      {/* Controller + Calendar (shadcn) */}
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
                      <Button size="sm" variant="outline" onClick={() => form.reset()}>
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
