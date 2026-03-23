'use client';

import { useState } from 'react';
import { 
  FileText, Clock, ChevronRight, ChevronDown, ExternalLink, MoreVertical, FolderOpen, Layers3, Hash, AlertCircle 
} from 'lucide-react';
import { LibraryDropdownActions } from "@/components/dropdowns/general/LibraryDropdownActions";

  const fileTypeDetails: any = {
    pdf: { color: 'text-red-600', bgColor: 'bg-red-500/10', iconColor: 'text-red-700 dark:text-red-400', label: 'PDF' },
    excel: { color: 'text-emerald-700', bgColor: 'bg-emerald-500/10', iconColor: 'text-emerald-700 dark:text-emerald-400', label: 'EXCEL' },
    word: { color: 'text-blue-700', bgColor: 'bg-blue-500/10', iconColor: 'text-blue-700 dark:text-blue-400', label: 'WORD' },
    default: { color: 'text-slate-700', bgColor: 'bg-slate-500/10', iconColor: 'text-slate-600 dark:text-gray-400', label: 'ARCHIVO' },
  };

  const getStatusDetails = (status: string, expirationDate: string) => {
    if (!expirationDate || status?.toLowerCase() === 'no_aplica') {
      return { label: 'PERMANENTE', classes: 'bg-blue-500/10 text-blue-700 border-blue-500/40 dark:border-blue-500/20', isWarning: false };
    }
    const now = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffTime < 0) return { label: 'VENCIDO', classes: 'bg-red-500/10 text-red-700 border-red-500/40 dark:border-red-500/20', isWarning: false };
    if (diffDays <= 5) return { label: `VENCE EN ${diffDays} DÍAS`, classes: 'bg-amber-500/10 text-amber-700 border-amber-500/40 dark:border-amber-500/20 animate-pulse', isWarning: true };
    return { label: 'VIGENTE', classes: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/40 dark:border-emerald-500/20', isWarning: false };
  };

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
      0: { border: 'border-l-blue-600' },
      1: { border: 'border-l-orange-600' },
      2: { border: 'border-l-emerald-600' },
      3: { border: 'border-l-purple-600' },
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
        <div key={pilarKey} className="flex flex-col border-b border-slate-200 dark:border-gray-800/50">
          <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-200 dark:bg-white/[0.02]">
            <FolderOpen className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-gray-300">
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
                  className="flex items-center justify-between px-8 py-2.5 hover:bg-slate-100 dark:hover:bg-white/[0.01] transition-colors border-b border-slate-200/50 dark:border-gray-800/30"
                >
                  <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown className="h-3 w-3 text-slate-500" /> : <ChevronRight className="h-3 w-3 text-slate-500" />}
                    <Layers3 className="h-3.5 w-3.5 text-slate-500 opacity-90" />
                    <span className="text-[10px] font-bold text-slate-800 dark:text-gray-300 uppercase tracking-tight">
                      {subKey.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-300 dark:bg-gray-800/50 border border-slate-400 dark:border-gray-700">
                    <Hash className="h-2 w-2 text-slate-600" />
                    <span className="text-[9px] font-black text-slate-700">{subDocs.length}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="flex flex-col bg-white dark:bg-black/5 divide-y divide-slate-100 dark:divide-gray-800/20">
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
            <div key={dept} className="bg-white dark:bg-[#0f1112] rounded-xl border border-slate-200 dark:border-gray-800/50 overflow-hidden shadow-md">
              <button 
                onClick={() => toggleDept(dept)}
                className={`flex items-center justify-between w-full p-4 border-l-4 ${color.border} bg-slate-300 dark:bg-gray-800/20 hover:bg-slate-400/20 dark:hover:bg-gray-800/40 transition-all`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-950 dark:text-gray-400">
                    {dept}
                  </span>
                  <span className="text-[11px] font-bold bg-slate-100 text-slate-900 dark:bg-black/40 dark:text-white px-2.5 py-0.5 rounded-full border border-slate-400 dark:border-gray-700 shadow-sm">
                    {docs.length}
                  </span>
                </div>
                {isOpen ? <ChevronDown className="h-4 w-4 text-slate-600" /> : <ChevronRight className="h-4 w-4 text-slate-600" />}
              </button>

              {isOpen && (
                <div className="flex flex-col divide-y divide-slate-100 dark:divide-gray-800/10">
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

  function DocumentRow({ doc, onView, columnVisibility, isSubItem, onDelete, canManage }: any) {
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

  // 🔥 Único cambio: formatear el string ISO a DD-MM-YYYY sin alterar el diseño
  let displayExpirationDate = 'Permanente';
  if (doc?.expiration_date) {
    const datePart = String(doc.expiration_date).substring(0, 10);
    const [year, month, day] = datePart.split('-');
    displayExpirationDate = `${day}-${month}-${year}`;
  }

  return (
    <div className={`group flex items-center gap-4 p-3 transition-all border-l-2 border-l-transparent hover:border-l-blue-600 border-b border-slate-100 dark:border-transparent
      ${isSubItem ? 'pl-14' : 'pl-3'} 
      ${statusInfo.isWarning ? 'bg-amber-50 dark:bg-amber-900/5' : 'bg-white hover:bg-blue-50 dark:bg-transparent dark:hover:bg-white/5'}`}>
      
      {columnVisibility.title && (
        <>
          <div className={`p-2 rounded-lg ${fileDetails.bgColor} shrink-0 shadow-sm border border-current/10`}>
            <FileText className={`h-5 w-5 ${fileDetails.iconColor}`} strokeWidth={2.5}/>
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h4 className="text-[12px] font-bold text-slate-900 dark:text-gray-100 truncate uppercase">
                {doc.title || "Sin título"}
              </h4>
              {statusInfo.isWarning && <AlertCircle className="h-3.5 w-3.5 text-amber-600 animate-bounce" />}
            </div>
            <span className={`w-fit text-[8px] font-black px-1.5 py-0.5 rounded border border-current/20 ${fileDetails.bgColor} ${fileDetails.color}`}>
              {fileDetails.label}
            </span>
          </div>
        </>
      )}

      {columnVisibility.expiry_date && (
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-[10px] text-slate-700 dark:text-gray-300 font-bold uppercase w-20 leading-none">
            {displayExpirationDate} {/* 👈 Tu fila original pintando la fecha formateada */}
          </span>
        </div>
      )}

      {columnVisibility.status && (
        <div className="hidden md:block shrink-0 px-2 w-32 text-center">
          <span className={`px-2.5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border-2 dark:border ${statusInfo.classes} leading-none shadow-sm`}>
              {statusInfo.label}
          </span>
        </div>
      )}

      {columnVisibility.actions && (
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button onClick={() => onView(doc.id)} className="p-2 text-slate-400 hover:text-blue-700 dark:hover:text-white hover:bg-blue-100 dark:hover:bg-blue-600 rounded-lg transition-all">
            <ExternalLink className="h-4 w-4" />
          </button>
          <LibraryDropdownActions 
            doc={doc} 
            canManage={canManage} 
            onDelete={onDelete} 
          />
        </div>
      )}
    </div>
  );
}