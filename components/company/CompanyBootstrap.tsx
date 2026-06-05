"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, PlaneTakeoff } from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "@/contexts/AuthContext";
import { useGetUserLocationsByCompanyId } from "@/hooks/sistema/usuario/useGetUserLocationsByCompanyId";
import { useCompanyStore } from "@/stores/CompanyStore";

import CompanySelect from "@/components/selects/CompanySelect";

const CompanyBootstrap = () => {
  const router = useRouter();

  const navigatingRef = useRef(false);
  const resolvedRef = useRef(false);
  const companyAutoSelectedRef = useRef(false);

  const { user, loading: userLoading } = useAuth();

  const {
    selectedCompany,
    selectedStation,
    setSelectedCompany,
    setSelectedStation,
    reset,
  } = useCompanyStore();

  const { mutateAsync: getLocations, isPending: locationsLoading } =
    useGetUserLocationsByCompanyId();

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useCompanyStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );

    if (useCompanyStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!hydrated || userLoading || !user) return;
    if (navigatingRef.current || resolvedRef.current) return;

    const getHistory = () => {
      if (typeof window === "undefined") return {};

      try {
        return JSON.parse(
          localStorage.getItem("company-station-history") || "{}"
        );
      } catch {
        return {};
      }
    };

    const saveHistory = (companyId: number | string, stationId: string) => {
      if (typeof window === "undefined") return;

      const history = getHistory();

      history[String(companyId)] = stationId;

      localStorage.setItem(
        "company-station-history",
        JSON.stringify(history)
      );
    };

    const bootstrap = async () => {
      if (selectedCompany && selectedStation) {
        const companyExists = user.companies?.some(
          (c) => c.id === selectedCompany.id
        );

        if (!companyExists) {
          reset();
          return;
        }

        try {
          const locations = await getLocations(selectedCompany.id);

          if (!locations?.length) {
            reset();
            return;
          }

          const stationExists = locations.some(
            (l) => l.id.toString() === selectedStation
          );

          if (!stationExists) {
            reset();
            return;
          }

          navigatingRef.current = true;
          router.replace(`/${selectedCompany.slug}/dashboard`);
          return;
        } catch {
          reset();
          return;
        }
      }

      if (!selectedCompany) {
        if (user.companies?.length === 1 && !companyAutoSelectedRef.current) {
          companyAutoSelectedRef.current = true;
          setSelectedCompany(user.companies[0]);
        }

        return;
      }

      const company = selectedCompany;

      try {
        const locations = await getLocations(company.id);

        if (!locations?.length) return;

        if (locations.length === 1) {
          const station = locations[0].id.toString();

          setSelectedStation(station);
          saveHistory(company.id, station);

          navigatingRef.current = true;
          router.replace(`/${company.slug}/dashboard`);
          return;
        }

        resolvedRef.current = true;
      } catch (error) {
        console.error(error);
      }
    };

    bootstrap();
  }, [
    hydrated,
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

  const shouldShowFullPageLoading =
    !hydrated ||
    userLoading ||
    navigatingRef.current ||
    (selectedCompany && selectedStation && locationsLoading);

  /**
   * LOADING SCREEN
   */
  if (shouldShowFullPageLoading) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen w-full bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {/* ambient glow */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.1, opacity: 1 }}
          transition={{ duration: 1.2, repeat: Infinity, repeatType: "mirror" }}
        />

        <div className="relative flex flex-col items-center gap-5">
          {/* icon container */}
          <motion.div
            className="relative"
            initial={{ scale: 0.6, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 2, 0, -2, 0],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Plane className="w-10 h-10 text-primary" />
            </motion.div>

            <motion.div
              className="absolute inset-0 blur-xl opacity-40 bg-primary rounded-full scale-150"
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: [1.3, 1.6, 1.3],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* text block */}
          <motion.div
            className="text-center space-y-1"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
          >
            <motion.p
              className="text-sm font-medium text-foreground"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Preparando tu entorno
            </motion.p>

            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Inicializando servicios del sistema...
            </motion.p>
          </motion.div>

          {/* progress bar */}
          <div className="w-44 h-1 bg-muted rounded-full overflow-hidden relative">
            <motion.div
              className="h-full w-1/3 bg-primary rounded-full"
              initial={{ x: "-100%" }}
              animate={{ x: "250%" }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  /**
   * MAIN SCREEN
   */
  return (
    <motion.div
      className="flex justify-end min-h-screen w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="flex justify-center items-center max-w-sm mx-auto">
        <motion.div
          className="flex flex-col items-center justify-center gap-2 -translate-y-14"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <PlaneTakeoff className="size-32" />

          <h1 className="text-6xl font-bold text-center">
            ¡Bienvenido a SIGEAC!
          </h1>

          <p className="text-muted-foreground text-center">
            Por favor, seleccione una <strong>empresa</strong> y una{" "}
            <strong>estación</strong> para comenzar.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: "easeOut", delay: 0.05 }}
          >
            <CompanySelect />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CompanyBootstrap;