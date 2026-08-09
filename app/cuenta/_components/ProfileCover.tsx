"use client";

import Image from "next/image";
import { memo } from "react";
import { AtSign, Briefcase, Mail, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { User } from "@/types";

type UserRole = NonNullable<User["roles"]>[number];

interface ProfileCoverProps {
  user: User;
  roles: UserRole[];
  jobTitle?: string | null;
  photoUrl?: string | null;
  photoLoading: boolean;
}

const initialsOf = (user: User) =>
  `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();

const ProfileCover = ({
  user,
  roles,
  jobTitle,
  photoUrl,
  photoLoading,
}: ProfileCoverProps) => {
  const fullName = `${user.first_name} ${user.last_name}`.trim();

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Portada: gradiente sobre la marca, sin imagen que descargar. */}
      <div className="relative h-32 bg-gradient-to-br from-primary/85 via-primary/60 to-primary/25 sm:h-40">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]"
        />
      </div>

      <div className="px-5 pb-5 sm:px-8 sm:pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          {/* Avatar solapando la portada. */}
          <div className="-mt-14 shrink-0 sm:-mt-20">
            <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-4 border-card bg-muted shadow-md sm:h-36 sm:w-36">
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
                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-3xl font-semibold text-primary sm:text-4xl">
                  {initialsOf(user) || "?"}
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-2 sm:pb-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
                {fullName}
              </h1>

              {roles.map((role) => {
                const isGlobal = role.company_id === null;

                return (
                  <Badge
                    key={`${role.id}-${role.company_id ?? "global"}`}
                    variant="outline"
                    className={cn(
                      "gap-1 text-[10px] font-semibold tracking-wide",
                      isGlobal
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        : "border-primary/30 bg-primary/10 text-primary"
                    )}
                  >
                    {isGlobal && <ShieldCheck className="size-3" />}
                    {role.label ?? role.name}
                  </Badge>
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
