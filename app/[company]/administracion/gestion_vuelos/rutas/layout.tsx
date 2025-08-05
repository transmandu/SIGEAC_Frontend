import ProtectedLayout from "@/components/layout/ProtectedLayout";
import React from "react";

const AdministrationLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedLayout
      roles={["SUPERUSER", "JEFE_ADMINISTRACION", "ANALISTA_ADMINISTRACION"]}
    >
      {children}
    </ProtectedLayout>
  );
};

export default AdministrationLayout;
