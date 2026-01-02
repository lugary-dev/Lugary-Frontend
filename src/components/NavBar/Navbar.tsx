import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import logoImg from "../../images/Logo.png";
import AuthRequiredModal from "../EspaciosPage/AuthRequiredModal";
import LogoutModal from "../PerfilPage/LogoutModal"; 
import { NotificationsPopover } from "./NotificationsPopover";

/**
 * Barra de navegación principal de la aplicación autenticada.
 */

// --- Iconos SVG ---
const SearchIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CalendarIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" />
  </svg>
);

const HomeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const MessageIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const BellIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

// 1. Definimos la interfaz de props para recibir onOpenChat
interface NavbarProps {
  onOpenChat?: () => void;
}

// 2. Desestructuramos onOpenChat de las props
export default function Navbar({ onOpenChat }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme(); 
  
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  // [NUEVO] Estado para el modal de cerrar sesión
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const userEmail = localStorage.getItem("userEmail");
  const isLoggedIn = !!userEmail;
  const inicial = userEmail ? userEmail.charAt(0).toUpperCase() : "";

  // Acción real de logout
  const performLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    window.location.href = "/"; 
  };

  // --- Manejador de acciones restringidas ---
  const handleRestrictedAction = (action: () => void) => {
    if (isLoggedIn) {
      action();
    } else {
      setShowAuthModal(true);
    }
  };

  const irAEspacios = () => navigate("/");
  const irALogin = () => navigate("/login");
  const irARegistro = () => navigate("/registro");
  const irAMisReservas = () => navigate("/mis-reservas");
  const irAMisEspacios = () => navigate("/mis-espacios");
  const irAPerfil = () => navigate("/perfil");

  const esRutaActiva = (path: string) => location.pathname === path;

  // Clase dinámica para botones deshabilitados visualmente
  const getNavButtonClass = (isActive: boolean) => {
    if (!isLoggedIn)
      return "text-slate-400 dark:text-slate-600 cursor-pointer";
    if (isActive) return "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900";
    return "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800";
  };

  // Iconos SVG para el botón de tema
  const SunIcon = () => (
    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
  
  const MoonIcon = () => (
    <svg className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );

  return (
    <>
    <nav className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex justify-between md:grid md:grid-cols-3 items-center h-full gap-4">

          {/* ---- Logo / Nombre ---- */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={irAEspacios}
          >
            <img src={logoImg} alt="Lugary" className="h-10 w-auto object-contain" />
          </div>

          {/* ---- Navegación central ---- */}
          <div className="hidden md:flex items-center justify-center gap-2 text-sm font-medium">
            <button
              onClick={irAEspacios}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                location.pathname === "/"
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <SearchIcon />
              Explorar
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>

            <button
              onClick={() => handleRestrictedAction(irAMisReservas)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${getNavButtonClass(
                esRutaActiva("/mis-reservas")
              )}`}
            >
              <CalendarIcon />
              Mis reservas
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>

            <button
              onClick={() => handleRestrictedAction(irAMisEspacios)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${getNavButtonClass(
                esRutaActiva("/mis-espacios")
              )}`}
            >
              <HomeIcon />
              Mis espacios
            </button>
          </div>

          {/* ---- Zona derecha: Botón Tema + Iconos + Avatar ---- */}
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none text-slate-600 dark:text-slate-400"
              title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>

            {isLoggedIn ? (
              <>
                {/* 3. BOTÓN DE MENSAJES CONECTADO AL MODAL */}
                <button 
                  onClick={onOpenChat} 
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative text-slate-600 dark:text-slate-400"
                  title="Mensajes"
                >
                  <MessageIcon />
                  <span className="absolute top-2 right-2 h-2 w-2 bg-blue-500 rounded-full ring-2 ring-white dark:ring-slate-950"></span>
                </button>

                {/* 4. BOTÓN DE NOTIFICACIONES + POPOVER */}
                <div className="relative mr-1">
                  <button 
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setMenuAbierto(false); // Cierra el menú de usuario si está abierto por prolijidad
                    }} 
                    className={`p-2 rounded-full transition-colors relative ${
                      showNotifications 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Notificaciones"
                  >
                    <BellIcon />
                    {/* Puntito rojo (podrías ocultarlo si showNotifications es true) */}
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-950 animate-pulse"></span>
                  </button>

                  {/* EL POPOVER DE NOTIFICACIONES (Se renderiza condicionalmente aquí) */}
                  <NotificationsPopover 
                    isOpen={showNotifications} 
                    onClose={() => setShowNotifications(false)}
                    onMarkAllRead={() => console.log("Marcar todas como leídas")}
                  />
                </div>

                {/* Menú de usuario */}
                <div className="relative border-l border-slate-200 dark:border-slate-800 pl-2 ml-1">
                  <button
                    type="button"
                    onClick={() => setMenuAbierto((prev) => !prev)}
                    className="flex items-center gap-2 focus:outline-none hover:bg-slate-50 dark:hover:bg-slate-800 p-1 pr-2 rounded-full transition"
                  >
                    <div className="h-9 w-9 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center font-medium shadow-sm border border-slate-200 dark:border-slate-700">
                      {inicial}
                    </div>
                    <svg
                      className={`w-4 h-4 text-slate-500 transition-transform ${
                        menuAbierto ? "rotate-180" : ""
                      }`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {menuAbierto && (
                    <>
                      <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden">
                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Conectado como</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {userEmail}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setMenuAbierto(false);
                            irAPerfil();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Mi perfil
                        </button>

                        <div className="md:hidden border-t border-slate-100 dark:border-slate-800">
                             <button onClick={() => { setMenuAbierto(false); irAMisReservas(); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" /> Mis reservas
                             </button>
                             <button onClick={() => { setMenuAbierto(false); irAMisEspacios(); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                                <HomeIcon className="w-4 h-4" /> Mis espacios
                             </button>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                        <button
                          onClick={() => {
                            setMenuAbierto(false);
                            setShowLogoutModal(true); // <--- Abrir Modal
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Cerrar sesión
                        </button>
                      </div>
                      
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setMenuAbierto(false)}
                      />
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={irALogin}
                  className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={irARegistro}
                  className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-sm transition-colors"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>

    {/* Modales */}
    <AuthRequiredModal 
      isOpen={showAuthModal} 
      onClose={() => setShowAuthModal(false)} 
    />
    
    {/* [NUEVO] Modal de Logout */}
    <LogoutModal 
      isOpen={showLogoutModal} 
      onClose={() => setShowLogoutModal(false)} 
      onConfirm={performLogout} 
    />
    </>
  );
}