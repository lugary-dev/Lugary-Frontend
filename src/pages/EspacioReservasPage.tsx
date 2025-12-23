import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";

interface ReservaEspacio {
  id: number;
  usuarioId: number;
  nombreUsuario: string;
  emailUsuario: string;
  fechaInicio: string;
  fechaFin: string;
  estado: "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | string;
}

interface EspacioResumen {
  id: number;
  nombre: string;
  direccion: string;
}

/**
 * Pantalla para que el propietario vea las reservas asociadas
 * a uno de sus espacios.
 */
export default function EspacioReservasPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [reservas, setReservas] = useState<ReservaEspacio[]>([]);
  const [espacio, setEspacio] = useState<EspacioResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const userIdString = localStorage.getItem("userId");
  const usuarioId = userIdString ? Number(userIdString) : null;

  const formatearFechaHora = (valor: string) => {
    if (!valor) return "";
    const fecha = new Date(valor);
    if (isNaN(fecha.getTime())) return valor;
    return fecha.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getClaseEstado = (estado: string): string => {
    switch (estado) {
      case "CONFIRMADA":
        return "bg-emerald-100 text-emerald-800";
      case "CANCELADA":
        return "bg-red-100 text-red-800";
      case "PENDIENTE":
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  useEffect(() => {
    const cargar = async () => {
      if (!id) {
        setErrorMensaje("No se especificó el espacio.");
        setLoading(false);
        return;
      }

      if (!usuarioId) {
        setErrorMensaje("Debe iniciar sesión nuevamente.");
        setLoading(false);
        return;
      }

      try {
        // Cargar resumen del espacio (para encabezado)
        const espacioResponse = await api.get<EspacioResumen>(`/espacios/${id}`);
        setEspacio(espacioResponse.data);

        // Cargar reservas del espacio
        const reservasResponse = await api.get<ReservaEspacio[]>(
          `/reservas/espacio/${id}`,
          {
            params: { usuarioId },
          }
        );
        setReservas(reservasResponse.data);
      } catch (error: any) {
        const status = error?.response?.status;
        const message =
          error?.response?.data?.message ||
          "No fue posible obtener las reservas del espacio.";

        if (status === 403) {
          setErrorMensaje("No tiene permisos para ver las reservas de este espacio.");
        } else if (status === 404) {
          setErrorMensaje("El espacio solicitado no existe.");
        } else {
          setErrorMensaje(message);
        }
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [id, usuarioId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p className="text-lg">Cargando reservas del espacio...</p>
      </div>
    );
  }

  if (errorMensaje) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl p-6 text-center">
          <h1 className="text-xl font-semibold mb-2">
            No se pudieron cargar las reservas
          </h1>
          <p className="text-sm text-slate-300 mb-4">{errorMensaje}</p>
          <button
            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-900 text-sm font-semibold hover:bg-white"
            onClick={() => navigate("/mis-espacios")}
          >
            Volver a mis espacios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              Reservas del espacio
            </h1>
            {espacio && (
              <p className="text-xs text-slate-400">
                {espacio.nombre} · {espacio.direccion}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              className="rounded-full border border-slate-700 px-3 py-1 hover:bg-slate-800"
              onClick={() => navigate("/mis-espacios")}
            >
              Mis espacios
            </button>
            {espacio && (
              <button
                className="rounded-full border border-slate-700 px-3 py-1 hover:bg-slate-800"
                onClick={() => navigate(`/espacios/${espacio.id}`)}
              >
                Ver espacio
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6">
        {reservas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-6 text-center text-slate-300 text-sm">
            <p className="mb-2">
              Este espacio todavía no tiene reservas registradas.
            </p>
            <p>
              Cuando los usuarios reserven este espacio, las reservas aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reservas.map((reserva) => (
              <article
                key={reserva.id}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    {reserva.nombreUsuario}
                  </p>
                  <p className="text-xs text-slate-400">
                    {reserva.emailUsuario}
                  </p>
                  <p className="text-xs text-slate-300 mt-2">
                    Desde:{" "}
                    <span className="font-medium">
                      {formatearFechaHora(reserva.fechaInicio)}
                    </span>
                  </p>
                  <p className="text-xs text-slate-300">
                    Hasta:{" "}
                    <span className="font-medium">
                      {formatearFechaHora(reserva.fechaFin)}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 text-xs">
                  <span
                    className={
                      "px-3 py-1 rounded-full font-semibold " +
                      getClaseEstado(reserva.estado)
                    }
                  >
                    {reserva.estado}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}