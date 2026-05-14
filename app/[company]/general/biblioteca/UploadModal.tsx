'use client';
import { useState, useEffect, useMemo } from 'react';
import libraryService, { FolderNode } from '@/lib/libraryService';
import axiosInstance from '@/lib/axios';
import { useAuth } from "@/contexts/AuthContext";
import { 
  X, 
  UploadCloud, 
  FileText, 
  Tag, 
  Calendar, 
  Building2, 
  CheckCircle2,
  ChevronDown,
  Folder
} from 'lucide-react';

interface UploadModalProps {
  company: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  departmentId: number | null;
  folders: FolderNode[];
}

export default function UploadModal({ company, isOpen, onClose, onSuccess, departmentId, folders }: UploadModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [departments, setDepartments] = useState<{ id: number, name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedFolderPath, setSelectedFolderPath] = useState('');
  const [versionLabel, setVersionLabel] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    department_id: '',
    department_name: '',
    expiration_date: '',
  });

  const hasFolders = folders.length > 0;

  const { isSuperUser, userDeptId } = useMemo(() => {
    if (!user) return { isSuperUser: false, userDeptId: null };
    const isSuper = user.roles?.some(role => 
      ['SUPERUSER', 'ADMIN', 'ADMINISTRADOR'].includes(role.name.toUpperCase())
    );
    const deptId = user.employee?.[0]?.department?.id;
    return { isSuperUser: isSuper, userDeptId: deptId };
  }, [user]);

  useEffect(() => {
    if (isOpen && company) {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          const [deptsRes, catsRes] = await Promise.all([
            axiosInstance.get(`/${company}/library/departments-list`),
            axiosInstance.get(`/${company}/library/categories-list`)
          ]);
          let availableDepts = deptsRes.data;
          if (!isSuperUser && userDeptId) {
            availableDepts = availableDepts.filter((d: any) => Number(d.id) === Number(userDeptId));
          }
          setDepartments(availableDepts);
          setCategories(catsRes.data);

          if (departmentId && availableDepts.some((d: any) => Number(d.id) === Number(departmentId))) {
            const dept = availableDepts.find((d: any) => Number(d.id) === Number(departmentId));
            setFormData(prev => ({
              ...prev,
              department_id: departmentId.toString(),
              department_name: dept?.name || ''
            }));
          } else if (availableDepts.length === 1) {
            setFormData(prev => ({
              ...prev,
              department_id: availableDepts[0].id.toString(),
              department_name: availableDepts[0].name
            }));
          }
        } catch (error) {
          console.error("Error al cargar datos:", error);
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [isOpen, company, isSuperUser, userDeptId, departmentId]);

  const flattenFolders = (nodes: FolderNode[], prefix = ''): { id: string; name: string; path: string; label: string }[] => {
    const result: { id: string; name: string; path: string; label: string }[] = [];
    for (const node of nodes) {
      result.push({ id: node.id, name: node.name, path: node.path, label: `${prefix}${node.name}` });
      if (node.children.length > 0) {
        result.push(...flattenFolders(node.children, `${prefix}${node.name} / `));
      }
    }
    return result;
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const ext = droppedFile.name.split('.').pop()?.toLowerCase();
      if (['pdf', 'xlsx', 'xls'].includes(ext || '')) {
        setFile(droppedFile);
      } else {
        alert("Solo se permiten archivos PDF o Excel.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !formData.category_id || !formData.department_id) return alert("Completa los campos.");

    setLoading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('title', formData.title);
    data.append('category_id', formData.category_id);
    data.append('department_id', formData.department_id);
    data.append('department_name', formData.department_name);
    if (formData.category_id === 'otro') data.append('new_category_name', newCategoryName);
    if (selectedFolderPath) data.append('folder_path', selectedFolderPath);
    if (versionLabel) data.append('version_label', versionLabel);
    data.append('requires_expiry', hasExpiry ? '1' : '0');
    if (hasExpiry && formData.expiration_date) data.append('expiration_date', formData.expiration_date);

    try {
      await libraryService.uploadDocument(company, data);
      onSuccess();
      handleInternalClose();
    } catch (error: any) {
      alert("Error al guardar: " + (error.response?.data?.message || "Error"));
    } finally {
      setLoading(false);
    }
  };

  const handleInternalClose = () => {
    setFile(null);
    setFormData({ title: '', category_id: '', department_id: '', department_name: '', expiration_date: '' });
    setNewCategoryName('');
    setHasExpiry(false);
    setSelectedFolderPath('');
    setVersionLabel('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
      <div className="bg-white dark:bg-[#1a1c1e] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-300 dark:border-gray-800 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-800/60 px-6 py-4 border-b border-slate-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <UploadCloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight uppercase">Subir documento</h2>
              {!isSuperUser && <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Modo Director</p>}
            </div>
          </div>
          <button onClick={handleInternalClose} className="text-slate-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-slate-50 dark:bg-[#1a1c1e]">
          
          {/* Nombre Doc */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-blue-500" /> Nombre del Documento
            </label>
            <input 
              type="text" required
              className="w-full h-11 px-4 border border-slate-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-slate-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
              placeholder="Ej. Manual de Mantenimiento 2026"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          {/* Versión Label */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-blue-500" /> Etiqueta de Versión
            </label>
            <input
              type="text"
              className="w-full h-11 px-4 border border-slate-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-slate-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
              placeholder="Ej. Rev A, Borrador, Final..."
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Depto Select */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-blue-500" /> Área / Depto
              </label>
              <div className="relative">
                <select 
                  required disabled={loadingData || (!isSuperUser && departments.length === 1) || !!departmentId}
                  className="w-full h-11 pl-4 pr-10 border border-slate-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-slate-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer appearance-none relative z-10 disabled:opacity-80 shadow-sm"
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value, department_name: e.target.options[e.target.selectedIndex].text })}
                >
                  {isSuperUser && <option value="" disabled className="dark:bg-gray-800">Seleccionar</option>}
                  {departments.map(d => (
                    <option key={d.id} value={d.id} className="dark:bg-gray-800">{d.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-20" />
              </div>
            </div>

            {/* Categoria Select */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-blue-500" /> Categoría
              </label>
              <div className="relative">
                <select 
                  required disabled={loadingData}
                  className={`w-full h-11 pl-4 pr-10 border rounded-xl bg-white dark:bg-gray-800 text-slate-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer appearance-none relative z-10 shadow-sm ${formData.category_id === 'otro' ? 'border-blue-500' : 'border-slate-300 dark:border-gray-700'}`}
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                >
                  <option value="" disabled className="dark:bg-gray-800">Seleccionar</option>
                  {categories.map(c => (<option key={c.id} value={c.id} className="dark:bg-gray-800">{c.name}</option>))}
                  <option value="otro" className="text-blue-500 font-bold dark:bg-gray-800">+ AGREGAR NUEVA...</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-20" />
              </div>
            </div>
          </div>

          {formData.category_id === 'otro' && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Tag className="h-3 w-3" /> Nueva categoría
              </label>
              <input 
                type="text" required
                className="w-full h-10 px-4 border border-blue-500 rounded-xl bg-blue-50/30 dark:bg-blue-900/10 text-slate-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nombre de la categoría"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
          )}

          {/* Carpeta destino — solo si el depto tiene carpetas */}
          {hasFolders && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 flex items-center gap-2">
                <Folder className="h-3.5 w-3.5 text-blue-500" /> Carpeta destino
              </label>
              <div className="relative">
                <select
                  value={selectedFolderPath}
                  onChange={(e) => setSelectedFolderPath(e.target.value)}
                  className="w-full h-11 pl-4 pr-10 border border-slate-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-slate-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer shadow-sm"
                >
                  <option value="">Raíz (sin carpeta)</option>
                  {flattenFolders(folders).map((f) => (
                    <option key={f.id} value={f.path}>{f.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Vigencia */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-blue-500" /> Vigencia
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200 dark:bg-gray-800/80 rounded-xl border border-slate-300 dark:border-gray-700 shadow-sm">
              <button 
                type="button" 
                className={`py-2 text-[10px] font-bold rounded-lg transition-all ${!hasExpiry ? 'bg-white dark:bg-gray-600 shadow-md text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} 
                onClick={() => { setHasExpiry(false); setFormData({...formData, expiration_date: ''}); }}
              > PERMANENTE </button>
              <button 
                type="button" 
                className={`py-2 text-[10px] font-bold rounded-lg transition-all ${hasExpiry ? 'bg-white dark:bg-gray-600 shadow-md text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} 
                onClick={() => setHasExpiry(true)}
              > CON VENCIMIENTO </button>
            </div>
          </div>

          {hasExpiry && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[11px] font-bold uppercase text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" /> Fecha de Expiración
              </label>
              <input 
                type="date" required
                className="w-full h-11 px-4 border border-slate-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-slate-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
                value={formData.expiration_date}
                onChange={(e) => setFormData({...formData, expiration_date: e.target.value})} 
              />
            </div>
          )}

          {/* Drag and Drop */}
          <div className="pt-2">
            <label 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200
                ${isDragging 
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/30 scale-[1.01] shadow-inner'
                  : file 
                    ? 'border-green-500 bg-green-50/30 dark:bg-green-900/10 hover:border-blue-400'
                    : 'border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-800/40 hover:border-blue-400 hover:bg-slate-100 dark:hover:bg-gray-800 shadow-sm'
                }`}
            >
              <div className="flex flex-col items-center justify-center text-center px-4 pointer-events-none">
                {file && !isDragging ? (
                  <CheckCircle2 className="h-7 w-7 mb-1 text-green-500" />
                ) : (
                  <UploadCloud className={`h-7 w-7 mb-1 transition-colors ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
                )}
                <p className="text-sm text-slate-600 dark:text-gray-300 font-bold">
                  {isDragging ? '¡Suéltalo aquí!' : file ? '¡Archivo listo!' : 'Haz clic o arrastra un archivo'}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[200px] font-bold uppercase tracking-tighter">
                  {file ? file.name : 'PDF (Max 10MB)'}
                </p>
              </div>
              <input 
                type="file" className="hidden" accept=".pdf" 
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} 
              />
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-gray-700">
            <button 
              type="button" onClick={handleInternalClose} 
              className="flex-1 px-4 py-3 text-[11px] font-bold tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-white uppercase transition-colors"
            > CANCELAR </button>
            <button 
              type="submit" disabled={loading || loadingData} 
              className="flex-1 px-4 py-3 text-[11px] font-bold tracking-widest text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20 uppercase transition-all"
            > {loading ? 'SUBIENDO...' : 'GUARDAR ARCHIVO'} </button>
          </div>
        </form>
      </div>
    </div>
  );
}
