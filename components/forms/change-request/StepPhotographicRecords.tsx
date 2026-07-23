"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface PhotographicImage {
  file: File;
  preview: string;
}

interface StepPhotographicRecordsProps {
  beforeImages: PhotographicImage[];
  afterImages: PhotographicImage[];
  onBeforeImagesChange: (images: PhotographicImage[]) => void;
  onAfterImagesChange: (images: PhotographicImage[]) => void;
}

function ImageDropZone({
  images,
  onImagesChange,
  label,
}: {
  images: PhotographicImage[];
  onImagesChange: (images: PhotographicImage[]) => void;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newImages: PhotographicImage[] = [];

    for (const file of Array.from(files)) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) continue;
      if (file.size > MAX_IMAGE_SIZE_BYTES) continue;
      newImages.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index].preview);
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <Plus className="size-3 mr-1" />
          Agregar
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {images.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-2 py-8 border border-dashed border-border/60 rounded-md cursor-pointer hover:bg-muted/20 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <ImageIcon className="size-8 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">
            Arrastra imágenes o haz clic para agregar
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            JPG, PNG o WebP — Máx. 5MB por imagen
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div
              key={img.preview}
              className="relative group aspect-square rounded-md overflow-hidden border border-border/40"
            >
              <Image
                src={img.preview}
                alt={`${label} ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/80 hover:bg-destructive text-white"
                onClick={() => removeImage(index)}
              >
                <Trash2 className="size-3" />
              </Button>
              <span className="absolute bottom-1 left-1 text-[10px] font-medium bg-black/50 text-white px-1.5 py-0.5 rounded">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StepPhotographicRecords({
  beforeImages,
  afterImages,
  onBeforeImagesChange,
  onAfterImagesChange,
}: StepPhotographicRecordsProps) {
  return (
    <div className="flex flex-col gap-6">
      <ImageDropZone
        images={beforeImages}
        onImagesChange={onBeforeImagesChange}
        label="ANTES del Cambio"
      />
      <ImageDropZone
        images={afterImages}
        onImagesChange={onAfterImagesChange}
        label="DESPUÉS del Cambio"
      />
    </div>
  );
}

export type { PhotographicImage };
