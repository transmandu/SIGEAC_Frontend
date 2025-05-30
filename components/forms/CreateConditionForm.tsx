"use client"
import { useCreateCondition } from "@/actions/aerolinea/almacen/condiciones_articulos/actions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import loadingGif from '@/public/loading2.gif';
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

const FormSchema = z.object({
  name: z.string().min(3, {
    message: "El usuario debe tener al menos 3 caracteres.",
  }),
  description: z.string().min(2, {
    message: "La contraseña debe tener al menos 5 caracteres.",
  }),
})

type FormSchemaType = z.infer<typeof FormSchema>
interface FormProps {
  onClose: () => void,
}

export function CreateConditionForm({ onClose }: FormProps) {

  const { user } = useAuth()

  const { createCondition } = useCreateCondition()

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const onSubmit = async (data: FormSchemaType) => {
    await createCondition.mutateAsync({
      ...data,
      registered_by: `${user?.first_name} ${user?.last_name}`
    })
    onClose()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input className="dark:bg-black/30" placeholder="EJ: Usado, reparable, etc..." {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
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
                <Textarea className="dark:bg-black/30" placeholder="Indica a que se refiere el nombre..." {...field} />
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
        <Button variant={createCondition.isPending ? 'outline' : "default"} className="bg-primary text-white hover:bg-blue-900 disabled:bg-slate-50 disabled:border-4" disabled={createCondition?.isPending} type="submit">
          {createCondition?.isPending ? <Image className="text-black" src={loadingGif} width={170} height={170} alt="Loading..." /> : <p>Crear</p>}
        </Button>
      </form>
    </Form>
  )
}
