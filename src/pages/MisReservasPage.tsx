import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useScrollLock } from "../hooks/useScrollLock";
/**
 * Modelo de reserva consumido desde el backend.
 * Algunos campos son opcionales porque pueden variar
 * según tu DTO actual.
 */
interface Reserva {
  id: number;
  espacioId: number;
  nombreEspacio?: string;
  direccionEspacio?: string;
  imagenUrlEspacio?: string; // [NUEVO] Para la foto de la tarjeta
  precioTotal?: number; // [NUEVO] Para mostrar el costo
  fechaInicio: string;
  fechaFin: string;
  estado: string; // PENDIENTE / CONFIRMADA / CANCELADA
}

/**
 * Página "Mis Reservas".
 *
 * Muestra las reservas activas del usuario autenticado en formato de tarjetas,
 * con posibilidad de cancelar una reserva (llamando al backend) y
 * feedback visual claro. Soporte Dark Mode.
 */
export default function MisReservasPage() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [reservaParaCancelar, setReservaParaCancelar] = useState<Reserva | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const userId = localStorage.getItem("userId");

  // [NUEVO] Formateador de fecha y hora más detallado y legible
  const formatearFechaDetallada = (iso: string) => {
    if (!iso) return "";
    const fecha = new Date(iso);
    if (isNaN(fecha.getTime())) return iso;
    
    const fechaStr = fecha.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
    const horaStr = fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });

    return `${fechaStr.replace('.', '')} • ${horaStr} hs`;
  };

  /**
   * Carga las reservas del usuario autenticado.
   */
  const cargarReservas = async () => {
    if (!userId) {
      setErrorMensaje("No se encontró el usuario en sesión.");
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setErrorMensaje(null);

      // [FIX] Recuperamos el token manualmente para asegurar que se envíe
      const token = localStorage.getItem("token");
      
      if (!token) {
        setErrorMensaje("Tu sesión ha expirado. Por favor, volvé a iniciar sesión.");
        setCargando(false);
        return;
      }

      // Volvemos al endpoint específico /reservas/usuario/{id} que es el que soporta el backend
      // y evitamos el error 500 del endpoint genérico con query params.
      const resp = await api.get<Reserva[]>(`/reservas/usuario/${userId}`, { 
        headers: { Authorization: `Bearer ${token}` }
      });

      // Para la vista principal mostramos solo reservas NO canceladas.
      const activas = resp.data.filter(
        (r) => r.estado !== "CANCELADA" && r.estado !== "Cancelada"
      );

      setReservas(activas);
    } catch (error) {
      console.error("Error al cargar reservas:", error);
      setErrorMensaje("No se pudieron cargar tus reservas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarReservas();
  }, []);

  // --- [NUEVO] Efecto para controlar el scroll del body cuando el modal está abierto ---
  useScrollLock(modalVisible);

  /**
   * Inicia el proceso de cancelación: guarda la reserva y muestra el modal.
   */
  const iniciarCancelacion = (reserva: Reserva) => {
    setReservaParaCancelar(reserva);
    // Forzamos un frame para que la transición de entrada se active
    requestAnimationFrame(() => {
      setModalVisible(true);
    });
  };

  /**
   * Cierra el modal de confirmación con una animación de salida.
   */
  const cerrarModal = () => {
    setModalVisible(false);
    // Esperamos que la animación termine para quitar el modal del DOM
    setTimeout(() => setReservaParaCancelar(null), 300); // Debe coincidir con la duración
  };

  /**
   * Ejecuta la cancelación de una reserva tras la confirmación del usuario.
   */
  const ejecutarCancelacion = async () => {
    if (!reservaParaCancelar || !userId) return;
    const token = localStorage.getItem("token");
    
    if (!token) {
      setErrorMensaje("Tu sesión ha expirado. Por favor, volvé a iniciar sesión.");
      return;
    }

    try {
      setProcesandoId(reservaParaCancelar.id);
      setErrorMensaje(null);

      await api.patch(
        `/reservas/${reservaParaCancelar.id}/cancelar`,
        null, // Body vacío para PATCH
        {
          params: { usuarioId: userId },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Quitamos la reserva cancelada del listado actual
      setReservas((prev) => prev.filter((r) => r.id !== reservaParaCancelar.id));
      cerrarModal(); // Cierra el modal con animación
    } catch (error) {
      console.error("Error al cancelar reserva:", error);
      setErrorMensaje("No se pudo cancelar la reserva. Intente nuevamente.");
      cerrarModal(); // También cierra con animación en caso de error
    } finally {
      setProcesandoId(null);
    }
  };

  // ---------- RENDER ESTADOS ESPECIALES ----------

  if (cargando) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
            Cargando tus reservas...
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
            onClick={() => void cargarReservas()}
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Mis reservas
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Revisá y gestioná los detalles de tus próximas reservas.
            </p>
          </div>
        </div>

        {/* Estado vacío (sin reservas activas) */}
        {reservas.length === 0 && (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-14 h-14 text-slate-300 dark:text-slate-600 mb-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M8 7V3M16 7V3M4 11h16M5 6h14a1 1 0 011 1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a1 1 0 011-1z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Aún no tenés reservas activas.
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1 mb-4">
              Cuando reserves un espacio, aparecerá listado en esta sección.
            </p>
          </div>
        )}

        {/* Grid de tarjetas de reservas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reservas.map((reserva) => {
            const estadoUpper = reserva.estado.toUpperCase();
            const esConfirmada = estadoUpper === "CONFIRMADA";
            const esPendiente = estadoUpper === "PENDIENTE";

            // Badges adaptados para dark mode
            const badgeClasses = esConfirmada
              ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
              : esPendiente
              ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
              : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400";

            const badgeTexto = esConfirmada
              ? "Confirmada"
              : esPendiente
              ? "Pendiente"
              : reserva.estado;
            
            return (
              <article
                key={reserva.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow flex flex-col sm:flex-row gap-4 p-4"
              >
                {/* 1. LA FOTO */}
                <div className="w-full sm:w-32 md:w-40 h-40 sm:h-auto flex-shrink-0">
                  <img 
                    src={reserva.imagenUrlEspacio || "https://images.unsplash.com/photo-1613977257363-31b5a15e589d?q=80&w=2070&auto=format&fit=crop"} 
                    alt={`Foto de ${reserva.nombreEspacio}`}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                {/* 2. LA INFO PRINCIPAL */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${badgeClasses}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${esConfirmada ? 'bg-emerald-500' : esPendiente ? 'bg-amber-500' : 'bg-slate-500'}`}></span>
                        {badgeTexto}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{reserva.nombreEspacio ?? 'Espacio reservado'}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1.5 mt-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {reserva.direccionEspacio ?? 'Dirección no disponible'}
                      </p>
                    </div>
                  </div>

                  <div className="my-3 border-t border-slate-100 dark:border-slate-800"></div>

                  <div className="flex gap-6 text-sm mt-4">
                    <div>
                        <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider font-semibold">Llegada</p>
                        <p className="font-medium text-slate-700 dark:text-slate-200">{formatearFechaDetallada(reserva.fechaInicio)}</p>
                    </div>
                    <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
                    <div>
                        <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider font-semibold">Salida</p>
                        <p className="font-medium text-slate-700 dark:text-slate-200">{formatearFechaDetallada(reserva.fechaFin)}</p>
                    </div>
                  </div>

                  {/* Acciones al final */}
                  <div className="mt-auto pt-3">
                      {reserva.precioTotal != null && (
                        <div className="text-right mb-2">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">${reserva.precioTotal.toLocaleString('es-AR')}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        disabled={procesandoId === reserva.id}
                        onClick={() => iniciarCancelacion(reserva)}
                        className="text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {procesandoId === reserva.id ? "Cancelando..." : "Cancelar"}
                      </button>
                      <button
                        onClick={() => navigate(`/espacios/${reserva.espacioId}`)}
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
                      >
                        Ver Espacio
                      </button>
                      </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* ---------- MODAL DE CONFIRMACIÓN DE CANCELACIÓN (CON TRANSICIONES) ---------- */}
      {reservaParaCancelar && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out
            ${modalVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none'}`}
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full m-4 border border-slate-200 dark:border-slate-800 transform transition-all duration-300 ease-out
              ${modalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          >
            <div className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white" id="modal-title">
                Confirmar cancelación
              </h3>
              <div className="mt-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  ¿Estás seguro de que querés cancelar la reserva para <strong className="text-slate-700 dark:text-slate-200">{reservaParaCancelar.nombreEspacio ?? "este espacio"}</strong>?
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl">
              <button
                type="button"
                disabled={procesandoId !== null}
                onClick={() => void ejecutarCancelacion()}
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-wait dark:focus:ring-offset-slate-900 transition-colors"
              >
                {procesandoId === reservaParaCancelar.id ? 'Cancelando...' : 'Sí, cancelar'}
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
    </div>
  );
}