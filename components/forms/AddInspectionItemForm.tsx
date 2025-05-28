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
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useAddPrelimItem } from "@/actions/planificacion/ordenes_trabajo/inspecccion_preliminar/actions";


const formSchema = z.object({
  ata: z.string().min(1, {
    message: "El ATA debe tener al menos 1 carácters.",
  }),
  description: z.string().min(1, {
    message: "Debe ingresar una descripción válida.",
  }),
  location: z.string().min(1, {
    message: "Debe ingresar una ubicación válida.",
  }),
})


interface FormProps {
  onClose: () => void,
  id: string,
}

export default function AddInspectionItemForm({ onClose, id }: FormProps) {
  const { updateAddInspectionItem } = useAddPrelimItem();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ata: "",
      description: "",
      location: "",
    },
  })
  const { control } = form;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formattedValues = {
      ...values,
      id,
    }
    await updateAddInspectionItem.mutateAsync(formattedValues)
    onClose()
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={control}
          name="ata"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ATA</FormLabel>
              <FormControl>
                <Input placeholder="EJ: 10, 28, 32, etc..." {...field} />
              </FormControl>
              <FormDescription>
                Código ATA.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación</FormLabel>
              <FormControl>
                <Textarea placeholder="EJ: Ala derecha, etc..." {...field} />
              </FormControl>
              <FormDescription>
                Ubicación exacta de la observación.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="EJ: Se encontró..." {...field} />
              </FormControl>
              <FormDescription>
                Breve descripción de lo observado.
              </FormDescription>
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
