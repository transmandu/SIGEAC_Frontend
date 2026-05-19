'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  text: string
  className?: string
}

export function MarqueeBlockText({
  text,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLParagraphElement>(null)

  const [overflowing, setOverflowing] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    const content = contentRef.current

    if (!container || !content) return

    setOverflowing(content.scrollHeight > container.clientHeight)
  }, [text])

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative overflow-hidden ${className}`}
    >
      <p
        ref={contentRef}
        className={`
          whitespace-pre-wrap text-sm leading-relaxed text-foreground/90
          transition-transform duration-&lsqb;6000ms&rsqb; ease-linear
          ${overflowing && hovered ? '-translate-y-[calc(100%-140px)]' : 'translate-y-0'}
        `}
      >
        {text}
      </p>
    </div>
  )
}