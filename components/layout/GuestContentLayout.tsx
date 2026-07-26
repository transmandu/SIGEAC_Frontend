"use client";

import { useLayoutEffect } from "react";

import { usePageTitle } from "@/contexts/PageTitleContext";

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

  return <div className="container pt-8 pb-8 px-4 sm:px-8">{children}</div>;
}
