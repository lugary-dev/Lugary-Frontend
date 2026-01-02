/**
 * LoginForm.tsx
 * Formulario de inicio de sesión con validación de email.
 * Soporta login con email/contraseña y OAuth de Google.
 */

import { useState, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/client";
import axios from "axios";
import logoImg from "../../images/Logo.png";
import { EyeIcon, GoogleIcon, FacebookIcon } from "./Icons";

interface LoginResponse {
  token: string;
  tokenType: string;
  email: string;
  rol: string;
  userId: number;
  firstLogin: boolean; // [NUEVO] Campo añadido
}

interface Props {
  /** Callback para cambiar a vista de registro */
  onSwitchToRegister: () => void;
  /** Callback para cambiar a vista de recuperar contraseña */
  onSwitchToForgotPassword: () => void;
}

/**
 * LoginForm - Formulario de inicio de sesión
 * 
 * Características:
 * - Validación de formato de email en tiempo real
 * - Toggle para mostrar/ocultar contraseña
 * - Opción "Recordarme"
 * - Manejo de errores desde backend
 * - Redirección post-login
 * - OAuth con Google (botón placeholder)
 */
export default function LoginForm({
  onSwitchToRegister,
  onSwitchToForgotPassword,
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  // Estado del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Estado UI
  const [loading, setLoading] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [emailError, setEmailError] = useState("");

  /**
   * Valida el formato del email usando regex
   */
  const validateEmail = (val: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val)) {
      setEmailError("Ingresá un email válido.");
    } else {
      setEmailError("");
    }
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (emailError) return;

    setLoading(true);
    setErrorMensaje(null);

    try {
      const response = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });
      const { token, email: emailUsuario, rol, userId, firstLogin } = response.data;

      // Almacenar credenciales en localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", emailUsuario);
      localStorage.setItem("userRol", rol);
      localStorage.setItem("userId", String(userId));
      localStorage.setItem("firstLogin", String(firstLogin)); // [NUEVO] Guardar flag

      // Redirigir a página de origen o home
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const mensajeBackend = (error.response?.data as { message?: string })
          ?.message;
        setErrorMensaje(mensajeBackend || "Credenciales inválidas.");
      } else {
        setErrorMensaje("Se produjo un error inesperado. Intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          ¡Hola de nuevo!
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Ingresá a la comunidad de eventos más segura.
        </p>
      </div>

      {/* Mensaje de error */}
      {errorMensaje && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 flex items-center">
          {errorMensaje}
        </div>
      )}

      {/* Formulario principal */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Campo Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validateEmail(e.target.value);
            }}
            onBlur={() => validateEmail(email)}
            className={`w-full px-4 py-3 rounded-xl border ${
              emailError
                ? "border-red-500 focus:ring-red-500"
                : "border-slate-200 dark:border-slate-700 focus:ring-blue-600"
            } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
            placeholder="nombre@ejemplo.com"
          />
          {emailError && (
            <p className="mt-1 text-xs text-red-500">{emailError}</p>
          )}
        </div>

        {/* Campo Contraseña */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Contraseña
            </label>
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
            >
              <EyeIcon show={showPassword} />
            </button>
          </div>
        </div>

        {/* Checkbox "Recordarme" */}
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-slate-600 dark:text-slate-400"
          >
            Recordarme en este dispositivo
          </label>
        </div>

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={loading || !!emailError}
          className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
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
              Iniciando...
            </>
          ) : (
            "Iniciar Sesión"
          )}
        </button>
      </form>

      {/* Divisor "O continuá con" */}
      <div className="relative mt-8 mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
            O continuá con
          </span>
        </div>
      </div>

      {/* Botones OAuth */}
      <div className="space-y-3">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-slate-700 dark:text-slate-200"
        >
          <GoogleIcon />
          Continuar con Google
        </button>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-slate-700 dark:text-slate-200"
        >
          <FacebookIcon />
          Continuar con Facebook
        </button>
      </div>

      {/* Link a Registro */}
      <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
        ¿No tenés una cuenta?{" "}
        <button
          onClick={onSwitchToRegister}
          className="font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
        >
          Registrate acá
        </button>
      </p>
    </div>
  );
}
