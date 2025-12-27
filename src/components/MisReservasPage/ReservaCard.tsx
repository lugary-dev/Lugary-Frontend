/**
 * ReservaCard.tsx
 *
 * Componente de tarjeta individual para mostrar los detalles de una reserva.
 * Muestra foto del espacio, información de fechas, estado, precio y acciones.
 *
 * @component
 * @example
 * <ReservaCard
 *   reserva={reserva}
 *   procesandoId={5}
 *   onCancelar={handleCancelacion}
 *   onVerEspacio={handleVerEspacio}
 * />
 */

interface Reserva {
  id: number;
  espacioId: number;
  nombreEspacio?: string;
  direccionEspacio?: string;
  imagenUrlEspacio?: string;
  precioTotal?: number;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}

interface ReservaCardProps {
  reserva: Reserva;
  procesandoId: number | null;
  onCancelar: (reserva: Reserva) => void;
  onVerEspacio: (espacioId: number) => void;
}

/**
 * Formatea una fecha ISO a formato legible: "15 ene • 14:30 hs"
 */
const formatearFechaDetallada = (iso: string): string => {
  if (!iso) return "";
  const fecha = new Date(iso);
  if (isNaN(fecha.getTime())) return iso;

  const fechaStr = fecha.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
  const horaStr = fecha.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${fechaStr.replace(".", "")} • ${horaStr} hs`;
};

/**
 * Determina clases CSS y texto del badge según el estado de la reserva
 */
const getEstadoBadgeClasses = (
  estado: string
): { classes: string; texto: string; dotColor: string } => {
  const estadoUpper = estado.toUpperCase();
  const esConfirmada = estadoUpper === "CONFIRMADA";
  const esPendiente = estadoUpper === "PENDIENTE";

  return {
    classes: esConfirmada
      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
      : esPendiente
      ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
    texto: esConfirmada ? "Confirmada" : esPendiente ? "Pendiente" : estado,
    dotColor: esConfirmada ? "bg-emerald-500" : esPendiente ? "bg-amber-500" : "bg-slate-500",
  };
};

/**
 * ReservaCard - Renderiza una tarjeta de reserva con todos sus detalles
 */
export default function ReservaCard({
  reserva,
  procesandoId,
  onCancelar,
  onVerEspacio,
}: ReservaCardProps) {
  const { classes, texto, dotColor } = getEstadoBadgeClasses(reserva.estado);

  return (
    <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow flex flex-col sm:flex-row gap-4 p-4">
      {/* Foto del espacio */}
      <div className="w-full sm:w-32 md:w-40 h-40 sm:h-auto flex-shrink-0">
        <img
          src={
            reserva.imagenUrlEspacio ||
            "https://images.unsplash.com/photo-1613977257363-31b5a15e589d?q=80&w=2070&auto=format&fit=crop"
          }
          alt={`Foto de ${reserva.nombreEspacio}`}
          className="w-full h-full object-cover rounded-xl"
        />
      </div>

      {/* Información principal */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            {/* Badge de estado */}
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${classes}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
              {texto}
            </span>

            {/* Nombre del espacio */}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {reserva.nombreEspacio ?? "Espacio reservado"}
            </h3>

            {/* Dirección */}
            <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1.5 mt-1">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {reserva.direccionEspacio ?? "Dirección no disponible"}
            </p>
          </div>
        </div>

        {/* Separador */}
        <div className="my-3 border-t border-slate-100 dark:border-slate-800"></div>

        {/* Fechas de entrada y salida */}
        <div className="flex gap-6 text-sm mt-4">
          <div>
            <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider font-semibold">
              Llegada
            </p>
            <p className="font-medium text-slate-700 dark:text-slate-200">
              {formatearFechaDetallada(reserva.fechaInicio)}
            </p>
          </div>
          <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
          <div>
            <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider font-semibold">
              Salida
            </p>
            <p className="font-medium text-slate-700 dark:text-slate-200">
              {formatearFechaDetallada(reserva.fechaFin)}
            </p>
          </div>
        </div>

        {/* Precio y acciones */}
        <div className="mt-auto pt-3">
          {reserva.precioTotal != null && (
            <div className="text-right mb-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                ${reserva.precioTotal.toLocaleString("es-AR")}
              </p>
            </div>
          )}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={procesandoId === reserva.id}
              onClick={() => onCancelar(reserva)}
              className="text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {procesandoId === reserva.id ? "Cancelando..." : "Cancelar"}
            </button>
            <button
              onClick={() => onVerEspacio(reserva.espacioId)}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
            >
              Ver Espacio
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
