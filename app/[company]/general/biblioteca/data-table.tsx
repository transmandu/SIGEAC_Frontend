'use client';
import { useState } from 'react';
import libraryService from '@/lib/libraryService';

interface Props {
  company: string;
  groupedDocuments: any; // El objeto { "Sistemas": [...], "RRHH": [...] }
  onRefresh: () => void; // Para recargar tras eliminar
}

export default function DocumentTable({ company, groupedDocuments, onRefresh }: Props) {
  
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este documento? Esta acción borrará el archivo físico del servidor.')) return;
    
    try {
      await libraryService.deleteDocument(company, id);
      onRefresh();
    } catch (error) {
      alert("Error al eliminar el documento");
    }
  };

  const handleView = (id: number) => {
    const url = libraryService.getViewUrl(company, id);
    window.open(url, '_blank'); // Abre el stream del PDF en pestaña nueva
  };

  // Obtenemos los nombres de los departamentos (las llaves del objeto)
  const departments = Object.keys(groupedDocuments);

  if (departments.length === 0) {
    return (
      <div className="text-center p-10 bg-gray-50 rounded-lg border-2 border-dashed">
        <p className="text-gray-500">No hay documentos cargados en la biblioteca aún.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {departments.map((dept) => (
        <div key={dept} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Encabezado del Departamento (Carpeta) */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <span className="text-xl">📁</span> {dept}
            </h3>
            <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
              {groupedDocuments[dept].length} Archivos
            </span>
          </div>

          {/* Tabla de Archivos */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 font-medium">Nombre del Documento</th>
                  <th className="px-6 py-3 font-medium text-center">Categoría</th>
                  <th className="px-6 py-3 font-medium text-center">Estado</th>
                  <th className="px-6 py-3 font-medium text-center">Vencimiento</th>
                  <th className="px-6 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {groupedDocuments[dept].map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {doc.title}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                        {doc.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500">
                      {doc.expiration_date ? doc.expiration_date : '---'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleView(doc.id)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Ver
                      </button>
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

// Sub-componente para los Badges de estado
function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    vigente: 'bg-green-100 text-green-700',
    vencido: 'bg-red-100 text-red-700',
    no_aplica: 'bg-gray-100 text-gray-600'
  };

  const labels: any = {
    vigente: 'Vigente',
    vencido: 'Vencido',
    no_aplica: 'N/A'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}