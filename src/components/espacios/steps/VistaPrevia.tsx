import React, { useState, useEffect } from "react";

const renderPreviewDescription = (text: string) => {
  if (!text) return "La descripción que escribas se mostrará en este espacio...";
  
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return <strong key={index} className="font-bold text-slate-700 dark:text-slate-200">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

interface VistaPreviaProps {
  nombre: string;
  tipos: string[];
  descripcion: string;
  ciudad: string;
  provincia: string;
  capacidadMaxima: number | '';
  precio: number | '';
  unidad: string;
  uploadedFiles: File[];
}

export default function VistaPrevia({
  nombre,
  tipos,
  descripcion,
  ciudad,
  provincia,
  capacidadMaxima,
  precio,
  unidad,
  uploadedFiles
}: VistaPreviaProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [previewFocalPoint, setPreviewFocalPoint] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragStartFocalPoint, setDragStartFocalPoint] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const newUrls = uploadedFiles.slice(0, 4).map(file => URL.createObjectURL(file));
    setPreviewUrls(newUrls);
    
    return () => {
      newUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [uploadedFiles]);

  const coverImageFile = uploadedFiles[0] as (File & { focalPoint?: { x: number, y: number } }) | undefined;
  const savedFocalPoint = coverImageFile?.focalPoint || { x: 50, y: 50 };
  const displayFocalPoint = previewFocalPoint || savedFocalPoint;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (uploadedFiles.length === 0) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragStartFocalPoint(displayFocalPoint);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    const changeX = (deltaX / rect.width) * 100;
    const changeY = (deltaY / rect.height) * 100;

    const newX = Math.max(0, Math.min(100, dragStartFocalPoint.x - changeX));
    const newY = Math.max(0, Math.min(100, dragStartFocalPoint.y - changeY));

    setPreviewFocalPoint({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (uploadedFiles.length > 0 && previewFocalPoint) {
      (uploadedFiles[0] as any).focalPoint = previewFocalPoint;
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) handleMouseUp();
  };

  return (
    <aside className="lg:sticky lg:top-20 hidden lg:block min-w-0">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors duration-300">
        <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          Vista Previa del Anuncio
        </h3>
        
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-950">
          <div 
            className={`relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 group overflow-hidden ${uploadedFiles.length > 0 ? 'cursor-grab active:cursor-grabbing' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {previewUrls.length > 0 ? (
              <>
                <img 
                  src={previewUrls[0]} 
                  alt="Vista previa" 
                  className="w-full h-full object-cover transition-none select-none pointer-events-none" 
                  style={{ objectPosition: `${displayFocalPoint.x}% ${displayFocalPoint.y}%` }}
                />
                {!isDragging && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">
                      Arrastrá para ajustar
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                <svg className="w-20 h-20 mb-3 opacity-30" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19.5 21a1.5 1.5 0 001.5-1.5v-4.25a.75.75 0 00-1.5 0v4.25a.5.5 0 01-.5.5h-4.5a.75.75 0 000 1.5h4.5zM8.5 21h-4a1.5 1.5 0 01-1.5-1.5v-4.25a.75.75 0 011.5 0v4.25a.5.5 0 00.5.5h4a.75.75 0 010 1.5zM3 10.25V12a.75.75 0 001.5 0v-1.75a.5.5 0 01.5-.5h14a.5.5 0 01.5.5V12a.75.75 0 001.5 0v-1.75a2 2 0 00-2-2h-14a2 2 0 00-2 2z" /><path fillRule="evenodd" d="M12 2.25a.75.75 0 01.53.22l8.25 8.25a.75.75 0 01-1.06 1.06L12 4.06 4.28 11.78a.75.75 0 01-1.06-1.06l8.25-8.25a.75.75 0 01.53-.22z" clipRule="evenodd" /><path d="M9.5 13.75a.75.75 0 00-1.5 0v7a.75.75 0 001.5 0v-7zM14.5 13.75a.75.75 0 00-1.5 0v7a.75.75 0 001.5 0v-7z" /></svg>
                <span className="text-xs font-medium uppercase tracking-wider opacity-50">Tu foto aquí</span>
              </div>
            )}
            {typeof capacidadMaxima === 'number' && capacidadMaxima > 0 && (
              <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm">
                Hasta {capacidadMaxima} pers.
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="flex flex-wrap gap-2 mb-2 min-h-[1.5rem]">
              {tipos.length > 0 ? (
                tipos.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wide">
                    {t}
                  </span>
                ))
              ) : (
                <span className="text-xs font-medium text-slate-400 dark:text-slate-600 uppercase tracking-wider">Tipo de espacio</span>
              )}
            </div>
            <h4 className={`font-bold text-lg leading-tight mb-2 truncate ${nombre ? 'text-slate-800 dark:text-white' : 'text-slate-400 italic'}`}>
              {nombre || "Título de tu anuncio"}
            </h4>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 h-10 break-words">
              {renderPreviewDescription(descripcion)}
            </p>
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-3 min-w-0">
              <svg className="w-4 h-4 mr-1 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="truncate capitalize">
                {[ciudad, provincia].filter(Boolean).join(', ') || "Ubicación"}
              </span>
            </div>
            
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Precio</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {typeof precio === 'number' && precio > 0 ? `$${precio.toLocaleString("es-AR")}` : "$ --"} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{unidad ? `/${unidad.toLowerCase()}` : ""}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}