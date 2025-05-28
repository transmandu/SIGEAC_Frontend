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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { useCreateManufacturer } from "@/actions/ajustes/globales/fabricantes/actions";


const formSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 carácters.",
  }),
  description: z.string().min(3, {
    message: "La descripcion debe tener al menos 3 carácters.",
  }),
  type: z.enum(["AIRCRAFT", "PART"], {
    required_error: "Debe seleccionar un tipo",
  }),
})


interface FormProps {
  onClose: () => void,
}

export default function CreateManufacturerForm({ onClose }: FormProps) {

  const { createManufacturer } = useCreateManufacturer()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "AIRCRAFT",
      description: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createManufacturer.mutateAsync(values)
      onClose()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Fabricante</FormLabel>
              <FormControl>
                <Input placeholder="EJ: Boeing, Airbus, etc..." {...field} />
              </FormControl>
              <FormDescription>
                Este será el nombre del fabricante.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="AIRCRAFT">Aeronave</SelectItem>
                  <SelectItem value="PART">Parte</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Indique si es de parte o de aeronave.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="..." {...field} />
              </FormControl>
              <FormDescription>
                Agregue una <strong>descripcion</strong> al fabricante.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70" disabled={createManufacturer?.isPending} type="submit">
          {createManufacturer?.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Crear</p>}
        </Button>
      </form>
    </Form>
  )
}
