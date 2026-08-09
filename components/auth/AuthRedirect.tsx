"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";

export default function AuthRedirect() {
  const router = useRouter();

  const navigatingRef = useRef(false);

  const { user, loading } = useAuth();

  const { selectedCompany } = useCompanyStore();

  useEffect(() => {
    if (loading || !user) return;

    if (navigatingRef.current) return;

    // Siempre a /inicio, nunca directo al dashboard: la compañía persistida
    // puede ser la de la sesión anterior y solo CompanyBootstrap comprueba que
    // pertenezca al usuario actual. Saltárselo metía al usuario nuevo en la
    // empresa del anterior, o dejaba el login colgado si ya no tiene acceso.
    const belongsToUser =
      selectedCompany &&
      user.companies?.some((company) => company.id === selectedCompany.id);

    navigatingRef.current = true;

    router.replace(
      belongsToUser ? `/${selectedCompany.slug}/dashboard` : "/inicio",
    );
  }, [loading, user, selectedCompany, router]);

  return null;
}