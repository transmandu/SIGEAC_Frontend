// app/bulletins-sms/page.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CustomCard } from "@/components/cards/CustomCard";
import Image from "next/image";
import { GuestContentLayout } from "@/components/layout/GuestContentLayout";

interface Bulletin {
  id: number;
  imageUrl: string;
  imageAlt: string;
  title: string;
  description: string;
}

const bulletinsData: Bulletin[] = [
  {
    id: 1,
    imageUrl:
      "https://ccvnd3lo965z.share.zrok.io/storage/images/sms/boletin_agosto.png",
    imageAlt: "Boletin de Agosto 2025",
    title: "Boletin de Septiembre 2025",
    description: "",
  },
  {
    id: 2,
    imageUrl:
      "https://ccvnd3lo965z.share.zrok.io/storage/images/sms/boletin_septiembre.png",
    imageAlt: "Boletin de Septiembre 2025",
    title: "Boletin del mes de Septiembre",
    description: "",
  },
];

export default function BulletinsSMSPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleCardClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseDialog = () => {
    setSelectedImage(null);
  };

  return (
    <GuestContentLayout title="Boletines de SMS">
      <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Boletines de SMS
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto px-2 sm:px-4">
            Acceda a los últimos boletines, directrices y mejores prácticas del
            sistema de gestión de seguridad para la seguridad operativa.
          </p>
        </div>

        {/* Bulletins Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {bulletinsData.map((bulletin) => (
            <div
              key={bulletin.id}
              className="cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-95"
              onClick={() => handleCardClick(bulletin.imageUrl)}
            >
              <CustomCard
                imageUrl={bulletin.imageUrl}
                imageAlt={bulletin.imageAlt}
                title={bulletin.title}
                description={bulletin.description}
                actionLink={{
                  href: "#",
                  label: "Ver",
                  variant: "outline",
                }}
                className="h-full"
                imageClassName="w-full h-32 sm:h-40 lg:h-48 object-cover"
                titleClassName="text-base sm:text-lg font-semibold"
                descriptionClassName="text-xs sm:text-sm"
              />
            </div>
          ))}
        </div>

        {/* Dialog para ampliar imagen - Responsive */}
        <Dialog open={!!selectedImage} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl max-h-[95vh] sm:max-h-[90vh] p-1 sm:p-2 bg-transparent border-none shadow-none">
            {selectedImage && (
              <div className="flex items-center justify-center w-full h-full p-2 sm:p-4">
                <Image
                  src={selectedImage}
                  alt="Imagen ampliada"
                  width={800} // Ancho máximo esperado
                  height={600} // Alto máximo esperado
                  className="max-w-full max-h-[85vh] sm:max-h-[80vh] object-contain rounded-lg shadow-2xl"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </GuestContentLayout>
  );
}
