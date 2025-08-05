'use client';
import { useCreateUnit } from "@/actions/general/unidades/actions";
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
import { Button } from "../../ui/button";


const formSchema = z.object({
  label: z.string().min(3, {
    message: "El nombre debe tener al menos 3 carácters.",
  }),
  value: z.string().min(1, {
    message: "El valor debe tener al menos 1 carácters.",
  }),
})


interface FormProps {
  onClose: () => void,
}

export default function CreateUnitForm({ onClose }: FormProps) {
  const { createUnit } = useCreateUnit();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      value: "",
    },
  })
  const { control } = form;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createUnit.mutate(values);
    onClose()
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="EJ: Kilogramo, Litro, Mililitro" {...field} />
              </FormControl>
              <FormDescription>
                Este será el nombre de su unidad.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
              <FormControl>
                <Input placeholder="EJ: Kg, L, mL" {...field} />
              </FormControl>
              <FormDescription>
                Este será el valor de su unidad.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70" disabled={createUnit?.isPending} type="submit">
          {createUnit?.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Crear</p>}
        </Button>
      </form>
    </Form>
  )
}
