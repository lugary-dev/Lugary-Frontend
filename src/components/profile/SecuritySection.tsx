import { useState, type ChangeEvent, useLayoutEffect, useRef } from "react";
import { 
  LuLock, LuShieldCheck, LuTrash2, LuChevronRight, 
  LuLoader, LuEye, LuEyeOff, LuTriangleAlert, LuX,
  LuUser, LuUserCheck, LuScanFace, LuFileImage, LuArrowRight, LuArrowLeft,
  LuZap, LuInfo
} from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";

// --- Componente Interno: Input de Contraseña con Toggle ---
const PasswordInput = ({ 
  label, 
  value, 
  onChange, 
  name, 
  placeholder 
}: { 
  label: string; 
  value: string; 
  onChange: (e: ChangeEvent<HTMLInputElement>) => void; 
  name: string; 
  placeholder?: string;
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className="mb-5 last:mb-0">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
          <LuLock className="w-5 h-5" />
        </div>
        <input 
          type={show ? "text" : "password"} 
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
        />
        <button 
          type="button"
          onClick={() => setShow(!show)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          {show ? <LuEyeOff className="w-5 h-5" /> : <LuEye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

// --- Componente Interno: Portal para Modales ---
const ModalPortal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void; }) => {
  useLayoutEffect(() => {
    const body = document.body;
    const originalOverflow = body.style.overflow;
    const originalPaddingRight = body.style.paddingRight;
    
    const hasScrollbar = window.innerWidth > body.clientWidth;
    if (hasScrollbar) {
      const scrollbarWidth = window.innerWidth - body.clientWidth;
      body.style.overflow = 'hidden';
      body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      body.style.overflow = 'hidden';
    }

    return () => {
      body.style.overflow = originalOverflow;
      body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      {children}
    </div>
  );
};

// --- Componente Interno: Cargador de Imagen ---
const ImageUploader = ({
  title,
  image,
  onImageChange,
  onImageDelete,
}: {
  title: string;
  image: string | null;
  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onImageDelete: () => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full">
      <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2 text-center">{title}</p>
      <div
        onClick={() => inputRef.current?.click()}
        className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-all group overflow-hidden"
      >
        {image ? (
          <>
            <img src={image} alt={title} className="w-full h-full object-contain p-2" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onImageDelete();
              }}
              className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <LuTrash2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="text-center text-slate-400 group-hover:text-blue-500 transition-colors">
            <LuFileImage className="w-10 h-10 mx-auto" />
            <p className="text-sm font-medium mt-2">Hacé clic para subir una foto</p>
            <p className="text-xs">JPG, PNG o WEBP. Máx 5MB.</p>
          </div>
        )}
        <input
          type="file"
          ref={inputRef}
          onChange={onImageChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />
      </div>
    </div>
  );
};

// --- Componente Principal ---

interface SecuritySectionProps {
  onBack: () => void;
}

export const SecuritySection = ({ onBack }: SecuritySectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para Verificación de Identidad
  const [isIdentityVerified, setIsIdentityVerified] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationStep, setVerificationStep] = useState(1);
  const [idFrontImage, setIdFrontImage] = useState<string | null>(null);
  const [idBackImage, setIdBackImage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  const CONFIRMATION_PHRASE = "ELIMINAR CUENTA";
  const isConfirmationValid = confirmationText === CONFIRMATION_PHRASE;
  
  // Estado para el formulario de contraseña
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  // Validación simple: Campos llenos y contraseñas nuevas coinciden
  const isValid = 
    passwords.current.length > 0 && 
    passwords.new.length >= 8 && 
    passwords.new === passwords.confirm;

  const handleUpdatePassword = () => {
    setIsLoading(true);
    // Simular API
    setTimeout(() => {
      setIsLoading(false);
      setPasswords({ current: "", new: "", confirm: "" }); // Resetear form
      alert("Contraseña actualizada correctamente"); 
    }, 1500);
  };

  const handleStartVerification = () => {
    setVerificationStep(1);
    setIdFrontImage(null);
    setIdBackImage(null);
    setIsVerifying(false);
    setIsVerificationModalOpen(true);
  };

  const handleVerificationFileChange = (e: ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      // Revocar URL anterior para evitar memory leaks
      const oldImage = side === 'front' ? idFrontImage : idBackImage;
      if (oldImage) URL.revokeObjectURL(oldImage);

      const imageUrl = URL.createObjectURL(file);
      if (side === 'front') {
        setIdFrontImage(imageUrl);
      } else {
        setIdBackImage(imageUrl);
      }
    }
  };

  const handleFinishVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerificationModalOpen(false);
      setIsIdentityVerified(true);
    }, 2000);
  };

  const handleDeleteAccount = () => {
    if (!isConfirmationValid) return;
    setIsDeleting(true);
    // Simular API
    setTimeout(() => {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      alert("Cuenta eliminada permanentemente.");
    }, 2000);
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

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Seguridad y Acceso</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gestioná la seguridad de tu cuenta y métodos de acceso.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-10">
          
          {/* 1. SECCIÓN CONTRASEÑA */}
          <div className="max-w-2xl">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Cambiar contraseña</h3>
            <div className="space-y-3">
              <PasswordInput 
                label="Contraseña actual" 
                name="current"
                value={passwords.current}
                onChange={handleChange}
                placeholder="Ingresá tu contraseña actual"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PasswordInput 
                  label="Nueva contraseña" 
                  name="new"
                  value={passwords.new}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
                />
                <PasswordInput 
                  label="Confirmar nueva" 
                  name="confirm"
                  value={passwords.confirm}
                  onChange={handleChange}
                  placeholder="Repetí la nueva contraseña"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleUpdatePassword}
                disabled={!isValid || isLoading}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all
                  ${isValid && !isLoading 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:-translate-y-0.5' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}
                `}
              >
                {isLoading ? <><LuLoader className="w-4 h-4 animate-spin"/> Actualizando...</> : "Actualizar contraseña"}
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* 2. VERIFICACIÓN DE IDENTIDAD */}
          <div className="max-w-2xl">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              Verificación de Identidad
              {!isIdentityVerified && (
                <span className="text-[10px] bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                  Prioritario
                </span>
              )}
            </h3>
            {isIdentityVerified ? (
              // --- ESTADO VERIFICADO ---
              <div className="flex items-center justify-between p-5 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                <div className="flex gap-4">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full self-start">
                    <LuUserCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400"/>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Identidad Verificada</p>
                      <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Confirmado
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Tu identidad ha sido confirmada. Esto aumenta la confianza con los anfitriones.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // --- ESTADO NO VERIFICADO (DISEÑO BOOST) ---
              <div className="relative group overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-gradient-to-r from-blue-50/50 to-white dark:from-blue-900/10 dark:to-slate-900 p-6 shadow-sm hover:shadow-md transition-all">
                
                {/* Adorno decorativo de fondo */}
                <LuShieldCheck className="absolute -right-6 -bottom-6 w-32 h-32 text-blue-500/5 dark:text-blue-400/5 -rotate-12 pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20">
                      <LuShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                          Tu perfil aún no destaca
                        </h4>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
                        Verificá tu identidad para obtener el <strong className="font-semibold text-slate-700 dark:text-slate-300">Sello de Confianza</strong> y posicionar tus espacios por encima de la competencia.
                      </p>
                      
                      {/* Badge de Beneficio de Algoritmo */}
                      <div className="flex items-center gap-2 mt-3 text-blue-600 dark:text-blue-400">
                        <LuZap className="w-4 h-4 fill-current" />
                        <span className="text-xs font-bold uppercase tracking-tight">
                          Mejora tu visibilidad en el algoritmo
                        </span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleStartVerification} 
                    className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Verificar ahora
                  </button>
                </div>

                {/* Banner de Info sutil */}
                <div className="mt-6 pt-6 border-t border-blue-100 dark:border-blue-900/30 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                  <LuInfo className="w-3.5 h-3.5" />
                  <span>Solo toma 2 minutos y requiere una foto de tu DNI. Tus datos están encriptados.</span>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* 3. ZONA DE PELIGRO */}
          <div className="max-w-2xl">
            <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2">
              <LuTriangleAlert className="w-5 h-5"/> Zona de Peligro
            </h3>
            <div className="p-6 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-red-50 mb-1">Eliminar cuenta permanentemente</h4>
                <p className="text-sm text-slate-600 dark:text-red-200/60 max-w-md leading-relaxed">
                  Una vez que elimines tu cuenta, no hay vuelta atrás. Perderás tu historial de reservas y favoritos.
                </p>
              </div>
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-5 py-2.5 bg-white dark:bg-transparent border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors whitespace-nowrap shadow-sm"
              >
                Eliminar cuenta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL DE VERIFICACIÓN DE IDENTIDAD --- */}
      <AnimatePresence>
        {isVerificationModalOpen && (
          <ModalPortal onClose={() => setIsVerificationModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Verificación de Identidad</h3>
                <button onClick={() => setIsVerificationModalOpen(false)} className="p-2 -m-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <LuX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8">
                <AnimatePresence mode="wait">
                  {/* --- PASO 1: INTRODUCCIÓN --- */}
                  {verificationStep === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                      <div className="w-full">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2 text-center">Paso 1 de 3: Introducción</p>
                        <div className="relative aspect-video w-full bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-col items-center justify-center p-6 text-center">
                          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4 inline-flex">
                            <LuScanFace className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h4 className="text-xl font-bold text-slate-900 dark:text-white">Verifiquemos tu identidad</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">Para la seguridad de todos, te pediremos fotos de tu documento. Asegurate de tener buena luz y que los datos sean legibles.</p>
                        </div>
                      </div>
                      <div className="flex justify-end items-center mt-6">
                        <button onClick={() => setVerificationStep(2)} className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all">
                          Comenzar <LuArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* --- PASO 2: FRENTE DNI --- */}
                  {verificationStep === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                      <ImageUploader 
                        title="Frente del documento"
                        image={idFrontImage}
                        onImageChange={(e) => handleVerificationFileChange(e, 'front')}
                        onImageDelete={() => setIdFrontImage(null)}
                      />
                      <div className="flex justify-between items-center mt-6">
                        <button onClick={() => setVerificationStep(1)} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <LuArrowLeft className="w-4 h-4" /> Atrás
                        </button>
                        <button onClick={() => setVerificationStep(3)} disabled={!idFrontImage} className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                          Siguiente <LuArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* --- PASO 3: REVERSO DNI --- */}
                  {verificationStep === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                      <ImageUploader 
                        title="Reverso del documento"
                        image={idBackImage}
                        onImageChange={(e) => handleVerificationFileChange(e, 'back')}
                        onImageDelete={() => setIdBackImage(null)}
                      />
                      <div className="flex justify-between items-center mt-6">
                        <button onClick={() => setVerificationStep(2)} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <LuArrowLeft className="w-4 h-4" /> Atrás
                        </button>
                        <button 
                          onClick={handleFinishVerification} 
                          disabled={!idBackImage || isVerifying} 
                          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isVerifying ? (
                            <><LuLoader className="w-4 h-4 animate-spin"/> Verificando...</>
                          ) : (
                            <><LuUserCheck className="w-4 h-4" /> Finalizar y enviar</>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Indicador de Pasos */}
                <div className="flex justify-center gap-2 mt-8">
                  {[1, 2, 3].map(step => (
                    <div 
                      key={step} 
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        verificationStep === step ? 'bg-blue-500 scale-125' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    />
                  ))}
                </div>

              </div>
            </motion.div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* --- MODAL DE CONFIRMACIÓN PARA ELIMINAR CUENTA --- */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <ModalPortal onClose={() => setIsDeleteModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-lg text-red-600 dark:text-red-400 flex items-center gap-2">
                  <LuTriangleAlert /> Acción irreversible
                </h3>
                <button onClick={() => setIsDeleteModalOpen(false)} className="p-2 -m-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <LuX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">¿Estás absolutamente seguro?</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Esta acción no se puede deshacer. Se eliminarán permanentemente todos tus datos, incluyendo tu perfil, historial de reservas, favoritos y cualquier espacio que hayas publicado.
                </p>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Para confirmar, por favor escribí <strong className="text-slate-900 dark:text-white">{CONFIRMATION_PHRASE}</strong> en el campo de abajo:
                  </p>
                  <input 
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    className="mt-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-center font-mono tracking-widest focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder={CONFIRMATION_PHRASE}
                  />
                </div>

                <button 
                  onClick={handleDeleteAccount}
                  disabled={!isConfirmationValid || isDeleting}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-sm text-white transition-all
                    ${isConfirmationValid && !isDeleting
                      ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20' 
                      : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'}
                  `}
                >
                  {isDeleting ? <><LuLoader className="w-4 h-4 animate-spin"/> Eliminando...</> : "Entiendo las consecuencias, eliminar mi cuenta"}
                </button>
              </div>
            </motion.div>
          </ModalPortal>
        )}
      </AnimatePresence>
    </div>
  );
};