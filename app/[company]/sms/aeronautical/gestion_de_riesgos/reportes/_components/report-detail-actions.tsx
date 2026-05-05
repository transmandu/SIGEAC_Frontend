"use client";

import { EyeIcon, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCompanyStore } from "@/stores/CompanyStore";

type ReportKind = "RVP" | "ROS";

type ReportDetailActionsProps = {
  id: number;
  kind: ReportKind;
};

export function ReportDetailActions({ id, kind }: ReportDetailActionsProps) {
  const { selectedCompany } = useCompanyStore();
  const router = useRouter();

  const href =
    kind === "RVP"
      ? `/${selectedCompany?.slug}/sms/aeronautical/gestion_de_riesgos/reportes/voluntarios/${id}`
      : `/${selectedCompany?.slug}/sms/aeronautical/gestion_de_riesgos/reportes/obligatorios/${id}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir acciones</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem
          onClick={() => {
            router.push(href);
          }}
        >
          <EyeIcon className="mr-2 h-4 w-4" />
          Ver detalle
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
