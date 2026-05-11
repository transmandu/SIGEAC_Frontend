"use client";

import ProtectedLayout from "@/components/layout/ProtectedLayout";
import React from "react";

const SMS_ROLES = ["JEFE_SMS", "ANALISTA_SMS", "SUPERUSER"];

const SMSLayout = ({ children }: { children: React.ReactNode }) => {
  return <ProtectedLayout roles={SMS_ROLES}>{children}</ProtectedLayout>;
};

export default SMSLayout;
