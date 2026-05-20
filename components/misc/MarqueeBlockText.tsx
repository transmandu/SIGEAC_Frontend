'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  text: string
  className?: string
}

const SPEED = 60 // px/s
const PAUSE_MS = 6000

export function MarqueeBlockText({ text, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [hovered, setHovered] = useState(false)
  const [offset, setOffset] = useState(0)

  const offsetRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const pausedRef = useRef(false)

  useEffect(() => {
    if (!hovered) {
      offsetRef.current = 0
      setOffset(0)
      pausedRef.current = false
      return
    }

    const container = containerRef.current!
    const content = contentRef.current!

    const maxScroll = content.scrollWidth - container.clientWidth

    let last = performance.now()

    const step = (now: number) => {
      const delta = now - last
      last = now

      if (!pausedRef.current) {
        offsetRef.current += (SPEED * delta) / 1000
        setOffset(offsetRef.current)

        if (offsetRef.current >= maxScroll) {
          offsetRef.current = maxScroll
          setOffset(maxScroll)

          pausedRef.current = true

          setTimeout(() => {
            // RESET ABRUPTO AL INICIO
            offsetRef.current = 0
            setOffset(0)
            pausedRef.current = false

            if (hovered) {
              rafRef.current = requestAnimationFrame(step)
            }
          }, PAUSE_MS)

          return
        }
      }

      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [hovered])

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full overflow-hidden', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        ref={contentRef}
        className="whitespace-nowrap text-sm leading-relaxed text-foreground/90"
        style={{
          transform: `translateX(${offset}px)`,
          willChange: 'transform',
        }}
      >
        {text}
      </div>
    </div>
  )
}