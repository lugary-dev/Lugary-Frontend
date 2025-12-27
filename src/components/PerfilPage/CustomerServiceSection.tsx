import { 
  LuChevronRight, LuMessageCircle, LuMail, LuPhone, 
  LuClock, LuCircleCheck 
} from "react-icons/lu";

// --- Sub-componente: Canal de Contacto ---
const ContactChannel = ({ 
  icon, title, subtitle, status, onClick, colorClass 
}: { 
  icon: React.ReactNode; title: string; subtitle: string; status?: string; onClick: () => void; colorClass: string 
}) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all group bg-white dark:bg-slate-900 text-left"
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colorClass} transition-colors`}>
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      {status && (
        <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          {status}
        </span>
      )}
      <LuChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
    </div>
  </button>
);

// --- Componente Principal ---
export const CustomerServiceSection = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <button onClick={onBack} className="mb-6 text-sm font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors group">
        <LuChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> 
        Volver a Configuración
      </button>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Atención al Cliente</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ponete en contacto con nuestro equipo de soporte especializado.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          
          {/* Info de Horario */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl mb-8 border border-blue-100 dark:border-blue-900/30 text-blue-800 dark:text-blue-200">
            <LuClock className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
                <p className="font-bold">Horario de atención</p>
                <p className="opacity-80 text-xs mt-1">Lunes a Sábado de 09:00 a 20:00 hs.</p>
                <p className="opacity-80 text-xs">Domingos y feriados: Guardia mínima.</p>
            </div>
          </div>

          {/* Canales */}
          <div className="space-y-4">
            <ContactChannel 
              icon={<LuMessageCircle className="w-6 h-6"/>}
              title="Chat en Vivo"
              subtitle="Respuesta promedio: 2 min"
              status="En línea"
              onClick={() => alert("Abriendo chat widget...")}
              colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            />
            
            <ContactChannel 
              icon={<LuPhone className="w-6 h-6"/>}
              title="WhatsApp"
              subtitle="Escribinos al +54 9 11..."
              onClick={() => window.open("https://wa.me/...")}
              colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
            />

            <ContactChannel 
              icon={<LuMail className="w-6 h-6"/>}
              title="Correo Electrónico"
              subtitle="soporte@lugary.com"
              onClick={() => window.location.href = "mailto:soporte@lugary.com"}
              colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
            />
          </div>

          {/* Footer de tranquilidad */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
              <LuCircleCheck className="w-3 h-3" /> Tu consulta generará un número de ticket automáticamente.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};