import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/NavBar/Navbar"; 
import { ChatModal } from "../components/NavBar/ChatModal"; // Importamos el modal que creamos
import WelcomeModal from "../components/WelcomeModal"; // [NUEVO] Importar el modal

const AppLayout = () => {
  // Estado para controlar la visibilidad del Chat
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col">
      
      {/* Pasamos la función para ABRIR el chat al Navbar */}
      <Navbar onOpenChat={() => setIsChatOpen(true)} />

      {/* Contenido principal de la página */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer (Opcional) */}
      <footer className="py-6 text-center text-sm text-slate-500 border-t border-slate-200 dark:border-slate-800 mt-auto">
        © 2026 Lugary. Todos los derechos reservados.
      </footer>

      {/* El Modal de Chat vive aquí, flotando sobre todo el layout */}
      <ChatModal 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />

      {/* [NUEVO] Modal de Bienvenida: Se auto-gestiona su visibilidad */}
      <WelcomeModal />
      
    </div>
  );
};

export default AppLayout;