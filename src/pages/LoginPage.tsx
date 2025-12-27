import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import logoImg from "../images/Logo.png";
import LoginForm from "../components/LoginPage/LoginForm";
import RegisterForm from "../components/LoginPage/RegisterForm";
import ForgotPasswordForm from "../components/LoginPage/ForgotPasswordForm";
import TermsModal from "../components/LoginPage/TermsModal";

const backgroundImages = [
  "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2070&auto=format&fit=crop", // Camping / Naturaleza
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2074&auto=format&fit=crop", // Salón elegante
];

/**
 * LoginPage - Página principal de autenticación
 * 
 * Componente contenedor que gestiona:
 * - Rotación de imágenes de fondo
 * - Cambio de vistas (login/registro/recuperación)
 * - Modal de términos y condiciones
 * - Layout responsivo (split desktop, stack mobile)
 */
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