'use client';

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

const PlaneIntro = () => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={
        reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, scale: 0.25, x: -420, y: 340 }
      }
      animate={
        reduceMotion
          ? { opacity: 1 }
          : { opacity: 1, scale: 1, x: 0, y: 0 }
      }
      transition={{
        duration: reduceMotion ? 0.3 : 2,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="z-10 w-full flex justify-center lg:relative"
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
        width={1280}
        height={1260}
        sizes="(max-width: 1024px) 100vw, 50vw"
        alt="Avión"
        priority
        draggable={false}
      />
    </motion.div>
  );
};

export default PlaneIntro;
