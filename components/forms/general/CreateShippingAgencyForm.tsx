"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateShippingAgency } from "@/actions/general/agencias_envio/actions"
import { useCompanyStore } from "@/stores/CompanyStore"
import loadingGif from "@/public/loading2.gif"
import Image from "next/image"

const FormSchema = z.object({
  name: z.string().min(2, { message: "El nombre es requerido" }),
  code: z.string().min(1, { message: "El código es requerido" }),
  description: z.string().optional(),
  type: z.enum(["NATIONAL", "INTERNATIONAL"]),
  phone: z.string().optional(),
  email: z.string().optional(),
})

type FormSchemaType = z.infer<typeof FormSchema>

interface Props {
  onClose: () => void
  initialValues?: FormSchemaType
  onSubmit?: (data: FormSchemaType) => Promise<void>
  isLoading?: boolean
}

export function CreateShippingAgencyForm({
  onClose,
  initialValues,
  onSubmit,
  isLoading: externalLoading,
}: Props) {
  const { selectedCompany } = useCompanyStore()
  const { mutateAsync, isLoading: internalLoading } = useCreateShippingAgency(selectedCompany?.slug) as any

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialValues ?? {
      name: "",
      code: "",
      description: "",
      type: "NATIONAL",
      phone: "",
      email: "",
    },
  })

  const handleSubmit = async (data: FormSchemaType) => {
    if (onSubmit) {
      await onSubmit(data)
      onClose()
      return
    }
    try {
      await mutateAsync(data)
      onClose()
    } catch (error) {
      console.error("Error creating agency:", error)
    }
  }

  const isLoading = onSubmit ? externalLoading : internalLoading

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">

        {/* Nombre + Código */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: DHL Express" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: DHL001" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Descripción */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Describe brevemente la agencia (opcional)" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Tipo */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de agencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NATIONAL">Nacional</SelectItem>
                  <SelectItem value="INTERNATIONAL">Internacional</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Teléfono + Email */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: +1 305 123 4567" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: contacto@agencia.com" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Botón */}
        <Button
          type="submit"
          variant={isLoading ? "outline" : "default"}
          className="bg-primary text-white hover:bg-blue-900 disabled:bg-slate-50 disabled:border-4 flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <Image src={loadingGif} width={20} height={20} alt="Cargando..." className="animate-spin" />
          ) : (
            onSubmit ? "Actualizar Agencia" : "Crear Agencia"
          )}
        </Button>
      </form>
    </Form>
  )
}