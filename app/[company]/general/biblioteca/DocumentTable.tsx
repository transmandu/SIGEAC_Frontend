'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, FolderOpen, Layers3, Hash } from 'lucide-react';
import DocumentRow from './documentRow';

export default function DocumentTable({ groupedDocuments, onView, columnVisibility, onDelete, onRefresh, canManage }: any) {
  const [openDepts, setOpenDepts] = useState<string[]>(Object.keys(groupedDocuments).slice(0, 1));
  const [openSubSections, setOpenSubSections] = useState<string[]>([]);

  // Intercepta el ID y le añade el Buster antes de enviarlo al padre
  const handleViewWithBuster = (id: string | number) => {
    const buster = new Date().getTime();
    
    // ✅ OPCIÓN A: Si onView acepta dos parámetros (Recomendado)
    onView(id, buster); 

    // ✅ OPCIÓN B: Si onView solo acepta un string (Ajuste de URL manual)
    onView(`${id}`, buster); 
  };

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
      <div key={pilarKey} className="flex flex-col border-b border-slate-100 dark:border-gray-800/50">
        <div className="flex items-center gap-2 px-6 py-2 bg-slate-50/50 dark:bg-white/[0.02]">
          <FolderOpen className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-300">
            {pilarKey.replace(/_/g, ' ')}
          </span>
        </div>

        {Object.keys(structure[pilarKey]).sort().map(subKey => {
          const sectionId = `${pilarKey}-${subKey}`;
          const isOpen = openSubSections.includes(sectionId);
          const subDocs = structure[pilarKey][subKey];

          if (subKey === 'Raiz') {
            return subDocs.map((doc: any) => (
              <DocumentRow key={doc.id} doc={doc} onView={handleViewWithBuster} columnVisibility={columnVisibility} isSubItem={true} onDelete={onDelete} onRefresh={onRefresh} canManage={canManage} />
            ));
          }

          return (
            <div key={subKey} className="flex flex-col">
              <button 
                onClick={() => toggleSubSection(sectionId)}
                className="flex items-center justify-between px-8 py-2 hover:bg-blue-50/30 dark:hover:bg-white/[0.01] transition-colors border-b border-slate-100 dark:border-gray-800/30"
              >
                <div className="flex items-center gap-2">
                  {isOpen ? <ChevronDown className="h-3 w-3 text-slate-400" /> : <ChevronRight className="h-3 w-3 text-slate-400" />}
                  <Layers3 className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-[11px] font-medium text-slate-600 dark:text-gray-400 uppercase">
                    {subKey.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700">
                  <Hash className="h-2.5 w-2.5 text-slate-500" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-gray-300">{subDocs.length}</span>
                </div>
              </button>

              {isOpen && (
                <div className="flex flex-col bg-white dark:bg-black/5 divide-y divide-slate-100 dark:divide-gray-800/20">
                  {subDocs.map((doc: any) => (
                    <DocumentRow key={doc.id} doc={doc} onView={handleViewWithBuster} columnVisibility={columnVisibility} isSubItem={true} onDelete={onDelete} onRefresh={onRefresh} canManage={canManage} />
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
          <div key={dept} className="bg-white dark:bg-[#0f1112] rounded-xl border border-slate-200 dark:border-gray-800/50 overflow-hidden shadow-sm">
            <button 
              onClick={() => toggleDept(dept)}
              className={`flex items-center justify-between w-full p-4 border-l-4 ${color.border} bg-white dark:bg-gray-800/20 hover:bg-slate-50 dark:hover:bg-gray-800/40 transition-all border-b ${isOpen ? 'border-slate-100' : 'border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm md:text-base font-bold uppercase tracking-tight text-slate-800 dark:text-gray-100">
                  {dept}
                </span>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-black/40 dark:text-white px-2 py-0.5 rounded-full border border-blue-100 dark:border-gray-700">
                  {docs.length}
                </span>
              </div>
              {isOpen ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
            </button>

            {isOpen && (
              <div className="flex flex-col divide-y divide-slate-50 dark:divide-gray-800/10">
                {isSMS ? renderSmsContent(docs) : docs.map((doc: any) => (
                  <DocumentRow key={doc.id} doc={doc} onView={handleViewWithBuster} columnVisibility={columnVisibility} onDelete={onDelete} onRefresh={onRefresh} canManage={canManage} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}