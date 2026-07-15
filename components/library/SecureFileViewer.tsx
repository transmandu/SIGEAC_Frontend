'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Loader2, ShieldCheck, Lock, Frown, RotateCcw } from 'lucide-react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { Button } from '@/components/ui/button';

// @ts-ignore - Ignorar error cosmético de TS en PC nueva
import '@react-pdf-viewer/core/lib/styles/index.css';
// @ts-ignore - Ignorar error cosmético de TS en PC nueva
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface SecureFileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Título breve mostrado en el header del visor (p. ej. nombre del documento). */
  title?: string;
  /** Resuelve el archivo a mostrar como una Object URL de blob. */
  fetchBlobUrl: () => Promise<string>;
}

/**
 * Visor seguro de documentos (fork genérico de components/library/SecureVisualizer,
 * desacoplado de libraryService): recibe cómo resolver el blob en vez de asumir
 * el endpoint de la Biblioteca, para poder reutilizarse en otros módulos.
 */
export default function SecureFileViewer({ isOpen, onClose, title, fetchBlobUrl }: SecureFileViewerProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');
  const activeUrlRef = useRef<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setCurrentTheme(isDark ? 'dark' : 'light');
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isControl = e.ctrlKey || e.metaKey;
      const forbiddenKeys = ['s', 'p', 'u', 'c'];
      if (isControl && forbiddenKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('copy', handleCopy);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('copy', handleCopy);
    };
  }, [isOpen]);

  // OJO: defaultLayoutPlugin usa hooks internamente — debe llamarse directo
  // en el cuerpo del componente (nunca dentro de useMemo/useCallback).
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

  // Ref a la última función de carga: evita que el efecto de abajo se
  // re-dispare por un simple cambio de identidad de `fetchBlobUrl` cuando
  // el caller la pasa inline (nueva función en cada render).
  const fetchBlobUrlRef = useRef(fetchBlobUrl);
  fetchBlobUrlRef.current = fetchBlobUrl;

  // Se incrementa para forzar una recarga (botón "Reintentar").
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    // Bandera de cancelación: si el efecto se re-ejecuta (StrictMode monta
    // dos veces en dev) o el visor se cierra, la carga vieja se descarta sin
    // revocar ni pisar la URL que el Viewer ya está mostrando.
    let cancelled = false;

    setLoading(true);
    setError(null);
    setFileUrl(null);

    fetchBlobUrlRef.current()
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        activeUrlRef.current = url;
        setFileUrl(url);
      })
      .catch(() => {
        if (!cancelled) {
          setError('No pudimos establecer una conexión segura para cargar este documento.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current);
        activeUrlRef.current = null;
      }
    };
  }, [isOpen, reloadKey]);

  if (!isOpen) return null;

  return (
    // pointer-events-auto: si el visor se abre encima de un dialog modal de
    // Radix, este pone pointer-events:none en el body; sin re-activarlos aquí,
    // el visor queda visible pero inclickeable (no se puede cerrar).
    <div className={`pointer-events-auto fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-6 backdrop-blur-sm transition-colors duration-300 ${currentTheme === 'dark' ? 'bg-black/95' : 'bg-slate-900/40'
      }`}>
      <div className={`relative w-full h-full max-w-7xl rounded-2xl overflow-hidden border flex flex-col shadow-2xl transition-all duration-300 ${currentTheme === 'dark' ? 'bg-[#111214] border-gray-800' : 'bg-white border-gray-300'
        }`}>

        {/* HEADER */}
        <div className={`p-4 border-b flex justify-between items-center ${currentTheme === 'dark' ? 'bg-[#1a1c1e] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${currentTheme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-500/20'}`}>
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${currentTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {title ?? 'Visualizador Seguro'}
              </h3>
              <p className="text-[9px] text-gray-500 font-bold uppercase">Transmisión Protegida</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-500/10 hover:text-red-500 text-gray-500 rounded-xl transition-all">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* ÁREA DE CONTENIDO */}
        <div
          className="flex-1 overflow-hidden relative select-text"
          onContextMenu={(e) => e.preventDefault()}
        >
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-inherit z-10">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
              <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-500 text-center px-4">Iniciando Virtualización AES-256...</p>
            </div>
          )}

          {error ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-inherit animate-in fade-in zoom-in duration-300">
              <div className="mb-6 p-6 rounded-full bg-amber-500/10 animate-pulse">
                <Frown className="h-16 w-16 text-amber-500" />
              </div>
              <h2 className={`text-xl font-bold mb-2 uppercase tracking-tight ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Algo salió mal...
              </h2>
              <p className="max-w-md text-sm text-gray-500 mb-10 font-medium italic leading-relaxed">
                {error}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm justify-center">
                <Button
                  onClick={() => setReloadKey((k) => k + 1)}
                  variant="default"
                  className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto flex items-center gap-2 group transition-all active:scale-95"
                >
                  <RotateCcw className="h-4 w-4 group-hover:rotate-[-90deg] transition-transform" />
                  Reintentar
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="border-gray-500 w-full sm:w-auto hover:bg-red-500/5 hover:text-red-500 transition-colors"
                >
                  Cerrar Visor
                </Button>
              </div>
            </div>
          ) : (
            fileUrl && (
              <div className="h-full">
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                  <Viewer
                    fileUrl={fileUrl}
                    plugins={[defaultLayoutPluginInstance]}
                    theme={currentTheme}
                    defaultScale={1.0}
                  />
                </Worker>
              </div>
            )
          )}
        </div>

        {/* FOOTER */}
        <div className={`p-3 border-t flex justify-center items-center gap-4 ${currentTheme === 'dark' ? 'bg-[#1a1c1e] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-2 text-[8px] font-bold uppercase text-gray-500 tracking-tighter">
            <Lock className="h-3 w-3" />© SIGEAC Digital Library - 2026
          </div>
        </div>
      </div>
    </div>
  );
}
