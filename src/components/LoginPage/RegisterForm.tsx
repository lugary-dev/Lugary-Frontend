/**
 * RegisterForm.tsx
 * Formulario completo de registro con validación de contraseña.
 * Incluye requisitos de seguridad visuales en tiempo real.
 */

import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/client";
import axios from "axios";
import logoImg from "../../images/Logo.png";
import { EyeIcon, ShieldCheckIcon } from "./Icons";
import RequisitoItem from "./RequisitoItem";

interface LoginResponse {
  token: string;
  tokenType: string;
  email: string;
  rol: string;
  userId: number;
}

interface Props {
  /** Callback para cambiar a vista de login */
  onSwitchToLogin: () => void;
  /** Callback para abrir modal de términos y condiciones */
  onOpenTerms: () => void;
}

/**
 * RegisterForm - Formulario de registro de nuevos usuarios
 *
 * Características:
 * - Validación de contraseña en tiempo real (requisitos mínimos)
 * - Confirmación de contraseña
 * - Aceptación obligatoria de T&C
 * - Creación de usuario y login automático
 * - Manejo de errores desde backend
 * - Redirección post-registro
 */
export default function RegisterForm({ onSwitchToLogin, onOpenTerms }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  // Estado del formulario
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  // Estado de visibilidad de contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  // Requisitos de contraseña
  const [reqLength, setReqLength] = useState(false);
  const [reqNumber, setReqNumber] = useState(false);
  const [reqSpecial, setReqSpecial] = useState(false);
  const [reqUpper, setReqUpper] = useState(false);

  // Estado UI
  const [loading, setLoading] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  /**
   * Efecto que valida los requisitos de contraseña en tiempo real
   */
  useEffect(() => {
    setReqLength(password.length >= 8);
    setReqNumber(/\d/.test(password));
    setReqSpecial(/[!@#$%^&*(),.?":{}|<>]/.test(password));
    setReqUpper(/[A-Z]/.test(password));
  }, [password]);

  /**
   * Verifica si la contraseña cumple todos los requisitos
   */
  const esContrasenaValida = () =>
    reqLength && reqNumber && reqSpecial && reqUpper;

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMensaje(null);

    // Validaciones previas
    if (!nombre.trim() || !apellido.trim()) {
      setErrorMensaje("Nombre y apellido son obligatorios.");
      return;
    }
    if (!esContrasenaValida()) {
      setErrorMensaje(
        "La contraseña no cumple con los requisitos de seguridad."
      );
      return;
    }
    if (password !== confirmPassword) {
      setErrorMensaje("Las contraseñas no coinciden.");
      return;
    }
    if (!aceptaTerminos) {
      setErrorMensaje(
        "Debe aceptar los términos y condiciones para continuar."
      );
      return;
    }

    setLoading(true);

    try {
      // Crear usuario
      await api.post("/usuarios", { nombre, apellido, email, password });

      // Login automático
      const loginResponse = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });
      const { token, email: emailUsuario, rol, userId } = loginResponse.data;

      // Almacenar credenciales
      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", emailUsuario);
      localStorage.setItem("userRol", rol);
      localStorage.setItem("userId", String(userId));

      // Redirigir
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const mensajeBackend = (error.response?.data as { message?: string })
          ?.message;
        setErrorMensaje(mensajeBackend || "No se pudo crear la cuenta.");
      } else {
        setErrorMensaje(
          "Se produjo un error inesperado al registrar la cuenta."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      {/* Encabezado */}
      <div className="text-center mb-4">
        <img
          src={logoImg}
          alt="Lugary"
          className="h-10 mx-auto mb-4 object-contain lg:hidden"
        />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Crear una cuenta
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Unite a la plataforma.
        </p>
      </div>

      {/* Mensaje de error */}
      {errorMensaje && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 flex items-center">
          {errorMensaje}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Nombre y Apellido (Grid) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nombre
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm transition-all"
              placeholder="Enzo"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Apellido
            </label>
            <input
              type="text"
              required
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm transition-all"
              placeholder="Fernández"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm transition-all"
            placeholder="nombre@ejemplo.com"
          />
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full rounded-lg border ${
                !esContrasenaValida() && password.length > 0
                  ? "border-amber-400 focus:ring-amber-400"
                  : "border-slate-300 dark:border-slate-700 focus:ring-blue-600"
              } bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 text-sm pr-10 transition-all`}
              placeholder="Creá tu contraseña"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <EyeIcon show={showPassword} />
            </button>
          </div>

          {/* Requisitos de contraseña */}
          <div className="mt-2 grid grid-cols-2 gap-1 px-1">
            <RequisitoItem cumplido={reqLength} texto="Mínimo 8 caracteres" />
            <RequisitoItem cumplido={reqNumber} texto="Al menos un número" />
            <RequisitoItem cumplido={reqUpper} texto="Una mayúscula" />
            <RequisitoItem
              cumplido={reqSpecial}
              texto="Un carácter especial"
            />
          </div>
        </div>

        {/* Confirmar Contraseña */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Confirmar contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword2 ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full rounded-lg border ${
                password !== confirmPassword && confirmPassword.length > 0
                  ? "border-red-500"
                  : "border-slate-300 dark:border-slate-700"
              } bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm pr-10 transition-all`}
              placeholder="Repetí tu contraseña"
            />
            <button
              type="button"
              onClick={() => setShowPassword2(!showPassword2)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <EyeIcon show={showPassword2} />
            </button>
          </div>
        </div>

        {/* Términos y Condiciones */}
        <div className="flex items-start">
          <input
            id="terminos"
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            checked={aceptaTerminos}
            onChange={(e) => setAceptaTerminos(e.target.checked)}
          />
          <label
            htmlFor="terminos"
            className="ml-2 text-xs text-slate-600 dark:text-slate-400"
          >
            Acepto los{" "}
            <button
              type="button"
              onClick={onOpenTerms}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Términos y Condiciones
            </button>
            .
          </label>
        </div>

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center text-sm"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
              Creando...
            </>
          ) : (
            "Crear cuenta"
          )}
        </button>
      </form>

      {/* Link a Login */}
      <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
        ¿Ya tenés una cuenta?{" "}
        <button
          onClick={onSwitchToLogin}
          className="font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
        >
          Iniciá sesión
        </button>
      </p>

      {/* Aviso de Seguridad */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center opacity-80">
        <ShieldCheckIcon />
        <p className="text-xs text-slate-500 dark:text-slate-500 max-w-[220px] leading-tight">
          Tus datos se almacenan de forma segura.
        </p>
      </div>
    </div>
  );
}
