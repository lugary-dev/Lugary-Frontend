import React, { useState, useEffect, useRef } from 'react';

// Iconos SVG Inline para no depender de librerías externas
const IconUpload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);
const IconStar = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-4 h-4"}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);
const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

interface ImageGalleryUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}

export default function ImageGalleryUpload({ files, onChange, disabled = false }: ImageGalleryUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generar URLs de previsualización para las imágenes
  useEffect(() => {
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);

    // Limpiar URLs al desmontar o cambiar archivos para evitar memory leaks
    return () => {
      newPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      onChange([...files, ...newFiles]);
    }
  };

  const handleDropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDropZoneLeave = () => setIsDragOver(false);

  const handleDropZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (droppedFiles.length > 0) onChange([...files, ...droppedFiles]);
  };

  const removeFile = (e: React.MouseEvent, index: number) => {
    e.stopPropagation(); // Evitar abrir el selector de archivos si se clickea borrar
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  // --- Lógica de Reordenamiento (Drag & Sort) ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Hack para ocultar la imagen fantasma por defecto si quisieras personalizarla, 
    // pero el default del navegador suele estar bien.
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // Necesario para permitir el drop
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newFiles = [...files];
    const [movedFile] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(targetIndex, 0, movedFile);
    
    onChange(newFiles);
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Zona de Drop (Empty State o Add More) */}
      <div
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDragOver={handleDropZoneDragOver}
        onDragLeave={handleDropZoneLeave}
        onDrop={handleDropZoneDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${disabled ? 'cursor-not-allowed opacity-60 border-slate-200 dark:border-slate-800' : 'cursor-pointer border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-blue-400'}
          ${!disabled && isDragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]' 
            : ''
          }
        `}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          multiple 
          accept="image/jpeg,image/png,image/webp" 
          onChange={handleFileSelect} 
          disabled={disabled}
        />
        <div className="flex flex-col items-center justify-center gap-3">
          <div className={`p-3 rounded-full transition-colors ${isDragOver ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            <IconUpload />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {isDragOver ? '¡Soltá las fotos acá!' : 'Hacé clic o arrastrá tus fotos aquí'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              JPG, PNG, WEBP hasta 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Grilla de Galería (Bento Grid) */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
          {files.map((file, index) => {
            const isCover = index === 0;
            return (
              <div
                key={`${file.name}-${index}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`
                  relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm cursor-move select-none
                  ${isCover ? 'col-span-2 row-span-2 aspect-square md:aspect-auto ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-900' : 'aspect-square'}
                  transition-all hover:shadow-md
                `}
              >
                {/* Imagen */}
                <img
                  src={previews[index]}
                  alt={`Preview `}
                  className="w-full h-full object-cover"
                />

                {/* Overlay con Acciones */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100">
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => removeFile(e, index)}
                      className="p-1.5 bg-white/90 text-red-500 rounded-full hover:bg-red-50 transition-colors shadow-sm"
                      title="Eliminar foto"
                    >
                      <IconTrash />
                    </button>
                  </div>
                  
                  {!isCover && (
                    <div className="text-center">
                      <span className="inline-block px-2 py-1 bg-black/60 text-white text-[10px] font-medium rounded-md backdrop-blur-sm">
                        Arrastrá a la portada
                      </span>
                    </div>
                  )}
                </div>

                {/* Badge de Portada */}
                {isCover && (
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-yellow-600 dark:text-yellow-400 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-yellow-200 dark:border-yellow-900/50">
                    <IconStar className="w-3.5 h-3.5 text-yellow-500" />
                    Portada Principal
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
