import { useState, useRef, type ChangeEvent } from "react";
import { 
  LuUser, LuMail, LuPhone, LuCamera, LuChevronRight, 
  LuLoader, LuTrash2, LuUpload, LuCheck
} from "react-icons/lu";

// --- Componente Reutilizable Interno: InputGroup ---
// (Idealmente, este debería ir en /components/ui/InputGroup.tsx en el futuro)
interface InputGroupProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  type?: string;
  placeholder?: string;
}

const InputGroup = ({ label, name, value, onChange, icon, type = "text", placeholder }: InputGroupProps) => (
  <div className="mb-5 last:mb-0">
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
        {icon}
      </div>
      <input 
        type={type} 
        name={name}
        value={value} 
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
      />
    </div>
  </div>
);

// --- Componente Principal ---

interface PersonalDataSectionProps {
  onBack: () => void;
}

const INITIAL_DATA = {
  fullName: "Enzo Gabriel",
  email: "enzo@example.com",
  phone: "9 261 123 4567",
  avatarUrl: null as string | null,
};

export const PersonalDataSection = ({ onBack }: PersonalDataSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado del formulario
  const [formData, setFormData] = useState(INITIAL_DATA);

  // Detectar cambios (Dirty State)
  const isDirty = JSON.stringify(formData) !== JSON.stringify(INITIAL_DATA);

  // Manejar cambios en los inputs
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Simular click en el input de archivo oculto
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Manejar subida de imagen (Previsualización)
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, avatarUrl: imageUrl }));
    }
  };

  // Eliminar foto
  const handleDeletePhoto = () => {
    setFormData(prev => ({ ...prev, avatarUrl: null }));
    // Aquí también resetearías el input file si fuera necesario
  };

  // Simular guardado
  const handleSave = () => {
    setIsLoading(true);
    // Simular petición a API
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Botón Volver */}
      <button 
        onClick={onBack} 
        className="mb-6 text-sm font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors group"
      >
        <LuChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> 
        Volver a Configuración
      </button>

      {/* Feedback de Éxito (Toast) */}
      {showSuccess && (
        <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
           <LuCheck className="w-5 h-5 flex-shrink-0" />
           <p className="text-sm font-medium">Cambios guardados correctamente</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Encabezado */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Datos Personales</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Información básica de tu perfil en Lugary.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="max-w-2xl">
            
            {/* Sección Avatar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10 border-b border-slate-100 dark:border-slate-800 pb-10">
              <div className="relative group cursor-pointer self-start sm:self-center" onClick={handleAvatarClick}>
                {/* Círculo de la imagen */}
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-md ring-4 ring-slate-50 dark:ring-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-slate-400 select-none">E</span>
                  )}
                </div>
                
                {/* Overlay al pasar el mouse */}
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <LuCamera className="text-white w-8 h-8" />
                </div>

                {/* Input oculto */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Foto de perfil</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">
                  Esta foto será visible para los anfitriones y en tus reseñas.
                  <br className="hidden sm:block"/> Soporta JPG, PNG o GIF. Máx 2MB.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={handleAvatarClick}
                    className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    <LuUpload className="w-3.5 h-3.5" /> Subir nueva
                  </button>
                  {formData.avatarUrl && (
                    <button 
                      onClick={handleDeletePhoto}
                      className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 border border-transparent px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LuTrash2 className="w-3.5 h-3.5" /> Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className="space-y-2">
              <InputGroup 
                label="Nombre completo" 
                name="fullName"
                value={formData.fullName} 
                onChange={handleInputChange}
                icon={<LuUser className="w-5 h-5"/>} 
                placeholder="Ej. Juan Pérez"
              />
              <InputGroup 
                label="Correo electrónico" 
                name="email"
                type="email"
                value={formData.email} 
                onChange={handleInputChange}
                icon={<LuMail className="w-5 h-5"/>} 
                placeholder="nombre@ejemplo.com"
              />
              
              {/* Input de Teléfono con Código de País Separado */}
              <div className="mb-5 last:mb-0">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Teléfono
                </label>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium text-sm whitespace-nowrap select-none">
                        <span>🇦🇷</span> <span>+54</span>
                    </div>
                    <div className="relative group flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                            <LuPhone className="w-5 h-5"/>
                        </div>
                        <input 
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="9 261 ..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                        />
                    </div>
                </div>
              </div>
            </div>
            
            {/* Footer de Acciones */}
            <div className="mt-10 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={onBack} 
                className="px-6 py-3 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={isLoading || !isDirty}
                className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all text-sm ${
                  isDirty 
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:-translate-y-0.5" 
                  : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <>
                    <LuLoader className="w-4 h-4 animate-spin" /> Guardando...
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};