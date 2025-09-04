import ProtectedRoute from "@/components/layout/ProtectedRoute";
import React from "react";

const SMSLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute roles={[]}>
      {children}
    </ProtectedRoute>
  );
};

export default SMSLayout;
