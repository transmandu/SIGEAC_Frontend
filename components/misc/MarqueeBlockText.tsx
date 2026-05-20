'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  text: string
  className?: string
}

const SPEED = 60

export function MarqueeBlockText({ text, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [enabled, setEnabled] = useState(false)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return

    const containerWidth = containerRef.current.offsetWidth
    const contentWidth = contentRef.current.scrollWidth

    const diff = contentWidth - containerWidth

    if (diff > 0) {
      setDuration(contentWidth / SPEED)
      setEnabled(true)
    } else {
      setDuration(0)
      setEnabled(false)
    }
  }, [text])

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full overflow-hidden', className)}
    >
      <div
        ref={contentRef}
        className={cn(
          'flex whitespace-nowrap text-sm leading-relaxed text-foreground/90',
          enabled && 'animate-marquee-loop'
        )}
        style={
          {
            '--duration': `${duration}s`,
          } as React.CSSProperties
        }
      >
        {/* duplicación clave para loop perfecto */}
        <span className="pr-8">{text}</span>
        {enabled && <span className="pr-8">{text}</span>}
      </div>
    </div>
  )
}