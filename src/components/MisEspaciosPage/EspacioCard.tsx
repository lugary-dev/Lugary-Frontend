interface EspacioPropio {
  id: number;
  nombre: string;
  descripcion: string;
  direccion: string;
  capacidadMaxima: number;
  precio: number;
  unidadPrecio: string;
  tipo: string | string[];
  estado: "PUBLICADO" | "PAUSADO" | "ELIMINADO" | "BORRADOR" | string;
  reservasActivas?: number;
  imagenUrl?: string;
  imagenes?: string[];
  puntuacionPromedio?: number;
}

interface Props {
  espacio: EspacioPropio;
  navigate: (path: string) => void;
  openMenuId: number | null;
  setOpenMenuId: (id: number | null) => void;
  iniciarEliminacion: (espacio: EspacioPropio) => void;
  manejarToggleActivo: (espacio: EspacioPropio) => void;
  iniciarPromocion: (espacio: EspacioPropio) => void;
  promocionados: number[];
  procesandoId: number | null;
}

const IconPencil = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </svg>
);
const IconTrash = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);
const IconPause = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
  </svg>
);
const IconPlay = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
  </svg>
);
const IconUser = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const IconTrendingUp = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.976 5.197m-4.21-4.21l-3.275 3.275" />
  </svg>
);

const IconDotsVertical = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
  </svg>
);

export default function EspacioCard({
  espacio,
  navigate,
  openMenuId,
  setOpenMenuId,
  iniciarEliminacion,
  manejarToggleActivo,
  iniciarPromocion,
  promocionados,
  procesandoId,
}: Props) {
  const coverImage = (espacio.imagenes && espacio.imagenes.length > 0) ? espacio.imagenes[0] : espacio.imagenUrl;
  const isDraft = espacio.estado === 'BORRADOR';

  return (
    <article
      key={espacio.id}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-visible group min-w-0 relative"
    >
      <div
        className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 cursor-pointer overflow-hidden rounded-t-2xl"
        onClick={() => navigate(isDraft ? `/espacios/editar/${espacio.id}` : `/espacios/${espacio.id}`)}
      >
        {coverImage ? (
          <img
            src={coverImage}
            alt={espacio.nombre}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isDraft ? 'opacity-80 grayscale-[30%]' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 bg-slate-100 dark:bg-slate-800">
             <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             <span className="text-xs font-medium uppercase tracking-wider opacity-60">Sin foto</span>
          </div>
        )}

        <div className="absolute top-3 right-3">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm backdrop-blur-md border border-white/10 ${
            espacio.estado === 'PUBLICADO' ? "bg-emerald-600/90 text-white" : 
            espacio.estado === 'BORRADOR' ? "bg-slate-500/90 text-white" :
            "bg-amber-500/90 text-white"
          }`}>
            {espacio.estado}
          </span>
        </div>

        {espacio.precio > 0 && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/10">
               ${espacio.precio?.toLocaleString("es-AR")} <span className="font-normal opacity-90">/ {espacio.unidadPrecio?.toLowerCase() || "hora"}</span>
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-1 relative">
           <h2 
             className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
             onClick={() => navigate(isDraft ? `/espacios/editar/${espacio.id}` : `/espacios/${espacio.id}`)}
           >
             {espacio.nombre || "Borrador sin título"}
           </h2>
           
           <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === espacio.id ? null : espacio.id);
                }}
                className="h-8 w-8 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <IconDotsVertical className="w-5 h-5" />
              </button>

              {openMenuId === espacio.id && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  {!isDraft && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); manejarToggleActivo(espacio); }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      {espacio.estado === 'PUBLICADO' ? <IconPause className="w-4 h-4" /> : <IconPlay className="w-4 h-4" />}
                      {espacio.estado === 'PUBLICADO' ? "Pausar publicación" : "Reactivar publicación"}
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); iniciarEliminacion(espacio); setOpenMenuId(null); }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400 transition-colors"
                  >
                    <IconTrash className="w-4 h-4" />
                    Eliminar espacio
                  </button>
                </div>
              )}
           </div>
        </div>

        <div className="flex flex-col gap-1 mb-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 min-w-0">
             <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             <span className="truncate">{espacio.direccion || "Sin dirección"}</span>
          </p>
          {espacio.capacidadMaxima > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <IconUser className="w-3.5 h-3.5" />
              Capacidad: {espacio.capacidadMaxima}
            </p>
          )}
        </div>

        {!isDraft ? (
          <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-100 dark:border-slate-800 mt-auto">
             <div className="text-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Vistas</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">--</p>
             </div>
             <div className="text-center border-l border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Reservas</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{espacio.reservasActivas || 0}</p>
             </div>
             <div className="text-center border-l border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Calif.</p>
                <p className={`text-sm font-bold flex items-center justify-center gap-1 ${
                  (espacio.puntuacionPromedio || 0) >= 4.5 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-200"
                }`}>
                  {espacio.puntuacionPromedio ? (
                      <>{espacio.puntuacionPromedio} <span className="text-amber-400">★</span></>
                  ) : "--"}
                </p>
             </div>
          </div>
        ) : (
          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
             <p className="text-xs text-slate-400 italic">Borrador guardado. Completá la información para publicar.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
         <button 
           onClick={() => navigate(`/espacios/editar/${espacio.id}`)}
           className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
         >
           <IconPencil className="w-4 h-4" /> {isDraft ? 'Continuar' : 'Editar'}
         </button>

        <button
          onClick={() => iniciarPromocion(espacio)}
          disabled={promocionados.includes(espacio.id) || isDraft}
          className={`flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all shadow-md 
            ${promocionados.includes(espacio.id)
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white cursor-not-allowed shadow-lg shadow-amber-500/30'
              : isDraft
                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500 dark:text-slate-400 shadow-none'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-purple-600/20 transform hover:scale-[1.02] active:scale-[0.98]'
            }`}>
          <IconTrendingUp className="w-4 h-4" />
          {promocionados.includes(espacio.id) ? "Promocionado" : "Promocionar"}
        </button>
      </div>
    </article>
  );
}
