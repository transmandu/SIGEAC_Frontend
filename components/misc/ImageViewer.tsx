'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X } from 'lucide-react';

interface ImageViewerProps {
  openImage: string | null;
  onClose: () => void;
}

// Va al body por portal: el contenedor de página tiene `relative z-0`, que crea
// un contexto de apilamiento y dejaría el overlay debajo del navbar/sidebar y
// posicionado contra el contenedor en vez del viewport.
const ImageViewer = ({ openImage, onClose }: ImageViewerProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!openImage) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [openImage, onClose]);

  if (!openImage || !mounted) return null;

  const src = openImage.startsWith('data:image')
    ? openImage
    : `data:image/jpeg;base64,${openImage}`;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Imagen ampliada"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-4 top-4 rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="size-5" />
      </button>

      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <Image
          src={src}
          alt="Imagen ampliada"
          width={1600}
          height={1200}
          style={{ width: 'auto', height: 'auto' }}
          className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
        />
      </div>
    </div>,
    document.body
  );
};

export default ImageViewer;
