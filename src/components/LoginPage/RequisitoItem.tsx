/**
 * RequisitoItem.tsx
 * Componente visual para mostrar el estado de un requisito de contraseña.
 * Se utiliza en el formulario de registro para validar seguridad.
 */

interface Props {
  /** Si el requisito se cumple */
  cumplido: boolean;
  /** Descripción del requisito (ej: "Mínimo 8 caracteres") */
  texto: string;
}

/**
 * RequisitoItem
 * Muestra un indicador visual (punto) del estado de un requisito.
 * Color verde cuando se cumple, gris cuando no.
 */
export default function RequisitoItem({ cumplido, texto }: Props) {
  return (
    <div
      className={`flex items-center gap-2 text-xs transition-colors ${
        cumplido
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-slate-400 dark:text-slate-500"
      }`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full ${
          cumplido
            ? "bg-emerald-500"
            : "bg-slate-300 dark:bg-slate-600"
        }`}
      />
      {texto}
    </div>
  );
}
