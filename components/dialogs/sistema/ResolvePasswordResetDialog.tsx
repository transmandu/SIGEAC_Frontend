"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

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
import { cn } from "@/lib/utils";
import {
  PasswordResetRequest,
  useRejectPasswordReset,
  useResolvePasswordReset,
} from "@/hooks/sistema/usuario/usePasswordResetRequests";

const FormSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Mínimo 8 caracteres." }),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Las contraseñas no coinciden.",
    path: ["password_confirmation"],
  });

type FormSchemaType = z.infer<typeof FormSchema>;

const EASE = [0.22, 1, 0.36, 1] as const;

/** Genera una clave legible pero fuerte, para no inventarla a mano. */
const generatePassword = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const symbols = "!@#$%&*";
  const bytes = new Uint32Array(14);
  crypto.getRandomValues(bytes);

  const body = Array.from(bytes.slice(0, 13))
    .map((n) => alphabet[n % alphabet.length])
    .join("");

  return body + symbols[bytes[13] % symbols.length];
};

interface Props {
  request: PasswordResetRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ResolvePasswordResetDialog({
  request,
  open,
  onOpenChange,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [show, setShow] = useState(false);

  const resolve = useResolvePasswordReset();
  const reject = useRejectPasswordReset();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  useEffect(() => {
    if (!open) return;

    const timeout = setTimeout(() => {
      form.reset();
      setShow(false);
    }, 200);

    return () => clearTimeout(timeout);
  }, [open, form]);

  if (!request) return null;

  const targetName = request.user
    ? `${request.user.first_name ?? ""} ${request.user.last_name ?? ""}`.trim() ||
      request.user.username ||
      request.email
    : request.email;

  const handleGenerate = () => {
    const generated = generatePassword();
    form.setValue("password", generated, { shouldValidate: true });
    form.setValue("password_confirmation", generated, { shouldValidate: true });
    setShow(true);
  };

  const handleCopy = async () => {
    const value = form.getValues("password");
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      toast.success("Contraseña copiada");
    } catch {
      toast.error("No se pudo copiar", {
        description: "Cópiela manualmente del campo.",
      });
    }
  };

  const onSubmit = async (data: FormSchemaType) => {
    await resolve.mutateAsync({ id: request.id, ...data });
    onOpenChange(false);
  };

  const handleReject = async () => {
    await reject.mutateAsync({ id: request.id });
    onOpenChange(false);
  };

  const busy = resolve.isPending || reject.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[26rem]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <KeyRound className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-left text-base">
                Restablecer contraseña
              </DialogTitle>
              <DialogDescription className="text-left text-xs truncate">
                {targetName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!request.user ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <ShieldAlert className="h-10 w-10 text-amber-500" />
            <p className="text-sm text-muted-foreground">
              El correo <strong>{request.email}</strong> no corresponde a
              ninguna cuenta registrada. No hay contraseña que restablecer.
            </p>
            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={handleReject}
              disabled={busy}
            >
              {reject.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Descartar solicitud"
              )}
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              {request.note && (
                <p className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Mensaje del usuario:{" "}
                  </span>
                  {request.note}
                </p>
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Nueva contraseña</FormLabel>

                      <button
                        type="button"
                        onClick={handleGenerate}
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline underline-offset-4"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Generar
                      </button>
                    </div>

                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={show ? "text" : "password"}
                          autoComplete="new-password"
                          className="h-10 rounded-lg pr-16 tracking-wider"
                        />

                        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center">
                          <button
                            type="button"
                            aria-label="Copiar contraseña"
                            onClick={handleCopy}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            aria-label={show ? "Ocultar" : "Mostrar"}
                            onClick={() => setShow((v) => !v)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                          >
                            {show ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
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
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type={show ? "text" : "password"}
                        autoComplete="new-password"
                        className="h-10 rounded-lg tracking-wider"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-muted-foreground">
                Anote la contraseña antes de guardar: no vuelve a mostrarse.
                Comuníquesela al usuario por un canal seguro.
              </p>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleReject}
                  disabled={busy}
                >
                  {reject.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Descartar"
                  )}
                </Button>

                <Button type="submit" className="flex-1" disabled={busy}>
                  <AnimatePresence mode="wait" initial={false}>
                    {resolve.isPending ? (
                      <motion.span
                        key="cargando"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.16, ease: EASE }}
                        className="flex items-center gap-2"
                      >
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Guardando…
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.16, ease: EASE }}
                      >
                        Restablecer
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
