'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ListChevronsDownUp, ListChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PreviewPanelIconProps {
  active: boolean
  className?: string
}

/**
 * Cerrado (ListChevronsUpDown, "expandir") ↔ abierto (ListChevronsDownUp,
 * "colapsar"). El crossfade con AnimatePresence evita el salto seco entre
 * ambos paths, que lucide no expone morph-eables.
 */
const PreviewPanelIcon = ({ active, className }: PreviewPanelIconProps) => {
  return (
    <span className={cn('relative inline-flex items-center justify-center', className)}>
      <AnimatePresence initial={false}>
        {active && (
          <motion.span
            key="glow"
            className="pointer-events-none absolute inset-0 rounded-full bg-blue-500/25 dark:bg-blue-400/25"
            initial={{ opacity: 0.3, scale: 0.4 }}
            animate={{ opacity: 0, scale: 1.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence initial={false} mode="wait">
        {active ? (
          <motion.span
            key="open"
            className="flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <ListChevronsDownUp className="size-full" />
          </motion.span>
        ) : (
          <motion.span
            key="closed"
            className="flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <ListChevronsUpDown className="size-full" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

export default PreviewPanelIcon
