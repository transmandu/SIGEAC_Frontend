'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  text: string
  className?: string
}

const SPEED = 60 // px por segundo (ajustable UX)

export function MarqueeBlockText({ text, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [hovered, setHovered] = useState(false)
  const [distance, setDistance] = useState(0)
  const [duration, setDuration] = useState(0)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return

    const containerWidth = containerRef.current.offsetWidth
    const contentWidth = contentRef.current.scrollWidth

    const diff = contentWidth - containerWidth

    if (diff > 0) {
      setDistance(diff)
      setDuration(diff / SPEED)
      setEnabled(true)
    } else {
      setDistance(0)
      setDuration(0)
      setEnabled(false)
    }
  }, [text])

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full overflow-hidden', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        ref={contentRef}
        className={cn(
          'whitespace-nowrap text-sm leading-relaxed text-foreground/90',
          hovered && enabled && 'animate-marquee-loop'
        )}
        style={{
          '--distance': `${distance}px`,
          '--duration': `${duration}s`,
        } as React.CSSProperties}
      >
        <span>{text}</span>
      </div>
    </div>
  )
}