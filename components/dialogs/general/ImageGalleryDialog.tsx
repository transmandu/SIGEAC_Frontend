"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImageGalleryDialogProps {
  images: {
    src: string;
    alt: string;
  }[];
  trigger: React.ReactNode;
  initialIndex?: number;
}

export function ImageGalleryDialog({
  images,
  trigger,
  initialIndex = 0,
}: ImageGalleryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToNextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPreviousImage = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset to initial index when closed
      setTimeout(() => setCurrentIndex(initialIndex), 300);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") goToPreviousImage();
    if (event.key === "ArrowRight") goToNextImage();
    if (event.key === "Escape") setIsOpen(false);
  };

  if (images.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="w-[95vw] h-[95vh] sm:w-[50vw] sm:h-[50vh] md:w-[40vw] md:h-[100vh] max-w-none p-0 bg-black/90 border-0 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 text-white hover:bg-white/20 w-8 h-8 sm:w-5 sm:h-5"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-4 h-4 sm:w-6 sm:h-6" />
        </Button>

        {/* Left arrow */}
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-1 sm:left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-50 text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
            onClick={goToPreviousImage}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </Button>
        )}

        {/* Right arrow */}
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 sm:right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-50 text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
            onClick={goToNextImage}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </Button>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-50 bg-black/50 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Current image - Contenedor principal */}
        <div className="w-full h-full flex items-center justify-center p-2 sm:p-3 md:p-4">
          <div className="relative w-full h-full max-w-full max-h-full flex items-center justify-center">
            <Image
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              className="max-w-[calc(100%-2rem)] max-h-[calc(100%-2rem)] object-contain"
            />
          </div>
        </div>

        {/* Thumbnails (optional) */}
        {images.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 z-50 flex gap-1 sm:gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all",
                  index === currentIndex
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/70"
                )}
              />
            ))}
          </div>
        )}

        {/* Touch swipe area for mobile */}
        <div className="absolute inset-0 z-40 flex">
          <div className="flex-1 cursor-pointer" onClick={goToPreviousImage} />
          <div className="flex-1 cursor-pointer" onClick={goToNextImage} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
