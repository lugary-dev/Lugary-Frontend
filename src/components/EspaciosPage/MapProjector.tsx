import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LuMapPin, LuX, LuChevronUp } from "react-icons/lu";
import { useScrollLock } from "../../hooks/useScrollLock";

interface MapProjectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MapProjector({ isOpen, onClose }: MapProjectorProps) {
  const [showContent, setShowContent] = useState(false);

  // Bloqueamos el scroll del body cuando el mapa está abierto
  useScrollLock(isOpen);

  // Retrasamos la carga del contenido (el mapa pesado) hasta que la animación empiece
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowContent(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  return (
    <>
      {/* BACKDROP (Fondo oscuro) - Usamos Portal para que cubra toda la pantalla sin importar el z-index del padre */}
      {createPortal(
        <div 
          className={`fixed inset-0 z-[35] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-500
            ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={onClose}
        />,
        document.body
      )}

      {/* EL PROYECTOR (Renderizado dentro del Header para alineación perfecta) */}
      <div 
        className={`
          absolute left-4 right-4 z-10
          flex flex-col items-center justify-end
          bg-white dark:bg-slate-900 shadow-2xl
          overflow-hidden 
          rounded-b-[40px] border-x border-b border-slate-200 dark:border-slate-800
          transition-[height] duration-700 ease-in-out cubic-bezier(0.4, 0, 0.2, 1)
        `}
        style={{ 
          top: 'calc(100% - 24px)', 
          // Altura: Si está abierto ocupa 80vh, si no, 0px.
          height: isOpen ? '80vh' : '0px'
        }}
      >
     
      {/* CONTENIDO DEL MAPA */}
      <div className={`w-full h-full relative transition-opacity duration-500 delay-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
       
        {/* Aquí iría el componente GoogleMap real */}
        {/* Placeholder visual del mapa */}
        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 relative group">
           <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover opacity-20 dark:opacity-10"></div>
           
           {/* Pines simulados */}
           <div className="absolute top-1/3 left-1/4 animate-bounce-slow">
              <LuMapPin className="w-10 h-10 text-red-500 drop-shadow-lg" fill="currentColor" />
           </div>
           <div className="absolute top-1/2 left-1/2 animate-bounce-slow delay-100">
              <LuMapPin className="w-10 h-10 text-blue-500 drop-shadow-lg" fill="currentColor" />
           </div>

           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="bg-white/80 dark:bg-slate-900/80 backdrop-blur px-4 py-2 rounded-full text-slate-600 dark:text-slate-300 font-medium shadow-sm">
                Usando tus filtros actuales...
              </span>
           </div>
        </div>

        {/* Botón flotante para cerrar (esquina) */}
        <button 
          onClick={onClose}
          className="absolute top-28 right-8 bg-white dark:bg-slate-900 p-3 rounded-full shadow-xl hover:scale-110 transition-transform z-50 group"
          title="Cerrar Mapa"
        >
          <LuX className="w-6 h-6 text-slate-500 group-hover:text-red-500" />
        </button>
      </div>

      {/* LA "CUERDITA" O MANIJA DEL PROYECTOR */}
      {/* Esta es la parte inferior que le da el look físico */}
      <div
        className="w-full bg-blue-600 h-6 flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors absolute bottom-0 z-50"
        onClick={onClose}
      >
        <div className="w-16 h-1 bg-white/50 rounded-full"></div>
        <LuChevronUp className="w-4 h-4 text-white absolute -top-3 bg-blue-600 rounded-full p-0.5 border-2 border-white" />
      </div>

      </div>
    </>
  );
}