/**
 * ForgotPasswordForm.tsx
 * Formulario para recuperación de contraseña.
 * Envía un email con enlace de recuperación (simulado).
 */

import { useState, type FormEvent } from "react";
import logoImg from "../../images/Logo.png";

interface Props {
  /** Callback para cambiar a vista de login */
  onSwitchToLogin: () => void;
}

/**
 * ForgotPasswordForm - Formulario para recuperar contraseña
 *
 * Características:
 * - Campo de email para identificar la cuenta
 * - Mensajes de éxito/error diferenciados
 * - Simulación de envío de email (1.5s)
 * - Vínculo de retorno a login
 */
export default function ForgotPasswordForm({ onSwitchToLogin }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    // Simulación de llamada a la API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (email === "error@ejemplo.com") {
      setErrorMessage("No se encontró una cuenta con ese email.");
    } else {
      setSuccessMessage(
        "Si tu email está registrado, recibirás un enlace para recuperar tu contraseña."
      );
    }

    setLoading(false);
  };

  return (
    <div className="p-6 sm:p-8">
      {/* Encabezado */}
      <div className="text-center mb-6">
        <img
          src={logoImg}
          alt="Lugary"
          className="h-10 mx-auto mb-4 object-contain lg:hidden"
        />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Recuperar Contraseña
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Ingresá tu email y te enviaremos un enlace para recuperarla.
        </p>
      </div>

      {/* Mensajes */}
      {errorMessage && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm px-4 py-3">
          {successMessage}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo Email */}
        <div>
          <label
            htmlFor="forgot-email"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Correo electrónico
          </label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            placeholder="nombre@ejemplo.com"
          />
        </div>

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={loading || !!successMessage}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Enviando...
            </>
          ) : (
            "Enviar enlace"
          )}
        </button>
      </form>

      {/* Link a Login */}
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        ¿Recordaste tu contraseña?{" "}
        <button
          onClick={onSwitchToLogin}
          className="font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
        >
          Volver a Iniciar Sesión
        </button>
      </p>
    </div>
  );
}
