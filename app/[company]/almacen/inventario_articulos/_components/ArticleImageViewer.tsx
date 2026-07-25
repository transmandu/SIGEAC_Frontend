"use client"

import { useState } from "react"
import { create } from "zustand"
import { ImageOff, Loader2 } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

type ViewerState = {
    src: string | null
    title: string
    open: (src: string, title: string) => void
    close: () => void
}

/**
 * Un único visor montado en la página, manejado por store: si el Dialog
 * viviera dentro de la celda, cada fila montaría su propio portal de Radix
 * y una tabla de 50 filas pagaría 50 overlays que casi nunca se abren.
 */
export const useArticleImageViewer = create<ViewerState>((set) => ({
    src: null,
    title: "",
    open: (src, title) => set({ src, title }),
    close: () => set({ src: null }),
}))

export const ArticleImageViewer = () => {
    const { src, title, close } = useArticleImageViewer()
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [loadedSrc, setLoadedSrc] = useState<string | null>(null)

    // Reset al cambiar de artículo: sin esto el spinner o el error del
    // anterior quedarían pegados al abrir el siguiente.
    if (src && src !== loadedSrc) {
        setLoadedSrc(src)
        setIsLoading(true)
        setHasError(false)
    }

    return (
        <Dialog
            open={!!src}
            onOpenChange={(isOpen) => {
                if (!isOpen) close()
            }}
        >
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-base">{title}</DialogTitle>
                    <DialogDescription className="sr-only">
                        Imagen de referencia del artículo.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative flex min-h-[240px] items-center justify-center rounded-md border bg-muted/30">
                    {isLoading && !hasError && (
                        <Loader2 className="absolute h-6 w-6 animate-spin text-muted-foreground" />
                    )}

                    {hasError ? (
                        <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                            <ImageOff className="h-8 w-8" />
                            <p className="text-sm">No se pudo cargar la imagen.</p>
                        </div>
                    ) : (
                        src && (
                            <img
                                // key: fuerza remontar al cambiar de artículo para
                                // que loading/error no queden pegados del anterior.
                                key={src}
                                src={src}
                                alt={title}
                                className="max-h-[70vh] w-auto rounded-md object-contain"
                                onLoad={() => setIsLoading(false)}
                                onError={() => {
                                    setIsLoading(false)
                                    setHasError(true)
                                }}
                            />
                        )
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
