'use client';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../../ui/button";
import { Textarea } from "../../../ui/textarea";
import { useAddPrelimItem } from "@/actions/mantenimiento/planificacion/ordenes_trabajo/inspecccion_preliminar/actions";
import { useCompanyStore } from "@/stores/CompanyStore";


const formSchema = z.object({
  description_task: z.string().min(1, 'La descripción de la tarea es obligatoria'),
  ata: z.string().min(1, 'Código ATA requerido'),
  task_number: z.string().min(1, 'Número de tarea requerido'),
  origin_manual: z.string().min(1, 'Origen manual requerido'),
  task_items: z.array(z.object({
    part_number: z.string().min(1, 'Número de parte requerido'),
    alternate_part_number: z.string().optional(),
  })).optional()
})

interface FormProps {
  onClose: () => void,
  work_order_id: string,
}

export default function AddRoutineTaskForm({ work_order_id, onClose }: FormProps) {
  const { updateAddInspectionItem } = useAddPrelimItem();
  const { selectedCompany } = useCompanyStore();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ata: "",
      description_task: "",
      origin_manual: "",
      task_number: "",
    },
  })
  const { control } = form;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {

    onClose()
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={control}
          name="task_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Tarea</FormLabel>
              <FormControl>
                <Input
                {...field}
                placeholder="Ej: TASK-001"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Origin Manual */}
        <FormField
          control={control}
          name="origin_manual"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manual de Origen</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ej: MPD"
                  />
                </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* ATA Code */}
        <FormField
          control={control}
          name="ata"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código ATA</FormLabel>
                <FormControl>
                  <Input
                  {...field}
                  placeholder="Ej: 20"
                  />
                </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Task Description (full width) */}
        <FormField
          control={control}
          name="description_task"
          render={({ field }) => (
            <FormItem className="md:col-span-3">
              <FormLabel>Descripción de la Tarea</FormLabel>
              <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Ej: Inspeccionar el ala derecha..."
                  />
                </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70" disabled={updateAddInspectionItem?.isPending} type="submit">
          {updateAddInspectionItem?.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Agregar</p>}
        </Button>
      </form>
    </Form>
  )
}
