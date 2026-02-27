'use client'

import Footer from "@/components/layout/Footer";
import Logo from "@/components/misc/Logo";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter()

  const onClick = () => {
    router.push('/login')
  }

  return (
    <div className="w-full h-screen flex flex-col lg:flex-row bg-sky-100">
      <div className="w-full flex justify-center h-full bg-clouds bg-cover relative animate-moveBackground rounded-b-full lg:rounded-r-full lg:rounded-b-none">
        <motion.div
          key="plane"
          className="mt-24 lg:mt-0"
          initial={{
            opacity: 0,
            scale: 0.25,
            x: -220,
            y: -140,
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
            duration: 1.6,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          <Image
            className="lg:absolute lg:top-50 lg:-right-32 w-[600px] -rotate-12 lg:w-auto"
            src={'/plane3.png'}
            width={890}
            height={890}
            alt="avion-al"
            priority
          />
        </motion.div>
      </div>

      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col justify-center items-center gap-4">
          <Logo />
          <Button onClick={onClick}>Iniciar Sesión - v2.0.2</Button>
        </div>
        <Footer />
      </div>
    </div>
  );
}
