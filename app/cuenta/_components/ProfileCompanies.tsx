"use client";

import Image from "next/image";
import { memo, useState } from "react";
import { Building2, Check, ChevronDown } from "lucide-react";

import { TagBadge } from "@/components/misc/TagBadge";
import { cn } from "@/lib/utils";
import { User } from "@/types";

type UserRole = NonNullable<User["roles"]>[number];

interface ProfileCompaniesProps {
  companies: User["companies"];
  roles: UserRole[];
  activeCompanyId?: number;
}

/** Con más empresas que esto, el resto queda tras "Ver todas". */
const VISIBLE_LIMIT = 6;

/**
 * Las empresas del usuario como fichas compactas en rejilla: una línea para el
 * nombre y otra para los roles, de modo que 20 empresas ocupen poco. La activa
 * se distingue con borde y una marca; la lista larga se pliega.
 */
const ProfileCompanies = ({
  companies,
  roles,
  activeCompanyId,
}: ProfileCompaniesProps) => {
  const [showAll, setShowAll] = useState(false);

  if (!companies?.length) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No tiene empresas asignadas.
      </p>
    );
  }

  // La activa siempre a la vista, aunque la lista esté plegada.
  const ordered = [...companies].sort(
    (a, b) =>
      Number(b.id === activeCompanyId) - Number(a.id === activeCompanyId),
  );
  const visible = showAll ? ordered : ordered.slice(0, VISIBLE_LIMIT);
  const hidden = ordered.length - visible.length;

  return (
    <div className="space-y-3">
      <ul className="flex flex-wrap justify-center gap-2.5">
        {visible.map((company) => {
          const isActive = company.id === activeCompanyId;

          const roleNames = roles
            .filter((role) => Number(role.company_id) === Number(company.id))
            .map((role) => role.label ?? role.name);

          return (
            <li
              key={company.id}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors sm:w-[calc(50%-0.3125rem)] xl:w-[calc(33.333%-0.4167rem)]",
                isActive
                  ? "border-primary/40 bg-primary/5"
                  : "border-slate-200 bg-white hover:border-blue-400/30 dark:border-slate-700/60 dark:bg-slate-900/40",
              )}
            >
              <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-background">
                {company.logo ? (
                  <Image
                    src={company.logo}
                    alt=""
                    fill
                    unoptimized
                    sizes="36px"
                    className="object-cover"
                  />
                ) : (
                  <Building2 className="size-4 text-muted-foreground" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-semibold text-slate-700 max-sm:text-base dark:text-slate-200"
                  title={company.name}
                >
                  {company.name}
                </p>
                <p
                  className={cn(
                    "truncate text-xs max-sm:text-[13px]",
                    roleNames.length
                      ? "text-muted-foreground"
                      : "text-muted-foreground/70",
                  )}
                  title={roleNames.join(", ") || undefined}
                >
                  {roleNames.length
                    ? roleNames.join(" · ")
                    : "Sin rol asignado"}
                </p>
              </div>

              {isActive && (
                <TagBadge tone="emerald" icon={Check} title="Empresa activa">
                  Activa
                </TagBadge>
              )}
            </li>
          );
        })}
      </ul>

      {companies.length > VISIBLE_LIMIT && (
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          aria-expanded={showAll}
          className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed text-[13px] font-medium text-muted-foreground transition-colors hover:border-blue-400/40 hover:text-foreground"
        >
          {showAll ? "Ver menos" : `Ver ${hidden} más`}
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              showAll && "rotate-180",
            )}
          />
        </button>
      )}
    </div>
  );
};

export default memo(ProfileCompanies);
