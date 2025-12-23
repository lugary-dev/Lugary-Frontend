import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import api from "../api/client";
import axios from "axios";
import logoImg from "../images/Logo.png";

// --- ICONOS ---
const EyeIcon = ({ show }: { show: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-500 dark:text-slate-400">
    {show ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /> : <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>}
  </svg>
);

const GoogleIcon = () => (
  <svg className="h-5 w-5 mr-2" aria-hidden="true" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-emerald-600 mr-2">
    <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
);

const RequisitoItem = ({ cumplido, texto }: { cumplido: boolean; texto: string }) => (
  <div className={`flex items-center gap-2 text-xs transition-colors ${cumplido ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`}>
    <div className={`w-1.5 h-1.5 rounded-full ${cumplido ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`} />
    {texto}
  </div>
);

const backgroundImages = [
  "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2070&auto=format&fit=crop", // Camping / Naturaleza
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2074&auto=format&fit=crop", // Salón elegante
];

// --- TIPOS ---
interface LoginResponse {
  token: string;
  tokenType: string;
  email: string;
  rol: string;
  userId: number;
}

// --- COMPONENTES INTERNOS ---

// 1. FORMULARIO DE LOGIN
const LoginForm = ({ onSwitchToRegister, onSwitchToForgotPassword }: { onSwitchToRegister: () => void; onSwitchToForgotPassword: () => void; }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (val: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val)) {
      setEmailError("Ingresá un email válido.");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (emailError) return;

    setLoading(true);
    setErrorMensaje(null);

    try {
      const response = await api.post<LoginResponse>("/auth/login", { email, password });
      const { token, email: emailUsuario, rol, userId } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", emailUsuario);
      localStorage.setItem("userRol", rol);
      localStorage.setItem("userId", String(userId));

      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const mensajeBackend =
          (error.response?.data as { message?: string })?.message;
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
      <div className="text-center mb-6">
        <img src={logoImg} alt="Lugary" className="h-10 mx-auto mb-4 object-contain lg:hidden" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">¡Hola de nuevo!</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Ingresá a la comunidad de eventos más segura.</p>
          </div>

          {errorMensaje && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 flex items-center">
              {errorMensaje}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Correo electrónico</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); validateEmail(e.target.value); }}
                onBlur={() => validateEmail(email)}
                className={`w-full px-4 py-3 rounded-xl border ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-600'} bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                placeholder="nombre@ejemplo.com"
              />
              {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Contraseña</label>
            <button type="button" onClick={onSwitchToForgotPassword} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">¿Olvidaste tu contraseña?</button>
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

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 dark:text-slate-400">
                Recordarme en este dispositivo
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !!emailError}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Iniciando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

          <div className="relative mt-8 mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">O continuá con</span>
            </div>
          </div>
          
          <button 
            type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-slate-700 dark:text-slate-200"
          >
            <GoogleIcon />
            Continuar con Google
          </button>
          
          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            ¿No tenés una cuenta?{" "}
            <button onClick={onSwitchToRegister} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors">
              Registrate acá
            </button>
          </p>
    </div>
  );
};

// 2. FORMULARIO DE REGISTRO
const RegisterForm = ({ onSwitchToLogin, onOpenTerms }: { onSwitchToLogin: () => void; onOpenTerms: () => void; }) => {
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

  const [reqLength, setReqLength] = useState(false);
  const [reqNumber, setReqNumber] = useState(false);
  const [reqSpecial, setReqSpecial] = useState(false);
  const [reqUpper, setReqUpper] = useState(false);

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

    if (!nombre.trim() || !apellido.trim()) { setErrorMensaje("Nombre y apellido son obligatorios."); return; }
    if (!esContrasenaValida()) { setErrorMensaje("La contraseña no cumple con los requisitos de seguridad."); return; }
    if (password !== confirmPassword) { setErrorMensaje("Las contraseñas no coinciden."); return; }
    if (!aceptaTerminos) { setErrorMensaje("Debe aceptar los términos y condiciones para continuar."); return; }

    setLoading(true);

    try {
      await api.post("/usuarios", { nombre, apellido, email, password });
      const loginResponse = await api.post<LoginResponse>("/auth/login", { email, password });
      const { token, email: emailUsuario, rol, userId } = loginResponse.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", emailUsuario);
      localStorage.setItem("userRol", rol);
      localStorage.setItem("userId", String(userId));

      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const mensajeBackend = (error.response?.data as { message?: string })?.message;
        setErrorMensaje(mensajeBackend || "No se pudo crear la cuenta.");
      } else {
        setErrorMensaje("Se produjo un error inesperado al registrar la cuenta.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="text-center mb-4">
        <img src={logoImg} alt="Lugary" className="h-10 mx-auto mb-4 object-contain lg:hidden" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Crear una cuenta</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Unite a la plataforma.</p>
      </div>

      {errorMensaje && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 flex items-center">
          {errorMensaje}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
            <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm transition-all" placeholder="Enzo" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Apellido</label>
            <input type="text" required value={apellido} onChange={(e) => setApellido(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm transition-all" placeholder="Fernández" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm transition-all" placeholder="nombre@ejemplo.com" />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full rounded-lg border ${!esContrasenaValida() && password.length > 0 ? 'border-amber-400 focus:ring-amber-400' : 'border-slate-300 dark:border-slate-700 focus:ring-blue-600'} bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 text-sm pr-10 transition-all`}
              placeholder="Creá tu contraseña"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <EyeIcon show={showPassword} />
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1 px-1">
            <RequisitoItem cumplido={reqLength} texto="Mínimo 8 caracteres" />
            <RequisitoItem cumplido={reqNumber} texto="Al menos un número" />
            <RequisitoItem cumplido={reqUpper} texto="Una mayúscula" />
            <RequisitoItem cumplido={reqSpecial} texto="Un carácter especial" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Confirmar contraseña</label>
          <div className="relative">
            <input
              type={showPassword2 ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full rounded-lg border ${password !== confirmPassword && confirmPassword.length > 0 ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm pr-10 transition-all`}
              placeholder="Repetí tu contraseña"
            />
            <button type="button" onClick={() => setShowPassword2(!showPassword2)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <EyeIcon show={showPassword2} />
            </button>
          </div>
        </div>

        <div className="flex items-start">
          <input id="terminos" type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} />
          <label htmlFor="terminos" className="ml-2 text-xs text-slate-600 dark:text-slate-400">
            Acepto los <button type="button" onClick={onOpenTerms} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">Términos y Condiciones</button>.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center text-sm"
        >
          {loading ? <><svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Creando...</> : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
        ¿Ya tenés una cuenta?{" "}
        <button onClick={onSwitchToLogin} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors">
          Iniciá sesión
        </button>
      </p>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center opacity-80">
        <ShieldCheckIcon />
        <p className="text-xs text-slate-500 dark:text-slate-500 max-w-[220px] leading-tight">Tus datos se almacenan de forma segura.</p>
      </div>
    </div>
  );
};

// 3. FORMULARIO DE OLVIDÉ CONTRASEÑA
const ForgotPasswordForm = ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    // Simulación de llamada a la API
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (email === "error@ejemplo.com") {
      setErrorMessage("No se encontró una cuenta con ese email.");
    } else {
      setSuccessMessage("Si tu email está registrado, recibirás un enlace para recuperar tu contraseña.");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="text-center mb-6">
        <img src={logoImg} alt="Lugary" className="h-10 mx-auto mb-4 object-contain lg:hidden" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Recuperar Contraseña</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Ingresá tu email y te enviaremos un enlace para recuperarla.</p>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Correo electrónico</label>
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

        <button
          type="submit"
          disabled={loading || !!successMessage}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Enviando...
            </>
          ) : 'Enviar enlace'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        ¿Recordaste tu contraseña?{" "}
        <button onClick={onSwitchToLogin} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors">
          Volver a Iniciar Sesión
        </button>
      </p>
    </div>
  );
};

// 4. MODAL DE TÉRMINOS Y CONDICIONES
const TermsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Términos y Condiciones de Uso</h2>
              <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 sm:p-8 flex-grow overflow-y-auto prose prose-slate dark:prose-invert max-w-none">
              <p>Contenido de los términos y condiciones irá aquí. Por ahora, es un texto de relleno para visualizar el diseño y el scroll.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.</p>
              <h3>1. Aceptación de los Términos</h3>
              <p>Fusce pellentesque suscipit nibh. Integer vitae libero ac risus egestas placerat. Vestibulum commodo felis quis tortor. Ut aliquam sollicitudin leo. Cras iaculis ultricies nulla. Donec quis dui at dolor tempor interdum.</p>
            </div>
            <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 flex-shrink-0 flex justify-end">
              <button onClick={onClose} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all">Entendido</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- COMPONENTE PRINCIPAL (AUTH PAGE) ---
export default function LoginPage() {
  const [view, setView] = useState<"login" | "register" | "forgot-password">("login");
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000); // Cambia cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  // Configuración de la animación de la tarjeta
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" } }
  };

  return (
    <div className="h-screen relative flex overflow-hidden">
      
      {/* 1. IMAGEN DE FONDO (Background) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {backgroundImages.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img 
              src={img} 
              alt="Fondo Lugary" 
              className={`w-full h-full object-cover transition-transform duration-[8000ms] ease-linear ${
                index === currentImageIndex ? "scale-110" : "scale-100"
              }`}
            />
          </div>
        ))}
        {/* Capa oscura para contraste */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/60 backdrop-blur-[3px]"></div>
      </div>

      {/* 2. CONTENEDOR DIVIDIDO */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row h-full">
        
        {/* IZQUIERDA: Branding (Logo + Lema) */}
        <div className="hidden lg:flex w-full lg:w-1/2 flex-col justify-center px-12 xl:px-24 text-white">
          <img 
            src={logoImg} 
            alt="Lugary" 
            className="h-14 w-auto mb-12 object-contain self-start brightness-0 invert opacity-90" 
          />
          
          <div className="animate-in fade-in slide-in-from-left-6 duration-700">
            <h2 className="text-5xl font-extrabold mb-6 leading-tight tracking-tight">
              Encontrá tu <br/>
              <span className="text-blue-400">lugar ideal.</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-lg leading-relaxed font-light">
              Sin señas dudosas, sin sorpresas. La comunidad de alquileres de eventos más segura y verificada.
            </p>
          </div>
        </div>

        {/* DERECHA: Formulario (Card Flotante Animada) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <motion.div layout className="w-full max-w-md relative">
            <AnimatePresence mode="wait" initial={false}>
              {view === "login" && (
                <motion.div
                  key="login-card"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20"
                >
                  <LoginForm onSwitchToRegister={() => setView("register")} onSwitchToForgotPassword={() => setView("forgot-password")} />
                </motion.div>
              )}
              {view === "register" && (
                <motion.div
                  key="register-card"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20"
                >
                  <RegisterForm onSwitchToLogin={() => setView("login")} onOpenTerms={() => setIsTermsModalOpen(true)} />
                </motion.div>
              )}
              {view === "forgot-password" && (
                <motion.div
                  key="forgot-card"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20"
                >
                  <ForgotPasswordForm onSwitchToLogin={() => setView("login")} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
      <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
    </div>
  );
}