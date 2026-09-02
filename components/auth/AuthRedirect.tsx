"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import {
  isSafeInternalPath,
  setPostLoginRedirect,
} from "@/lib/postLoginRedirect";

export default function AuthRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // La página de login no se re-monta al volver del logout, así que este
  // candado sobrevive a la sesión anterior y hay que soltarlo a mano.
  const navigatedForUserRef = useRef<number | string | null>(null);

  const { user, loading, loggingOut } = useAuth();

  // Quedarse sin sesión lo suelta: guardando solo el id, volver a entrar con el
  // MISMO usuario encontraba el candado cerrado y nadie navegaba.
  useEffect(() => {
    if (loading) return;

    // Durante un logout la sesión aún puede leerse viva por un instante:
    // navegar aquí devolvía al usuario a /inicio y peleaba con el replace()
    // del propio logout, dejando el login parpadeando en bucle.
    if (loggingOut) return;

    if (!user) {
      navigatedForUserRef.current = null;
      return;
    }

    if (navigatedForUserRef.current === user.id) return;

    // La ruta que el usuario pedía antes de que el middleware lo mandara al
    // login. No se navega aquí: el destino final lo decide CompanyBootstrap una
    // vez resueltas empresa y estación, así que solo se deja anotado.
    const from = searchParams.get("from");

    setPostLoginRedirect(isSafeInternalPath(from) ? from : null);

    navigatedForUserRef.current = user.id;

    // Siempre a /inicio, nunca directo al dashboard: la compañía persistida
    // puede ser la de la sesión anterior y solo CompanyBootstrap comprueba que
    // pertenezca al usuario actual. Saltárselo metía al usuario nuevo en la
    // empresa del anterior, o dejaba el login colgado si ya no tiene acceso.
    router.replace("/inicio");
  }, [loading, loggingOut, user, searchParams, router]);

  return null;
}