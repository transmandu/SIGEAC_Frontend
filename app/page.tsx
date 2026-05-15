'use client';

import Footer from "@/components/layout/Footer";
import Logo from "@/components/misc/Logo";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const onClick = () => {
    router.push("/login");
  };

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
        overflow-hidden
      "
    >
      {/* LEFT SIDE */}
      <div
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        className="
          w-full 
          flex 
          flex-1 
          items-center 
          justify-center 
          bg-clouds dark:bg-night
          bg-cover 
          relative 
          animate-moveBackground 
          rounded-b-full 
          lg:rounded-r-full 
          lg:rounded-b-none

          select-none
        "
      >
        <motion.div
          key="plane"
          initial={{
            opacity: 0,
            scale: 0.25,
            x: -420,
            y: 340,
            filter: "blur(6px)",
          }}
          animate={{
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="w-full flex justify-center lg:relative"
        >
          <Image
            className="
              w-[700px] 
              -rotate-12 
              lg:w-auto 
              lg:absolute 
              lg:top-1/2 
              lg:-translate-y-1/2 
              lg:-right-32

              select-none
              pointer-events-none
            "
            src="/plane3.png"
            width={1350}
            height={1350}
            alt="avion-al"
            priority
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        </motion.div>
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

          <Button onClick={onClick}>
            Iniciar Sesión - v2.0.2
          </Button>
        </div>

        <Footer />
      </div>
    </div>
  );
}