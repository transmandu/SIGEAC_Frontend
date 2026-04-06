'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, ShieldCheck, Lock, Frown, RotateCcw } from 'lucide-react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { Button } from "@/components/ui/button";

// @ts-ignore - Ignorar error cosmético de TS en PC nueva
import '@react-pdf-viewer/core/lib/styles/index.css';
// @ts-ignore - Ignorar error cosmético de TS en PC nueva
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

import libraryService from '@/lib/libraryService';

export default function PublicNativeViewerPage() {
  const params = useParams();
  const company = params.company as string;
  const token = params.token as string;

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const activeUrlRef = useRef<string | null>(null);

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [],
    renderToolbar: (Toolbar) => (
      <Toolbar>
        {(slots) => {
          const { Zoom, ZoomIn, ZoomOut, EnterFullScreen, NumberOfPages, CurrentPageInput } = slots;
          return (
            <div className="flex items-center justify-between w-full px-4">
              <div className="flex items-center gap-2">
                <ZoomOut /> <Zoom /> <ZoomIn />
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                <CurrentPageInput /> / <NumberOfPages />
              </div>
              <div className="flex items-center">
                <EnterFullScreen />
              </div>
            </div>
          );
        }}
      </Toolbar>
    ),
  });

  // --- 🛡️ BLOQUEO DE SEGURIDAD AMPLIADO (PERMITE SUBRAYAR, NIEGA COPIAR/CORTAR) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isControl = e.ctrlKey || e.metaKey;
      
      // Bloqueamos Ctrl+S (guardar), P (imprimir), U (ver código), C (copiar), X (cortar)
      const forbiddenKeys = ['s', 'p', 'u', 'c', 'x'];
      if (isControl && forbiddenKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    const handleCopyCut = (e: ClipboardEvent) => {
      e.preventDefault(); // Evitamos que se mueva la data original al portapapeles
      
      // Sobrescribimos el portapapeles con una advertencia en lugar del texto real
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', '⚠️ Contenido Protegido por SIGEAC Library');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('copy', handleCopyCut);
    window.addEventListener('cut', handleCopyCut); // Bloqueo de cortar

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('copy', handleCopyCut);
      window.removeEventListener('cut', handleCopyCut);
    };
  }, []);

  // --- FUNCIÓN DE CARGA ---
  const loadFile = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const url = await libraryService.getFileBlob(company, token);

      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current);
      }

      activeUrlRef.current = url;
      setFileUrl(url);
    } catch (err) {
      setError("No pudimos validar este documento. Es posible que el enlace haya expirado o no sea válido.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFile();

    return () => {
      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current);
        activeUrlRef.current = null;
        setFileUrl(null);
      }
    };
  }, [company, token]);

  return (
    // 🔥 CAMBIO CLAVE: Cambiado 'select-none' por 'select-text' para permitir subrayar con el mouse
    <div className="h-screen w-screen flex flex-col bg-[#111214] text-white overflow-hidden select-text" onContextMenu={(e) => e.preventDefault()}>
      
      {/* HEADER NATIVO */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1a1c1e]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Visor Público</h3>
            <p className="text-[9px] text-gray-500 font-bold uppercase">Transmisión Protegida por SIGEAC</p>
          </div>
        </div>
      </div>

      {/* ÁREA DE CONTENIDO (Estirada al máximo) */}
      <div className="flex-1 relative overflow-hidden bg-[#141517]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111214] z-10">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-500 text-center px-4">
              Cifrando Visualización...
            </p>
          </div>
        )}

        {error ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#111214]">
            <div className="mb-6 p-6 rounded-full bg-amber-500/10 animate-pulse">
              <Frown className="h-16 w-16 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold mb-2 uppercase tracking-tight text-white">
              No se pudo cargar el documento
            </h2>
            <p className="max-w-md text-sm text-gray-400 mb-10 font-medium italic leading-relaxed">
              {error}
            </p>
            <Button 
              onClick={loadFile} 
              variant="default" 
              className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2 transition-all active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
              Reintentar
            </Button>
          </div>
        ) : (
          fileUrl && (
            <div className="h-full w-full">
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                <Viewer 
                  fileUrl={fileUrl} 
                  plugins={[defaultLayoutPluginInstance]} 
                  theme="dark"
                  defaultScale={1.0}
                />
              </Worker>
            </div>
          )
        )}
      </div>

      {/* FOOTER NATIVO */}
      <div className="p-3 border-t border-gray-800 flex justify-center items-center gap-4 bg-[#1a1c1e]">
        <div className="flex items-center gap-2 text-[8px] font-bold uppercase text-gray-500 tracking-tighter">
          <Lock className="h-3 w-3" />© SIGEAC Digital Library - 2026
        </div>
      </div>
    </div>
  );
}