"use client";

import ProtectedLayout from "@/components/layout/ProtectedLayout";
import React from "react";

const COURSE_ROLES = ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"];

const CoursesLayout = ({ children }: { children: React.ReactNode }) => {
  return <ProtectedLayout roles={COURSE_ROLES}>{children}</ProtectedLayout>;
};

export default CoursesLayout;
