import { useState, useLayoutEffect } from "react";
import { 
  LuPlus, LuTrash2, LuShieldCheck, LuChevronRight, 
  LuX, LuTriangleAlert, LuCircleCheck
} from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";

// --- Tipos ---
interface CardData {
  id: string;
  type: "Visa" | "Mastercard";
  last4: string;
  expiry: string;
  holder: string;
  color: string;
}

// --- Algoritmo de Luhn para validación de tarjeta ---
const isValidLuhn = (number: string): boolean => {
  const num = number.replace(/\s/g, '');
  if (!/^\d+$/.test(num) || num.length < 13) {
    return false;
  }
  let sum = 0;
  let shouldDouble = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

// --- Componente Interno: Tarjeta Visual (Static) ---
const CreditCardView = ({ card, onDelete }: { card: CardData; onDelete: (id: string) => void }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className={`relative w-full aspect-[1.586/1] rounded-2xl p-6 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden group ${card.color}`}
  >
    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
    <div className="relative z-10 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start">
        <div className="w-10 h-7 bg-amber-200/80 rounded-md border border-amber-300/50 flex flex-col justify-center gap-[2px] px-1 opacity-90">
            <div className="w-full h-[1px] bg-amber-600/30"></div>
            <div className="w-full h-[1px] bg-amber-600/30"></div>
        </div>
        <span className="font-bold text-lg italic tracking-wider opacity-90">{card.type}</span>
      </div>
      <p className="font-mono text-lg sm:text-xl tracking-widest shadow-black drop-shadow-md whitespace-nowrap">•••• •••• •••• {card.last4}</p>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] text-white/70 uppercase tracking-wider mb-0.5">Titular</p>
          <p className="font-medium text-sm tracking-wide uppercase truncate max-w-[150px]">{card.holder}</p>
        </div>
        <div>
          <p className="text-[10px] text-white/70 uppercase tracking-wider mb-0.5">Vence</p>
          <p className="font-medium text-sm tracking-wide">{card.expiry}</p>
        </div>
      </div>
    </div>
    <button 
      onClick={() => onDelete(card.id)}
      className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-red-500 text-white rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 scale-90 group-hover:scale-100"
    >
      <LuTrash2 className="w-4 h-4" />
    </button>
  </motion.div>
);

// --- Componente Interno para manejar el portal del modal y el bloqueo del scroll ---
// Este componente soluciona el "salto" del layout al abrir y cerrar el modal.
// El useLayoutEffect se ejecuta al montar/desmontar este componente, y AnimatePresence
// retrasa el desmontaje hasta que la animación de salida termina.
const ModalPortal = ({ children, onClose, blur = 'md' }: { children: React.ReactNode; onClose: () => void; blur?: 'sm' | 'md' }) => {
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
  }, []); // El array vacío asegura que se ejecute solo al montar y desmontar

  const backdropClass = blur === 'sm' ? "absolute inset-0 bg-slate-900/60 backdrop-blur-sm" : "absolute inset-0 bg-slate-900/80 backdrop-blur-md";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={backdropClass} onClick={onClose} />
      {children}
    </div>
  );
};

