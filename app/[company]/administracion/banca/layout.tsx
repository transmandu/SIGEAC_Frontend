import ProtectedRoute from "@/components/layout/ProtectedRoute";
import React from "react";

const BancaLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute
      roles={["SUPERUSER", "JEFE_ADMINISTRACION", "ANALISTA_ADMINISTRACION"]}
    >
      {children}
    </ProtectedRoute>
  );
};

export default BancaLayout;
