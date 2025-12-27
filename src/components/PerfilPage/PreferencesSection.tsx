import { useState } from "react";
import { 
  LuGlobe, LuBell, LuChevronRight, 
  LuLoader, LuMail, LuSmartphone, LuMegaphone
} from "react-icons/lu";

// --- Tipos ---
interface PreferencesState {
  language: string;
  currency: string;
  emailNotif: boolean;
  pushNotif: boolean;
  marketingNotif: boolean;
}

// --- Componente Interno: Toggle Row ---
const ToggleRow = ({ 
  icon, title, desc, checked, onChange 
}: { 
  icon: React.ReactNode; title: string; desc: string; checked: boolean; onChange: () => void 
}) => (
  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
    <div className="flex items-start gap-4">
      <div className={`p-2.5 rounded-lg transition-colors ${checked ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
        {icon}
      </div>
      <div>
        <p className="font-semibold text-slate-900 dark:text-white text-sm">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5 max-w-[250px] sm:max-w-md">{desc}</p>
      </div>
    </div>
    <button 
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

// --- Componente Principal ---

interface PreferencesSectionProps {
  onBack: () => void;
}

export const PreferencesSection = ({ onBack }: PreferencesSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [form, setForm] = useState<PreferencesState>({
    language: "es-AR",
    currency: "ARS",
    emailNotif: true,
    pushNotif: true,
    marketingNotif: false,
  });

  const handleChange = (key: keyof PreferencesState, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setHasChanges(false);
      // Aquí iría el toast de éxito
    }, 1000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <button 
        onClick={onBack} 
        className="mb-6 text-sm font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors group"
      >
        <LuChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> 
        Volver a Configuración
      </button>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Preferencias Globales</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Personalizá tu experiencia, idioma y notificaciones.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-10">
          
          {/* 1. REGIÓN E IDIOMA */}
          <div className="max-w-3xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <LuGlobe className="w-4 h-4 text-slate-400"/> Región
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">IDIOMA</label>
                <div className="relative">
                  <select 
                    value={form.language}
                    onChange={(e) => handleChange("language", e.target.value)}
                    className="w-full appearance-none p-3 pl-4 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:border-blue-300 transition-colors"
                  >
                    <option value="es-AR">Español (Argentina)</option>
                    <option value="es-LA">Español (Latinoamérica)</option>
                    <option value="en-US">English (United States)</option>
                    <option value="pt-BR">Português (Brasil)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                    <LuChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">MONEDA</label>
                <div className="relative">
                  <select 
                    value={form.currency}
                    onChange={(e) => handleChange("currency", e.target.value)}
                    className="w-full appearance-none p-3 pl-4 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:border-blue-300 transition-colors"
                  >
                    <option value="ARS">ARS ($) - Peso Argentino</option>
                    <option value="USD">USD ($) - Dólar Estadounidense</option>
                    <option value="EUR">EUR (€) - Euro</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                    <LuChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* 3. NOTIFICACIONES */}
          <div className="max-w-3xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <LuBell className="w-4 h-4 text-slate-400"/> Notificaciones
            </h3>
            <div className="flex flex-col gap-1">
              <ToggleRow 
                icon={<LuMail className="w-5 h-5"/>}
                title="Correos electrónicos"
                desc="Recibir confirmaciones de reserva, facturas y recordatorios importantes."
                checked={form.emailNotif}
                onChange={() => handleChange("emailNotif", !form.emailNotif)}
              />
              <ToggleRow 
                icon={<LuSmartphone className="w-5 h-5"/>}
                title="Notificaciones Push"
                desc="Alertas en tiempo real en tu navegador o móvil sobre el estado de tus reservas."
                checked={form.pushNotif}
                onChange={() => handleChange("pushNotif", !form.pushNotif)}
              />
              <ToggleRow 
                icon={<LuMegaphone className="w-5 h-5"/>}
                title="Novedades y Ofertas"
                desc="Descuentos exclusivos y novedades de Lugary (máximo 2 al mes)."
                checked={form.marketingNotif}
                onChange={() => handleChange("marketingNotif", !form.marketingNotif)}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={handleSave}
              disabled={!hasChanges || isLoading}
              className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all
                ${hasChanges && !isLoading 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:-translate-y-0.5' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}
              `}
            >
              {isLoading ? <><LuLoader className="w-4 h-4 animate-spin"/> Guardando...</> : "Guardar preferencias"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};