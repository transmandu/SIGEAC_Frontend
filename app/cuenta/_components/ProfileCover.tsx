"use client";

import Image from "next/image";
import { memo } from "react";
import { AtSign, Briefcase, Mail, ShieldCheck } from "lucide-react";

import { TagBadge } from "@/components/misc/TagBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { User } from "@/types";

import { profileSurface } from "./ProfileSection";

type UserRole = NonNullable<User["roles"]>[number];

interface ProfileCoverProps {
  user: User;
  roles: UserRole[];
  jobTitle?: string | null;
  photoUrl?: string | null;
  photoLoading: boolean;
  /** Tiñe la portada: femenino en rosa; masculino o sin dato, el azul de la marca. */
  gender?: string | null;
}

const initialsOf = (user: User) =>
  `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();

const ProfileCover = ({
  user,
  roles,
  jobTitle,
  photoUrl,
  photoLoading,
  gender,
}: ProfileCoverProps) => {
  const isFemale = gender === "FEMALE";
  const fullName = `${user.first_name} ${user.last_name}`.trim();

  return (
    <section className={`${profileSurface} overflow-hidden shadow-xs`}>
      {/* Portada: gradiente sobre la marca, sin imagen que descargar. */}
      <div className="relative h-32 sm:h-40">
        <div className="absolute inset-0 bg-linear-to-br from-primary/85 via-primary/60 to-primary/25" />
        {/* Capa aparte: un degradado no se anima, pero su opacidad sí; así el
            cambio de azul a rosa al llegar la ficha no es un salto. */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 bg-linear-to-br from-pink-500/85 via-pink-400/60 to-pink-300/25 transition-opacity duration-700 motion-reduce:transition-none",
            isFemale ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.18] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-size-[18px_18px]"
        />
      </div>

      <div className="px-4 pb-5 sm:px-8 sm:pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          {/* Avatar solapando la portada. */}
          <div className="-mt-14 shrink-0 sm:-mt-20">
            <div className="relative h-28 w-28 overflow-hidden rounded-xl border-4 border-white bg-muted shadow-md sm:h-36 sm:w-36 dark:border-slate-900">
              {photoLoading ? (
                <Skeleton className="h-full w-full" />
              ) : photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={fullName}
                  fill
                  unoptimized
                  sizes="144px"
                  priority
                  className="object-cover"
                />
              ) : (
                <div
                  className={cn(
                    "flex h-full w-full items-center justify-center text-3xl font-semibold sm:text-4xl",
                    isFemale
                      ? "bg-pink-500/10 text-pink-600 dark:text-pink-400"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {initialsOf(user) || "?"}
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-2 sm:pb-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="text-2xl font-semibold tracking-tight wrap-break-word sm:truncate sm:text-3xl">
                {fullName}
              </h1>

              {roles.map((role) => {
                const isGlobal = role.company_id === null;

                return (
                  <TagBadge
                    key={`${role.id}-${role.company_id ?? "global"}`}
                    tone={isGlobal ? "amber" : "blue"}
                    icon={isGlobal ? ShieldCheck : undefined}
                  >
                    {role.label ?? role.name}
                  </TagBadge>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <AtSign className="size-3.5" />
                {user.username}
              </span>

              <span className="inline-flex min-w-0 items-center gap-1.5">
                <Mail className="size-3.5 shrink-0" />
                <span className="truncate">{user.email}</span>
              </span>

              {jobTitle && (
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="size-3.5" />
                  {jobTitle}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(ProfileCover);
