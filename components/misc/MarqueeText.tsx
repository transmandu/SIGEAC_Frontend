"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function MarqueeText({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [hovered, setHovered] = useState(false);
  const [distance, setDistance] = useState(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const contentWidth = contentRef.current.scrollWidth;

    const diff = contentWidth - containerWidth;

    if (diff > 0) {
      setDistance(diff);
      setEnabled(true);
    } else {
      setEnabled(false);
    }
  }, [text]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        ref={contentRef}
        className={cn(
          "flex whitespace-nowrap text-xs text-muted-foreground transition-transform",
          hovered && enabled && "animate-marquee-x"
        )}
        style={
          {
            "--distance": `${distance}px`,
          } as React.CSSProperties
        }
      >
        <span>{text}</span>
      </div>
    </div>
  );
}