"use client"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@/lib/zod-resolver"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useCreateWorkshop } from "@/actions/general/talleres/actions"
import { useCompanyStore } from "@/stores/CompanyStore"
import type { Workshop } from "@/types"

const FormSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  rif: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  contact_name: z.string().optional(),
})

interface FormProps {
  onClose: () => void
  onSuccess?: (workshop: Workshop) => void
}

export function CreateWorkshopForm({ onClose, onSuccess }: FormProps) {
  const { selectedCompany } = useCompanyStore()
  const { createWorkshop } = useCreateWorkshop()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      rif: "",
      address: "",
      phone: "",
      contact_name: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const result = await createWorkshop.mutateAsync({
        company: selectedCompany?.slug,
        data,
      })
      if (onSuccess && result) onSuccess(result)
      onClose()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.stopPropagation()
          form.handleSubmit(onSubmit)(e)
        }}
        className="flex flex-col space-y-3"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del taller</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Overhaul Shop C.A." {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rif"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RIF</FormLabel>
              <FormControl>
                <Input placeholder="Ej: J-12345678-9" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input placeholder="Dirección del taller" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input placeholder="Teléfono de contacto" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contact_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Persona de contacto</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del contacto" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>
        <Button
          className="bg-primary text-white hover:bg-blue-900 disabled:bg-primary/70"
          disabled={createWorkshop?.isPending}
          type="submit"
        >
          {createWorkshop?.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Crear</p>}
        </Button>
      </form>
    </Form>
  )
}
