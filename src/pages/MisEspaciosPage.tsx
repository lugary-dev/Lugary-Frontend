import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PauseModal from "../components/PauseModal";
import { useScrollLock } from "../hooks/useScrollLock";
import { 
  obtenerEspaciosUsuario, 
  pausarEspacio, 
  publicarEspacio, 
  eliminarEspacio 
} from "../services/espaciosService";
// Se importa el servicio de espacios (plural) para evitar conflictos de caché

/**
 * Modelo de espacio propio. Extiende lo que ya usás en otras pantallas.
 */
interface EspacioPropio {
  id: number;
  nombre: string;
  descripcion: string;
  direccion: string;
  capacidadMaxima: number;
  precio: number;
  unidadPrecio: string;
  tipo: string | string[];
  estado: "PUBLICADO" | "PAUSADO" | "ELIMINADO" | "BORRADOR" | string; // [MODIFICADO] De boolean a enum de estados
  // Campos opcionales para futura evolución
  reservasActivas?: number;
  imagenUrl?: string; // [NUEVO] Para mostrar la foto de portada
  imagenes?: string[]; // [NUEVO] Para la galería completa
  puntuacionPromedio?: number; // [NUEVO] Para mostrar rating
}

/**
 * Página "Mis Espacios".
 *
 * Muestra los espacios publicados por el usuario, permitiendo activar/
 * desactivar y eliminar, con un diseño de tarjetas consistente con el lobby.
 */

// --- ICONOS UI ---
const IconPencil = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </svg>
);
const IconTrash = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);
const IconPause = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
  </svg>
);
const IconPlay = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
  </svg>
);
const IconUser = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const IconTrendingUp = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.976 5.197m-4.21-4.21l-3.275 3.275" />
  </svg>
);

const IconDotsVertical = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
  </svg>
);

