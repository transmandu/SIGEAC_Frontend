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
import loadingGif from "@/public/loading2.gif";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Separator } from "../../ui/separator";
import { useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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
                  className="dark:bg-black/30"
                  placeholder="admin"
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
                    className="dark:bg-black/30 pr-10 text-foreground tracking-wider placeholder:text-muted-foreground"
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
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={handleTogglePassword}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition flex items-center justify-center"
                        >
                          <span className="transition-all duration-200 ease-in-out">
                            {showPassword ? (
                              <EyeOff className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
                            ) : (
                              <Eye className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
                            )}
                          </span>
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

        <Button
          variant={loginMutation.isPending ? "outline" : "default"}
          className="bg-primary text-white hover:bg-blue-900 disabled:bg-slate-50 disabled:border-4"
          disabled={loginMutation?.isPending}
          type="submit"
        >
          {loginMutation?.isPending ? (
            <Image
              className="text-black"
              src={loadingGif}
              width={170}
              height={170}
              alt="Loading..."
            />
          ) : (
            <p>Iniciar Sesion</p>
          )}
        </Button>
      </form>
    </Form>
  );
}