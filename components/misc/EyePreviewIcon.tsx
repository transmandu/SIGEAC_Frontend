'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeClosed } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EyePreviewIconProps {
  active: boolean
  className?: string
}

/**
 * Ojo cerrado → ojo abierto con un destello al activarse, en vez de un
 * simple swap de ícono. AnimatePresence hace crossfade entre EyeClosed/Eye
 * (lucide no expone un solo path morph-eable entre ambos estados). La
 * duración es deliberadamente lenta (0.45s) para que se lea como un
 * "despertar" del ojo, no un parpadeo; el destello se estira a la par.
 * El ícono cerrado parte un poco más chico (0.85) que el abierto (1), no
 * del mismo tamaño, para reforzar la sensación de apertura al crecer.
 */
const EyePreviewIcon = ({ active, className }: EyePreviewIconProps) => {
  return (
    <span className={cn('relative inline-flex items-center justify-center', className)}>
      <AnimatePresence initial={false}>
        {active && (
          <motion.span
            key="glow"
            className="pointer-events-none absolute inset-0 rounded-full bg-blue-500/50 dark:bg-blue-400/50"
            initial={{ opacity: 0.6, scale: 0.3 }}
            animate={{ opacity: 0, scale: 2.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence initial={false} mode="wait">
        {active ? (
          <motion.span
            key="open"
            className="flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.55, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <Eye className="size-full" />
          </motion.span>
        ) : (
          <motion.span
            key="closed"
            className="flex items-center justify-center"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 0.85 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <EyeClosed className="size-full" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

export default EyePreviewIcon
