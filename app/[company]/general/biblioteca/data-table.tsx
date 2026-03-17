'use client';

import { useState } from 'react';
import { 
  FileText, Trash2, Clock, ChevronRight, ChevronDown, ExternalLink 
} from 'lucide-react';

// Colores por tipo de archivo (ajustados para ambos modos)
const fileTypeDetails: any = {
  pdf: { color: 'text-red-500', bgColor: 'bg-red-500/10' },
  excel: { color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  word: { color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  default: { color: 'text-gray-500', bgColor: 'bg-gray-500/10' },
};

export default function DocumentTable({ company, groupedDocuments, onRefresh, onView }: any) {
  const [openDepts, setOpenDepts] = useState<string[]>(Object.keys(groupedDocuments).slice(0, 1));

  const toggleDept = (dept: string) => {
    setOpenDepts(prev => 
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const accentColors: any = {
    0: { border: 'border-l-blue-500', icon: 'text-blue-500', bg: 'bg-blue-500/10' },
    1: { border: 'border-l-orange-500', icon: 'text-orange-500', bg: 'bg-orange-500/10' },
    2: { border: 'border-l-emerald-500', icon: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    3: { border: 'border-l-purple-500', icon: 'text-purple-500', bg: 'bg-purple-500/10' },
  };

  return (
    <div className="space-y-6">
      {Object.keys(groupedDocuments).map((dept, index) => {
        const isOpen = openDepts.includes(dept);
        const docs = groupedDocuments[dept];
        const color = accentColors[index % 4];

        return (
          <div key={dept} className="flex flex-col">
            <button 
              onClick={() => toggleDept(dept)}
              className={`flex items-center justify-between w-full p-4 border-l-4 ${color.border} 
                bg-gray-100/50 dark:bg-gray-800/20 hover:bg-gray-200/50 dark:hover:bg-gray-800/40 
                transition-all rounded-r-xl group`}
            >
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-white transition-colors">
                  {dept}
                </span>
                <span className="text-[9px] text-gray-500 dark:text-gray-400 font-black bg-white dark:bg-black/40 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-800">
                  {docs.length} ARCHIVOS
                </span>
              </div>
              {isOpen ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
            </button>

            {isOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 mb-8 ml-1">
                {docs.map((doc: any) => (
                  <DocumentCard 
                    key={doc?.id || Math.random()} 
                    doc={doc} 
                    company={company} 
                    colorAccent={color} 
                    onRefresh={onRefresh}
                    onView={onView} 
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DocumentCard({ company, doc, colorAccent, onRefresh, onView }: any) {
  const fileExtension = doc?.file_type || 'pdf'; 
  const fileDetails = fileTypeDetails[fileExtension] || fileTypeDetails.default;

  if (!doc) return null;

  return (
    <div className="relative bg-white dark:bg-[#16181a] border border-gray-200 dark:border-gray-800/60 rounded-[2rem] p-7 shadow-sm hover:shadow-xl hover:border-blue-500/30 dark:hover:border-gray-700 transition-all duration-500 flex flex-col items-center group/card overflow-hidden h-[380px]">
      
      {/* Icono Principal */}
      <div className={`relative p-6 rounded-full ${colorAccent.bg} mb-6 z-10 transition-transform duration-500 group-hover/card:scale-110`}>
        <FileText className={`h-14 w-14 ${colorAccent.icon}`} strokeWidth={1.5}/>
      </div>

      {/* Marca de agua decorativa */}
      <div className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-[0.03] dark:opacity-[0.02] pointer-events-none group-hover/card:opacity-[0.07] dark:group-hover/card:opacity-[0.05] group-hover/card:-right-5 transition-all duration-700">
        <FileText className={`h-64 w-64 ${colorAccent.icon}`} strokeWidth={1} />
      </div>

      {/* Título del documento */}
      <div className="text-center w-full mb-6 z-10">
        <h4 className="text-[14px] font-bold text-gray-800 dark:text-gray-100 leading-snug line-clamp-2 min-h-[2.8rem] px-4 uppercase tracking-tight">
          {doc.title || "Sin título"}
        </h4>
      </div>

      {/* Estados y Fecha */}
      <div className="flex flex-col items-center gap-4 w-full mb-6 pt-5 border-t border-gray-100 dark:border-gray-800/40 z-10">
        <div className="flex gap-2">
            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${colorAccent.bg} ${colorAccent.icon} border border-blue-500/10`}>
                {doc.status || 'VIGENTE'}
            </div>
            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${fileDetails.bgColor} ${fileDetails.color} border border-gray-500/10`}>
                {fileExtension.toUpperCase()}
            </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tighter">
          <Clock className="h-3.5 w-3.5" /> Vence: {doc.expiration_date || 'Permanente'}
        </div>
      </div>

      {/* Botonera de acciones */}
      <div className="w-full mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center gap-3 z-10">
        <button 
          onClick={() => typeof onView === 'function' && onView(doc.id)} 
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-blue-600 dark:bg-white hover:bg-blue-700 dark:hover:bg-gray-200 text-white dark:text-black text-[10px] font-black uppercase tracking-[0.15em] rounded-2xl transition-all active:scale-95 shadow-md"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Visualizar
        </button>

        <button 
          onClick={() => { if(confirm('¿Desea eliminar este documento?')) onRefresh(); }}
          className="p-3.5 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all border border-gray-200 dark:border-gray-800/60"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}