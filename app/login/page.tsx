"use client";

import AuthRedirect from "@/components/auth/AuthRedirect";
import { LoginForm } from '@/components/forms/ajustes/LoginForm'
import { ThemeToggler } from '@/components/layout/ThemeToggler'
import Logo from '@/components/misc/Logo'
import { useAuth } from "@/contexts/AuthContext";
import { useDocumentTitle } from "@/hooks/helpers/use-document-title";
import { motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";

const Login = () => {
  const { clearLoggingOut } = useAuth();
  const reduceMotion = useReducedMotion();

  useDocumentTitle("Login");

  // El overlay de cierre se levanta cuando esta página ya está PINTADA, no al
  // montarse: el efecto corre antes del paint, así que destapaba la pantalla con
  // el login todavía en blanco. Los dos rAF esperan al primer frame real.
  useEffect(() => {
    let raf2 = 0;

    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => clearLoggingOut());
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [clearLoggingOut]);

  /**
   * Solo opacidad y una escala mínima. Animar `filter: blur()` obligaba al
   * navegador a rasterizar la tarjeta con sus sombras en un búfer aparte: al
   * llegar a 0 recomponía de golpe y parecía un fallo de render.
   */
  const fadeIn = (delay: number) =>
    reduceMotion
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }
      : {
          initial: { opacity: 0, scale: 0.985 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <>
      <AuthRedirect />

      {/* min-h en vez de h fija: en móviles bajos el contenido puede crecer. */}
      <div className="relative min-h-[100dvh] w-full">
        <div className="flex min-h-[100dvh] flex-col lg:flex-row">

          {/* Toggler de móvil: en desktop vive dentro de la tarjeta. Va en
              position absolute para no robarle ancho a la fila en lg. */}
          <div className="absolute top-4 right-4 z-20 lg:hidden">
            <ThemeToggler />
          </div>

          {/* IZQUIERDA — logo centrado en su mitad */}
          <motion.div
            {...fadeIn(0)}
            className="flex w-full shrink-0 items-center justify-center px-6 pt-20 pb-6 lg:w-1/2 lg:px-12 lg:py-0"
          >
            {/* 22rem es el tope nítido: el archivo mide 712px y en pantallas
                2x un ancho mayor obliga al navegador a escalar hacia arriba. */}
            <Logo
              width={712}
              height={344}
              className="w-48 sm:w-60 lg:w-[22rem] max-w-full dark:opacity-90 dark:brightness-95"
            />
          </motion.div>

          {/* DERECHA — panel azul, tarjeta centrada en su mitad */}
          <div className="relative flex w-full flex-1 items-start justify-center px-4 py-10 lg:w-1/2 lg:flex-none lg:items-center lg:px-12">
            <div className="login-panel absolute inset-0" aria-hidden />

            <motion.div
              {...fadeIn(0.08)}
              className="login-card relative z-10 w-full max-w-[31rem] rounded-2xl p-6 sm:p-9 lg:p-12"
            >
              <div className="hidden lg:flex w-full justify-end">
                <ThemeToggler />
              </div>

              <h1 className="text-center text-2xl sm:text-3xl font-bold tracking-tight lg:mt-2">
                Ingrese al Sistema
              </h1>

              <p className="mt-2 text-center text-sm font-light text-muted-foreground">
                Por favor, inicie sesión con sus credenciales para ingresar.
              </p>

              <div className="mt-6">
                <LoginForm />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
