"use client";

import Image from "next/image";
import { memo } from "react";
import { Building2, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { User } from "@/types";

type UserRole = NonNullable<User["roles"]>[number];

interface ProfileCompaniesProps {
  companies: User["companies"];
  roles: UserRole[];
  activeCompanyId?: number;
}

const ProfileCompanies = ({
  companies,
  roles,
  activeCompanyId,
}: ProfileCompaniesProps) => {
  if (!companies?.length) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        No tiene empresas asignadas.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {companies.map((company) => {
        const isActive = company.id === activeCompanyId;

        const companyRoles = roles.filter(
          (role) => Number(role.company_id) === Number(company.id)
        );

        return (
          <li
            key={company.id}
            className={cn(
              "flex items-start gap-3 rounded-xl border bg-card p-3.5 transition-colors",
              isActive ? "border-primary/50 bg-primary/[0.04]" : "border-border"
            )}
          >
            <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background">
              {company.logo ? (
                <Image
                  src={company.logo}
                  alt={company.name}
                  fill
                  unoptimized
                  sizes="44px"
                  className="object-cover"
                />
              ) : (
                <Building2 className="size-5 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-sm font-semibold">{company.name}</p>

                {isActive && (
                  <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    <Check className="size-3" />
                    Activa
                  </span>
                )}
              </div>

              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {companyRoles.length > 0 ? (
                  companyRoles.map((role) => (
                    <Badge
                      key={role.id}
                      variant="secondary"
                      className="text-[10px] font-medium"
                    >
                      {role.label ?? role.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Sin rol asignado
                  </span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default memo(ProfileCompanies);
