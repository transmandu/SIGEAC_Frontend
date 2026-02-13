"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import loadingGif from "@/public/loading2.gif";
import { Separator } from "../../ui/separator";

const ResetPasswordSchema = z
  .object({
    password: z.string().min(6, {
      message: "La contraseña debe tener al menos 6 caracteres.",
    }),
    password_confirmation: z.string().min(6, {
      message: "La confirmación debe tener al menos 6 caracteres.",
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  });

type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;

interface ResetPasswordFormProps {
  token: string;
  email: string;
}

export function ResetPasswordForm({ token, email }: ResetPasswordFormProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (data: ResetPasswordSchemaType) => {
    setIsPending(true);

    try {
      const response = await axiosInstance.post("/reset-password", {
        token: token,
        email: email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      toast.success(
        response.data.message || "La contraseña ha sido restablecida correctamente.",
      );
      router.push("/login");
    } catch (error: any) {
      console.error("Ha ocurrido un error al intentar restablecer la contraseña:", error);
      toast.error(
        error.response?.data?.message || "Ha ocurrido un error al intentar restablecer la contraseña.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-4"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Nueva contraseña
          </h1>
          <p className="text-sm text-muted-foreground">
            Introduce tu nueva contraseña a continuación.
          </p>
        </div>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nueva Contraseña</FormLabel>
              <FormControl>
                <Input
                  className="dark:bg-black/30"
                  type="password"
                  placeholder="********"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password_confirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Contraseña</FormLabel>
              <FormControl>
                <Input
                  className="dark:bg-black/30"
                  type="password"
                  placeholder="********"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground text-xs font-medium">SIGEAC</p>
          <Separator className="flex-1" />
        </div>

        <Button
          variant={isPending ? "outline" : "default"}
          className="bg-primary text-white hover:bg-blue-900 w-full"
          disabled={isPending}
          type="submit"
        >
          {isPending ? (
            <Image
              src={loadingGif}
              width={100}
              height={100}
              alt="Cargando..."
            />
          ) : (
            <p>Restablecer contraseña</p>
          )}
        </Button>
      </form>
    </Form>
  );
}
