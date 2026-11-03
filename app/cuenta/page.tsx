"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  IdCard,
  KeyRound,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useTourContext } from "@/components/tour/TourProvider";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import LoadingPage from "@/components/misc/LoadingPage";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useMyEmployee } from "@/hooks/sistema/usuario/useMyEmployee";
import { useProfileIdentity } from "@/hooks/sistema/usuario/useProfileIdentity";
import { cuentaSteps } from "@/components/tour/steps/cuenta";

import ProfileCompanies from "./_components/ProfileCompanies";
import ProfileCover from "./_components/ProfileCover";
import { ProfileField, ProfileSection } from "./_components/ProfileSection";

// El diálogo sólo existe tras un clic: no entra en el bundle inicial del perfil.
const RequestPasswordResetDialog = dynamic(
  () => import("@/components/dialogs/sistema/RequestPasswordResetDialog"),
  { ssr: false },
);

type Employee = NonNullable<ReturnType<typeof useMyEmployee>["data"]>;

const documentOf = (employee: Employee) =>
  `${employee.dni_type ? `${employee.dni_type}-` : ""}${employee.dni}`.toUpperCase();

/** Entrada escalonada de los bloques, solo en móvil y si el sistema no pide menos movimiento. */
const enter = (index: number) => ({
  className: "motion-safe:max-md:animate-card-in",
  style: { animationDelay: `${index * 70}ms` },
});

const AccountPage = () => {
  const { loading } = useAuth();
  const { user, selectedCompany, visibleRoles } = useProfileIdentity();
  const { data: employee, isLoading: employeeLoading } = useMyEmployee();
  const { registerTour, unregisterTour } = useTourContext();

  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    registerTour("cuenta", "Mi Cuenta", cuentaSteps);
    return () => unregisterTour("cuenta");
  }, [registerTour, unregisterTour, user]);

  const employeeName = useMemo(() => {
    if (!employee) return null;

    return [employee.first_name, employee.last_name].filter(Boolean).join(" ");
  }, [employee]);

  if (loading) return <LoadingPage />;

  if (!user) {
    return (
      <ContentLayout title="Mi Cuenta">
        <div className="flex flex-col gap-6">
          <PageHeader />
          <div className="flex min-h-75 items-center justify-center text-sm text-muted-foreground">
            Sesión finalizada
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Mi Cuenta">
      <div className="flex flex-col gap-6" data-tour="cuenta-title">
        <PageHeader />

        <div data-tour="cuenta-user-card" {...enter(0)}>
          <ProfileCover
            user={user}
            roles={visibleRoles}
            jobTitle={employee?.job_title?.name}
            photoUrl={employee?.photo_url_lg ?? employee?.photo_url}
            photoLoading={employeeLoading}
            gender={employee?.gender}
          />
        </div>

        <div data-tour="cuenta-company-info" {...enter(1)}>
          <ProfileSection
            title="Mis empresas"
            icon={Building2}
            hint="Las empresas a las que tiene acceso y su rol en cada una."
          >
            <ProfileCompanies
              companies={user.companies}
              roles={user.roles ?? []}
              activeCompanyId={selectedCompany?.id}
            />
          </ProfileSection>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div {...enter(2)}>
            <ProfileSection title="Cuenta" icon={UserRound} className="h-full">
              <div className="divide-y">
                <ProfileField
                  label="Nombre de usuario"
                  value={user.username}
                  mono
                />
                <ProfileField label="Correo electrónico" value={user.email} />
                <ProfileField
                  label="Empresa activa"
                  value={selectedCompany?.name}
                />
              </div>
            </ProfileSection>
          </div>

          <div {...enter(3)}>
            <ProfileSection
              title="Ficha laboral"
              icon={IdCard}
              className="h-full"
            >
              {employee ? (
                <div className="divide-y">
                  <ProfileField label="Empleado" value={employeeName} />
                  <ProfileField
                    label="Cargo"
                    value={employee.job_title?.name}
                  />
                  <ProfileField
                    label="Departamento"
                    value={employee.department?.name}
                  />
                  <ProfileField
                    label="Documento"
                    value={employee.dni && documentOf(employee)}
                    mono
                  />
                </div>
              ) : employeeLoading ? (
                <div className="space-y-3 py-1">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-5 w-full" />
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {selectedCompany
                    ? "No hay un empleado asociado a su usuario en esta empresa."
                    : "Seleccione una empresa para ver su ficha laboral."}
                </p>
              )}
            </ProfileSection>
          </div>
        </div>

        <div data-tour="cuenta-security" {...enter(4)}>
          <ProfileSection title="Seguridad" icon={ShieldCheck}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Contraseña
                </p>
                <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
                  Por políticas de seguridad, la nueva contraseña la asigna un
                  administrador. Al solicitarla se le notifica para que se la
                  comunique.
                </p>
              </div>

              <ActionTriggerButton
                className="max-sm:w-full sm:shrink-0"
                onClick={() => setResetOpen(true)}
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Solicitar cambio
              </ActionTriggerButton>
            </div>
          </ProfileSection>
        </div>
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
