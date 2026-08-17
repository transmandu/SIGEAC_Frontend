"use client";

import { useEffect, useLayoutEffect } from "react";

import { usePageTitle } from "@/contexts/PageTitleContext";
import { setPageTitle } from "@/lib/document-title";

interface ContentLayoutProps {
  title: string;
  children: React.ReactNode;
}

/**
 * El GuestNavbar vive en GuestDashboardLayout para que persista entre
 * navegaciones. Aquí solo se publica el título de la página.
 */
export function GuestContentLayout({ title, children }: ContentLayoutProps) {
  const { registerTitle } = usePageTitle();

  useLayoutEffect(() => registerTitle(title), [registerTitle, title]);

  // Sin cleanup: ver la nota en ContentLayout.
  useEffect(() => setPageTitle(title), [title]);

  return <div className="container pt-8 pb-8 px-4 sm:px-8">{children}</div>;
}
