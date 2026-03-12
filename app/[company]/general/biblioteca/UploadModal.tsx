'use client';
import { useState, useEffect } from 'react';
import libraryService from '@/lib/libraryService';
import axiosInstance from '@/lib/axios';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Tag, 
  Calendar, 
  Building2, 
  CheckCircle2,
  ChevronDown 
} from 'lucide-react';

export default function UploadModal({ company, isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [hasExpiry, setHasExpiry] = useState(false);
  
  const [departments, setDepartments] = useState<{ id: number, name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    department_id: '',
    department_name: '',
    expiration_date: '',
  });

  // Carga de datos desde la API
  useEffect(() => {
    if (isOpen && company) {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          const [deptsRes, catsRes] = await Promise.all([
            axiosInstance.get(`/${company}/library/departments-list`),
            axiosInstance.get(`/${company}/library/categories-list`)
          ]);
          setDepartments(deptsRes.data);
          setCategories(catsRes.data);
        } catch (error) {
          console.error("Error al cargar datos del backend:", error);
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [isOpen, company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !formData.category_id || !formData.department_id) {
        return alert("Error: Por favor completa todos los campos obligatorios.");
    }

    setLoading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('title', formData.title);
    data.append('category_id', formData.category_id);
    data.append('department_id', formData.department_id);
    data.append('department_name', formData.department_name);
    
    if (hasExpiry && formData.expiration_date) {
      data.append('expiration_date', formData.expiration_date);
    }

    try {
      await libraryService.uploadDocument(company, data);
      onSuccess();
      onClose();
      // Reset de estados
      setFile(null);
      setFormData({ title: '', category_id: '', department_id: '', department_name: '', expiration_date: '' });
    } catch (error: any) {
      alert("Error al guardar: " + (error.response?.data?.message || "Error de servidor"));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white dark:bg-[#1a1c1e] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
        
        {/* Cabecera Estilo Profesional */}
        <div className="bg-gray-50 dark:bg-gray-800/40 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <UploadCloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white tracking-tight">
              Subir nuevo documento
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Nombre del Documento */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-blue-500" /> Nombre del Documento
            </label>
            <input 
              type="text" required
              className="w-full h-11 px-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
              placeholder="Ej. Manual de Mantenimiento 2026"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          {/* Grid de Desplegables (Blindados) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Departamento */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-blue-500" /> Área / Depto
              </label>
              <div className="relative">
                <select 
                  required
                  disabled={loadingData}
                  className="w-full h-11 pl-4 pr-10 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer appearance-none relative z-10"
                  value={formData.department_id}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedName = e.target.options[e.target.selectedIndex].text;
                    setFormData({ ...formData, department_id: selectedId, department_name: selectedName });
                  }}
                >
                  <option value="" disabled>Seleccionar</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id} className="dark:bg-gray-800">{d.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-20">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Categoría */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-blue-500" /> Categoría
              </label>
              <div className="relative">
                <select 
                  required
                  disabled={loadingData}
                  className="w-full h-11 pl-4 pr-10 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer appearance-none relative z-10"
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                >
                  <option value="" disabled>Seleccionar</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id} className="dark:bg-gray-800">{c.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-20">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Selector de Vigencia */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-blue-500" /> Vigencia
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className={`py-2 text-[10px] font-black rounded-lg transition-all duration-300 ${!hasExpiry ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
                onClick={() => setHasExpiry(false)}
              >
                PERMANENTE
              </button>
              <button
                type="button"
                className={`py-2 text-[10px] font-black rounded-lg transition-all duration-300 ${hasExpiry ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
                onClick={() => setHasExpiry(true)}
              >
                CON VENCIMIENTO
              </button>
            </div>
          </div>

          {/* Animación Suave para Fecha de Expiración */}
          <div 
            className={`transition-all duration-500 ease-in-out overflow-hidden ${hasExpiry ? 'max-h-24 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'}`}
          >
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold uppercase text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" /> Fecha de Expiración
              </label>
              <input 
                type="date" 
                required={hasExpiry}
                className="w-full h-11 px-4 border border-blue-200 dark:border-blue-900/40 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50/30 dark:bg-blue-900/10 text-gray-800 dark:text-white"
                onChange={(e) => setFormData({...formData, expiration_date: e.target.value})}
              />
            </div>
          </div>

          {/* Zona de Archivo */}
          <div className="pt-2">
            <label className={`relative flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${file ? 'border-green-500 bg-green-50/30 dark:bg-green-900/10' : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800/60'}`}>
              <div className="flex flex-col items-center justify-center text-center px-4">
                {file ? <CheckCircle2 className="h-7 w-7 text-green-500 mb-1 animate-bounce" /> : <UploadCloud className="h-7 w-7 text-gray-400 mb-1" />}
                <p className="text-sm dark:text-gray-300 font-medium">
                  {file ? '¡Archivo seleccionado!' : 'Haz clic para subir archivo'}
                </p>
                <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{file ? file.name : 'PDF o Excel (Max 10MB)'}</p>
              </div>
              <input type="file" className="hidden" accept=".pdf,.xlsx,.xls" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
            </label>
          </div>

          {/* Footer de Acciones */}
          <div className="flex gap-3 pt-4 border-t dark:border-gray-800">
            <button 
              type="button" onClick={onClose}
              className="flex-1 px-4 py-3 text-[11px] font-black tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all uppercase"
            >
              CANCELAR
            </button>
            <button 
              type="submit" disabled={loading || loadingData}
              className="flex-1 px-4 py-3 text-[11px] font-black tracking-widest text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              {loading ? 'SUBIENDO...' : 'GUARDAR ARCHIVO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}