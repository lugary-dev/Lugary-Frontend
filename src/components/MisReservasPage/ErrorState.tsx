/**
 * ErrorState.tsx
 *
 * Componente para mostrar errores cuando falla la carga de reservas.
 *
 * @component
 * @example
 * <ErrorState 
 *   mensaje="Error al cargar reservas" 
 *   onReitentar={handleReintentar}
 * />
 */

interface ErrorStateProps {
  mensaje: string;
  onReintentar: () => void;
}

/**
 * ErrorState - Muestra mensaje de error con botón de reintento
 */
export default function ErrorState({ mensaje, onReintentar }: ErrorStateProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 shadow-lg rounded-2xl p-6 max-w-md w-full border border-slate-100 dark:border-slate-800 text-center">
        {/* Icono de error */}
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8.25v4.5m0 4.5v.75m0 0a6 6 0 1 1 0-12 6 6 0 0 1 0 12z"
              />
            </svg>
          </div>
        </div>

        {/* Mensaje de error */}
        <p className="text-red-600 dark:text-red-400 font-medium mb-3">
          {mensaje}
        </p>

        {/* Botón de reintento */}
        <button
          onClick={onReintentar}
          className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
