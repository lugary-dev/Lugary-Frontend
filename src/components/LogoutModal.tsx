import type { FC } from "react";
import { LuLogOut, LuTriangleAlert } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollLock } from "../hooks/useScrollLock"; // <--- 1. Importar el hook

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  
  // 2. Usar el hook: Bloquea el scroll cuando el modal está abierto
  useScrollLock(isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                <LuTriangleAlert className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                ¿Cerrar sesión?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Tendrás que volver a ingresar tus datos para acceder a tu cuenta.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                >
                  <LuLogOut className="w-4 h-4" />
                  Salir
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LogoutModal;