import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuX, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { useScrollLock } from '../hooks/useScrollLock';

interface ImageLightboxProps {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

const ArrowButton = ({ direction, onClick }: { direction: 'left' | 'right', onClick: (e: React.MouseEvent) => void }) => (
  <button
    onClick={onClick}
    className={`absolute top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white/80 hover:bg-black/40 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50
      ${direction === 'left' ? 'left-4 lg:left-8' : 'right-4 lg:right-8'}`}
    aria-label={direction === 'left' ? 'Imagen anterior' : 'Siguiente imagen'}
  >
    {direction === 'left' ? <LuChevronLeft size={28} /> : <LuChevronRight size={28} />}
  </button>
);

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ images, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  useScrollLock(true);

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
      if (e.key === 'ArrowLeft') setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  // --- Sincronizar scroll de miniaturas con la imagen activa ---
  useEffect(() => {
    if (thumbnailContainerRef.current) {
      const activeThumbnail = thumbnailContainerRef.current.children[currentIndex] as HTMLElement;
      if (activeThumbnail) {
        // Centra el thumbnail activo en el contenedor de miniaturas
        const containerWidth = thumbnailContainerRef.current.offsetWidth;
        const scrollLeft = activeThumbnail.offsetLeft - (containerWidth / 2) + (activeThumbnail.offsetWidth / 2);
        thumbnailContainerRef.current.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        });
      }
    }
  }, [currentIndex]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col items-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Close Button */}
      <button onClick={onClose} className="absolute top-4 right-4 z-30 p-2 bg-black/20 rounded-full flex items-center justify-center text-white/80 hover:bg-black/40 hover:text-white transition-all" aria-label="Cerrar galería">
        <LuX size={24} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 z-30 bg-black/20 text-white/90 text-sm font-mono px-3 py-1.5 rounded-full">
        {currentIndex + 1} / {images.length}
      </div>

      {/* ============================================================== */}
      {/* CAROUSEL AREA - MODIFICADO ESTRATÉGICAMENTE */}
      {/* ============================================================== */}
      
      {/* CAMBIO 1: Altura explícita en el contenedor padre.
         Si hay miniaturas (tu tira mide 100px), el área principal mide 100vh - 100px.
         Si no hay miniaturas, ocupa toda la pantalla (h-screen).
         Quitamos el 'flex-1' y el padding 'p-4' que tenías aquí antes.
      */}
      <div 
        className={`relative w-full flex items-center justify-center z-10 ${images.length > 1 ? 'h-[calc(100vh-100px)]' : 'h-screen'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 && <ArrowButton direction="left" onClick={goToPrevious} />}
        
        {/* CAMBIO 2: Wrapper de la imagen.
           Este div ahora tiene 'w-full h-full' para llenar el contenedor padre.
           AQUÍ es donde ponemos el padding (p-4 md:p-8) para darle "aire" a la foto
           y que no toque los bordes de la pantalla ni las miniaturas.
        */}
        <div className="relative w-full h-full flex items-center justify-center p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`Imagen ${currentIndex + 1}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              /* CAMBIO 3: Clases de la imagen simplificadas.
                 Ya no usamos max-w/max-h específicos. Le decimos:
                 "Usa el 100% del ancho y alto de tu wrapper (w-full h-full), 
                 pero mantén tu proporción (object-contain) para no deformarte".
              */
              className="block w-full h-full object-contain rounded-lg shadow-2xl select-none"
            />
          </AnimatePresence>
        </div>

        {images.length > 1 && <ArrowButton direction="right" onClick={goToNext} />}
      </div>

      {/* ============================================================== */}
      {/* FIN CAROUSEL AREA */}
      {/* ============================================================== */}

      {/* Tira de Miniaturas (Thumbnails) */}
      {images.length > 1 && (
        <div 
          className="w-full h-[100px] flex-shrink-0 flex justify-center items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            ref={thumbnailContainerRef}
            className="flex gap-3 overflow-x-auto p-2"
          >
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Miniatura ${index + 1}`}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
                className={`h-16 w-auto object-cover rounded-lg cursor-pointer transition-all duration-300 ring-2 ring-offset-2 ring-offset-black/60 ${
                  currentIndex === index
                    ? 'ring-white'
                    : 'ring-transparent opacity-60 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};