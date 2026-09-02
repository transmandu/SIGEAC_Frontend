"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlaneTakeoff, Settings2 } from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "@/contexts/AuthContext";
import { useGetUserLocationsByCompanyId } from "@/hooks/sistema/usuario/useGetUserLocationsByCompanyId";
import { useCompanyStore } from "@/stores/CompanyStore";
import { User } from "@/types";

import { resolveLandingPath } from "@/lib/postLoginRedirect";
import CompanySelect from "@/components/selects/CompanySelect";
import PlaneCheckMorph from "@/components/misc/PlaneCheckMorph";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CompanyBootstrap = () => {
  const router = useRouter();

  const navigatingRef = useRef(false);
  const resolvedRef = useRef(false);
  const companyAutoSelectedRef = useRef(false);

  const { user, loading: userLoading } = useAuth();

  const isSuperUser = user?.roles?.some((role) => role.name === "SUPERUSER");

  const {
    selectedCompany,
    selectedStation,
    setSelectedCompany,
    setSelectedStation,
    reset,
  } = useCompanyStore();

  const { mutateAsync: getLocations } = useGetUserLocationsByCompanyId();

  const [hydrated, setHydrated] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);

  // Next mantiene /inicio montado entre sesiones, así que refs y estado
  // sobrevivían al logout: el usuario siguiente entraba con navigatingRef ya en
  // true y se quedaba en el loading para siempre, con el efecto de bootstrap
  // cortocircuitado. Cambiar de usuario devuelve el componente a cero.
  const sessionUserRef = useRef<User["id"] | null>(null);

  if (user && user.id !== sessionUserRef.current) {
    sessionUserRef.current = user.id;

    navigatingRef.current = false;
    resolvedRef.current = false;
    companyAutoSelectedRef.current = false;

    if (isRedirecting) setIsRedirecting(false);
    if (redirectTarget) setRedirectTarget(null);
  }

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
    if (navigatingRef.current) return;

    // resolvedRef solo frena el auto-resolve de estación; si el usuario ya
    // eligió ambas cosas manualmente, el redirect (y su loading) debe correr.
    if (resolvedRef.current && !(selectedCompany && selectedStation)) return;

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

    const forgetHistory = (companyId: number | string) => {
      if (typeof window === "undefined") return;

      const history = getHistory();

      delete history[String(companyId)];

      localStorage.setItem(
        "company-station-history",
        JSON.stringify(history)
      );
    };

    // Descartar la selección persistida reabre la pantalla de selección, así
    // que la auto-selección tiene que volver a estar disponible: si no, un
    // usuario de una sola empresa se quedaba sin empresa y sin nada que elegir.
    const discardSelection = (companyId?: number | string) => {
      if (companyId !== undefined) forgetHistory(companyId);

      companyAutoSelectedRef.current = false;
      resolvedRef.current = false;

      setIsRedirecting(false);
      reset();
    };

    const bootstrap = async () => {
      if (selectedCompany && selectedStation) {
        setIsRedirecting(true);

        const companyExists = user.companies?.some(
          (c) => c.id === selectedCompany.id
        );

        if (!companyExists) {
          discardSelection(selectedCompany.id);
          return;
        }

        try {
          const locations = await getLocations(selectedCompany.id);

          if (!locations?.length) {
            discardSelection(selectedCompany.id);
            return;
          }

          const stationExists = locations.some(
            (l) => l.id.toString() === selectedStation
          );

          if (!stationExists) {
            discardSelection(selectedCompany.id);
            return;
          }

          setIsRedirecting(true);
          saveHistory(selectedCompany.id, selectedStation);

          const target = `/${selectedCompany.slug}/dashboard`;

          if (typeof window !== "undefined" && "requestAnimationFrame" in window) {
            requestAnimationFrame(() => requestAnimationFrame(() =>
              setRedirectTarget(target)
            ));
          } else {
            setTimeout(() => setRedirectTarget(target), 0);
          }
          return;
        } catch {
          discardSelection();
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
          setIsRedirecting(true);

          const target = `/${company.slug}/dashboard`;

          if (typeof window !== "undefined" && "requestAnimationFrame" in window) {
            requestAnimationFrame(() => requestAnimationFrame(() =>
              setRedirectTarget(target)
            ));
          } else {
            setTimeout(() => setRedirectTarget(target), 0);
          }
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

  useEffect(() => {
    if (!redirectTarget) return;

    // 1s da tiempo al aterrizaje: círculo (0.45s tras 0.1s) y check (0.3s tras
    // 0.35s) cierran en ~0.65s, y el resto se ve como una pausa intencional.
    const timeout = window.setTimeout(() => {
      navigatingRef.current = true;

      // El `from` se consume aquí y no al calcular el destino: solo en este
      // punto la navegación es segura. Consumirlo antes lo perdía si el
      // bootstrap descartaba la selección (estación caída) y volvía a empezar.
      router.replace(
        resolveLandingPath(redirectTarget.split("/")[1], redirectTarget)
      );
    }, 1000);

    // Si la navegación no prospera —un 401 la interrumpe y la sesión vuelve a
    // /inicio— navigatingRef se quedaba en true: cortocircuitaba el bootstrap y
    // dejaba el loading para siempre, sin poder elegir empresa. Soltarlo permite
    // que el efecto vuelva a resolver desde cero. Solo actúa si seguimos en
    // /inicio: aterrizar en el destino desmonta esto y el cleanup lo cancela.
    const escape = window.setTimeout(() => {
      if (window.location.pathname !== "/inicio") return;

      navigatingRef.current = false;
      setRedirectTarget(null);
      setIsRedirecting(false);
    }, 6000);

    return () => {
      window.clearTimeout(timeout);
      window.clearTimeout(escape);
    };
  }, [redirectTarget, router]);

  const shouldShowFullPageLoading =
    !hydrated || userLoading || isRedirecting || navigatingRef.current;

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
          {/* El avión llega y se posa; al fijarse el destino aterriza y se
              convierte en check, que es el instante previo al dashboard. Sin
              wrapper animado: el componente ya trae su propia entrada, y una
              segunda animación encima le movía el avión a media trayectoria. */}
          <PlaneCheckMorph
            phase={redirectTarget ? "arrived" : "traveling"}
            direction="arrival"
          />

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
              {redirectTarget ? "Todo listo" : "Preparando tu entorno"}
            </motion.p>

            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {redirectTarget
                ? "Entrando a tu panel..."
                : "Inicializando servicios del sistema..."}
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

          {isSuperUser && (
            <motion.div
              className="flex flex-col items-center gap-2 mt-4 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, ease: "easeOut", delay: 0.1 }}
            >
              <div className="flex items-center gap-3 w-full">
                <span className="h-px flex-1 bg-border/60" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  o
                </span>
                <span className="h-px flex-1 bg-border/60" />
              </div>

              {/* Mismo lenguaje visual que los selects de CompanySelect: la
                  entrada al panel global es una opción más de esta pantalla. */}
              <Button
                asChild
                variant="ghost"
                className={cn(
                  "h-9 w-[368px] rounded-lg text-sm font-normal",
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
              >
                <Link href="/sistema/empresas">
                  <Settings2 className="size-4" />
                  Administrar el sistema
                </Link>
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Empresas, módulos, usuarios y roles. No requiere seleccionar una
                empresa.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CompanyBootstrap;