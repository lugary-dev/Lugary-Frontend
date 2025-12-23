import { useState, type FormEvent, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import api from "../api/client";
import axios from "axios";

// --- Iconos (iguales) ---
const EyeIcon = ({ show }: { show: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-500">
    {show ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /> : <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>}
  </svg>
);

const ShieldCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-emerald-600 mr-2">
    <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
);

interface RegistroResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
}

interface LoginResponse {
  token: string;
  tokenType: string;
  email: string;
  rol: string;
  userId: number;
}

export default function RegistroPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  // Estados para validación visual de contraseña
  const [reqLength, setReqLength] = useState(false);
  const [reqNumber, setReqNumber] = useState(false);
  const [reqSpecial, setReqSpecial] = useState(false);
  const [reqUpper, setReqUpper] = useState(false);

  // Validar contraseña en tiempo real
  useEffect(() => {
    setReqLength(password.length >= 8);
    setReqNumber(/\d/.test(password));
    setReqSpecial(/[!@#$%^&*(),.?":{}|<>]/.test(password));
    setReqUpper(/[A-Z]/.test(password));
  }, [password]);

  const esContrasenaValida = () => reqLength && reqNumber && reqSpecial && reqUpper;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMensaje(null);

    if (!nombre.trim() || !apellido.trim()) {
      setErrorMensaje("Nombre y apellido son obligatorios.");
      return;
    }

    if (!esContrasenaValida()) {
      setErrorMensaje("La contraseña no cumple con los requisitos de seguridad.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMensaje("Las contraseñas no coinciden.");
      return;
    }

    if (!aceptaTerminos) {
      setErrorMensaje("Debe aceptar los términos y condiciones para continuar.");
      return;
    }

    setLoading(true);

    try {
      // 1) Crear usuario
      await api.post<RegistroResponse>("/usuarios", {
        nombre,
        apellido,
        email,
        password,
      });

      // 2) Auto-login con las mismas credenciales
      // 2) Auto-login
      const loginResponse = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      const { token, email: emailUsuario, rol, userId } = loginResponse.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", emailUsuario);
      localStorage.setItem("userRol", rol);
      localStorage.setItem("userId", String(userId));

      // Redirigir a la página anterior o al inicio si no hay historial
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const mensajeBackend =
          (error.response?.data as { message?: string })?.message;
        setErrorMensaje(mensajeBackend || "No se pudo crear la cuenta.");
      } else {
        setErrorMensaje("Se produjo un error inesperado al registrar la cuenta.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Componente pequeño para los items de requisitos
  const RequisitoItem = ({ cumplido, texto }: { cumplido: boolean; texto: string }) => (
    <div className={`flex items-center gap-2 text-xs transition-colors ${cumplido ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${cumplido ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`} />
      {texto}
    </div>
  );

  return (
    <div className="min-h-screen flex w-full">
      {/* Columna izquierda */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative">
        <img
          src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop"
          alt="Personas celebrando"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>

        <div className="absolute bottom-0 left-0 p-12 text-white z-10 w-full">
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Empezá a publicar y reservar hoy.
          </h2>
          <p className="text-lg text-slate-200 max-w-md">
            Gestión segura y simple para tus eventos.
          </p>
        </div>
      </div>

      {/* Columna derecha */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white dark:bg-slate-950 px-8 md:px-16 lg:px-24 transition-colors duration-300">
        <div className="w-full max-w-md py-8">
          <div className="text-center mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-blue-900 dark:text-blue-500 mx-auto mb-4 opacity-90">
              <path fillRule="evenodd" d="M11.47 1.72a.75.75 0 011.06 0l8.25 8.25a.75.75 0 01-1.06 1.06L18 9.31V19.5A2.25 2.25 0 0115.75 21.75h-7.5A2.25 2.25 0 016 19.5V9.31L4.28 11.03a.75.75 0 01-1.06-1.06l8.25-8.25z" clipRule="evenodd" />
            </svg>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Crear una cuenta</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Unite a la plataforma.</p>
          </div>

          {errorMensaje && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 flex items-center animate-pulse">
              {errorMensaje}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
                <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm transition-all" placeholder="Enzo" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Apellido</label>
                <input type="text" required value={apellido} onChange={(e) => setApellido(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm transition-all" placeholder="Fernández" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm transition-all" placeholder="nombre@ejemplo.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-lg border ${!esContrasenaValida() && password.length > 0 ? 'border-amber-400 focus:ring-amber-400' : 'border-slate-300 dark:border-slate-700 focus:ring-blue-600'} bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 text-sm pr-10 transition-all`}
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
              
              {/* Checklist de requisitos de contraseña */}
              <div className="mt-2 grid grid-cols-2 gap-1 px-1">
                <RequisitoItem cumplido={reqLength} texto="Mínimo 8 caracteres" />
                <RequisitoItem cumplido={reqNumber} texto="Al menos un número" />
                <RequisitoItem cumplido={reqUpper} texto="Una mayúscula" />
                <RequisitoItem cumplido={reqSpecial} texto="Un carácter especial" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirmar contraseña</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showPassword2 ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full rounded-lg border ${password !== confirmPassword && confirmPassword.length > 0 ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm pr-10 transition-all`}
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

            <div className="flex items-start">
              <input id="terminos" type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} />
              <label htmlFor="terminos" className="ml-2 text-xs text-slate-600 dark:text-slate-400">
                Acepto los{" "}
                <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  Términos y condiciones
                </span>{" "}
                y la política de privacidad.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {loading ? (
                <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Creando cuenta...</>
              ) : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            ¿Ya tenés una cuenta?{" "}
            <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Iniciá sesión
            </Link>
          </p>

          <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center opacity-80">
            <ShieldCheckIcon />
            <p className="text-xs text-slate-500 dark:text-slate-500 max-w-[220px] leading-tight">Tus datos se almacenan de forma segura.</p>
          </div>
        </div>
      </div>
    </div>
  );
}