/**
 * EmptyState.tsx
 *
 * Componente para mostrar el estado vacío cuando no hay reservas activas.
 *
 * @component
 * @example
 * <EmptyState />
 */

/**
 * EmptyState - Muestra mensaje amigable cuando no hay reservas
 */
export default function EmptyState() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center flex flex-col items-center">
      {/* Icono de calendario */}
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

      {/* Texto principal */}
      <p className="text-slate-600 dark:text-slate-400 font-medium">
        Aún no tenés reservas activas.
      </p>

      {/* Subtexto */}
      <p className="text-slate-400 dark:text-slate-500 text-sm mt-1 mb-4">
        Cuando reserves un espacio, aparecerá listado en esta sección.
      </p>
    </div>
  );
}
