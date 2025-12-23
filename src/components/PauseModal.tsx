import { motion, AnimatePresence } from "framer-motion";

interface PauseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  espacioNombre: string;
}

export default function PauseModal({ isOpen, onClose, onConfirm, espacioNombre }: PauseModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        
        {/* 1. Backdrop (Fondo oscuro con blur) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* 2. Contenido del Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          <div className="p-6 sm:p-8">
            
            {/* Icono Superior */}
            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 mb-6">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Títulos */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                ¿Pausar publicación?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                Estás a punto de pausar el espacio <span className="font-semibold text-slate-800 dark:text-slate-200">"{espacioNombre}"</span>.
              </p>
            </div>

            {/* CAJA DE ADVERTENCIA (Lo más importante UX) */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 mb-8 rounded-r-lg">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-500 dark:text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-semibold mb-1">Lo que tenés que saber:</p>
                  <ul className="list-disc pl-4 space-y-1 text-amber-700/90 dark:text-amber-300/90">
                    <li>Tu anuncio dejará de ser visible en las búsquedas.</li>
                    <li>Podrás reactivarlo en cualquier momento.</li>
                    <li><strong>Tus reservas confirmadas NO se cancelarán.</strong></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex items-center justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-slate-200">
                Volver
              </button>
              <button onClick={onConfirm} className="px-4 py-2.5 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 shadow-lg shadow-amber-500/25 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 active:scale-95">
                Sí, pausar espacio
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}