"use client"

import { useUpdateUser } from "@/actions/usuarios/actions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useGetUsers } from "@/hooks/user/useGetUsers";
import loadingGif from '@/public/loading2.gif';
import { User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from 'lucide-react';
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

const FormSchema = z.object({
  username: z.string().min(2, {
    message: "La contraseña debe tener al menos 5 caracteres.",
  }),
  password: z.string().min(2, {
    message: "La contraseña debe tener al menos 5 caracteres.",
  }),
  email: z.string().email({
    message: "Debe ingresar un correo electrónico válido."
  }),
})


type FormSchemaType = z.infer<typeof FormSchema>



export function EditUserForm({ user, onClose }: { user: User, onClose: () => void, }) {

  const { data: users } = useGetUsers();

  const [showPwd, setShowPwd] = useState(false);

  const { updateUser } = useUpdateUser()

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: user.username,
      password: "",
      email: user.email,
    },
  })

  const { setValue, setError, clearErrors } = form;
  const firstName = user.first_name
  const lastName = user.last_name
  const [debouncedUsername, setDebouncedUsername] = useState("");


  useEffect(() => {
    const handler = setTimeout(() => {
      if (firstName && lastName) {
        const newUsername = `${firstName.charAt(0)}${lastName}`.toLowerCase();
        const isUsernameTaken = users?.some(user => user.username === newUsername);
        if (isUsernameTaken) {
          setError("username", {
            type: "manual",
            message: "El nombre de usuario ya está en uso."
          });
        } else {
          clearErrors("username");
          setDebouncedUsername(newUsername);
        }
      }
    }, 500); // Ajusta el tiempo del debounce según sea necesario

    return () => {
      clearTimeout(handler);
    };
  }, [firstName, lastName, clearErrors, setError, users]);

  useEffect(() => {
    if (debouncedUsername) {
      setValue('username', debouncedUsername);
    }
  }, [debouncedUsername, setValue]);


  const onSubmit = async (data: FormSchemaType) => {
    try {
      const isUsernameTaken = users?.some(user => user.username === data.username);
      if (isUsernameTaken) {
        setError("username", {
          type: "manual",
          message: "El nombre de usuario ya está en uso."
        });
        return;
      } else {
        clearErrors("username");
        await updateUser.mutateAsync({ ...data, id: user.id.toString() });
      }
    } catch (error) {
      console.error("Error al crear usuario:", error);
    } finally {
      onClose()
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-3">
        <div className="flex gap-2 justify-center items-center  ">
          <div className="space-y-3">
            <Label>Nombre</Label>
            <Input defaultValue={user.first_name} disabled />
          </div>
          <div className="space-y-3">
            <Label>Apellido</Label>
            <Input defaultValue={user.last_name} disabled />
          </div>
        </div>
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input  {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuario</FormLabel>
                <FormControl>
                  <Input disabled placeholder="Ej: aperez" {...field} />
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
                <FormLabel className="flex gap-2 items-center">Contraseña {showPwd ? <EyeOff onClick={() => setShowPwd(!showPwd)} className="size-5 cursor-pointer hover:scale-110 transition-all" /> : <Eye onClick={() => setShowPwd(!showPwd)} className="size-5 cursor-pointer hover:scale-110 transition-all" />}</FormLabel>
                <FormControl>
                  <Input type={showPwd ? "text" : "password"} {...field} />
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
        <Button className="bg-primary text-white hover:bg-blue-900 disabled:bg-slate-50 disabled:border-dashed disabled:border-black" disabled={updateUser?.isPending} type="submit">
          {updateUser?.isPending ? <Image className="text-black" src={loadingGif} width={170} height={170} alt="Loading..." /> : <p>Aplicar Cambios</p>}
        </Button>
      </form >
    </Form >
  )
}
