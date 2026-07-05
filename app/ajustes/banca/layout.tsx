import ProtectedRoute from "@/components/layout/ProtectedRoute";
import React from "react";

const BankAccountLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute
      roles={[
        "ANALISTA_ADMINISTRACION",
        "JEFE_ADMINISTRACION",
        "ANALISTA_COMPRAS",
        "JEFE_COMPRAS",
        "ASISTENTE_COMPRAS",
        "SUPERUSER",
      ]}
    >
      {children}
    </ProtectedRoute>
  );
};

export default BankAccountLayout;
