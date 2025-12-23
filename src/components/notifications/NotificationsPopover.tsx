import { motion, AnimatePresence } from "framer-motion";
import { 
  LuX, LuCheck, LuCalendarCheck, LuCreditCard, 
  LuInfo, LuShieldAlert 
} from "react-icons/lu";

// --- Tipos Mock ---
export interface NotificationItem {
  id: string;
  type: 'reservation' | 'payment' | 'security' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// --- DATOS MOCK ---
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1", type: "reservation", title: "Reserva Confirmada", 
    message: "Tu reserva en 'Estancia La Candelaria' ha sido confirmada por el anfitrión.", 
    time: "Hace 2 min", read: false
  },
  {
    id: "2", type: "payment", title: "Pago Exitoso", 
    message: "Se procesó correctamente el pago de la seña por $45.000 ARS.", 
    time: "Hace 1 hora", read: false
  },
  {
    id: "3", type: "security", title: "Nuevo inicio de sesión", 
    message: "Detectamos un acceso desde un dispositivo nuevo (Chrome, Windows).", 
    time: "Ayer", read: true
  },
  {
    id: "4", type: "system", title: "¡Bienvenido a Lugary!", 
    message: "Completá tu perfil para obtener mejores recomendaciones.", 
    time: "Hace 2 días", read: true
  }
];

// --- Sub-componente: Icono según tipo ---
const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'reservation': 
      return <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full"><LuCalendarCheck className="w-4 h-4"/></div>;
    case 'payment': 
      return <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full"><LuCreditCard className="w-4 h-4"/></div>;
    case 'security': 
      return <div className="p-2 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-full"><LuShieldAlert className="w-4 h-4"/></div>;
    default: 
      return <div className="p-2 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-full"><LuInfo className="w-4 h-4"/></div>;
  }
};

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
}

export const NotificationsPopover = ({ isOpen, onClose, onMarkAllRead }: NotificationsPopoverProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. Backdrop Invisible (Para cerrar al hacer clic afuera) */}
          <div className="fixed inset-0 z-40 cursor-default" onClick={onClose} />

          {/* 2. El Popover */}
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notificaciones</h3>
          <div className="flex items-center gap-1">
            <button 
              onClick={onMarkAllRead}
              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors"
            >
              Marcar leídas
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              <LuX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lista de Notificaciones */}
        <div className="max-h-[400px] overflow-y-auto">
          {MOCK_NOTIFICATIONS.length > 0 ? (
            MOCK_NOTIFICATIONS.map((item) => (
              <div 
                key={item.id} 
                className={`relative px-4 py-3 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex gap-3 group cursor-pointer ${!item.read ? 'bg-blue-50/40 dark:bg-blue-900/5' : ''}`}
              >
                {/* Indicador de No Leído */}
                {!item.read && (
                  <span className="absolute left-0 top-4 w-0.5 h-8 bg-blue-500 rounded-r-full"></span>
                )}

                <div className="flex-shrink-0 mt-0.5">
                  <NotificationIcon type={item.type} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className={`text-sm ${!item.read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                      {item.title}
                    </p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {item.message}
                  </p>
                </div>
              </div>
            ))
          ) : (
            // Estado Vacío
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full mb-3 text-slate-400">
                <LuCheck className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Estás al día</p>
              <p className="text-xs text-slate-500 mt-1">No tienes notificaciones nuevas.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <button className="w-full py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow">
            Ver historial completo
          </button>
        </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};