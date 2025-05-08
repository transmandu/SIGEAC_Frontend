"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Separator } from "../ui/separator"
import { useCreateCertificate } from "@/actions/ingenieria/certificados/actions"
import { Loader2 } from "lucide-react"

const FormSchema = z.object({
  name: z.string().min(3, {
    message: "El usuario debe tener al menos 3 caracteres.",
  }),
})

type FormSchemaType = z.infer<typeof FormSchema>

interface FormProps {
  onClose: () => void,
}

export function CreateCertificateForm({ onClose }: FormProps) {

  const { createCertificate } = useCreateCertificate()

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
    },
  })


  const onSubmit = async (data: FormSchemaType) => {
    await createCertificate.mutateAsync(data)
    onClose()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-3">
        <div className='flex justify-center gap-2 items-center'>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center gap-2">
                <FormLabel>Nombre del Certificado</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 8130, Fabricante, etc..." {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>
        <Button disabled={createCertificate.isPending}>{createCertificate.isPending ? <Loader2 className="animate-spin" /> : "Crear Certificado"}</Button>
      </form>
    </Form>
  )
}
