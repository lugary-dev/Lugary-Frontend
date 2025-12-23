import { useState, useEffect, type FC } from "react";
import { Link } from "react-router-dom";
import { 
  LuUser, LuHeart, LuHistory, LuCreditCard, LuShieldCheck, 
  LuMapPin, LuCalendarCheck, LuReceipt, 
  LuGlobe, LuSettings, LuCircleCheck, LuCircleX, LuClock, LuChevronRight, 
  LuCircleHelp, LuLogOut
} from "react-icons/lu";
import LogoutModal from "../components/LogoutModal";
import { PersonalDataSection } from "../components/profile/PersonalDataSection"; // Ajusta la ruta
import { SecuritySection } from "../components/profile/SecuritySection";
import { PaymentMethodsSection } from "../components/profile/PaymentMethodsSection";
import { PreferencesSection } from "../components/profile/PreferencesSection";
import { HelpCenterSection } from "../components/profile/HelpCenterSection";
import { CustomerServiceSection } from "../components/profile/CustomerServiceSection";

// --- Tipos y Helpers para Navegación ---

type ActiveProfileSection = "inicio" | "historial_reservas" | "historial_pagos" | "favoritos" | "configuracion" | "pagos" | "seguridad" | "ayuda" | "datos_personales" | "preferencias" | "atencion_cliente";

const getSectionFromHash = (): ActiveProfileSection => {
    const hash = window.location.hash.replace('#', '');
    const validSections: ActiveProfileSection[] = [
        "inicio", "historial_reservas", "historial_pagos", "favoritos", 
        "configuracion", "pagos", "seguridad", "ayuda", "datos_personales", 
        "preferencias", "atencion_cliente"
    ];
    if (validSections.includes(hash as ActiveProfileSection)) {
        return hash as ActiveProfileSection;
    }
    return 'inicio';
};

// --- Tipos e Interfaces ---

interface Favorito {
  id: number;
  nombre: string;
  direccion: string;
  precio: number;
  imagenUrl: string;
  unidadPrecio: string;
}

interface HistorialReserva {
  id: number;
  lugar: string;
  fecha: string;
  estado: "Completada" | "Cancelada";
  imagenUrl: string;
  codigoReserva: string;
}

interface HistorialPago {
  id: string;
  fecha: string;
  concepto: string;
  monto: number;
  metodo: string;
  estado: "Aprobado" | "Pendiente" | "Rechazado";
}

// --- Componentes UI Reutilizables ---

const SectionContainer: FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 mb-6 last:mb-0">
    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const NavItem: FC<{
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  variant?: 'default' | 'danger';
}> = ({ active, onClick, icon, label, badge, variant = 'default' }) => {
  const baseClass = "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group";
  const activeClass = "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm";
  const inactiveClass = "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800";
  const dangerClass = "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20";

  return (
    <button onClick={onClick} className={`${baseClass} ${variant === 'danger' ? dangerClass : (active ? activeClass : inactiveClass)}`}>
      <div className="flex items-center gap-3">
        <span className={`text-lg ${active ? "text-blue-600 dark:text-blue-400" : (variant === 'danger' ? "text-red-500" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500")}`}>
          {icon}
        </span>
        {label}
      </div>
      {badge ? (
        <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600">
          {badge}
        </span>
      ) : null}
    </button>
  );
};

// --- Componentes Específicos ---

