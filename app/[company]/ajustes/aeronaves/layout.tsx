import ProtectedLayout from "@/components/layout/ProtectedLayout";
import React from "react";

/** La flota de aerolínea la administran los roles de administración. */
const AircraftsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedLayout
      roles={["SUPERUSER", "JEFE_ADMINISTRACION", "ANALISTA_ADMINISTRACION"]}
      requiresOmac={false}
    >
      {children}
    </ProtectedLayout>
  );
};

export default AircraftsLayout;