// --- Componente Principal ---
export const PaymentMethodsSection = ({ onBack }: { onBack: () => void }) => {
  
  // Estado Mock para las tarjetas
  const [cards, setCards] = useState<CardData[]>([
    { 
      id: "1", 
      type: "Visa", 
      last4: "4242", 
      expiry: "12/28", 
      holder: "ENZO GABRIEL", 
      color: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
    },
    { 
      id: "2", 
      type: "Mastercard", 
      last4: "8899", 
      expiry: "09/25", 
      holder: "ENZO GABRIEL", 
      color: "bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900"
    }
  ]);

  // Estados para Modales
  const [cardIdToDelete, setCardIdToDelete] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Estado para Formulario de Nueva Tarjeta
  const [addStep, setAddStep] = useState(1);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isExpiryValid, setIsExpiryValid] = useState(true);
  const [isLuhnValid, setIsLuhnValid] = useState(true);
  const [newCard, setNewCard] = useState({
    number: "",
    holder: "",
    expiry: "",
    cvc: "",
    type: "Visa" as "Visa" | "Mastercard"
  });

  // Validación del formulario del paso 1
  const isFormStep1Valid = 
    newCard.number.replace(/\s/g, '').length >= 16 &&
    newCard.holder.trim().length > 2 &&
    newCard.expiry.length === 5 &&
    isExpiryValid &&
    isLuhnValid;

  // Navegación al siguiente paso
  const handleNextStep = () => {
    if (isFormStep1Valid) {
      setAddStep(2);
      setIsFlipped(true);
    }
  };

  // Handlers
  const confirmDelete = () => {
    if (cardIdToDelete) {
      setCards(cards.filter(c => c.id !== cardIdToDelete));
      setCardIdToDelete(null);
    }
  };

  const handleAddCard = () => {
    const last4 = newCard.number.slice(-4);
    const id = Math.random().toString(36).substr(2, 9);
    const colors = [
        "bg-gradient-to-br from-emerald-900 to-teal-900",
        "bg-gradient-to-br from-rose-900 to-red-900",
        "bg-gradient-to-br from-amber-800 to-orange-900"
    ];
    
    const newEntry: CardData = {
      id,
      type: newCard.type,
      last4,
      expiry: newCard.expiry,
      holder: newCard.holder.toUpperCase(),
      color: colors[Math.floor(Math.random() * colors.length)]
    };

    setCards([...cards, newEntry]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewCard({ number: "", holder: "", expiry: "", cvc: "", type: "Visa" });
    setAddStep(1);
    setIsFlipped(false);
    setIsExpiryValid(true);
    setIsLuhnValid(true);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ''); // 1. Solo números
    let formattedValue = rawValue;

    if (rawValue.length > 2) {
      // 2. Poner la barra
      formattedValue = `${rawValue.slice(0, 2)}/${rawValue.slice(2, 4)}`;
    } else if (rawValue.length === 2 && newCard.expiry.length === 1) {
      // Auto-add slash when 2 digits are typed
      formattedValue = rawValue + '/';
    }

    // 3. Validar fecha lógica
    if (formattedValue.length === 5) {
      const [monthStr, yearStr] = formattedValue.split('/');
      const month = parseInt(monthStr, 10);
      const year = parseInt(yearStr, 10);
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;

      if (month < 1 || month > 12 || year < currentYear || (year === currentYear && month < currentMonth)) {
        setIsExpiryValid(false);
      } else {
        setIsExpiryValid(true);
      }
    } else {
      setIsExpiryValid(true); // No es inválido hasta que esté completo
    }
    setNewCard({ ...newCard, expiry: formattedValue });
  };

  // Bloquear scroll del body manteniendo el espacio (evita saltos de layout)
  useLayoutEffect(() => {
    const body = document.body;
    const originalOverflow = body.style.overflow;
    const originalPaddingRight = body.style.paddingRight;

    if (isAddModalOpen || cardIdToDelete) {
      const scrollbarWidth = window.innerWidth - body.clientWidth;
      body.style.overflow = 'hidden';
      body.style.paddingRight = `${scrollbarWidth}px`;

      // La función de limpieza se ejecuta cuando el modal se cierra o el componente se desmonta
      return () => {
        body.style.overflow = originalOverflow;
        body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isAddModalOpen, cardIdToDelete]);

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
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
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Métodos de Pago</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gestioná tus tarjetas para pagos y señas de reserva.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {/* Grid de Tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <AnimatePresence mode="popLayout">
              {cards.map(card => (
                <CreditCardView key={card.id} card={card} onDelete={(id) => setCardIdToDelete(id)} />
              ))}
            </AnimatePresence>

            {/* Botón Agregar Nueva (Diseño Dashed) */}
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="relative w-full aspect-[1.586/1] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
            >
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-3 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:scale-110 transition-transform shadow-sm text-slate-500 group-hover:text-blue-600">
                    <LuPlus className="w-8 h-8" />
                </div>
                <span className="font-bold text-sm">Agregar nueva tarjeta</span>
            </button>
          </div>

          {/* Información de Seguridad (Footer) */}
          <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-emerald-600">
                <LuShieldCheck className="w-5 h-5" />
            </div>
            <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Pagos 100% Seguros</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Encriptación SSL de grado bancario. Lugary no almacena los números completos.
                </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL ELIMINAR --- */}
      <AnimatePresence>
        {cardIdToDelete && (
          <ModalPortal onClose={() => setCardIdToDelete(null)} blur="sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
                <LuTriangleAlert className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">¿Eliminar tarjeta?</h3>
              <p className="text-sm text-slate-500 mt-2">Esta acción no se puede deshacer. Deberás volver a cargar los datos si querés usarla de nuevo.</p>
              <div className="grid grid-cols-2 gap-3 w-full mt-6">
                <button onClick={() => setCardIdToDelete(null)} className="py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancelar</button>
                <button onClick={confirmDelete} className="py-2.5 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors">Sí, eliminar</button>
              </div>
            </div>
            </motion.div>
          </ModalPortal>
        )}
      </AnimatePresence>  

      {/* --- MODAL AGREGAR TARJETA (2 PASOS) --- */}
      <AnimatePresence>
        {isAddModalOpen && (
          <ModalPortal onClose={() => setIsAddModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="p-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Nueva Tarjeta</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-3 -m-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><LuX /></button>
            </div>

            <div className="p-6 pt-8">
              {/* TARJETA 3D INTERACTIVA */}
              <div className="perspective-1000 w-full aspect-[1.586/1] mb-10 group">
                <div className={`relative w-full h-full transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                  
                  {/* Cara Frontal */}
                  <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-2xl flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-7 bg-amber-200/80 rounded-md"></div>
                        <span className="font-bold italic text-lg">{newCard.number.startsWith('4') ? 'Visa' : 'Mastercard'}</span>
                    </div>
                    <div className="mt-4">
                        <p className="font-mono text-lg sm:text-xl tracking-widest whitespace-nowrap">{newCard.number || "•••• •••• •••• ••••"}</p>
                    </div>
                    <div className="flex justify-between items-end">
                        <div className="flex-1 mr-4">
                            <p className="text-[8px] uppercase opacity-70">Titular</p>
                            <p className="font-medium text-xs truncate uppercase">{newCard.holder || "NOMBRE EN TARJETA"}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] uppercase opacity-70">Vence</p>
                            <p className="font-medium text-xs">{newCard.expiry || "MM/YY"}</p>
                        </div>
                    </div>
                  </div>

                  {/* Cara Trasera */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-2xl flex flex-col py-6">
                    <div className="w-full h-10 bg-black/80 mt-2 mb-4"></div>
                    <div className="px-6 flex flex-col items-end">
                        <p className="text-[8px] text-white uppercase mb-1 mr-1">CVC</p>
                        <div className="w-20 h-8 bg-white rounded flex items-center justify-end px-3 cvc-pattern">
                            <p className="font-mono text-slate-900 italic font-bold tracking-widest">{newCard.cvc}</p>
                        </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FORMULARIO POR PASOS */}
              <div className="space-y-4">
                {addStep === 1 ? (
                  <div className="animate-in fade-in duration-300 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Número de tarjeta</label>
                        <input 
                            type="text" 
                            placeholder="xxxx xxxx xxxx xxxx"
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 dark:text-white"
                            value={newCard.number}
                            onChange={(e) => {
                                const formatted = e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
                                setNewCard({...newCard, number: formatted, type: formatted.startsWith('4') ? 'Visa' : 'Mastercard'})
                            }}
                            maxLength={19}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Nombre del titular</label>
                        <input 
                            type="text" 
                            placeholder="COMO FIGURA EN LA TARJETA"
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 dark:text-white uppercase"
                            value={newCard.holder}
                            onChange={(e) => setNewCard({...newCard, holder: e.target.value.replace(/[^a-zA-Z\s]/g, '')})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Vencimiento</label>
                        <input 
                            type="tel" 
                            placeholder="MM/AA"
                            className={`w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 dark:text-white ${!isExpiryValid && newCard.expiry.length === 5 ? 'focus:ring-red-500 ring-2 ring-red-500' : 'focus:ring-blue-500'}`}
                            value={newCard.expiry}
                            onChange={handleExpiryChange}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleNextStep(); } }}
                            maxLength={5}
                        />
                        {!isExpiryValid && newCard.expiry.length === 5 && (
                            <p className="text-xs text-red-500 mt-1 animate-in fade-in">La tarjeta parece vencida.</p>
                        )}
                    </div>
                    <div className="pt-2">
                        <button 
                            onClick={handleNextStep}
                            disabled={!isFormStep1Valid}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                            Continuar
                        </button>
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-300 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Código de seguridad (CVC)</label>
                        <input 
                            autoFocus
                            type="tel" 
                            inputMode="numeric"
                            placeholder="***"
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 dark:text-white text-center text-xl tracking-widest"
                            value={newCard.cvc}
                            onChange={(e) => setNewCard({...newCard, cvc: e.target.value.replace(/\D/g, '')})}
                            maxLength={4}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => {setAddStep(1); setIsFlipped(false);}} className="py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">Atrás</button>
                        <button 
                            onClick={handleAddCard}
                            className="py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                            disabled={newCard.cvc.length < 3}
                        >
                            <LuCircleCheck className="w-5 h-5" /> Guardar
                        </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            </motion.div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* ESTILOS CSS PARA LA TARJETA 3D */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .cvc-pattern {
          background-image: repeating-linear-gradient(
              45deg, 
              rgba(0,0,0,0.03), 
              rgba(0,0,0,0.03) 10px, 
              transparent 10px, 
              transparent 20px
          );
        }
      `}</style>
    </div>
  );
};