const HistorialCard: FC<{ item: HistorialReserva }> = ({ item }) => (
  <div className="flex flex-col sm:flex-row gap-4 border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 hover:shadow-sm transition-shadow">
    <img src={item.imagenUrl} alt={item.lugar} className="w-full sm:w-32 h-24 object-cover rounded-lg bg-slate-200" />
    <div className="flex-1">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{item.lugar}</h3>
                <p className="text-sm text-slate-500 font-mono mt-1">{item.codigoReserva} • {item.fecha}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${item.estado === 'Completada' ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
                {item.estado}
            </span>
        </div>
        <div className="mt-4 flex gap-3">
            <button className="text-sm font-semibold text-blue-600 hover:underline">Volver a reservar</button>
            <span className="text-slate-300">|</span>
            <button className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">Ver recibo</button>
        </div>
    </div>
  </div>
);

const PaymentRow: FC<{ item: HistorialPago }> = ({ item }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors gap-3 sm:gap-0">
    <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-full ${item.estado === 'Aprobado' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
            {item.estado === 'Aprobado' ? <LuCircleCheck className="w-5 h-5"/> : <LuClock className="w-5 h-5"/>}
        </div>
        <div>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.concepto}</p>
            <p className="text-xs text-slate-500">{item.fecha} · <span className="font-medium text-slate-600 dark:text-slate-400">{item.metodo}</span></p>
        </div>
    </div>
    <div className="text-left sm:text-right pl-[52px] sm:pl-0">
        <p className={`font-bold ${item.estado === 'Aprobado' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
            ${item.monto.toLocaleString("es-AR")}
        </p>
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{item.estado}</span>
    </div>
  </div>
);

const ConfigCard: FC<{ icon: React.ReactNode, title: string, desc: string, actionText: string, onClick?: () => void }> = ({ icon, title, desc, actionText, onClick }) => (
    <div onClick={onClick} className="flex items-start gap-4 p-5 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all cursor-pointer group bg-white dark:bg-slate-900 h-full hover:-translate-y-1 duration-300">
        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {icon}
        </div>
        <div className="flex-1">
            <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">{desc}</p>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1">
                {actionText} <LuChevronRight className="w-3 h-3" />
            </span>
        </div>
    </div>
);

const PerfilPage: FC = () => {
  const [activeSection, setActiveSection] = useState<ActiveProfileSection>(getSectionFromHash());
  
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  
  // [NUEVO] Estados y funciones para el modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Sincroniza el estado con el hash de la URL para la navegación del navegador (atrás/adelante)
  useEffect(() => {
    const handleHashChange = () => {
      setActiveSection(getSectionFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []); // Se ejecuta solo una vez al montar el componente

  // Actualiza el hash de la URL cuando el usuario navega en la UI
  useEffect(() => {
    window.location.hash = activeSection;
  }, [activeSection]);

  const handleLogout = () => {
    localStorage.clear(); // O borra token, userId, etc. uno por uno si prefieres
    window.location.href = "/";
  };

  // --- DATOS MOCK ---
  const historialReservas: HistorialReserva[] = [
    { id: 101, lugar: "Casa de Campo 'Los Aromos'", fecha: "15 Oct 2024", estado: "Completada", imagenUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&q=80&w=300", codigoReserva: "RES-8821" },
    { id: 102, lugar: "Salón Central", fecha: "22 Ago 2024", estado: "Cancelada", imagenUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=300", codigoReserva: "RES-1002" },
  ];

  const historialPagos: HistorialPago[] = [
    { id: "TRX-998", fecha: "20 Dic 2025", concepto: "Seña - Quincho Los Pinos", monto: 45000, metodo: "Visa terminada en 4242", estado: "Aprobado" },
    { id: "TRX-887", fecha: "15 Oct 2024", concepto: "Reserva Total - Los Aromos", monto: 120000, metodo: "Transferencia Bancaria", estado: "Aprobado" },
    { id: "TRX-102", fecha: "10 Sep 2024", concepto: "Devolución Garantía", monto: 20000, metodo: "Billetera Virtual", estado: "Aprobado" },
  ];

  // Cargar Favoritos
  useEffect(() => {
    const stored = localStorage.getItem("lugary_favoritos");
    if (stored) setFavoritos(JSON.parse(stored));
  }, [activeSection]);

  // Eliminar Favorito
  const removeFavorito = (id: number) => {
    const nuevos = favoritos.filter(f => f.id !== id);
    setFavoritos(nuevos);
    localStorage.setItem("lugary_favoritos", JSON.stringify(nuevos));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 py-8 transition-colors duration-300 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mi Cuenta</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-1">
             Bienvenido de nuevo. Aquí tienes el resumen de tu actividad.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          
          {/* SIDEBAR */}
          <aside>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-3 sticky top-24">
              <nav className="space-y-1">
                <NavItem 
                  label="Inicio" icon={<LuUser />} 
                  active={activeSection === "inicio"} 
                  onClick={() => setActiveSection("inicio")} 
                />
                
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-3 mx-4" />
                <p className="px-4 pb-2 text-[11px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Actividad</p>

                <NavItem 
                  label="Historial Reservas" icon={<LuHistory />} 
                  active={activeSection === "historial_reservas"} 
                  onClick={() => setActiveSection("historial_reservas")} 
                />
                <NavItem 
                  label="Historial Pagos" icon={<LuReceipt />} 
                  active={activeSection === "historial_pagos"} 
                  onClick={() => setActiveSection("historial_pagos")} 
                />
                <NavItem 
                  label="Favoritos" icon={<LuHeart />} badge={favoritos.length}
                  active={activeSection === "favoritos"} 
                  onClick={() => setActiveSection("favoritos")} 
                />

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-3 mx-4" />
                <p className="px-4 pb-2 text-[11px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Cuenta</p>

                <NavItem 
                  label="Configuración" icon={<LuSettings />} 
                  active={activeSection === "configuracion"} 
                  onClick={() => setActiveSection("configuracion")} 
                />
                
                <div className="pt-2">
                    <NavItem 
                    label="Cerrar Sesión" icon={<LuLogOut />} variant="danger"
                    onClick={() => setShowLogoutModal(true)} // Ahora sí existe
                    />
                </div>
              </nav>
            </div>
          </aside>

          {/* CONTENIDO PRINCIPAL */}
          <main className="min-w-0">

            {/* INICIO */}
            {activeSection === "inicio" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Hero Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl shadow-xl shadow-blue-900/20 p-8 text-white">
                   <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider border border-white/10">
                                Próxima Reserva
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-2">Quincho Los Pinos</h2>
                        <p className="text-blue-100 flex items-center gap-2 mb-8 text-lg font-medium">
                           <LuCalendarCheck className="w-5 h-5" /> Sábado, 20 de Dic · 21:00 hs
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg shadow-black/10">
                                Ver Ticket de Ingreso
                            </button>
                            <button className="bg-blue-800/40 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800/60 transition-colors backdrop-blur-sm border border-white/10">
                                Cómo llegar
                            </button>
                        </div>
                   </div>
                   <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                   <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-500/30 rounded-full blur-2xl pointer-events-none"></div>
                </div>
                
              </div>
            )}

            {/* HISTORIAL RESERVAS */}
            {activeSection === "historial_reservas" && (
               <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                   <SectionContainer title="Historial de Reservas" subtitle="Tus experiencias anteriores y canceladas.">
                      <div className="space-y-4">
                         {historialReservas.map(item => (
                            <HistorialCard key={item.id} item={item} />
                         ))}
                      </div>
                   </SectionContainer>
               </div>
            )}

            {/* HISTORIAL PAGOS (Aquí se usa PaymentRow y historialPagos) */}
            {activeSection === "historial_pagos" && (
               <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                   <SectionContainer title="Historial de Pagos" subtitle="Transacciones, señas y devoluciones.">
                      <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden mb-6">
                         {historialPagos.map(pago => <PaymentRow key={pago.id} item={pago} />)}
                      </div>
                      <div className="text-center">
                          <button className="text-sm text-blue-600 font-semibold hover:text-blue-800 flex items-center justify-center gap-2 mx-auto p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                             <LuReceipt /> Descargar informe completo
                          </button>
                      </div>
                   </SectionContainer>
               </div>
            )}

            {/* FAVORITOS */}
            {activeSection === "favoritos" && (
               <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                   <SectionContainer title="Tus Favoritos" subtitle="Lugares que guardaste para después.">
                      {favoritos.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="bg-slate-50 dark:bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
                                <LuHeart className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tu lista está vacía</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6 max-w-sm mx-auto">Guardá los espacios que te gusten para encontrarlos fácilmente cuando estés listo para reservar.</p>
                            <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors inline-block shadow-lg shadow-blue-600/20">
                                Explorar lugares
                            </Link>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {favoritos.map(fav => (
                                <div key={fav.id} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                                    <div className="aspect-[4/3] relative">
                                        <img src={fav.imagenUrl || "/placeholder.jpg"} alt={fav.nombre} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        
                                        <button onClick={() => removeFavorito(fav.id)} className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full text-rose-500 hover:bg-white hover:text-rose-600 shadow-sm opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100" title="Quitar de favoritos">
                                            <LuCircleX className="w-5 h-5 fill-current" />
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-slate-900 dark:text-white truncate text-lg">{fav.nombre}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 truncate">
                                            <LuMapPin className="w-3.5 h-3.5 text-slate-400" /> {fav.direccion}
                                        </p>
                                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                            <span className="font-bold text-slate-900 dark:text-white">
                                                ${fav.precio?.toLocaleString("es-AR")} <span className="text-xs font-normal text-slate-500">/{fav.unidadPrecio?.toLowerCase()}</span>
                                            </span>
                                        </div>
                                        <Link to={`/espacios/${fav.id}`} className="mt-3 block w-full text-center py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors uppercase tracking-wide">
                                            Ver Detalles
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                      )}
                   </SectionContainer>
               </div>
            )}

            {/* CONFIGURACIÓN (Aquí se usan ConfigCard y LuGlobe) */}
            {activeSection === "configuracion" && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                   <SectionContainer title="Configuración de Cuenta" subtitle="Administrá tus datos y preferencias.">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ConfigCard 
                                icon={<LuUser className="w-6 h-6"/>} 
                                title="Datos Personales" 
                                desc="Nombre, email y teléfono de contacto." 
                                actionText="Editar perfil" 
                                onClick={() => setActiveSection("datos_personales")}
                            />
                            <ConfigCard 
                                icon={<LuShieldCheck className="w-6 h-6"/>} 
                                title="Seguridad y Acceso" 
                                desc="Contraseña y verificación de identidad." 
                                actionText="Gestionar seguridad"
                                onClick={() => setActiveSection("seguridad")} 
                            />
                            <ConfigCard 
                                icon={<LuCreditCard className="w-6 h-6"/>} 
                                title="Métodos de Pago" 
                                desc="Tarjetas guardadas y datos bancarios." 
                                actionText="Administrar tarjetas" 
                                onClick={() => setActiveSection("pagos")}
                            />
                            <ConfigCard 
                                icon={<LuGlobe className="w-6 h-6"/>} 
                                title="Preferencias" 
                                desc="Idioma, moneda y notificaciones." 
                                actionText="Cambiar ajustes" 
                                onClick={() => setActiveSection("preferencias")}
                            />
                        </div>
                   </SectionContainer>

                   <SectionContainer title="Soporte y Ayuda">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Aquí se usa LuCircleHelp */}
                            <button onClick={() => setActiveSection('ayuda')} className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl text-left hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group">
                                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-700"><LuCircleHelp className="w-6 h-6 text-slate-600 dark:text-slate-300"/></div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">Centro de Ayuda</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Tutoriales y preguntas frecuentes.</p>
                                </div>
                            </button>
                            <button onClick={() => setActiveSection('atencion_cliente')} className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl text-left hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group">
                                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-700"><LuUser className="w-6 h-6 text-slate-600 dark:text-slate-300"/></div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">Atención al Cliente</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Chatea con nuestro equipo.</p>
                                </div>
                            </button>
                        </div>
                   </SectionContainer>
               </div>
            )}

            {/* 1. DATOS PERSONALES */}
            {activeSection === "datos_personales" && (
                <PersonalDataSection onBack={() => setActiveSection('configuracion')} />
            )}

            {/* 3. PAGOS */}
            {activeSection === "pagos" && (
                <PaymentMethodsSection onBack={() => setActiveSection('configuracion')} />
            )}

            {/* 4. PREFERENCIAS */}
            {activeSection === "preferencias" && (
                <PreferencesSection onBack={() => setActiveSection('configuracion')} />
            )}

            {/* 2. SEGURIDAD */}
            {activeSection === "seguridad" && (
                <SecuritySection onBack={() => setActiveSection('configuracion')} />
            )}

            {/* CENTRO DE AYUDA */}
            {activeSection === "ayuda" && (
                <HelpCenterSection onBack={() => setActiveSection('configuracion')} />
            )}

            {/* ATENCIÓN AL CLIENTE */}
            {activeSection === "atencion_cliente" && (
                <CustomerServiceSection onBack={() => setActiveSection('configuracion')} />
            )}

          </main>
        </div>
      </div>
      
      {/* --- MODAL DE LOGOUT --- */}
      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={handleLogout} 
      />
    </div>
  );
};

export default PerfilPage;