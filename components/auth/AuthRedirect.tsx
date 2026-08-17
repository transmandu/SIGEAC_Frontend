"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";

export default function AuthRedirect() {
  const router = useRouter();

  // Guarda el id de la sesión que ya se redirigió, en vez de un booleano: la
  // página de login no se re-monta al volver del logout, así que un candado sin
  // identidad seguía cerrado para la sesión siguiente y el segundo login se
  // quedaba en el formulario con todo en verde.
  const navigatedForUserRef = useRef<number | string | null>(null);

  const { user, loading } = useAuth();

  const { selectedCompany } = useCompanyStore();

  useEffect(() => {
    if (loading || !user) return;

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