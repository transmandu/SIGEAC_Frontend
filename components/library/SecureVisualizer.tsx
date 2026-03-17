'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, ShieldCheck, Lock } from 'lucide-react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

import libraryService from '@/lib/libraryService';

export default function DocumentViewer({ company, documentId, isOpen, onClose }: any) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 1. ESTADO PARA DETECTAR EL TEMA
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setCurrentTheme(isDark ? 'dark' : 'light');
    };

    updateTheme();
    
    // Observador para cambios en la clase 'dark' del documento (Tailwind)
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // 2. BLOQUEO DE TECLADO
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isControl = e.ctrlKey || e.metaKey;
      const forbiddenKeys = ['s', 'p', 'u', 'c'];
      if (isControl && forbiddenKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
        return false;
      }
    };

    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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

  useEffect(() => {
    let currentBlobUrl: string | null = null;
    if (isOpen && documentId) {
      const loadFile = async () => {
        setLoading(true);
        try {
          const url = await libraryService.getFileBlob(company, documentId);
          setFileUrl(url);
          currentBlobUrl = url;
        } catch (error) {
          console.error("Error en visor seguro:", error);
        } finally {
          setLoading(false);
        }
      };
      loadFile();
    }
    return () => {
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
        setFileUrl(null);
      }
    };
  }, [isOpen, documentId, company]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-6 select-none backdrop-blur-sm transition-colors duration-300 ${
      currentTheme === 'dark' ? 'bg-black/95' : 'bg-slate-900/40'
    }`}>
      <div className={`relative w-full h-full max-w-7xl rounded-2xl overflow-hidden border flex flex-col shadow-2xl transition-all duration-300 ${
        currentTheme === 'dark' 
          ? 'bg-[#111214] border-gray-800' 
          : 'bg-white border-gray-300'
      }`}>
        
        {/* HEADER */}
        <div className={`p-4 border-b flex justify-between items-center transition-colors ${
          currentTheme === 'dark' ? 'bg-[#1a1c1e] border-gray-800' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${currentTheme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-500/20'}`}>
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${currentTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                SecureStream Engine
              </h3>
              <p className="text-[9px] text-gray-500 font-bold uppercase">Modo Lectura Protegido</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-500/10 hover:text-red-500 text-gray-500 rounded-xl transition-all">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* ÁREA DE RENDERIZADO */}
        <div 
          className={`flex-1 overflow-hidden relative custom-pdf-viewer ${currentTheme === 'dark' ? 'bg-[#0e0f11]' : 'bg-gray-100'}`}
          onContextMenu={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
        >
          {/* AJUSTE DE CONTRASTE PARA RESALTADO SEGÚN TEMA */}
          <style>{`
            .rpv-core__text-layer {
              user-select: text !important;
              -webkit-user-select: text;
            }
            ::selection {
              background: ${currentTheme === 'dark' ? 'rgba(0, 120, 215, 0.9)' : 'rgba(0, 80, 200, 0.9)'} !important; 
              color: ${currentTheme === 'dark' ? 'white' : 'inherit'} !important;
            }
            ::-moz-selection {
              background: ${currentTheme === 'dark' ? 'rgba(0, 120, 215, 0.9)' : 'rgba(0, 80, 200, 0.9)'} !important;
              color: ${currentTheme === 'dark' ? 'white' : 'inherit'} !important;
            }
          `}</style>

          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
              <div className="text-center">
                <p className={`text-[10px] font-black uppercase tracking-widest ${currentTheme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                  Iniciando Virtualización
                </p>
              </div>
            </div>
          ) : (
            fileUrl && (
              <div className="h-full overflow-hidden">
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                  <Viewer 
                    fileUrl={fileUrl} 
                    plugins={[defaultLayoutPluginInstance]} 
                    theme={currentTheme}
                    defaultScale={0.9}
                  />
                </Worker>
              </div>
            )
          )}
        </div>

        {/* FOOTER */}
        <div className={`p-2 border-t flex justify-center items-center gap-6 transition-colors ${
          currentTheme === 'dark' ? 'bg-[#1a1c1e] border-gray-800' : 'bg-gray-50 border-gray-200'
        }`}>
           <div className={`flex items-center gap-2 text-[8px] font-black uppercase ${currentTheme === 'dark' ? 'text-gray-600' : 'text-slate-400'}`}>
              <Lock className="h-3 w-3" />
              Contenido Protegido
           </div>
           <div className="w-px h-3 bg-gray-300 dark:bg-gray-800"></div>
           <div className={`text-[8px] font-black uppercase ${currentTheme === 'dark' ? 'text-gray-700' : 'text-slate-500'}`}>
             © SIGEAC Digital Library
           </div>
        </div>
      </div>
    </div>
  );
}