'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Image from "next/image"

interface ImageZoomProps {
  src: string
  alt?: string
  width?: number | string
  height?: number | string
  initialZoom?: number
  maxZoom?: number
  minZoom?: number
  step?: number
  className?: string
  showControls?: boolean
  controlsPlacement?: 'overlay' | 'below'
  controlsOffset?: number
} 

export default function ImageZoom({
  src,
  alt = '',
  width = '100%',
  height = 'auto',
  initialZoom = 2,
  maxZoom = 3,
  minZoom = 1,
  step = 0.25,
  className = '',
  showControls = true,
  controlsPlacement = 'below',
  controlsOffset = 40,
}: ImageZoomProps) {
  const [zoom, setZoom] = useState<number>(minZoom)
  const [tx, setTx] = useState<number>(0)
  const [ty, setTy] = useState<number>(0)
  const [dragging, setDragging] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const pointerRef = useRef<{ id: number; x: number; y: number } | null>(null)
  // movedRef: indica que hubo movimiento de arrastre para suprimir toggle de zoom al soltar
  const movedRef = useRef<boolean>(false)

  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

  const toggleZoom = () => {
    if (zoom === minZoom) setZoom(Math.min(initialZoom, maxZoom))
    else {
      setZoom(minZoom)
      setTx(0)
      setTy(0)
    }
  }

  const inc = useCallback(() => {
    setZoom((z) =>
      clamp(+((z + step).toFixed(3)), minZoom, maxZoom)
    )
  }, [step, minZoom, maxZoom])

  const dec = useCallback(() => {
    setZoom((z) => {
      const newZ = clamp(+((z - step).toFixed(3)), minZoom, maxZoom)
      if (newZ <= minZoom) {
        setTx(0)
        setTy(0)
      }
      return newZ
    })
  }, [step, minZoom, maxZoom])
  // Inicia captura de pointer para panning (solo si zoom > 1)
  const onPointerDown = (e: React.PointerEvent) => {
    if (zoom <= 1) return
    const target = wrapperRef.current
    if (!target) return
    (e.target as Element).setPointerCapture(e.pointerId)
    pointerRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
    movedRef.current = false
    setDragging(true)
  }

  // Maneja el arrastre/panning: actualiza tx/ty y marca `movedRef` si hubo desplazamiento
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !pointerRef.current) return
    const prev = pointerRef.current
    if (e.pointerId !== prev.id) return
    const dx = e.clientX - prev.x
    const dy = e.clientY - prev.y

    if (Math.abs(dx) + Math.abs(dy) > 4) movedRef.current = true

    pointerRef.current = { ...prev, x: e.clientX, y: e.clientY }

    setTx((x) => x + dx)
    setTy((y) => y + dy)
  }

  // Finaliza la captura del pointer y mantiene el zoom/pan en su estado actual
  const onPointerUp = (e: React.PointerEvent) => {
    if (pointerRef.current && e.pointerId === pointerRef.current.id) {
      try {
        (e.target as Element).releasePointerCapture(e.pointerId)
      } catch {}
      pointerRef.current = null
      setDragging(false)

      setTimeout(() => {
        movedRef.current = false
      }, 50)
    }
  }

  // Wheel zoom: zoom immediato al pasar la rueda sobre el contenedor. Previene el scroll de la página y
  // centra el zoom en la posición del cursor ajustando tx/ty para mantener el punto focal.
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (!wrapperRef.current) return

    const rect = wrapperRef.current.getBoundingClientRect()
    const cursorX = e.clientX - rect.left
    const cursorY = e.clientY - rect.top

    const s = zoom
    // multiplicador de zoom por rueda; ajustable si se desea un paso distinto
    const multiplier = e.deltaY < 0 ? 1.15 : 0.85
    const newScale = clamp(+((s * multiplier).toFixed(3)), minZoom, maxZoom)
    if (newScale === s) return

    const cx = rect.width / 2
    const cy = rect.height / 2

    // ajustar tx/ty para que el punto bajo el cursor permanezca en su lugar
    const newTx = tx + (s - newScale) * (cursorX - tx - cx) / s
    const newTy = ty + (s - newScale) * (cursorY - ty - cy) / s

    setZoom(newScale)
    setTx(newTx)
    setTy(newTy)
  }

  // Maneja clicks evitando alternar zoom si hubo arrastre
  // Evita alternar zoom cuando el usuario soltó después de arrastrar (movedRef)
  const handleClick = (e: React.MouseEvent) => {
    if (movedRef.current) {
      movedRef.current = false
      return
    }

    toggleZoom()
  }

  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if (ev.key === '+' || ev.key === '=' || ev.key === 'ArrowUp') {
        ev.preventDefault()
        inc()
      } else if (ev.key === '-' || ev.key === '_' || ev.key === 'ArrowDown') {
        ev.preventDefault()
        dec()
      } else if (ev.key === 'Escape') {
        ev.preventDefault()
        setZoom(minZoom)
        setTx(0)
        setTy(0)
      }
    }
    const node = wrapperRef.current
    node?.addEventListener('keydown', handler)
    return () => node?.removeEventListener('keydown', handler)
  }, [minZoom, dec, inc])

  useEffect(() => {
    if (zoom <= minZoom) {
      setTx(0)
      setTy(0)
    }
  }, [zoom, minZoom])

  const transform = `translate3d(${tx}px, ${ty}px, 0) scale(${zoom})`
  const cursorClass = zoom > 1 ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'

  return (
    <figure className={`inline-block ${className}`}>
      <div
        ref={wrapperRef}
        role="group"
        aria-label="Contenedor de imagen con zoom"
        tabIndex={0}
        onClick={handleClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        style={{
          width,
          height,
          overflow: 'hidden',
          touchAction: 'none',
          display: 'inline-block',
        }}
        className={`relative ${cursorClass} select-none`}
      >
        <Image
          src={src}
          alt={alt}
          draggable={false}
          style={{
            transform,
            transformOrigin: 'center center',
            transition: dragging ? 'none' : 'transform 180ms ease',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
          loading="lazy"
        />

        {showControls && controlsPlacement === 'overlay' && (
          // Controles en overlay: rectángulo sobre la imagen. stopPropagation evita iniciar panning
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-6 z-20"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-md px-3 py-1 flex items-center gap-3">
              <button
                type="button"
                aria-label="Reducir zoom"
                onClick={(e) => {
                  e.stopPropagation()
                  dec()
                }}
                className="px-2 py-1 rounded border bg-white hover:bg-gray-100 text-sm"
              >
                -
              </button>

              <div aria-live="polite" className="text-sm">
                {zoom.toFixed(2)}x
              </div>

              <button
                type="button"
                aria-label="Aumentar zoom"
                onClick={(e) => {
                  e.stopPropagation()
                  inc()
                }}
                className="px-2 py-1 rounded border bg-white hover:bg-gray-100 text-sm"
              >
                +
              </button>
            </div>
          </div>
        )}

      </div>

      {showControls && controlsPlacement === 'below' && (
        // Controles debajo de la imagen: centrados y con un offset configurable (`controlsOffset`)
        <div className="flex justify-center" style={{ marginTop: `${controlsOffset}px` }} onPointerDown={(e) => e.stopPropagation()}>
          <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-md px-3 py-1 flex items-center gap-3">
            <button
              type="button"
              aria-label="Reducir zoom"
              onClick={(e) => {
                e.stopPropagation()
                dec()
              }}
              className="px-2 py-1 rounded border bg-white hover:bg-gray-100 text-sm"
            >
              -
            </button>

            <div aria-live="polite" className="text-sm">
              {zoom.toFixed(2)}x
            </div>

            <button
              type="button"
              aria-label="Aumentar zoom"
              onClick={(e) => {
                e.stopPropagation()
                inc()
              }}
              className="px-2 py-1 rounded border bg-white hover:bg-gray-100 text-sm"
            >
              +
            </button>
          </div>
        </div>
      )}

    </figure>
  )
}