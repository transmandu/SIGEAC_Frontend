"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckCircle2, KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useRequestPasswordReset } from "@/hooks/sistema/usuario/usePasswordResetRequests";

const FormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Ingrese su correo." })
    .email({ message: "El correo no es válido." }),
  note: z.string().max(500, { message: "Máximo 500 caracteres." }).optional(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const EASE = [0.22, 1, 0.36, 1] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RequestPasswordResetDialog({ open, onOpenChange }: Props) {
  const reduceMotion = useReducedMotion();
  const [sent, setSent] = useState(false);

  const { mutateAsync, isPending } = useRequestPasswordReset();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: { email: "", note: "" },
  });

  // Al reabrir se limpia el estado; si no, el usuario vería la confirmación
  // de la vez anterior.
  useEffect(() => {
    if (!open) return;

    const timeout = setTimeout(() => {
      setSent(false);
      form.reset();
    }, 200);

    return () => clearTimeout(timeout);
  }, [open, form]);

  const onSubmit = async (data: FormSchemaType) => {
    try {
      await mutateAsync({ email: data.email, note: data.note || undefined });
      setSent(true);
    } catch {
      // El hook ya muestra el toast de error.
    }
  };

  const fade = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 8, filter: "blur(4px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, y: -8, filter: "blur(4px)" },
      };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[26rem]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {/* El icono acompaña el estado: llave -> escudo al confirmar. */}
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                "border transition-colors duration-300",
                sent
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-primary/25 bg-primary/10 text-primary"
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={sent ? "done" : "key"}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: -25 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: 25 }}
                  transition={{ duration: 0.24, ease: EASE }}
                >
                  {sent ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <KeyRound className="h-5 w-5" />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-left text-base">
                {sent ? "Solicitud enviada" : "Recuperar contraseña"}
              </DialogTitle>
              <DialogDescription className="text-left text-xs">
                {sent
                  ? "El administrador fue notificado."
                  : "Confirme su correo para solicitar una nueva contraseña."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait" initial={false}>
          {sent ? (
            <motion.div
              key="confirmacion"
              {...fade}
              transition={{ duration: 0.28, ease: EASE }}
              className="flex flex-col items-center gap-3 py-4 text-center"
            >
              <motion.div
                initial={reduceMotion ? { opacity: 0 } : { scale: 0.5, opacity: 0 }}
                animate={reduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.05 }}
              >
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </motion.div>

              <p className="text-sm text-muted-foreground">
                Si el correo corresponde a una cuenta, un administrador se
                encargará de asignarle una nueva contraseña y se la comunicará.
              </p>

              <Button
                className="mt-2 w-full"
                onClick={() => onOpenChange(false)}
              >
                Entendido
              </Button>
            </motion.div>
          ) : (
            <motion.div key="formulario" {...fade} transition={{ duration: 0.28, ease: EASE }}>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo electrónico</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              {...field}
                              type="email"
                              autoComplete="email"
                              placeholder="usuario@sigeac.com"
                              className="h-10 rounded-lg pl-9"
                            /> 
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          Mensaje
                          <span className="text-xs font-normal text-muted-foreground">
                            (opcional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="Algún detalle que ayude al administrador a identificarlo."
                            className="resize-none rounded-lg"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <p className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    Por políticas de seguridad, la nueva contraseña la asigna un
                    administrador; no se define desde este formulario.
                  </p>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => onOpenChange(false)}
                      disabled={isPending}
                    >
                      Cancelar
                    </Button>

                    <Button type="submit" className="flex-1" disabled={isPending}>
                      <AnimatePresence mode="wait" initial={false}>
                        {isPending ? (
                          <motion.span
                            key="cargando"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Enviando…
                          </motion.span>
                        ) : (
                          <motion.span
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            Enviar solicitud
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
