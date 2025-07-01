"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Separator } from "../../ui/separator"

const FormSchema = z.object({
  acronym: z.string({ message: "El acronimo es requerido." }),
  name: z.string().min(3, {
    message: "El usuario debe tener al menos 3 caracteres.",
  }),
  fiscal_address: z.string().min(2, {
    message: "La direccion debe tener al menos 5 caracteres.",
  }),
  rif: z.string().min(4, {
    message: "Debe ingresar un RIF válido."
  }),
  description: z.string().min(10, {
    message: "Debe proveer una descripcion minima."
  }),
  phone_number: z.string(),
  alt_phone_number: z.string().optional(),
  cod_inac: z.string().min(2, {
    message: "El codigo debe tener la longitud correcta.",
  }),
  cod_iata: z.string().min(2, {
    message: "El codigo debe tener la longitud correcta.",
  }),
  cod_oaci: z.string().min(2, {
    message: "El codigo debe tener la longitud correcta.",
  }),
})

type FormSchemaType = z.infer<typeof FormSchema>

interface FormProps {
  onClose: () => void,
}

export function CreateCompanyForm({ onClose }: FormProps) {

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      fiscal_address: "",
      rif: "",
      phone_number: "",
      description: "",
      alt_phone_number: "",
      cod_iata: "",
      cod_oaci: "",
      cod_inac: "",
    },
  })


  const onSubmit = (data: FormSchemaType) => {
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-3">
        <div className='flex gap-2 items-center'>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razón Social</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Hangar74" {...field} />
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
                  <Input placeholder="Ej: J-#######" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="acronym"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Abrev.</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: TMD - HG74 - etc..." {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Empresa de mantenimiento..." {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fiscal_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación Fiscal</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Av. Atlantico, Calle 804..." {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <div className="flex gap-2 items-center">
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: +58424-2025399" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="alt_phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel >Teléfono 2 <span className="text-xs text-muted-foreground">(opcional)</span></FormLabel>
                <FormControl>
                  <Input placeholder="Ej: +58424-2025399" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center gap-2">
          <FormField
            control={form.control}
            name="cod_inac"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código INAC</FormLabel>
                <FormControl>
                  <Input placeholder="ABC123" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cod_iata"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código IATA</FormLabel>
                <FormControl>
                  <Input placeholder="ABC123" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cod_oaci"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código OACI</FormLabel>
                <FormControl>
                  <Input placeholder="ABC123" {...field} />
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
        <Button>Crear Company</Button>
      </form>
    </Form>
  )
}
