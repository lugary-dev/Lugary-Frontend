/**
 * TermsModal.tsx
 * Modal para mostrar Términos y Condiciones.
 * Incluye contenido scrolleable y animaciones.
 */

import { AnimatePresence, motion } from "framer-motion";

interface Props {
  /** Si el modal está abierto */
  isOpen: boolean;
  /** Callback para cerrar el modal */
  onClose: () => void;
}

/**
 * TermsModal - Modal con Términos y Condiciones
 *
 * Características:
 * - Contenido con scroll independiente
 * - Backdrop oscuro con blur
 * - Animaciones suave (escala + opacidad)
 * - Botón de cierre (X) y "Entendido"
 * - Responsivo (se adapta al tamaño de pantalla)
 */
export default function TermsModal({ isOpen, onClose }: Props) {
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
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Términos y Condiciones de Uso
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="p-6 sm:p-8 flex-grow overflow-y-auto prose prose-slate dark:prose-invert max-w-none">
              <p>
                Contenido de los términos y condiciones irá aquí. Por ahora, es
                un texto de relleno para visualizar el diseño y el scroll.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non
                risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing
                nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas
                ligula massa, varius a, semper congue, euismod non, mi.
              </p>
              <h3>1. Aceptación de los Términos</h3>
              <p>
                Fusce pellentesque suscipit nibh. Integer vitae libero ac risus
                egestas placerat. Vestibulum commodo felis quis tortor. Ut aliquam
                sollicitudin leo. Cras iaculis ultricies nulla. Donec quis dui at
                dolor tempor interdum.
              </p>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 flex-shrink-0 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
