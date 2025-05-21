'use client';
import { useCreateVendor } from "@/actions/ajustes/globales/proveedores/actions";
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


const formSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 carácters.",
  }),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})


interface FormProps {
  onClose: () => void,
}

export default function CreateVendorForm({ onClose }: FormProps) {
  const { createVendor } = useCreateVendor()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      email: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createVendor.mutateAsync(values)
    } catch (error) {
      console.log(error)
    }
    onClose()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2 justify-center">
          <div className="flex gap-2 items-center">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Nombre del Proveedor</FormLabel>
                  <FormControl>
                    <Input placeholder="EJ: Boeing, Airbus, etc..." {...field} />
                  </FormControl>
                  <FormDescription>Nombre identificador.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Nro. de TLF</FormLabel>
                  <FormControl>
                    <Input placeholder="..." {...field} />
                  </FormControl>
                  <FormDescription>Número de contacto.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input placeholder="..." {...field} />
                </FormControl>
                <FormDescription>Correo de contacto.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Ubicación</FormLabel>
                <FormControl>
                  <Input placeholder="..." {...field} />
                </FormControl>
                <FormDescription>Ubicación fiscal.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70" disabled={createVendor?.isPending} type="submit">
          {createVendor?.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Crear Proveedor</p>}
        </Button>
      </form>
    </Form>
  )
}
