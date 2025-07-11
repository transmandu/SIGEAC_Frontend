// components/CompanyRedirectHandler.tsx
'use client';
import { useCompanyStore } from "@/stores/CompanyStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const RedirectHandler = () => {
  const router = useRouter();
  const { selectedCompany, selectedStation } = useCompanyStore();

  useEffect(() => {
    if (selectedCompany && selectedStation) {
      router.push(`/${selectedCompany.slug}/dashboard`);
    }
  }, [selectedStation, selectedCompany]);

  return null; // Este componente no renderiza nada
 };
