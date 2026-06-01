'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface BackButtonProps {
  label?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'link'
  iconOnly?: boolean
  tooltip?: string
  fallbackHref?: string
  className?: string
  disabled?: boolean
}

export default function BackButton({
  label = 'Volver',
  variant = 'secondary',
  iconOnly = false,
  tooltip,
  fallbackHref = '/',
  className,
  disabled = false,
}: BackButtonProps) {
  const router = useRouter()
  const [isLeaving, setIsLeaving] = useState(false)

  const handleBack = useCallback(() => {
    if (disabled || isLeaving) return
    setIsLeaving(true)
    window.setTimeout(() => {
      if (window.history.length > 1) {
        router.back()
      } else {
        router.push(fallbackHref)
      }
    }, 180)
  }, [disabled, fallbackHref, isLeaving, router])

  const button = (
    <Button
      type="button"
      variant={variant}
      size={iconOnly ? 'icon' : 'default'}
      onClick={handleBack}
      disabled={disabled || isLeaving}
      className={cn(
        `
          group
          relative overflow-hidden
          rounded-full
          border border-slate-200/80
          bg-slate-100
          text-slate-700
          shadow-sm
          backdrop-blur-md
          transition-all duration-200
          hover:bg-slate-200/70
          hover:text-slate-900
          hover:shadow-md
          active:scale-[0.985]
          disabled:pointer-events-none
          disabled:opacity-60
          dark:border-slate-800
          dark:bg-slate-900
          dark:text-slate-200
          dark:hover:bg-slate-800
          dark:hover:text-white
          dark:shadow-black/10
        `,
        iconOnly
          ? 'h-10 w-10'
          : 'h-10 px-4',
        className
      )}
    >
      <motion.div
        className="flex items-center justify-center gap-2"
        animate={{
          opacity: isLeaving ? 0.75 : 1,
        }}
        transition={{
          duration: 0.15,
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isLeaving ? (
            <motion.div
              key="loader"
              initial={{
                opacity: 0,
                rotate: -90,
              }}
              animate={{
                opacity: 1,
                rotate: 0,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.18,
              }}
            >
              <Loader2
                className={cn(
                  'animate-spin',
                  iconOnly ? 'h-5 w-5' : 'h-4 w-4'
                )}
              />
            </motion.div>
          ) : (
            <motion.div
              key="arrow"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.18,
              }}
            >
              <ArrowLeft
                className={cn(
                  `
                    transition-all duration-200
                    group-hover:opacity-80
                  `,
                  iconOnly ? 'h-5 w-5' : 'h-4 w-4'
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {!iconOnly && (
          <span className="text-sm font-medium tracking-tight">
            {label}
          </span>
        )}
      </motion.div>

      <motion.div
        className="
          pointer-events-none
          absolute inset-0
          opacity-0
          transition-opacity duration-300
          group-hover:opacity-100
        "
      >
        <div
          className="
            absolute inset-y-0 left-0 w-1/3
            bg-gradient-to-r
            from-transparent
            via-white/20
            to-transparent
            blur-md
            dark:via-white/10
          "
        />
      </motion.div>
    </Button>
  )

  if (!tooltip) return button

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>

        <TooltipContent
          side="bottom"
          className="
            rounded-xl
            border
            bg-background/95
            px-3 py-1.5
            text-xs font-medium
            shadow-xl
            backdrop-blur
          "
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}