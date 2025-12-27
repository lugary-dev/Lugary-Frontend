/**
 * CancelacionModal.tsx
 *
 * Modal de confirmación para cancelar una reserva.
 * Incluye animaciones de entrada/salida con transitions de Tailwind.
 *
 * @component
 * @example
 * <CancelacionModal
 *   visible={true}
 *   reserva={reserva}
 *   procesandoId={5}
 *   onConfirmar={handleConfirmar}
 *   onCancelar={handleCancelar}
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

interface CancelacionModalProps {
  visible: boolean;
  reserva: Reserva | null;
  procesandoId: number | null;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/**
 * CancelacionModal - Modal de confirmación con animaciones
 */
export default function CancelacionModal({
  visible,
  reserva,
  procesandoId,
  onConfirmar,
  onCancelar,
}: CancelacionModalProps) {
  if (!reserva) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out
        ${visible ? "bg-black/60 backdrop-blur-sm" : "bg-black/0 backdrop-blur-none"}`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full m-4 border border-slate-200 dark:border-slate-800 transform transition-all duration-300 ease-out
          ${visible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        <div className="p-6 text-center">
          {/* Icono de advertencia */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
              />
            </svg>
          </div>

          {/* Título */}
          <h3
            className="mt-4 text-lg font-semibold text-slate-900 dark:text-white"
            id="modal-title"
          >
            Confirmar cancelación
          </h3>

          {/* Descripción */}
          <div className="mt-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              ¿Estás seguro de que querés cancelar la reserva para{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                {reserva.nombreEspacio ?? "este espacio"}
              </strong>
              ?
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl">
          {/* Botón Confirmar */}
          <button
            type="button"
            disabled={procesandoId !== null}
            onClick={onConfirmar}
            className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-wait dark:focus:ring-offset-slate-900 transition-colors"
          >
            {procesandoId === reserva.id ? "Cancelando..." : "Sí, cancelar"}
          </button>

          {/* Botón Volver */}
          <button
            type="button"
            disabled={procesandoId !== null}
            onClick={onCancelar}
            className="mt-3 inline-flex w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-base font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600 dark:focus:ring-offset-slate-900 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}
