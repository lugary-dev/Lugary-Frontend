/**
 * LoadingState.tsx
 *
 * Componente para mostrar el estado de carga mientras se obtienen las reservas.
 *
 * @component
 * @example
 * <LoadingState />
 */

/**
 * LoadingState - Spinner de carga con mensaje
 */
export default function LoadingState() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner animado */}
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />

        {/* Texto */}
        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
          Cargando tus reservas...
        </p>
      </div>
    </div>
  );
}
