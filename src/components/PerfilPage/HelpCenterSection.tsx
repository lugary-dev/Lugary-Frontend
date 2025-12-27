import { useState } from "react";
import { 
  LuSearch, LuChevronRight, LuChevronDown, 
  LuBookOpen, LuCreditCard, LuCalendarCheck, LuShield 
} from "react-icons/lu";

// --- Sub-componente: FAQ Item ---
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className={`font-semibold text-sm transition-colors ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
          {question}
        </span>
        <LuChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pr-4">
          {answer}
        </p>
      </div>
    </div>
  );
};

// --- Componente Principal ---
export const HelpCenterSection = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <button onClick={onBack} className="mb-6 text-sm font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors group">
        <LuChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> 
        Volver a Configuración
      </button>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Header con Buscador */}
        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Centro de Ayuda</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Encontrá respuestas rápidas a tus dudas.</p>
          
          <div className="max-w-md mx-auto relative group">
            <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Ej. cancelar reserva, métodos de pago..." 
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm text-sm"
            />
          </div>
        </div>

        <div className="p-6 sm:p-8">
          
          {/* Categorías Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { icon: <LuCalendarCheck/>, label: "Reservas" },
              { icon: <LuCreditCard/>, label: "Pagos" },
              { icon: <LuShield/>, label: "Seguridad" },
              { icon: <LuBookOpen/>, label: "Guías" },
            ].map((cat, idx) => (
              <button key={idx} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group">
                <div className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2 transition-colors">
                  {cat.icon}
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>

          {/* Preguntas Frecuentes */}
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Preguntas Populares</h3>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-6 py-2">
            <FAQItem 
                question="¿Cómo cancelo mi reserva?" 
                answer="Podés cancelar tu reserva desde la sección 'Mis Reservas'. Dependiendo de la antelación, podrías recibir un reembolso total o parcial."
            />
            <FAQItem 
                question="¿Qué métodos de pago aceptan?" 
                answer="Aceptamos tarjetas de crédito, débito y transferencias bancarias para la seña."
            />
            <FAQItem 
                question="¿Es necesario verificar mi identidad?" 
                answer="Sí, para garantizar la seguridad de la comunidad, todos los usuarios deben verificar su identidad antes de reservar."
            />
          </div>

        </div>
      </div>
    </div>
  );
};