/**
 * src/components/WelcomeModal.tsx
 * Modal de bienvenida que se muestra solo en el primer inicio de sesión.
 */
import { useState, useEffect, Fragment } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

// Icono de cohete profesional para el header
const RocketIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436h.004l-4.747 4.747a3 3 0 11-4.243-4.243l4.747-4.747h-.004zm4.243 4.243l3.535-3.536a6.002 6.002 0 01-1.414 1.414L13.558 11.826a.75.75 0 01-.001.001l-.003.003-.006.006-.016.015a3.816 3.816 0 00-.32.342 3.823 3.823 0 01-.343.32l-.015.016-.006.006-.003.003-.001.001-2.12 2.121a1.5 1.5 0 002.122 2.122l2.12-2.121.001-.001.003-.003.006-.006.016-.015a3.816 3.816 0 00.32-.342 3.823 3.823 0 01.343.32l.015-.016.006-.006.003-.003.001-.001z" clipRule="evenodd" />
    <path d="M3 19.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
  </svg>
);

// Icono de lupa para el botón de explorar
const SearchIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

// Icono de 'más' para el botón de publicar
const PlusIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificamos si el usuario está logueado y si es su primer login
    const isFirstLogin = localStorage.getItem("firstLogin") === "true";
    const token = localStorage.getItem("token");

    if (token && isFirstLogin) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = async (redirectPath?: string) => {
    setLoading(true);
    const userId = localStorage.getItem("userId");
    
    try {
      // Llamada al backend para actualizar el flag en la base de datos
      if (userId) {
        await api.patch(`/usuarios/${userId}/bienvenida`);
      }
      
      // Actualizamos localStorage para que no vuelva a aparecer en esta sesión
      localStorage.setItem("firstLogin", "false");
      
      setIsOpen(false);
      
      if (redirectPath) {
        navigate(redirectPath);
      }
    } catch (error) {
      console.error("Error actualizando estado de bienvenida", error);
      // En caso de error, cerramos igual para no bloquear al usuario
      setIsOpen(false);
      localStorage.setItem("firstLogin", "false");
      if (redirectPath) {
        navigate(redirectPath);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => !loading && handleClose()}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              {/* Cambiamos max-w-md por max-w-2xl para hacerlo mucho más ancho */}
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white dark:bg-slate-900 text-left align-middle shadow-2xl transition-all border border-slate-100 dark:border-slate-800">
                {/* Header con Gradiente de Marca y Icono Profesional */}
                <div className="bg-gradient-to-br from-orange-500 to-blue-600 p-14 flex justify-center relative overflow-hidden">
                  {/* Círculos decorativos de fondo */}
                  <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full mix-blend-overlay filter blur-xl"></div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-800 rounded-full mix-blend-overlay filter blur-xl"></div>
                  </div>
                  
                  <div className="bg-white/90 dark:bg-slate-950/90 p-5 rounded-full shadow-lg relative z-10 ring-4 ring-white/30 dark:ring-slate-800/30 backdrop-blur-sm">
                    <RocketIcon className="w-12 h-12 text-orange-600 dark:text-orange-500" />
                  </div>
                </div>

                <div className="p-10 pt-12 text-center">
                  <DialogTitle
                    as="h3"
                    className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight"
                  >
                    ¡Bienvenido a Lugary!
                  </DialogTitle>
                  <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                    Ya sos parte de la comunidad de eventos más exclusiva. <br className="hidden sm:block"/> ¿Por dónde querés empezar tu viaje?
                  </p>

                  <div className="mt-10 flex flex-col-reverse sm:flex-row gap-4 justify-center items-stretch sm:items-center">
                    {/* Botón Secundario (Azul Marca) */}
                    <button
                      type="button"
                      onClick={() => handleClose("/")}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full border-2 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 disabled:opacity-50"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div> : <><SearchIcon className="w-5 h-5" /> Explorar</>}
                    </button>

                    {/* Botón Primario (Naranja Marca) - ¡Tope de Gama! */}
                    <button
                      type="button"
                      onClick={() => handleClose("/espacios/nuevo")}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:from-orange-600 hover:to-orange-700 transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-900 disabled:opacity-50"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <><PlusIcon className="w-5 h-5 text-white/90" /> Publicar espacio</>}
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
