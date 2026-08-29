"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";

export default function AuthRedirect() {
  const router = useRouter();

  // La página de login no se re-monta al volver del logout, así que este
  // candado sobrevive a la sesión anterior y hay que soltarlo a mano.
  const navigatedForUserRef = useRef<number | string | null>(null);

  const { user, loading } = useAuth();

  const { selectedCompany } = useCompanyStore();

  // Quedarse sin sesión lo suelta: guardando solo el id, volver a entrar con el
  // MISMO usuario encontraba el candado cerrado y nadie navegaba.
  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigatedForUserRef.current = null;
      return;
    }

    if (navigatedForUserRef.current === user.id) return;

    // Siempre a /inicio, nunca directo al dashboard: la compañía persistida
    // puede ser la de la sesión anterior y solo CompanyBootstrap comprueba que
    // pertenezca al usuario actual. Saltárselo metía al usuario nuevo en la
    // empresa del anterior, o dejaba el login colgado si ya no tiene acceso.
    const belongsToUser =
      selectedCompany &&
      user.companies?.some((company) => company.id === selectedCompany.id);

    navigatedForUserRef.current = user.id;

    router.replace(
      belongsToUser ? `/${selectedCompany.slug}/dashboard` : "/inicio",
    );
  }, [loading, user, selectedCompany, router]);

  return null;
}