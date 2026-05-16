'use client';

import { ContentLayout } from '@/components/layout/ContentLayout';
import { Info } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface DefaultDashboardProps {
  companySlug?: string;
}

export default function DefaultDashboard({ companySlug }: DefaultDashboardProps) {
  return (
    <ContentLayout title={`Dashboard / ${companySlug || ''}`}>
      <main
        className="
          flex flex-col items-center justify-center min-h-[80vh]
          text-center px-6 py-20
          bg-transparent
        "
      >
        {/* Imagen principal animada */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-64 h-64 md:w-80 md:h-80 mb-12 select-none"
        >
          {/* Light mode image */}
          <Image
            src="/dashboard-construction.png"
            alt="Panel en construcción"
            fill
            priority
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            className="object-contain drop-shadow-md opacity-95 dark:hidden pointer-events-none select-none"
          />

          {/* Dark mode image */}
          <Image
            src="/dashboard-construction-dark.png"
            alt="Panel en construcción modo oscuro"
            fill
            priority
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            className="object-contain drop-shadow-md opacity-95 hidden dark:block pointer-events-none select-none"
          />
        </motion.div>

        {/* Título principal */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100 mb-4"
        >
          Bienvenido a <span className="text-blue-600 dark:text-blue-400 italic">SIGEAC</span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed mb-10"
        >
          Estamos preparando un entorno de trabajo hecho a tu medida.  
          Muy pronto podrás acceder a funciones personalizadas que optimizarán tu experiencia dentro del sistema.
        </motion.p>

        {/* Línea decorativa */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '5rem' }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="border-t-4 border-blue-500 dark:border-blue-400 rounded-full mb-8"
        />

        {/* Mensaje final */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="
            flex items-center justify-center text-sm
            text-gray-500 dark:text-gray-300
            bg-white/50 dark:bg-gray-900/40
            px-4 py-2 rounded-full shadow-sm
            border border-gray-100 dark:border-gray-800
            backdrop-blur-md
          "
        >
          <Info className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
          <span>Tu panel estará disponible muy pronto.</span>
        </motion.div>
      </main>
    </ContentLayout>
  );
}