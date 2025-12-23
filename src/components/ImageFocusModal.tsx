import React, { useState, useRef, useEffect } from "react";

interface ImageFocusModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  initialFocalPoint?: { x: number; y: number };
  onSave: (focalPoint: { x: number; y: number }) => void;
}

export default function ImageFocusModal({ isOpen, onClose, imageUrl, initialFocalPoint, onSave }: ImageFocusModalProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [tempPoint, setTempPoint] = useState(initialFocalPoint || { x: 50, y: 50 });

  useEffect(() => {
    if (isOpen) {
      setTempPoint(initialFocalPoint || { x: 50, y: 50 });
    }
  }, [isOpen, initialFocalPoint]);

  if (!isOpen) return null;

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const img = imageRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = Math.round((x / rect.width) * 100);
    const yPercent = Math.round((y / rect.height) * 100);

    const finalX = Math.max(0, Math.min(100, xPercent));
    const finalY = Math.max(0, Math.min(100, yPercent));

    setTempPoint({ x: finalX, y: finalY });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-2xl w-full relative shadow-2xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Elige el punto principal</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Haz clic en la parte más importante de la foto. Esto es lo que se verá centrado en la tarjeta.</p>

        <div className="relative cursor-crosshair overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 group select-none" onClick={handleImageClick}>
           <img
             ref={imageRef}
             src={imageUrl}
             alt="Ajustar foco"
             className="w-full h-auto object-contain max-h-[60vh] mx-auto"
             draggable="false"
           />

           {/* Puntero */}
           <div
             className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-white bg-red-500/80 shadow-lg pointer-events-none transition-all duration-75 ease-out flex items-center justify-center"
             style={{
               left: `${tempPoint.x}%`,
               top: `${tempPoint.y}%`
             }}
           >
             <div className="w-1 h-1 bg-white rounded-full"></div>
           </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors">Cancelar</button>
          <button
            onClick={() => {
                onSave(tempPoint);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            Guardar foco
          </button>
        </div>
      </div>
    </div>
  );
}