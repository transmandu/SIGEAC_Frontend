"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ImageIcon, ImageOff, Loader2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

/**
 * Popover por fila en vez de un Dialog global: permite recorrer el inventario
 * viendo referencias sin el ciclo abrir/cerrar de un modal.
 *
 * El costo en reposo sigue siendo un botón — Radix no monta el contenido ni
 * el portal hasta que se abre, así que la imagen se descarga en el primer
 * clic y el navegador la cachea para las siguientes veces.
 */
const ArticleImageCell = ({
    image,
    alt,
}: {
    image?: string | null
    alt?: string
}) => {
    const [hasOpened, setHasOpened] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    const src = image?.trim()

    if (!src) {
        return (
            <div className="flex justify-center">
                <span className="text-xs text-muted-foreground">—</span>
            </div>
        )
    }

    return (
        <div className="flex justify-center">
            <Popover onOpenChange={(open) => open && setHasOpened(true)}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Ver imagen de referencia</span>
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-2" side="left" align="center">
                    <div className="relative flex h-[240px] w-[240px] items-center justify-center overflow-hidden rounded-md bg-muted/30">
                        {isLoading && !hasError && (
                            <Loader2 className="absolute h-5 w-5 animate-spin text-muted-foreground" />
                        )}

                        {hasError ? (
                            <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                                <ImageOff className="h-6 w-6" />
                                <p className="text-xs">No se pudo cargar.</p>
                            </div>
                        ) : (
                            // hasOpened evita pedir la imagen antes del primer clic.
                            hasOpened && (
                                <Image
                                    src={src}
                                    alt={alt?.trim() || "Artículo"}
                                    fill
                                    sizes="240px"
                                    className="object-contain"
                                    onLoad={() => setIsLoading(false)}
                                    onError={() => {
                                        setIsLoading(false)
                                        setHasError(true)
                                    }}
                                />
                            )
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default ArticleImageCell
