'use client';

import Image from 'next/image';

interface ImageViewerProps {
  openImage: string | null;
  onClose: () => void;
}

const ImageViewer = ({ openImage, onClose }: ImageViewerProps) => {
  if (!openImage) return null;

  const getImageSrc = () => {
    return openImage.startsWith('data:image')
      ? openImage
      : `data:image/jpeg;base64,${openImage}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={getImageSrc()}
          alt="Imagen ampliada"
          width={1400}
          height={900}
          className="object-contain max-w-full max-h-[90vh] rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
}

export default ImageViewer;