import React from 'react';
import Image from 'next/image';
import { Card } from "@/components/ui/card";

interface PillarProps {
    image: string;
    title?: string;
}

export const PillarCard = ({ image, title = "Imagen" }: PillarProps) => {
    return (
        <Card className="overflow-hidden border-border/60 rounded-xl bg-muted/20">
            {/* aspect-square garantiza que el contenedor sea un cuadrado */}
            <div className="relative w-full aspect-square p-2">
                <Image
                    src={image}
                    alt={title}
                    fill
                    /* object-contain asegura que la imagen se vea completa sin cortes */
                    className="object-contain"
                    priority
                />
            </div>
        </Card>
    );
};
