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
        className="relative max-w-[70vw] max-h-[70vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={getImageSrc()}
          alt="Imagen ampliada"
          width={800}
          height={600}
          className="object-contain w-auto h-auto max-w-full max-h-[70vh] rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
}

export default ImageViewer;