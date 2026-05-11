"use client";

import React from 'react';
import Image from 'next/image';
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface PersonProps {
    role: string;
    image: string;
    description: string;
}

export const PersonCard = ({ role, image, description }: PersonProps) => {
    return (
        <Card className="relative overflow-hidden bg-transparent border border-transparent shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-0 min-h-[350px]">

                {/* IMAGE SECTION */}
                <div className="flex items-center justify-center">
                    <Dialog>
                        <DialogTrigger asChild>
                            <div
                                tabIndex={0}
                                role="button"
                                className="relative w-full h-[350px] md:h-[450px] overflow-hidden cursor-zoom-in"
                            >
                                <Image
                                    src={image}
                                    alt={role}
                                    fill
                                    /* object-contain garantiza ver la foto completa sin recortes */
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </DialogTrigger>

                        <DialogContent className="max-w-5xl border-none bg-transparent p-0 shadow-none">
                            <VisuallyHidden>
                                <DialogTitle>{role}</DialogTitle>
                            </VisuallyHidden>
                            <div className="relative h-[90vh] w-full">
                                <Image
                                    src={image}
                                    alt={role}
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* INFO SECTION */}
                <div className="flex flex-col justify-center p-4">
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-foreground leading-tight">
                            {role}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-tight">
                            {description}
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
};
