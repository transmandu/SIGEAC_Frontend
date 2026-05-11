"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plane } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetUserLocationsByCompanyId } from "@/hooks/sistema/usuario/useGetUserLocationsByCompanyId";
import { useCompanyStore } from "@/stores/CompanyStore";
import CompanySelect from "@/components/selects/CompanySelect";

const CompanyBootstrap = () => {
  const router = useRouter();

  const { user, loading: userLoading } = useAuth();
  const [ready, setReady] = useState(false);
  const navigatingRef = useRef(false);
  const hydratedRef = useRef(false);

  const {
    selectedCompany,
    selectedStation,
    setSelectedCompany,
    setSelectedStation,
    initFromLocalStorage,
    reset,
  } = useCompanyStore();

  const {
    mutateAsync: getLocations,
    isPending: locationsLoading,
  } = useGetUserLocationsByCompanyId();

  useEffect(() => {
    const init = () => {
      initFromLocalStorage();
      setReady(true);
      hydratedRef.current = true;
    };

    init();
  }, [initFromLocalStorage]);

  useEffect(() => {
    const bootstrap = async () => {
      if (
        !ready ||
        userLoading ||
        !user ||
        navigatingRef.current ||
        !hydratedRef.current
      )
        return;

      if (selectedCompany && selectedStation) {
        const companyStillExists = user.companies?.some(
          (c) => c.id === selectedCompany.id
        );

        if (!companyStillExists) {
          reset();
          return;
        }

        try {
          const locations = await getLocations(selectedCompany.id);

          const stationStillExists = locations.some(
            (l) => l.id.toString() === selectedStation
          );

          if (stationStillExists) {
            navigatingRef.current = true;

            router.replace(
              `/${selectedCompany.slug}/dashboard`
            );

            return;
          }

          reset();
        } catch {
          reset();
        }
      }

      if (user.companies?.length === 1) {
        const onlyCompany = user.companies[0];

        setSelectedCompany(onlyCompany);

        try {
          const locations = await getLocations(onlyCompany.id);

          if (locations.length === 1) {
            const onlyLocation = locations[0];

            setSelectedStation(
              onlyLocation.id.toString()
            );

            navigatingRef.current = true;

            router.replace(
              `/${onlyCompany.slug}/dashboard`
            );
          }
        } catch (error) {
          console.error(error);
        }
      }
    };

    bootstrap();
  }, [
    ready,
    user,
    userLoading,
    selectedCompany,
    selectedStation,
    getLocations,
    setSelectedCompany,
    setSelectedStation,
    reset,
    router,
  ]);

  useEffect(() => {
    if (
      selectedCompany &&
      selectedStation &&
      ready &&
      !userLoading &&
      !navigatingRef.current
    ) {
      navigatingRef.current = true;

      router.replace(
        `/${selectedCompany.slug}/dashboard`
      );
    }
  }, [
    selectedCompany,
    selectedStation,
    ready,
    userLoading,
    router,
  ]);

  if (
    !ready ||
    userLoading ||
    locationsLoading ||
    !hydratedRef.current ||
    navigatingRef.current
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-background">
        
        <div className="relative flex flex-col items-center gap-4">

          {/* Avión animado */}
          <div className="relative">
            <Plane className="w-10 h-10 text-primary animate-bounce" />

            {/* glow sutil */}
            <div className="absolute inset-0 blur-xl opacity-30 bg-primary rounded-full scale-150" />
          </div>

          {/* Texto */}
          <div className="text-center space-y-1">
            <p className="text-sl font-medium text-foreground">
              Preparando tu entorno
            </p>
            <p className="text-xl text-muted-foreground">
              Cargando configuración del sistema...
            </p>
          </div>

          {/* barra sutil de progreso */}
          <div className="w-40 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-primary animate-pulse rounded-full" />
          </div>

        </div>
      </div>

    );
  }

  return <CompanySelect />;
};

export default CompanyBootstrap;