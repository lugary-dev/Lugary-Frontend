import { useBlocker } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useScrollLock } from "../hooks/useScrollLock";

interface Props {
  isDirty: boolean;
  onSaveDraft?: () => Promise<boolean>;
}

export default function UnsavedChangesModal({ isDirty, onSaveDraft }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. PROTECCIÓN NATIVA (Refresh / Cerrar Pestaña)
  // Esto funciona en todos los navegadores y routers sin configuración extra.
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ""; // Requerido por Chrome
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // 2. PROTECCIÓN DE NAVEGACIÓN INTERNA (React Router)
  // Intercepta navegación (atrás, links, etc.) si el formulario está sucio
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [blocker.state]);

  // 3. EFECTO PARA CONTROLAR EL SCROLL DEL BODY
  // Usamos el hook personalizado que compensa el ancho de la barra
  useScrollLock(showModal);

  const handleStay = () => {
    if (blocker.state === "blocked") {
      blocker.reset(); // Cancela la navegación
    }
    setShowModal(false);
  };

  const handleDiscard = () => {
    if (blocker.state === "blocked") {
      blocker.proceed(); // Permite la navegación
    }
    setShowModal(false);
  };

  const handleSaveAndProceed = async () => {
    if (!onSaveDraft) return;
    
    setIsSaving(true);
    try {
      const success = await onSaveDraft();
      if (success && blocker.state === "blocked") {
        blocker.proceed();
      } else {
        setIsSaving(false);
      }
    } catch (error) {
      console.error("Error al guardar borrador desde modal", error);
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={handleStay} // Si toca afuera, se queda
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            <div className="p-6">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 mb-5">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  ¿Te vas sin guardar?
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                  Tenés cambios sin guardar. Si salís ahora, perderás el progreso.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {onSaveDraft && (
                  <button
                    onClick={handleSaveAndProceed}
                    disabled={isSaving}
                    className="w-full py-2.5 text-sm font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                        Guardar borrador y salir
                      </>
                    )}
                  </button>
                )}
                <div className="flex gap-3 mt-1">
                    <button onClick={handleStay} disabled={isSaving} className="flex-1 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        Seguir editando
                    </button>
                    <button onClick={handleDiscard} disabled={isSaving} className="flex-1 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors border border-transparent">
                        Descartar
                    </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}