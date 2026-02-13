"use client";
import { useState } from "react";
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
import loadingGif from "@/public/loading2.gif";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Separator } from "../../ui/separator";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

const ForgotSchema = z.object({
  email: z.string().email({
    message: "Por favor, ingresa un correo electrónico válido.",
  }),
});

type ForgotSchemaType = z.infer<typeof ForgotSchema>;

export function ForgotPasswordForm() {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ForgotSchemaType>({
    resolver: zodResolver(ForgotSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotSchemaType) => {
    setIsPending(true);
    try {
      const response = await axiosInstance.post("forgot-password", data);
      toast.success(response.data.message || "Enlace enviado correctamente.");
      form.reset();
    } catch (error: any) {
      console.error("Error enviado link: ", error);
      toast.error(
        error.response?.data?.message || "Error al enviar el enlace.",
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
          <h1 className="text-2xl font-bold tracking-tight">SIGEAC</h1>
          <p className="text-xl font-bold">Recuperar contraseña</p>
          <p className="text-sm text-muted-foreground">
            Introduce tu correo y te enviaremos un enlace para restablecerla.
          </p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <Input
                  className="dark:bg-black/30"
                  type="email"
                  placeholder="ejemplo@correo.com"
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
              alt="Enviando..."
            />
          ) : (
            <p>Enviar enlace de recuperación</p>
          )}
        </Button>

        <div className="text-center mt-2">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </form>
    </Form>
  );
}
