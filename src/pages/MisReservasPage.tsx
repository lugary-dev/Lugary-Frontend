import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useScrollLock } from "../hooks/useScrollLock";
import ReservaCard from "../components/MisReservasPage/ReservaCard";
import CancelacionModal from "../components/MisReservasPage/CancelacionModal";
import EmptyState from "../components/MisReservasPage/EmptyState";
import LoadingState from "../components/MisReservasPage/LoadingState";
import ErrorState from "../components/MisReservasPage/ErrorState";
import { Reserva } from "../components/MisReservasPage/types";

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
    return <LoadingState />;
  }

  if (errorMensaje) {
    return (
      <ErrorState 
        mensaje={errorMensaje} 
        onReintentar={cargarReservas}
      />
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
        {reservas.length === 0 && <EmptyState />}

        {/* Grid de tarjetas de reservas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reservas.map((reserva) => (
            <ReservaCard
              key={reserva.id}
              reserva={reserva}
              procesandoId={procesandoId}
              onCancelar={iniciarCancelacion}
              onVerEspacio={(espacioId) => navigate(`/espacios/${espacioId}`)}
            />
          ))}
        </div>
      </div>

      {/* ---------- MODAL DE CONFIRMACIÓN DE CANCELACIÓN (CON TRANSICIONES) ---------- */}
      <CancelacionModal
        visible={modalVisible}
        reserva={reservaParaCancelar}
        procesandoId={procesandoId}
        onConfirmar={ejecutarCancelacion}
        onCancelar={cerrarModal}
      />
    </div>
  );
}