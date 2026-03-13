"use client";

import ProtectedLayout from "@/components/layout/ProtectedLayout";
import React from "react";
import { usePathname } from "next/navigation";

const SMSLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // Verificamos si la ruta actual es la de certificados
  const isCertificadosPage = pathname.includes("/sms/certificados");

  /**
   * Lógica de Acceso:
   * 1. Si es la página de certificados, usamos ProtectedLayout SIN la prop 'roles'.
   * Esto permite que cualquier usuario logueado entre.
   * 2. Para cualquier otra ruta de SMS, mantenemos la protección estricta para jefes.
   */
  if (isCertificadosPage) {
    return <ProtectedLayout>{children}</ProtectedLayout>;
  }

  return (
    <ProtectedLayout roles={["JEFE_SMS", "ANALISTA_SMS", "SUPERUSER"]}>
      {children}
    </ProtectedLayout>
  );
};

export default SMSLayout;