import Footer from "@/components/layout/Footer";
import Logo from "@/components/misc/Logo";
import PlaneIntro from "@/components/misc/PlaneIntro";
import { buttonVariants } from "@/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

const APP_VERSION = "v2.0.2";

export const metadata: Metadata = {
  title: "SIGEAC | Inicio",
  description: "Sistema de Gestión Aeronáutica Civil",
};

export default function Home() {
  return (
    <div
      className="
        w-full
        min-h-[100dvh]
        flex
        flex-col
        lg:flex-row
        bg-sky-100
        dark:bg-background
        overflow-x-hidden
      "
    >
      {/* LEFT SIDE */}
      <div
        className="
          w-full
          flex
          flex-1
          items-center
          justify-center
          relative
          rounded-b-full
          lg:rounded-r-full
          lg:rounded-b-none

          select-none
        "
      >
        {/* El recorte vive en el wrapper para que el avión siga sobresaliendo
            del panel; la capa interna anima transform sin repintar el fondo. */}
        <div
          aria-hidden
          className="
            absolute inset-0
            overflow-hidden
            rounded-b-full
            lg:rounded-r-full
            lg:rounded-b-none
          "
        >
          <div
            className="
              absolute inset-0
              bg-clouds dark:bg-night
              bg-cover bg-center
              will-change-transform
              animate-moveBackground
              motion-reduce:animate-none
            "
          />
        </div>

        <PlaneIntro />
      </div>

      {/* RIGHT SIDE */}
      <div
        className="
          w-full
          flex
          flex-1
          flex-col
          items-center
          justify-center
          gap-4
          px-4
          text-slate-900
          dark:text-slate-100
        "
      >
        <div className="flex flex-col justify-center items-center gap-4">
          <Logo />

          <Link href="/login" className={buttonVariants()}>
            Iniciar Sesión - {APP_VERSION}
          </Link>
        </div>

        <Footer />
      </div>
    </div>
  );
}
