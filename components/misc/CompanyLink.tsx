"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ComponentProps } from "react";

type CompanyLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  /** Ruta dentro de la compañía, sin slug ni barra inicial. */
  to: string;
};

// Las celdas de tabla no tienen un lugar cómodo para leer la compañía de la
// URL: este enlace la toma de ahí, para no escribirla a mano en cada ruta.
export function CompanyLink({ to, ...props }: CompanyLinkProps) {
  const { company } = useParams<{ company: string }>();

  return <Link href={`/${company}/${to}`} {...props} />;
}
