"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { setPostLoginRedirect } from "@/lib/postLoginRedirect";

// Solo rutas internas: un `from` con host propio ("//evil.com", "https://…")
// convertiría el login en un redirector abierto.
const safeInternalPath = (from: string | null) =>
  from && from.startsWith("/") && !from.startsWith("//") ? from : null;

export default function AuthRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // La página de login no se re-monta al volver del logout, así que este
  // candado sobrevive a la sesión anterior y hay que soltarlo a mano.
  const navigatedForUserRef = useRef<number | string | null>(null);

  const { user, loading } = useAuth();

  // Quedarse sin sesión lo suelta: guardando solo el id, volver a entrar con el
  // MISMO usuario encontraba el candado cerrado y nadie navegaba.
  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigatedForUserRef.current = null;
      return;
    }

    if (navigatedForUserRef.current === user.id) return;

    // La ruta que el usuario pedía antes de que el middleware lo mandara al
    // login. No se navega aquí: el destino final lo decide CompanyBootstrap una
    // vez resueltas empresa y estación, así que solo se deja anotado.
    setPostLoginRedirect(safeInternalPath(searchParams.get("from")));

    navigatedForUserRef.current = user.id;

    // Siempre a /inicio, nunca directo al dashboard: la compañía persistida
    // puede ser la de la sesión anterior y solo CompanyBootstrap comprueba que
    // pertenezca al usuario actual. Saltárselo metía al usuario nuevo en la
    // empresa del anterior, o dejaba el login colgado si ya no tiene acceso.
    router.replace("/inicio");
  }, [loading, user, searchParams, router]);

  return null;
}