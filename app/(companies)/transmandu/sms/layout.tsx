import ProtectedLayout from "@/components/layout/ProtectedLayout";
import React from "react";

const SMSLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedLayout roles={["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER","GUEST"]}>
      {children}
    </ProtectedLayout>
  );
};

export default SMSLayout;
