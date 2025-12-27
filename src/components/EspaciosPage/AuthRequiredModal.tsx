import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalContent = ({ onClose }: { onClose: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Bloquear el scroll del body cuando el modal está abierto
  useEffect(() => {
    const root = document.documentElement;
    const originalOverflow = root.style.overflow;
    const originalPaddingRight = root.style.paddingRight;

    // Calcular el ancho de la barra de scroll y aplicarlo como padding
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    root.style.overflow = "hidden";
    root.style.paddingRight = `${scrollbarWidth}px`;

    // Al cerrar el modal, restauramos los estilos originales
    return () => {
      root.style.overflow = originalOverflow;
      root.style.paddingRight = originalPaddingRight;
    };
  }, []); // El array vacío asegura que se ejecute solo al montar/desmontar

  const handleLogin = () => {
    onClose();
    // Guardamos la ubicación actual en el estado para volver después
    navigate("/login", { state: { from: location } });
  };

  const handleRegister = () => {
    onClose();
    navigate("/registro", { state: { from: location } });
  };

  return (
    <>
      {/* 1. BACKDROP (Fondo Oscuro) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 2. EL MODAL (La Tarjeta) */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300,
            mass: 0.5
          }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 dark:border-slate-800 text-center relative pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >

          {/* --- CONTENIDO DEL MODAL --- */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 mb-4">
            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            ¿Quieres ver más?
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Necesitas identificarte para acceder a tu perfil, reservas y funciones avanzadas.
          </p>

          <div className="grid gap-3">
            <button onClick={handleLogin} className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20">Iniciar Sesión</button>
            <button onClick={onClose} className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors">Quizás más tarde</button>
          </div>

          <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            ¿Primera vez en Lugary?{" "}
            <button
              onClick={handleRegister}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors focus:outline-none"
            >
              Créate una cuenta gratis
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default function AuthRequiredModal({ isOpen, onClose }: AuthRequiredModalProps) {
  return (
    <AnimatePresence>
      {isOpen && <ModalContent onClose={onClose} />}
    </AnimatePresence>
  );
}
