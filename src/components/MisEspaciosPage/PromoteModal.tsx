import { motion, AnimatePresence } from "framer-motion";

export default function PromoteModal({
  isOpen,
  onClose,
  onConfirm,
  espacioNombre,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  espacioNombre: string;
  loading: boolean;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full m-4 border border-slate-200 dark:border-slate-800"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-blue-600 dark:text-blue-400">
                    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM12 18.75a.75.75 0 01.75.75v.008c0 .414-.336.75-.75.75h-.008a.75.75 0 01-.75-.75v-.008c0-.414.336.75.75.75h.008zM16.28 15.75a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white" id="modal-title">
                    Promocionar Espacio
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Destacá tu anuncio en el lobby.
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-4 text-sm">
                <p className="text-slate-600 dark:text-slate-300">
                  Vas a promocionar el espacio <strong className="text-slate-800 dark:text-slate-100">{espacioNombre}</strong>. Tu anuncio aparecerá en la primera fila de resultados durante 7 días.
                </p>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Costo de la promoción:</span>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">$5.000 ARS</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Se cobrará a tu método de pago registrado.</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl">
              <button
                type="button"
                disabled={loading}
                onClick={onConfirm}
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-wait dark:focus:ring-offset-slate-900 transition-colors"
              >
                {loading ? 'Procesando...' : 'Confirmar y Pagar'}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-base font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600 dark:focus:ring-offset-slate-900 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
