"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  CheckCircle2,
  Info,
  KeyRound,
  Loader2,
  Mail,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";

import {
  fieldClass,
  hintClass,
  textareaClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import {
  PanelFieldLabel,
  PanelSection,
  PanelStaticLabel,
} from "@/components/forms/PanelSection";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  fullScreenOnMobile,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dialogs/shared/FormDialogContent";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useRequestPasswordReset } from "@/hooks/sistema/usuario/usePasswordResetRequests";

const MAX_NOTE = 500;

const FormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Ingrese su correo." })
    .email({ message: "El correo no es válido." }),
  note: z
    .string()
    .max(MAX_NOTE, { message: `Máximo ${MAX_NOTE} caracteres.` })
    .optional(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const EASE = [0.22, 1, 0.36, 1] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Correo de la sesión. Desde el login no se conoce y hay que pedirlo, pero
   * dentro del sistema ya se sabe quién solicita: se envía sin preguntarlo.
   */
  email?: string;
}

/**
 * El contenido vive en su propio componente: Radix lo desmonta al cerrar, así
 * que cada apertura arranca limpia (sin la confirmación de la vez anterior ni
 * el texto a medio escribir) sin necesidad de un efecto que lo reinicie.
 */
function ResetRequest({
  email,
  onClose,
}: {
  email?: string;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [sent, setSent] = useState(false);
  const isAuthenticated = Boolean(email);

  const { mutateAsync, isPending } = useRequestPasswordReset();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: { email: email ?? "", note: "" },
  });
  const note = useWatch({ control: form.control, name: "note" });

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
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      };

  return (
    <>
      {/* ───────── Encabezado ───────── */}
      <FormDialogHeader
        tone={sent ? "emerald" : "primary"}
        iconNode={
          // El icono acompaña el estado: llave -> escudo al confirmar.
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={sent ? "done" : "key"}
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.6, rotate: -25 }
              }
              animate={
                reduceMotion
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, rotate: 0 }
              }
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.6, rotate: 25 }
              }
              transition={{ duration: 0.24, ease: EASE }}
              className="flex"
            >
              {sent ? (
                <ShieldCheck className="size-5" />
              ) : (
                <KeyRound className="size-5" />
              )}
            </motion.span>
          </AnimatePresence>
        }
        title={sent ? "Solicitud enviada" : "Recuperar contraseña"}
        description={
          sent
            ? "El administrador fue notificado."
            : isAuthenticated
              ? "Se solicitará una nueva contraseña para su cuenta."
              : "Confirme su correo para solicitar una nueva contraseña."
        }
      />

      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="confirmacion"
            {...fade}
            transition={{ duration: 0.28, ease: EASE }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <FormDialogBody className="flex flex-col items-center gap-3 py-8 text-center">
              <motion.div
                initial={
                  reduceMotion ? { opacity: 0 } : { scale: 0.5, opacity: 0 }
                }
                animate={
                  reduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }
                }
                transition={{ duration: 0.4, ease: EASE, delay: 0.05 }}
              >
                <CheckCircle2 className="size-12 text-emerald-500" />
              </motion.div>

              <p className="max-w-xs text-sm text-muted-foreground">
                {isAuthenticated
                  ? "Un administrador le asignará una nueva contraseña y se la comunicará."
                  : "Si el correo corresponde a una cuenta, un administrador se encargará de asignarle una nueva contraseña y se la comunicará."}
              </p>
            </FormDialogBody>

            <FormDialogFooter>
              <Button type="button" className="min-w-35" onClick={onClose}>
                Entendido
              </Button>
            </FormDialogFooter>
          </motion.div>
        ) : (
          <motion.div
            key="formulario"
            {...fade}
            transition={{ duration: 0.28, ease: EASE }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <Form {...form}>
              <form
                // Desde el login este diálogo cuelga, por el árbol de React,
                // del formulario de inicio de sesión: sin esto el envío
                // también dispararía el de aquel.
                onSubmit={(event) => {
                  event.stopPropagation();
                  void form.handleSubmit(onSubmit)(event);
                }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <FormDialogBody className="space-y-4">
                  <PanelSection
                    icon={Mail}
                    title="Su solicitud"
                    hint="Un administrador la recibirá y le responderá."
                  >
                    <div className="space-y-4">
                      {isAuthenticated ? (
                        <div>
                          <PanelStaticLabel>
                            Correo electrónico
                          </PanelStaticLabel>
                          <div className="flex h-10 items-center gap-2.5 rounded-lg border border-slate-400/60 bg-muted/40 px-3 dark:border-slate-600/60">
                            <Mail className="size-4 shrink-0 text-muted-foreground" />
                            <span className="truncate text-[15px] max-sm:text-base">
                              {email}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <PanelFieldLabel>
                                Correo electrónico
                              </PanelFieldLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                  <Input
                                    {...field}
                                    type="email"
                                    autoComplete="email"
                                    placeholder="usuario@sigeac.com"
                                    className={cn(fieldClass, "pl-9")}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-[13px]" />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="note"
                        render={({ field }) => (
                          <FormItem>
                            <PanelFieldLabel
                              action={
                                <span
                                  className={cn(
                                    hintClass,
                                    "tabular-nums",
                                    (note?.length ?? 0) > MAX_NOTE &&
                                      "text-destructive",
                                  )}
                                >
                                  {note?.length ?? 0}/{MAX_NOTE}
                                </span>
                              }
                            >
                              Mensaje{" "}
                              <span className="font-normal">(opcional)</span>
                            </PanelFieldLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={3}
                                placeholder="Algún detalle que ayude al administrador a identificarlo."
                                className={textareaClass}
                              />
                            </FormControl>
                            <FormMessage className="text-[13px]" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </PanelSection>

                  <p className="flex items-start gap-2 text-[13px] leading-snug text-muted-foreground">
                    <Info className="mt-0.5 size-4 shrink-0" />
                    Por políticas de seguridad, la nueva contraseña la asigna un
                    administrador; no se define desde este formulario.
                  </p>
                </FormDialogBody>

                <FormDialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="min-w-35"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Enviando…
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 size-4" />
                        Enviar solicitud
                      </>
                    )}
                  </Button>
                </FormDialogFooter>
              </form>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function RequestPasswordResetDialog({
  open,
  onOpenChange,
  email,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-104",
          fullScreenOnMobile,
        )}
        // Lo escrito no se recupera: un clic fuera no debe cerrarlo.
        onInteractOutside={(event) => event.preventDefault()}
      >
        <ResetRequest email={email} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
