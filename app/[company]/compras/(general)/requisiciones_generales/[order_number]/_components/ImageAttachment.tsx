'use client';

import Image from 'next/image';

interface ImageAttachmentProps {
  image: string;
  onImageClick: (image: string) => void;
}

const ImageAttachment = ({ image, onImageClick }: ImageAttachmentProps) => {
  const getImageSrc = () => {
    return image.startsWith('data:image')
      ? image
      : `data:image/jpeg;base64,${image}`;
  };

  return (
    <div className="relative w-full flex items-center justify-center">
      {/* Desktop: lines on sides */}
      <div className="hidden md:flex flex-1 h-px bg-border/50 mr-4" />

      {/* CARD */}
      <div className="relative w-fit max-w-[300px] rounded-md border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 p-2.5 shadow-sm space-y-2 shrink-0">
        {/* HEADER */}
        <div className="flex items-center gap-2 select-none">
          <span className="text-[11px] font-semibold tracking-widest text-muted-foreground whitespace-nowrap">
            IMAGEN ADJUNTA
          </span>
          <div className="hidden md:block h-px flex-1 bg-border/50" />
        </div>

        {/* CONTENIDO */}
        <div className="flex items-center justify-center">
          <div className="max-w-[260px] max-h-[160px]">
            <Image
              src={getImageSrc()}
              alt="Imagen adjunta"
              width={260}
              height={160}
              className="object-contain w-auto h-auto max-w-full max-h-[160px] cursor-pointer transition hover:opacity-90"
              onClick={() => onImageClick(image)}
            />
          </div>
        </div>
      </div>

      {/* Desktop: lines on sides */}
      <div className="hidden md:flex flex-1 h-px bg-border/50 ml-4" />
    </div>
  );
}

export default ImageAttachment;