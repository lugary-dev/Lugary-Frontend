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
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full m-4 border border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            {/* Header con Gradiente Sutil */}
            <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900 p-6 pb-0">
               <div className="flex items-center gap-4 mb-2 relative z-10">
                <div className="h-14 w-14 flex-shrink-0 flex items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM12 18.75a.75.75 0 01.75.75v.008c0 .414-.336.75-.75.75h-.008a.75.75 0 01-.75-.75v-.008c0-.414.336.75.75.75h.008zM16.28 15.75a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white" id="modal-title">
                    Potenciá tu Espacio
                  </h3>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Pagá solo si tenés éxito.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 pt-4">
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
                Vamos a destacar a <strong className="text-slate-900 dark:text-white">{espacioNombre}</strong> en los primeros resultados durante 1 mes. A cambio, actualizamos tu plan de comisión solo para las reservas que consigas.
              </p>

              {/* Gráfico de Tasas */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 mb-6">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tu plan actual</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">10% comisión</span>
                 </div>
                 {/* Barra de progreso visual */}
                 <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-slate-400 w-[10%]"></div>
                 </div>

                 <div className="flex items-center justify-center py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-400 animate-bounce">
                      <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                    </svg>
                 </div>

                 <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                       <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                       Plan Potenciado
                    </span>
                    <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">15% comisión</span>
                 </div>
                 <div className="h-3 w-full bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-blue-600 w-[15%] shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                 </div>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
                   Inversión por éxito: Solo pagás el 5% extra cuando se confirma una reserva.
                 </p>
              </div>

              {/* Botones */}
              <div className="flex flex-col gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={onConfirm}
                  className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700 hover:shadow-blue-600/40 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Activando...
                    </>
                  ) : (
                    "Activar Potenciador Ahora"
                  )}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                  className="w-full py-3 rounded-xl text-slate-500 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
              >
                  Quizás más tarde
              </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
