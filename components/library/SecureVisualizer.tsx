"use client";

import { useEffect } from "react";
import SecureFileViewer from "@/components/library/SecureFileViewer";
import { useTourContext } from "@/components/tour/TourProvider";
import { bibliotecaVisualizadorSteps } from "@/components/tour/steps/general/biblioteca/biblioteca-visualizador";
import libraryService from "@/lib/libraryService";

interface SecureViewerProps {
  company: string;
  /** Id del documento, o de una versión si `isVersionHistory`. */
  documentId: number | string | null;
  isOpen: boolean;
  onClose: () => void;
  isVersionHistory?: boolean;
}

const TOUR = {
  title: "biblioteca-viewer-title",
  close: "biblioteca-viewer-close",
  toolbar: "biblioteca-viewer-toolbar",
  footer: "biblioteca-viewer-footer",
};

/**
 * Visor de documentos de la biblioteca. Es el visor genérico (`SecureFileViewer`)
 * con el endpoint de la biblioteca: así comparte el portal al body —sin él, el
 * visor quedaba atrapado en el stacking context del layout y salía por detrás
 * de la barra, del menú y de los paneles—, el cierre con Escape y el manejo de
 * diálogos que tenga debajo.
 */
export default function SecureViewer({
  company,
  documentId,
  isOpen,
  onClose,
  isVersionHistory = false,
}: SecureViewerProps) {
  const { registerTour, unregisterTour } = useTourContext();
  const open = isOpen && documentId != null && documentId !== "";

  useEffect(() => {
    if (open) {
      registerTour(
        "biblioteca-visualizador",
        "Visualizador Seguro",
        bibliotecaVisualizadorSteps,
        { onlyVisible: true },
      );
    }
    return () => unregisterTour("biblioteca-visualizador");
  }, [open, registerTour, unregisterTour]);

  return (
    <SecureFileViewer
      isOpen={open}
      onClose={onClose}
      title="Visualizador Seguro"
      // Al saltar de un documento a otro, la respuesta lenta del primero se
      // ignora en vez de mostrarse sobre el segundo.
      signature={`${company}|${documentId}|${isVersionHistory}`}
      fetchBlobUrl={() =>
        libraryService.getFileBlob(
          company,
          documentId as number | string,
          isVersionHistory,
        )
      }
      tour={TOUR}
    />
  );
}
