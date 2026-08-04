import ProtectedLayout from "@/components/layout/ProtectedLayout";
import React from "react";

const RecepcionesLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedLayout
      roles={["SUPERUSER", "JEFE_ADMINISTRACION", "ANALISTA_ADMINISTRACION"]}
      requiresOmac
    >
      {children}
    </ProtectedLayout>
  );
};

export default RecepcionesLayout;
