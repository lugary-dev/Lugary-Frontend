import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LuX, LuSearch, LuSend, LuPaperclip, 
  LuChevronLeft, LuCheck, LuCheckCheck
} from "react-icons/lu";

// --- Tipos Mock (Igual que antes) ---
interface Message {
  id: string; sender: 'me' | 'other'; text: string; timestamp: string; status: 'sent' | 'read';
}
interface Conversation {
  id: string; name: string; avatar: string; lastMessage: string; time: string; unread: number; online: boolean; messages: Message[];
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "1", name: "Estancia La Candelaria", avatar: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=200", lastMessage: "¡Dale! Te espero el sábado.", time: "10:30", unread: 2, online: true,
    messages: [
      { id: "m1", sender: "me", text: "Hola, ¿disponible el 20?", timestamp: "10:00", status: "read" },
      { id: "m2", sender: "other", text: "Hola! Sí, tenemos lugar.", timestamp: "10:05", status: "read" },
      { id: "m3", sender: "me", text: "Genial, paso el sábado.", timestamp: "10:15", status: "read" },
      { id: "m4", sender: "other", text: "¡Dale! Te espero el sábado.", timestamp: "10:30", status: "read" },
    ]
  },
  {
    id: "2", name: "Soporte Lugary", avatar: "https://ui-avatars.com/api/?name=Soporte+Lugary&background=0D8ABC&color=fff", lastMessage: "Reembolso procesado.", time: "Ayer", unread: 0, online: false,
    messages: [{ id: "m1", sender: "other", text: "Tu reembolso ha sido procesado.", timestamp: "09:30", status: "read" }]
  }
];

// --- Componente Principal ---
interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal = ({ isOpen, onClose }: ChatModalProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Derivados
  const activeConversation = MOCK_CONVERSATIONS.find(c => c.id === selectedId);

  // Auto-scroll
  useEffect(() => {
    if (isOpen && activeConversation) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [isOpen, selectedId, activeConversation]);

  // Bloquear scroll y compensar ancho de barra para evitar saltos
  useLayoutEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      // [NUEVO] Compensar el propio contenedor del modal para que no "salte"
      // al desaparecer la barra de scroll.
      if (modalContainerRef.current) {
        modalContainerRef.current.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        if (modalContainerRef.current) {
          modalContainerRef.current.style.paddingRight = '';
        }
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div ref={modalContainerRef} 
             className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          
          {/* Backdrop (Fondo oscuro) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Ventana Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex border border-slate-200 dark:border-slate-800"
          >
            
            {/* --- COLUMNA IZQUIERDA: LISTA (Inbox) --- */}
            <div className={`
          w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 absolute inset-0 md:relative
          ${selectedId ? 'hidden md:flex' : 'flex'} // En móvil, oculta la lista si hay chat
        `}>
          {/* Header Lista */}
          <div className="h-16 px-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mensajes</h2>
            {/* Botón cerrar (Solo visible en desktop en esta columna, o móvil si no hay chat) */}
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
              <LuX className="w-5 h-5" />
            </button>
          </div>

          {/* Buscador */}
          <div className="p-3">
            <div className="relative">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Buscar..." className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {MOCK_CONVERSATIONS.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left border-l-4 ${selectedId === conv.id ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500' : 'border-transparent'}`}
              >
                <div className="relative shrink-0">
                  <img src={conv.avatar} className="w-12 h-12 rounded-full object-cover bg-slate-200" alt="" />
                  {conv.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className={`font-bold truncate text-sm ${selectedId === conv.id ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>{conv.name}</span>
                    <span className="text-[10px] text-slate-400">{conv.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500 truncate pr-2">{conv.lastMessage}</p>
                    {conv.unread > 0 && <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 h-4 rounded-full flex items-center justify-center">{conv.unread}</span>}
                  </div>
                </div>
              </button>
            ))}
            </div>
            </div>

            {/* --- COLUMNA DERECHA: CHAT ACTIVO --- */}
            <div className={`
          flex-1 flex flex-col bg-slate-50 dark:bg-slate-950/50 relative w-full h-full
          ${!selectedId ? 'hidden md:flex' : 'flex'} // En móvil, solo muestra si hay chat
        `}>
          
          {selectedId && activeConversation ? (
            <>
              {/* Header Chat */}
              <div className="h-16 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedId(null)} className="md:hidden p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-500">
                    <LuChevronLeft className="w-5 h-5" />
                  </button>
                  <img src={activeConversation.avatar} className="w-9 h-9 rounded-full object-cover" alt="" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{activeConversation.name}</h3>
                    <p className="text-[11px] text-slate-500">{activeConversation.online ? 'En línea' : 'Desconectado'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {/* Botón Cerrar Modal (Desktop Chat View) */}
                  <button onClick={onClose} className="hidden md:block p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors ml-2 border-l border-slate-200 pl-4">
                    <LuX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Mensajes Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
                <div className="flex justify-center my-4">
                    <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full">Hoy</span>
                </div>
                
                {activeConversation.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${msg.sender === 'me' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none'}`}>
                      <p>{msg.text}</p>
                      <div className={`text-[10px] flex justify-end items-center gap-1 mt-1 ${msg.sender === 'me' ? 'text-blue-100' : 'text-slate-400'}`}>
                        {msg.timestamp}
                        {msg.sender === 'me' && (msg.status === 'read' ? <LuCheckCheck className="w-3 h-3" /> : <LuCheck className="w-3 h-3" />)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                  <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><LuPaperclip className="w-5 h-5" /></button>
                  <input 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && setInputText("")}
                    placeholder="Escribe un mensaje..." 
                    className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-500"
                  />
                  <button 
                    disabled={!inputText.trim()}
                    onClick={() => setInputText("")}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-transparent disabled:text-slate-400 transition-all"
                  >
                    <LuSend className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Estado vacío (Desktop)
            <div className="hidden md:flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                 <LuPaperclip className="w-10 h-10 opacity-20" /> {/* O cualquier ilustración */}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tus mensajes</h3>
              <p className="max-w-xs mx-auto mt-2 text-sm">Selecciona una conversación de la lista para ver el historial o comenzar a chatear.</p>
            </div>
          )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};