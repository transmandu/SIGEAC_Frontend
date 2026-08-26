"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import loadingGif from "@/public/loading2.gif";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import RequestPasswordResetDialog from "@/components/dialogs/sistema/RequestPasswordResetDialog";
import { useRef, useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

// Mismo lenguaje visual que los selects de CompanySelect y el botón de
// "Administrar el sistema": cristal suave con borde slate.
const fieldClass = cn(
  "h-10 rounded-lg text-sm",
  "bg-gradient-to-br from-background/70 to-background/40",
  "backdrop-blur-md",
  "border border-slate-400/60 dark:border-slate-600/60",
  "shadow-sm",
  "hover:border-blue-400/30",
  "hover:shadow-md hover:shadow-blue-500/10",
  "transition-all duration-200"
);

const FormSchema = z.object({
  login: z.string().min(3, {
    message: "El usuario debe tener al menos 3 caracteres.",
  }),
  password: z.string().min(2, {
    message: "La contraseña debe tener al menos 5 caracteres.",
  }),
});

type FormSchemaType = z.infer<typeof FormSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [recoverOpen, setRecoverOpen] = useState(false);
  const { loginMutation } = useAuth();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });

  const passwordRef = useRef<HTMLInputElement | null>(null);

  const onSubmit = (data: FormSchemaType) => {
    loginMutation.mutate(data);
  };

  const handleTogglePassword = () => {
    const input = passwordRef.current;

    const pos = input?.selectionStart ?? 0;

    setShowPassword((v) => !v);

    requestAnimationFrame(() => {
      if (input) {
        input.focus();
        input.setSelectionRange(pos, pos);
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        <FormField
          control={form.control}
          name="login"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuario</FormLabel>
              <FormControl>
                <Input
                  className={fieldClass}
                  placeholder="admin"
                  autoComplete="username"
                  {...field}
                />
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
                <div className="relative">
                  <Input
                    {...field}
                    ref={(el) => {
                      field.ref(el);
                      passwordRef.current = el;
                    }}
                    className={cn(
                      fieldClass,
                      "pr-10 tracking-wider",
                      "text-foreground placeholder:text-muted-foreground"
                    )}
                    type={showPassword ? "text" : "password"}
                    placeholder="******"
                    autoComplete="current-password"
                    data-lpignore="true"
                    data-1p-ignore
                    spellCheck={false}
                  />

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          aria-label={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={handleTogglePassword}
                          className={cn(
                            "absolute right-1 top-1/2 -translate-y-1/2",
                            "flex h-7 w-7 items-center justify-center rounded-md",
                            "text-muted-foreground hover:text-foreground",
                            "hover:bg-muted/60 active:scale-90",
                            "transition-all duration-200"
                          )}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </TooltipTrigger>

                      <TooltipContent side="top" className="text-xs">
                        {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
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

        {/* Misma construcción que los campos —degradado, borde, sombra azul en
            hover— pero en color primario: sigue siendo la acción principal. */}
        <Button
          variant="ghost"
          className={cn(
            "group relative h-10 w-full overflow-hidden rounded-lg text-sm font-medium",
            "shadow-sm transition-all duration-200",
            "active:scale-[0.99]",
            // El variant ghost trae hover:bg-accent/text-accent-foreground y
            // tailwind-merge no los quita (grupos distintos al degradado).
            "hover:bg-transparent",
            loginMutation?.isPending
              ? // El GIF es line-art negro de trazo fino: necesita fondo claro
                // en ambos temas o la animación no se distingue.
                "bg-slate-50 border border-slate-300 dark:bg-slate-100 dark:border-slate-300 text-slate-700 hover:text-slate-700"
              : cn(
                  "bg-gradient-to-br from-primary to-primary/85",
                  "text-primary-foreground hover:text-primary-foreground",
                  "border border-primary/70",
                  "hover:from-primary hover:to-primary",
                  "hover:border-primary",
                  "hover:shadow-md hover:shadow-blue-500/25"
                ),
            "disabled:opacity-100"
          )}
          disabled={loginMutation?.isPending}
          type="submit"
        >
          {loginMutation?.isPending ? (
            /* El GIF trae mucho margen vacío arriba y abajo, así que se
               amplía muy por encima del alto del botón: el overflow recorta
               ese margen y deja ver la animación a buen tamaño. */
            <Image
              src={loadingGif}
              width={170}
              height={170}
              alt="Cargando"
              className="h-[9rem] w-auto max-w-none object-contain"
              unoptimized
            />
          ) : (
            <span className="flex items-center gap-2">
              Iniciar Sesión
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          )}
        </Button>

        <button
          type="button"
          onClick={() => setRecoverOpen(true)}
          className={cn(
            "mx-auto w-fit rounded-md px-2 py-1 text-xs font-medium",
            "text-blue-600 dark:text-blue-400",
            "hover:text-blue-700 dark:hover:text-blue-300 hover:underline underline-offset-4",
            "transition-colors duration-200"
          )}
        >
          ¿Olvidaste tu contraseña?
        </button>

        <RequestPasswordResetDialog
          open={recoverOpen}
          onOpenChange={setRecoverOpen}
        />
      </form>
    </Form>
  );
}