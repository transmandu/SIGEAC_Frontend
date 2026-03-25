'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, FolderOpen, Layers3, Hash } from 'lucide-react';
import DocumentRow from './documentRow';

export default function DocumentTable({ groupedDocuments, onView, columnVisibility, onDelete, canManage }: any) {
  const [openDepts, setOpenDepts] = useState<string[]>(Object.keys(groupedDocuments).slice(0, 1));
  const [openSubSections, setOpenSubSections] = useState<string[]>([]);

  const toggleDept = (dept: string) => {
    setOpenDepts(prev => prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]);
  };

  const toggleSubSection = (id: string) => {
    setOpenSubSections(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const accentColors: any = {
    0: { border: 'border-l-blue-500' },
    1: { border: 'border-l-orange-500' },
    2: { border: 'border-l-emerald-500' },
    3: { border: 'border-l-purple-500' },
  };

  const renderSmsContent = (docs: any[]) => {
    const structure: any = {};
    docs.forEach(doc => {
      const parts = doc.document.split('/');
      const libraryIndex = parts.indexOf('library');
      let pilarRaw = 'Otros', subRaw = 'General';

      if (libraryIndex !== -1 && parts.length > libraryIndex + 3) {
        pilarRaw = parts[libraryIndex + 2];
        subRaw = parts[libraryIndex + 3];
      } else if (libraryIndex !== -1 && parts.length > libraryIndex + 2) {
        pilarRaw = 'General';
        subRaw = parts[libraryIndex + 2];
      } else {
        pilarRaw = parts[parts.length - 2] || 'Library';
        subRaw = 'Raiz';
      }
      
      if (!structure[pilarRaw]) structure[pilarRaw] = {};
      if (!structure[pilarRaw][subRaw]) structure[pilarRaw][subRaw] = [];
      structure[pilarRaw][subRaw].push(doc);
    });

    return Object.keys(structure).sort().map(pilarKey => (
      // 🔥 CAMBIO 1: Borde divisor color #a8a8a8
      <div key={pilarKey} className="flex flex-col border-b border-[#a8a8a8] dark:border-gray-800/50">
        {/* 🔥 CAMBIO 2: Variación más clara de #ececec (usé #f4f4f4) y texto slate-800 */}
        <div className="flex items-center gap-2 px-6 py-2 bg-[#f4f4f4] dark:bg-white/[0.02]">
          <FolderOpen className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-gray-300">
            {pilarKey.replace(/_/g, ' ')}
          </span>
        </div>

        {Object.keys(structure[pilarKey]).sort().map(subKey => {
          const sectionId = `${pilarKey}-${subKey}`;
          const isOpen = openSubSections.includes(sectionId);
          const subDocs = structure[pilarKey][subKey];

          if (subKey === 'Raiz') {
            return subDocs.map((doc: any) => (
              <DocumentRow key={doc.id} doc={doc} onView={onView} columnVisibility={columnVisibility} isSubItem={true} onDelete={onDelete} canManage={canManage} />
            ));
          }

          return (
            <div key={subKey} className="flex flex-col">
              <button 
                onClick={() => toggleSubSection(sectionId)}
                // 🔥 CAMBIO 3: Borde divisor color #a8a8a8
                className="flex items-center justify-between px-8 py-2 hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors border-b border-[#a8a8a8] dark:border-gray-800/30"
              >
                <div className="flex items-center gap-2">
                  {isOpen ? <ChevronDown className="h-3 w-3 text-slate-400" /> : <ChevronRight className="h-3 w-3 text-slate-400" />}
                  <Layers3 className="h-3.5 w-3.5 text-slate-400" />
                  {/* 🔥 CAMBIO 4: Slate más oscuro (slate-800) sin alterar clases de fuente */}
                  <span className="text-[10px] font-semibold text-slate-800 dark:text-gray-300 uppercase">
                    {subKey.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700">
                  <Hash className="h-2 w-2 text-slate-500" />
                  <span className="text-[9px] font-bold text-slate-600 dark:text-gray-300">{subDocs.length}</span>
                </div>
              </button>

              {isOpen && (
                // 🔥 CAMBIO 5: Borde divisor color #a8a8a8 entre elementos internos
                <div className="flex flex-col bg-white dark:bg-black/5 divide-y divide-[#a8a8a8] dark:divide-gray-800/20">
                  {subDocs.map((doc: any) => (
                    <DocumentRow key={doc.id} doc={doc} onView={onView} columnVisibility={columnVisibility} isSubItem={true} onDelete={onDelete} canManage={canManage} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    ));
  };

  return (
    <div className="flex flex-col gap-4">
      {Object.keys(groupedDocuments).map((dept, index) => {
        const isOpen = openDepts.includes(dept);
        const docs = groupedDocuments[dept];
        const color = accentColors[index % 4];
        const isSMS = dept.toLowerCase().includes('seguridad operacional') || dept.toLowerCase().includes('sms');

        return (
          // 🔥 CAMBIO 6: Borde exterior de la tarjeta color #a8a8a8 en claro
          <div key={dept} className="bg-white dark:bg-[#0f1112] rounded-xl border border-[#a8a8a8] dark:border-gray-800/50 overflow-hidden shadow-sm shadow-slate-200/50">
            <button 
              onClick={() => toggleDept(dept)}
              // 🔥 CAMBIO 7: Cabecera color #ececec y texto slate-900 (slate oscuro) sin tocar clases de fuente
              className={`flex items-center justify-between w-full p-4 border-l-4 ${color.border} bg-[#ececec] dark:bg-gray-800/20 hover:bg-slate-100/80 dark:hover:bg-gray-800/40 transition-all`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-gray-400">
                  {dept}
                </span>
                <span className="text-[10px] font-bold bg-white text-slate-700 dark:bg-black/40 dark:text-white px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-gray-700">
                  {docs.length}
                </span>
              </div>
              {isOpen ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
            </button>

            {isOpen && (
              // 🔥 CAMBIO 8: Borde divisor color #a8a8a8 entre los registros
              <div className="flex flex-col divide-y divide-[#a8a8a8] dark:divide-gray-800/10">
                {isSMS ? renderSmsContent(docs) : docs.map((doc: any) => (
                  <DocumentRow key={doc.id} doc={doc} onView={onView} columnVisibility={columnVisibility} onDelete={onDelete} canManage={canManage} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}