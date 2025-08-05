"use client"
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import loadingGif from '@/public/loading2.gif';
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Separator } from "../../ui/separator";

const FormSchema = z.object({
  login: z.string().min(3, {
    message: "El usuario debe tener al menos 3 caracteres.",
  }),
  password: z.string().min(2, {
    message: "La contraseña debe tener al menos 5 caracteres.",
  }),
})

type FormSchemaType = z.infer<typeof FormSchema>

export function LoginForm() {

  const { loginMutation } = useAuth();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  })

  const onSubmit = (data: FormSchemaType) => {
    loginMutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-3">
        <FormField
          control={form.control}
          name="login"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuario</FormLabel>
              <FormControl>
                <Input className="dark:bg-black/30" placeholder="admin" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input className="dark:bg-black/30" type="password" placeholder="******" {...field} />
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
        <Button variant={loginMutation.isPending ? 'outline' : "default"} className="bg-primary text-white hover:bg-blue-900 disabled:bg-slate-50 disabled:border-4" disabled={loginMutation?.isPending} type="submit">
          {loginMutation?.isPending ? <Image className="text-black" src={loadingGif} width={170} height={170} alt="Loading..." /> : <p>Iniciar Sesion</p>}
        </Button>
      </form>
    </Form>
  )
}
