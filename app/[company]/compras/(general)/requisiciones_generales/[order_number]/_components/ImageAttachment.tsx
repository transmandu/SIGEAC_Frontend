"use client";

import Image from "next/image";

interface ImageAttachmentProps {
  image: string;
  onImageClick: (image: string) => void;
}

const ImageAttachment = ({ image, onImageClick }: ImageAttachmentProps) => {
  const getImageSrc = () => {
    return image.startsWith("data:image")
      ? image
      : `data:image/jpeg;base64,${image}`;
  };

  return (
    <div className="relative w-full flex items-center justify-center">
      {/* Desktop: lines on sides */}
      <div className="hidden md:flex flex-1 h-px bg-border/50 mr-4" />

      {/* CARD */}
      <div className="relative w-fit max-w-75 rounded-xl border border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-900/60 p-2.5 shadow-xs space-y-2 shrink-0">
        {/* HEADER */}
        <div className="flex items-center gap-2 select-none">
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            Imagen adjunta
          </span>
          <div className="hidden md:block h-px flex-1 bg-border/50" />
        </div>

        {/* CONTENIDO */}
        <div className="flex items-center justify-center">
          <div className="max-w-65 max-h-40">
            <Image
              src={getImageSrc()}
              alt="Imagen adjunta"
              width={260}
              height={160}
              className="object-contain w-auto h-auto max-w-full max-h-40 cursor-pointer transition hover:opacity-90"
              onClick={() => onImageClick(image)}
            />
          </div>
        </div>
      </div>

      {/* Desktop: lines on sides */}
      <div className="hidden md:flex flex-1 h-px bg-border/50 ml-4" />
    </div>
  );
};

export default ImageAttachment;
