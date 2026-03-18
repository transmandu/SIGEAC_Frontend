'use client';

import { useState } from 'react';
import { 
  FileText, Clock, ChevronRight, ChevronDown, ExternalLink, MoreVertical, FolderOpen, Layers3, Hash, AlertCircle 
} from 'lucide-react';


const fileTypeDetails: any = {
  pdf: { color: 'text-red-500', bgColor: 'bg-red-500/10', iconColor: 'text-red-600 dark:text-red-400', label: 'PDF' },
  excel: { color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', iconColor: 'text-emerald-600 dark:text-emerald-400', label: 'EXCEL' },
  word: { color: 'text-blue-500', bgColor: 'bg-blue-500/10', iconColor: 'text-blue-600 dark:text-blue-400', label: 'WORD' },
  default: { color: 'text-gray-500', bgColor: 'bg-gray-500/10', iconColor: 'text-gray-600 dark:text-gray-400', label: 'ARCHIVO' },
};


const getStatusDetails = (status: string, expirationDate: string) => {
  if (!expirationDate || status?.toLowerCase() === 'no_aplica') {
    return { label: 'PERMANENTE', classes: 'bg-blue-500/10 text-blue-500 border-blue-500/20', isWarning: false };
  }
  const now = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffTime < 0) return { label: 'VENCIDO', classes: 'bg-red-500/10 text-red-500 border-red-500/20', isWarning: false };

  if (diffDays <= 5) return { label: `VENCE EN ${diffDays} DÍAS`, classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse', isWarning: true };
  return { label: 'VIGENTE', classes: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', isWarning: false };
};

export default function DocumentTable({ groupedDocuments, onView, columnVisibility }: any) {
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
      
      let pilarRaw = 'Otros';
      let subRaw = 'General';

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
      <div key={pilarKey} className="flex flex-col border-b border-gray-100 dark:border-gray-800/50">
        <div className="flex items-center gap-2 px-6 py-2 bg-gray-50/50 dark:bg-white/[0.02]">
          <FolderOpen className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">
            {pilarKey.replace(/_/g, ' ')}
          </span>
        </div>

        {Object.keys(structure[pilarKey]).sort().map(subKey => {
          const sectionId = `${pilarKey}-${subKey}`;
          const isOpen = openSubSections.includes(sectionId);
          const subDocs = structure[pilarKey][subKey];

          if (subKey === 'Raiz') {
            return subDocs.map((doc: any) => (
              <DocumentRow key={doc.id} doc={doc} onView={onView} columnVisibility={columnVisibility} isSubItem={true} />
            ));
          }

          return (
            <div key={subKey} className="flex flex-col">
              <button 
                onClick={() => toggleSubSection(sectionId)}
                className="flex items-center justify-between px-8 py-2.5 hover:bg-gray-100/50 dark:hover:bg-white/[0.01] transition-colors border-b border-gray-50 dark:border-gray-800/30"
              >
                <div className="flex items-center gap-2">
                  {isOpen ? <ChevronDown className="h-3 w-3 text-gray-400" /> : <ChevronRight className="h-3 w-3 text-gray-400" />}
                  <Layers3 className="h-3.5 w-3.5 text-gray-400 opacity-70" />
                  <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tight">
                    {subKey.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <Hash className="h-2 w-2 text-gray-400" />
                  <span className="text-[9px] font-black text-gray-500">{subDocs.length}</span>
                </div>
              </button>

              {isOpen && (
                <div className="flex flex-col bg-gray-50/30 dark:bg-black/5">
                  {subDocs.map((doc: any) => (
                    <DocumentRow key={doc.id} doc={doc} onView={onView} columnVisibility={columnVisibility} isSubItem={true} />
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
          <div key={dept} className="bg-white dark:bg-[#0f1112] rounded-xl border border-gray-200 dark:border-gray-800/50 overflow-hidden shadow-sm">
            <button 
              onClick={() => toggleDept(dept)}
              className={`flex items-center justify-between w-full p-4 border-l-4 ${color.border} bg-gray-50 dark:bg-gray-800/20 hover:bg-gray-100 dark:hover:bg-gray-800/40 transition-all`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400">{dept}</span>
                <span className="text-[11px] font-bold bg-white dark:bg-black/40 px-2.5 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">{docs.length}</span>
              </div>
              {isOpen ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
            </button>

            {isOpen && (
              <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800/50">
                {isSMS ? renderSmsContent(docs) : docs.map((doc: any) => (
                  <DocumentRow key={doc.id} doc={doc} onView={onView} columnVisibility={columnVisibility} />
                ))}
              </div>
            )}
          </div>
        );
        })}
    </div>
  );
}

function DocumentRow({ doc, onView, columnVisibility, isSubItem }: any) {
  const getFileDetails = (type: any, title: any) => {
    const t = String(type || "").toLowerCase();
    const name = String(title || "").toLowerCase();
    if (t.includes('pdf') || name.includes('.pdf')) return fileTypeDetails.pdf;
    if (t.includes('xls') || t.includes('xlsx') || name.includes('.xls') || name.includes('.xlsx')) return fileTypeDetails.excel;
    if (t.includes('doc') || name.includes('.doc')) return fileTypeDetails.word;
    return fileTypeDetails.default;
  };

  const fileDetails = getFileDetails(doc?.file_type, doc?.title);
  const statusInfo = getStatusDetails(doc?.status, doc?.expiration_date);

  return (
    <div className={`group flex items-center gap-4 p-3 transition-all border-l-2 border-l-transparent hover:border-l-blue-500 
      ${isSubItem ? 'pl-14' : 'pl-3'} 
      ${statusInfo.isWarning ? 'bg-amber-50/30 dark:bg-amber-900/5' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}>
      
      {columnVisibility.title && (
        <>
          <div className={`p-2 rounded-lg ${fileDetails.bgColor} shrink-0`}>
            <FileText className={`h-5 w-5 ${fileDetails.iconColor}`} strokeWidth={2.5}/>
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h4 className="text-[12px] font-bold text-gray-800 dark:text-gray-100 truncate uppercase">
                {doc.title || "Sin título"}
              </h4>
              {statusInfo.isWarning && <AlertCircle className="h-3.5 w-3.5 text-amber-500 animate-bounce" />}
            </div>
            <span className={`w-fit text-[8px] font-black px-1.5 py-0.5 rounded border border-current/10 ${fileDetails.bgColor} ${fileDetails.color}`}>
              {fileDetails.label}
            </span>
          </div>
        </>
      )}

      {columnVisibility.expiry_date && (
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Clock className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-[10px] text-gray-500 font-bold uppercase w-20 leading-none">
            {doc.expiration_date || 'Permanente'}
          </span>
        </div>
      )}

      {columnVisibility.status && (
        <div className="hidden md:block shrink-0 px-2 w-32 text-center">
          <span className={`px-2.5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${statusInfo.classes} leading-none`}>
              {statusInfo.label}
          </span>
        </div>
      )}

      {columnVisibility.actions && (
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button onClick={() => onView(doc.id)} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-blue-600 rounded-lg transition-all">
            <ExternalLink className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}