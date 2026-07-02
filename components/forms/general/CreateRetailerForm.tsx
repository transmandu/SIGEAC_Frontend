'use client';
import { useCreateRetailer } from "@/actions/general/comercios/actions";
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
import { useCompanyStore } from "@/stores/CompanyStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../ui/button";
import type { Retailer } from "@/types";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 carácteres.",
  }),
  address: z.string().optional(),
  phone: z.string().optional(),
})

interface FormProps {
  onClose: () => void,
  /** Called with the newly created retailer after a successful creation. */
  onCreated?: (retailer: Retailer) => void,
}

export default function CreateRetailerForm({ onClose, onCreated }: FormProps) {
  const { createRetailer } = useCreateRetailer()
  const { selectedCompany } = useCompanyStore()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const retailer = await createRetailer.mutateAsync({
        ...values,
        company: selectedCompany!.slug,
      })
      if (retailer) onCreated?.(retailer)
    } catch (error) {
    }
    onClose()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2 justify-center">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nombre del Comercio</FormLabel>
                <FormControl>
                  <Input placeholder="EJ: Ferretería EPA, Mercado Libre, etc..." {...field} />
                </FormControl>
                <FormDescription>Tienda física o sitio en línea donde se compra.</FormDescription>
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
                <FormDescription>Número de contacto (opcional).</FormDescription>
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
                <FormDescription>Dirección física o URL del sitio (opcional).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70" disabled={createRetailer?.isPending} type="submit">
          {createRetailer?.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Crear Comercio</p>}
        </Button>
      </form>
    </Form>
  )
}
