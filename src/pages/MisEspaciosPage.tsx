import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PauseModal from "../components/MisEspaciosPage/PauseModal";
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

import PromoteModal from "../components/MisEspaciosPage/PromoteModal";
import EspacioCard from "../components/MisEspaciosPage/EspacioCard";

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

  // EspacioCard moved to components/MisEspaciosPage/EspacioCard.tsx

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
            {espaciosPublicados.map(e => (
              <EspacioCard
                key={e.id}
                espacio={e}
                navigate={navigate}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                iniciarEliminacion={iniciarEliminacion}
                manejarToggleActivo={manejarToggleActivo}
                iniciarPromocion={iniciarPromocion}
                promocionados={promocionados}
                procesandoId={procesandoId}
              />
            ))}
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
              {espaciosBorradores.map(e => (
                <EspacioCard
                  key={e.id}
                  espacio={e}
                  navigate={navigate}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  iniciarEliminacion={iniciarEliminacion}
                  manejarToggleActivo={manejarToggleActivo}
                  iniciarPromocion={iniciarPromocion}
                  promocionados={promocionados}
                  procesandoId={procesandoId}
                />
              ))}
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