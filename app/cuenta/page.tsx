"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Building2, IdCard, KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { useTourContext } from "@/components/tour/TourProvider";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useMyEmployee } from "@/hooks/sistema/usuario/useMyEmployee";
import { useProfileIdentity } from "@/hooks/sistema/usuario/useProfileIdentity";
import { cuentaSteps } from "@/components/tour/steps/cuenta";
import { cn } from "@/lib/utils";

import ProfileCompanies from "./_components/ProfileCompanies";
import ProfileCover from "./_components/ProfileCover";
import { ProfileField, ProfileSection } from "./_components/ProfileSection";

// El diálogo sólo existe tras un clic: no entra en el bundle inicial del perfil.
const RequestPasswordResetDialog = dynamic(
  () => import("@/components/dialogs/sistema/RequestPasswordResetDialog"),
  { ssr: false }
);

const AccountPage = () => {
  const { loading } = useAuth();
  const { user, selectedCompany, visibleRoles } = useProfileIdentity();
  const { data: employee, isLoading: employeeLoading } = useMyEmployee();
  const { registerTour, unregisterTour } = useTourContext();

  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    registerTour("cuenta", "Cuenta", cuentaSteps);
    return () => unregisterTour("cuenta");
  }, [registerTour, unregisterTour, user]);

  const employeeName = useMemo(() => {
    if (!employee) return null;

    return [employee.first_name, employee.last_name].filter(Boolean).join(" ");
  }, [employee]);

  if (loading) return <LoadingPage />;

  if (!user) {
    return (
      <ContentLayout title="Mi perfil">
        <PageHeader className="mb-6" />
        <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
          Sesión finalizada
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Mi perfil">
      <PageHeader className="mb-2" />

      <div className="mx-auto mt-4 max-w-5xl space-y-6" data-tour="cuenta-title">
        <div data-tour="cuenta-user-card">
          <ProfileCover
            user={user}
            roles={visibleRoles}
            jobTitle={employee?.job_title?.name}
            photoUrl={employee?.photo_url_lg ?? employee?.photo_url}
            photoLoading={employeeLoading}
          />
        </div>

        <div data-tour="cuenta-company-info">
          <ProfileSection
            title="Mis empresas"
            icon={<Building2 className="size-4" />}
          >
            <ProfileCompanies
              companies={user.companies}
              roles={user.roles ?? []}
              activeCompanyId={selectedCompany?.id}
            />
          </ProfileSection>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ProfileSection
            title="Cuenta"
            icon={<UserRound className="size-4" />}
          >
            <div className="divide-y rounded-xl border bg-card px-4">
              <ProfileField label="Nombre de usuario" value={user.username} mono />
              <ProfileField label="Correo electrónico" value={user.email} />
              <ProfileField
                label="Empresa activa"
                value={selectedCompany?.name}
              />
            </div>
          </ProfileSection>

          <ProfileSection
            title="Ficha laboral"
            icon={<IdCard className="size-4" />}
          >
            <div className="divide-y rounded-xl border bg-card px-4">
              {employee ? (
                <>
                  <ProfileField label="Empleado" value={employeeName} />
                  <ProfileField label="Cargo" value={employee.job_title?.name} />
                  <ProfileField
                    label="Departamento"
                    value={employee.department?.name}
                  />
                  <ProfileField
                    label="Documento"
                    value={
                      employee.dni &&
                      `${employee.dni_type ?? ""}${employee.dni}`.toUpperCase()
                    }
                    mono
                  />
                </>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {employeeLoading
                    ? "Cargando ficha…"
                    : selectedCompany
                      ? "No hay un empleado asociado a su usuario en esta empresa."
                      : "Seleccione una empresa para ver su ficha laboral."}
                </p>
              )}
            </div>
          </ProfileSection>
        </div>

        <ProfileSection
          title="Seguridad"
          icon={<ShieldCheck className="size-4" />}
        >
          <div
            data-tour="cuenta-security"
            className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">Contraseña</p>
              <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
                Por políticas de seguridad, la nueva contraseña la asigna un
                administrador. Al solicitarla se le notifica para que se la
                comunique.
              </p>
            </div>

            {/* Mismo lenguaje visual que los selects del bootstrap y la
                entrada al panel global: superficie translúcida y realce azul. */}
            <Button
              variant="ghost"
              className={cn(
                "h-9 gap-2 rounded-lg text-sm font-normal sm:shrink-0",
                "bg-gradient-to-br from-background/70 to-background/40",
                "backdrop-blur-md",
                "border border-slate-400/60 dark:border-slate-600/60",
                "shadow-sm",
                "text-slate-700 dark:text-slate-200",
                "hover:border-blue-400/30 hover:bg-gradient-to-br",
                "hover:from-background/70 hover:to-background/40",
                "hover:shadow-md hover:shadow-blue-500/10",
                "transition-all duration-200",
                "active:scale-[0.99]"
              )}
              onClick={() => setResetOpen(true)}
            >
              <KeyRound className="size-4" />
              Solicitar cambio
            </Button>
          </div>
        </ProfileSection>

        <Separator className="opacity-0" />
      </div>

      {resetOpen && (
        <RequestPasswordResetDialog
          open={resetOpen}
          onOpenChange={setResetOpen}
          email={user.email}
        />
      )}
    </ContentLayout>
  );
};

export default AccountPage;