// --- [NUEVO] MODAL DE PROMOCIÓN ---
const PromoteModal = ({
  isOpen,
  onClose,
  onConfirm,
  espacioNombre,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  espacioNombre: string;
  loading: boolean;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full m-4 border border-slate-200 dark:border-slate-800"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-blue-600 dark:text-blue-400">
                    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM12 18.75a.75.75 0 01.75.75v.008c0 .414-.336.75-.75.75h-.008a.75.75 0 01-.75-.75v-.008c0-.414.336.75.75.75h.008zM16.28 15.75a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white" id="modal-title">
                    Promocionar Espacio
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Destacá tu anuncio en el lobby.
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-4 text-sm">
                <p className="text-slate-600 dark:text-slate-300">
                  Vas a promocionar el espacio <strong className="text-slate-800 dark:text-slate-100">{espacioNombre}</strong>. Tu anuncio aparecerá en la primera fila de resultados durante 7 días.
                </p>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Costo de la promoción:</span>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">$5.000 ARS</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Se cobrará a tu método de pago registrado.</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl">
              <button
                type="button"
                disabled={loading}
                onClick={onConfirm}
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-wait dark:focus:ring-offset-slate-900 transition-colors"
              >
                {loading ? 'Procesando...' : 'Confirmar y Pagar'}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-base font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600 dark:focus:ring-offset-slate-900 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function MisEspaciosPage() {
  const navigate = useNavigate();

  const [espacios, setEspacios] = useState<EspacioPropio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [espacioParaEliminar, setEspacioParaEliminar] = useState<EspacioPropio | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [espacioParaPausar, setEspacioParaPausar] = useState<EspacioPropio | null>(null);
  const [pauseModalVisible, setPauseModalVisible] = useState(false);
  const [espacioParaPromocionar, setEspacioParaPromocionar] = useState<EspacioPropio | null>(null);
  const [promoteModalVisible, setPromoteModalVisible] = useState(false);
  // [MODIFICADO] Inicializar desde localStorage para persistencia
  const [promocionados, setPromocionados] = useState<number[]>(() => {
    const stored = localStorage.getItem("promocionados");
    return stored ? JSON.parse(stored) : [];
  });
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Cerrar menú al hacer clic fuera

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId !== null) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  // --- [NUEVO] Efecto para controlar el scroll del body cuando hay modales abiertos ---
  useScrollLock(deleteModalVisible || pauseModalVisible || promoteModalVisible);

  const userId = localStorage.getItem("userId");

  const cargarEspacios = async () => {
    if (!userId) {
      setErrorMensaje("No se encontró el usuario en sesión.");
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setErrorMensaje(null);

      const data = await obtenerEspaciosUsuario(userId);
      setEspacios(data);
    } catch (error) {
      console.error("Error al cargar mis espacios:", error);
      setErrorMensaje("No se pudieron cargar tus espacios publicados.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarEspacios();
  }, []);

  // Filtrar espacios
  const espaciosPublicados = espacios.filter(e => e.estado !== 'BORRADOR' && e.estado !== 'ELIMINADO');
  const espaciosBorradores = espacios.filter(e => e.estado === 'BORRADOR');

  // Función auxiliar para renderizar la tarjeta (evita duplicar código)
  const renderEspacioCard = (espacio: EspacioPropio) => {
    const coverImage = (espacio.imagenes && espacio.imagenes.length > 0) 
        ? espacio.imagenes[0] 
        : espacio.imagenUrl;
    
    const isDraft = espacio.estado === 'BORRADOR';

    return (
      <article
        key={espacio.id}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-visible group min-w-0 relative"
      >
        {/* 1. IMAGEN DE PORTADA (Clickable) */}
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
          
          {/* Badge de Estado (Overlay Superior) */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm backdrop-blur-md border border-white/10 ${
              espacio.estado === 'PUBLICADO' ? "bg-emerald-600/90 text-white" : 
              espacio.estado === 'BORRADOR' ? "bg-slate-500/90 text-white" :
              "bg-amber-500/90 text-white"
            }`}>
              {espacio.estado}
            </span>
          </div>
          
          {/* Badge de Precio (Overlay Inferior) - Solo si tiene precio */}
          {espacio.precio > 0 && (
            <div className="absolute bottom-3 left-3">
              <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/10">
                 ${espacio.precio?.toLocaleString("es-AR")} <span className="font-normal opacity-90">/ {espacio.unidadPrecio?.toLowerCase() || "hora"}</span>
              </span>
            </div>
          )}
        </div>

        {/* 2. CONTENIDO */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-2 mb-1 relative">
             <h2 
               className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
               onClick={() => navigate(isDraft ? `/espacios/editar/${espacio.id}` : `/espacios/${espacio.id}`)}
             >
               {espacio.nombre || "Borrador sin título"}
             </h2>
             
             {/* Menú de Más Opciones */}
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

          {/* Stats Grid (Solo para publicados) */}
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

        {/* 3. ACCIONES (Footer Unificado) */}
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
              }`}
          >
            <IconTrendingUp className="w-4 h-4" />
            {promocionados.includes(espacio.id) ? "Promocionado" : "Promocionar"}
          </button>
        </div>
      </article>
    );
  };

  /**
   * Decide si mostrar el modal de pausa o activar directamente.
   */
  const manejarToggleActivo = (espacio: EspacioPropio) => {
    if (!userId) return;
    setOpenMenuId(null);

    if (espacio.estado === 'PUBLICADO') {
      // Acción es PAUSAR, mostrar modal de advertencia.
      iniciarPausa(espacio);
    } else {
      // Acción es ACTIVAR, menos crítico, se puede hacer más directo.
      void ejecutarReactivacion(espacio);
    }
  };

  /**
   * Inicia el proceso de pausa: guarda el espacio y muestra el modal.
   */
  const iniciarPausa = (espacio: EspacioPropio) => {
    setEspacioParaPausar(espacio);
    requestAnimationFrame(() => {
      setPauseModalVisible(true);
    });
  };

  /**
   * Cierra el modal de pausa.
   */
  const cerrarPauseModal = () => {
    setPauseModalVisible(false);
    setTimeout(() => setEspacioParaPausar(null), 300);
  };

  /**
   * Ejecuta la acción de PAUSAR un espacio.
   */
  const ejecutarPausa = async () => {
    if (!espacioParaPausar || !userId) return;
    
    try {
      setProcesandoId(espacioParaPausar.id);
      setErrorMensaje(null);

      await pausarEspacio(espacioParaPausar.id, userId);

      setEspacios((prev) =>
        prev.map((e) =>
          e.id === espacioParaPausar.id ? { ...e, estado: 'PAUSADO' } : e
        )
      );
      cerrarPauseModal();
    } catch (error) {
      console.error("Error al cambiar estado de espacio:", error);
      setErrorMensaje(
        "No se pudo actualizar el estado del espacio. Intente nuevamente."
      );
      cerrarPauseModal();
    } finally {
      setProcesandoId(null);
    }
  };

  /**
   * Ejecuta la acción de REACTIVAR un espacio.
   */
  const ejecutarReactivacion = async (espacio: EspacioPropio) => {
    if (!userId) return;
    
    try {
      setProcesandoId(espacio.id);
      setErrorMensaje(null);

      await publicarEspacio(espacio.id, userId);

      setEspacios((prev) =>
        prev.map((e) =>
          e.id === espacio.id ? { ...e, estado: 'PUBLICADO' } : e
        )
      );
    } catch (error) {
      console.error("Error al reactivar espacio:", error);
      setErrorMensaje(
        "No se pudo activar el espacio. Intente nuevamente."
      );
    } finally {
      setProcesandoId(null);
    }
  };

  const iniciarEliminacion = (espacio: EspacioPropio) => {
    setEspacioParaEliminar(espacio);
    requestAnimationFrame(() => {
      setDeleteModalVisible(true);
    });
  };

  const cerrarModal = () => {
    setDeleteModalVisible(false);
    setTimeout(() => setEspacioParaEliminar(null), 300); // Duración de la animación
  };

  /**
   * Elimina un espacio, siempre que no tenga reservas activas.
   */
  const ejecutarEliminacion = async () => {
    if (!espacioParaEliminar || !userId) return;

    try {
      setProcesandoId(espacioParaEliminar.id);
      setErrorMensaje(null);

      await eliminarEspacio(espacioParaEliminar.id, userId);

      setEspacios((prev) => prev.filter((e) => e.id !== espacioParaEliminar.id));
      cerrarModal();
    } catch (error: any) {
      console.error("Error al eliminar espacio:", error);

      // Intentamos leer un mensaje claro desde el backend
      const mensajeBackend =
        (error.response?.data as { message?: string })?.message;

      setErrorMensaje(
        mensajeBackend ||
          "No se pudo eliminar el espacio. Verificá si tiene reservas asociadas."
      );
      cerrarModal();
    } finally {
      setProcesandoId(null);
    }
  };

  // --- [NUEVO] Lógica de Promoción ---
  const iniciarPromocion = (espacio: EspacioPropio) => {
    setOpenMenuId(null);
    setEspacioParaPromocionar(espacio);
    requestAnimationFrame(() => {
      setPromoteModalVisible(true);
    });
  };

  const cerrarPromoteModal = () => {
    setPromoteModalVisible(false);
    setTimeout(() => setEspacioParaPromocionar(null), 300);
  };

  const ejecutarPromocion = async () => {
    if (!espacioParaPromocionar) return;

    setProcesandoId(espacioParaPromocionar.id);
    setErrorMensaje(null);

    // Simulamos una llamada a la API y un pago
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Actualizamos el estado local para reflejar la promoción
    setPromocionados(prev => {
      const nuevos = [...prev, espacioParaPromocionar.id];
      localStorage.setItem("promocionados", JSON.stringify(nuevos)); // [NUEVO] Guardar en localStorage
      return nuevos;
    });
    
    setProcesandoId(null);
    cerrarPromoteModal();
  };

  // ---------- RENDER ESTADOS ESPECIALES ----------

  if (cargando) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
            Cargando tus espacios publicados...
          </p>
        </div>
      </div>
    );
  }

  if (errorMensaje) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="bg-white dark:bg-slate-900 shadow-lg rounded-2xl p-6 max-w-md w-full border border-slate-100 dark:border-slate-800 text-center">
          <p className="text-red-600 dark:text-red-400 font-medium mb-3">{errorMensaje}</p>
          <button
            onClick={() => void cargarEspacios()}
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ---------- RENDER PRINCIPAL ----------

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mis espacios</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Administrá los espacios que publicaste en Lugary.
            </p>
          </div>

          {espacios.length > 0 && (
            <button
              type="button"
              onClick={() => navigate("/espacios/nuevo")}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 transition"
            >
              <span className="mr-1">＋</span> Publicar nuevo espacio
            </button>
          )}
        </div>

        {/* Estado vacío */}
        {espacios.length === 0 && (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-14 h-14 text-slate-300 dark:text-slate-600 mb-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M3 12l2-2 7-7 7 7 2 2v7a2 2 0 01-2 2h-4v-5H9v5H5a2 2 0 01-2-2v-7z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Todavía no publicaste ningún espacio.
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1 mb-4 max-w-sm">
              Si tenés un quincho, salón o camping, podés empezar a generar
              ingresos alquilándolo de forma segura.
            </p>
            <button
              type="button"
              onClick={() => navigate("/espacios/nuevo")}
              className="px-4 py-2 rounded-full bg-emerald-500 text-slate-900 text-sm font-semibold hover:bg-emerald-400 transition"
            >
              Publicar mi primer espacio
            </button>
          </div>
        )}

        {/* Grid de tarjetas de espacios PUBLICADOS */}
        {espaciosPublicados.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            {espaciosPublicados.map(renderEspacioCard)}
          </div>
        )}

        {/* Grid de tarjetas de espacios BORRADORES */}
        {espaciosBorradores.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-t border-slate-200 dark:border-slate-800 pt-8">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Borradores
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {espaciosBorradores.map(renderEspacioCard)}
            </div>
          </>
        )}
      </div>

      {/* ---------- MODAL DE CONFIRMACIÓN DE ELIMINACIÓN ---------- */}
      {espacioParaEliminar && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out
            ${deleteModalVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none'}`}
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full m-4 border border-slate-200 dark:border-slate-800 transform transition-all duration-300 ease-out
              ${deleteModalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          >
            <div className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white" id="modal-title">
                Confirmar eliminación
              </h3>
              <div className="mt-2">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  ¿Estás seguro de que querés eliminar el espacio <strong className="text-slate-700 dark:text-slate-200">{espacioParaEliminar.nombre}</strong>?
                </p>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-lg p-3 text-left flex gap-3">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                   <div className="text-xs text-amber-800 dark:text-amber-200">
                      <p className="font-bold mb-0.5">Esta acción es irreversible</p>
                      <p className="opacity-90 leading-relaxed">Por seguridad, solo se permite eliminar espacios que no tengan reservas activas (pendientes o confirmadas).</p>
                   </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl">
              <button
                type="button"
                disabled={procesandoId !== null}
                onClick={() => void ejecutarEliminacion()}
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-wait dark:focus:ring-offset-slate-900 transition-colors"
              >
                {procesandoId === espacioParaEliminar.id ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
              <button
                type="button"
                disabled={procesandoId !== null}
                onClick={cerrarModal}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-base font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600 dark:focus:ring-offset-slate-900 transition-colors"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- [NUEVO] MODAL DE CONFIRMACIÓN DE PAUSA ---------- */}
      <PauseModal
        isOpen={pauseModalVisible}
        onClose={cerrarPauseModal}
        onConfirm={() => void ejecutarPausa()}
        espacioNombre={espacioParaPausar?.nombre || ""}
      />

      {/* ---------- [NUEVO] MODAL DE PROMOCIÓN ---------- */}
      <PromoteModal
        isOpen={promoteModalVisible}
        onClose={cerrarPromoteModal}
        onConfirm={() => void ejecutarPromocion()}
        espacioNombre={espacioParaPromocionar?.nombre || ""}
        loading={procesandoId === espacioParaPromocionar?.id}
      />
    </div>
  );
}