import { Dispatch, SetStateAction, useRef, useState, useEffect } from "react";
import { LuNavigation } from "react-icons/lu"; 
import MapProjector from "./MapProjector";
import bannerImg from "../../images/banner.png";

// --- Constantes de Datos ---

// Estructura para los Tipos categorizados
const tiposCategorizados = [
  {
    categoria: "Eventos",
    opciones: ["Quincho", "Salón de Fiestas", "Pelotero"],
  },
  {
    categoria: "Aire Libre",
    opciones: ["Casaquinta / Parque", "Camping"],
  },
  {
    categoria: "Alojamiento",
    opciones: ["Cabaña", "Loft"],
  },
  {
    categoria: "Otros",
    opciones: ["Otro"],
  },
];

// Opciones para el nuevo filtro "Varios"
const amenidadesOpciones = [
  "Para pasar la noche",
  "Dueños verificados",
  "Piscina / Pileta",
  "Estacionamiento",
];

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM6.338 13.162a.75.75 0 01.721.544l.318 1.114a1.875 1.875 0 001.288 1.288l1.114.318a.75.75 0 010 1.442l-1.114.318a1.875 1.875 0 00-1.288 1.288l-.318 1.114a.75.75 0 01-1.442 0l-.318-1.114a1.875 1.875 0 00-1.288-1.288l-1.114-.318a.75.75 0 010-1.442l1.114-.318a1.875 1.875 0 001.288-1.288l.318-1.114a.75.75 0 01.721-.544z" clipRule="evenodd" />
  </svg>
);

interface EspaciosHeaderProps {
  busqueda: string;
  setBusqueda: Dispatch<SetStateAction<string>>;
  filtroTipo: string[];
  setFiltroTipo: Dispatch<SetStateAction<string[]>>;
  filtroAmenidades: string[];
  setFiltroAmenidades: Dispatch<SetStateAction<string[]>>;
  filtroCapacidad: number | null;
  setFiltroCapacidad: Dispatch<SetStateAction<number | null>>;
  filtroEstrellas: number | null;
  setFiltroEstrellas: Dispatch<SetStateAction<number | null>>;
  filtroDistancia: number | null;
  setFiltroDistancia: Dispatch<SetStateAction<number | null>>;
  openDropdown: "tipo" | "capacidad" | "estrellas" | "distancia" | "amenidades" | null;
  setOpenDropdown: Dispatch<SetStateAction<"tipo" | "capacidad" | "estrellas" | "distancia" | "amenidades" | null>>;
  isLoggedIn: boolean;
  onAuthRequired: () => void;
  setUserCoords: Dispatch<SetStateAction<{ lat: number; lon: number } | null>>;
  locationError: string | null;
  setLocationError: Dispatch<SetStateAction<string | null>>;
  onOpenMap?: () => void;
  isMapOpen?: boolean;
  onCloseMap?: () => void;
}

export const EspaciosHeader = ({
  busqueda,
  setBusqueda,
  filtroTipo,
  setFiltroTipo,
  filtroAmenidades,
  setFiltroAmenidades,
  filtroCapacidad,
  setFiltroCapacidad,
  filtroEstrellas,
  setFiltroEstrellas,
  filtroDistancia,
  setFiltroDistancia,
  openDropdown,
  setOpenDropdown,
  isLoggedIn,
  onAuthRequired,
  setUserCoords,
  locationError,
  setLocationError,
  onOpenMap,
  isMapOpen = false,
  onCloseMap = () => {},
}: EspaciosHeaderProps) => {

  const searchBarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [isSearchBarSticky, setIsSearchBarSticky] = useState(false);
  
  // --- NUEVO: Estado para mostrar sugerencias de búsqueda ---
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current && searchBarRef.current) {
        const headerRect = headerRef.current.getBoundingClientRect();
        const headerBottom = headerRect.bottom;
        const navHeight = 64;
        const overlapOffset = 36; // 2.25rem (-mt-9) compensa el margen negativo
        
        // Ajustamos el punto de quiebre para que coincida exactamente cuando la barra se pega visualmente
        const shouldBeSticky = headerBottom <= navHeight + overlapOffset;
        setIsSearchBarSticky(shouldBeSticky);
      }
    };

    // --- NUEVO: Cerrar sugerencias al hacer click fuera ---
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false);
        setOpenDropdown(null);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mousedown", handleClickOutside); // Listener para click outside

    return () => {
        window.removeEventListener("scroll", handleScroll);
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setOpenDropdown]);

  const scrollToSearchBar = () => {
    setTimeout(() => {
      if (searchBarRef.current) {
        const rect = searchBarRef.current.getBoundingClientRect();
        const navHeight = 64; // altura aproximada de la navbar
        const scrollPosition = window.scrollY + rect.top - navHeight - 2;
        window.scrollTo({ top: scrollPosition, behavior: "smooth" });
      }
    }, 100);
  };

  const handleFilterToggle = (
    menu: "tipo" | "capacidad" | "estrellas" | "distancia" | "amenidades"
  ) => {
    if (!isLoggedIn) {
      onAuthRequired();
    } else {
      setOpenDropdown(openDropdown === menu ? null : menu);
      setShowSearchSuggestions(false); // Cerramos sugerencias si abre un filtro
      scrollToSearchBar();
    }
  };

  // --- Lógica para Multi-select ---

  // Función para alternar un tipo en el array
  const toggleTipo = (tipo: string) => {
    setFiltroTipo((prevTipos) => {
      if (prevTipos.includes(tipo)) {
        return prevTipos.filter((t) => t !== tipo); // Quitar si ya existe
      } else {
        return [...prevTipos, tipo]; // Agregar si no existe
      }
    });
  };

   // Función para alternar una amenidad en el array
   const toggleAmenidad = (amenidad: string) => {
    setFiltroAmenidades((prevAmenidades) => {
      if (prevAmenidades.includes(amenidad)) {
        return prevAmenidades.filter((a) => a !== amenidad);
      } else {
        return [...prevAmenidades, amenidad];
      }
    });
  };

  // Estado para el Modal de IA
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Función simulada de "Inteligencia Artificial"
  const handleAIProcess = () => {
    setIsProcessing(true);
    
    // SIMULACIÓN: Imagina que la IA analiza el texto
    setTimeout(() => {
      // 1. Reseteamos filtros actuales
      // Nota: limpiarFiltros verifica login, pero como el modal solo se abre si hay login, es seguro.
      // Sin embargo, para evitar cerrar el modal por error si limpiarFiltros tuviera efectos secundarios de UI,
      // reseteamos los estados manualmente aquí o confiamos en que el usuario ya está logueado.
      setFiltroTipo([]);
      setFiltroAmenidades([]);
      setFiltroCapacidad(null);
      setFiltroEstrellas(null);
      setFiltroDistancia(null);
      setBusqueda("");
      
      // 2. Aplicamos la lógica "inteligente" (Hardcodeada por ahora para el ejemplo)
      const texto = aiPrompt.toLowerCase();
      
      if (texto.includes("pileta") || texto.includes("piscina")) {
        toggleAmenidad("Piscina / Pileta");
      }
      if (texto.includes("quinta")) {
        toggleTipo("Casaquinta / Parque");
      }
      if (texto.includes("cumple") || texto.includes("fiesta")) {
         toggleTipo("Salón de Fiestas");
         toggleTipo("Quincho");
      }
      if (texto.includes("pelotero")) {
         toggleTipo("Pelotero");
      }
      // Detección de números básica para el ejemplo
      const numeros = texto.match(/\d+/);
      if (numeros) {
        setFiltroCapacidad(parseInt(numeros[0]));
      }

      setIsProcessing(false);
      setIsAIModalOpen(false);
      setAiPrompt("");
    }, 1500);
  };

  // Función para usar el micrófono (Web Speech API)
  const toggleMic = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setAiPrompt(prev => prev + (prev ? " " : "") + transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      alert("Tu navegador no soporta reconocimiento de voz.");
    }
  };

  const limpiarFiltros = () => {
    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }
    setFiltroTipo([]);
    setFiltroAmenidades([]);
    setFiltroCapacidad(null);
    setFiltroEstrellas(null);
    setFiltroDistancia(null);
    setUserCoords(null);
    setLocationError(null);
    setBusqueda("");
  };

  // --- NUEVO: Manejador para "Buscar en la zona" ---
  const handleSearchNearMe = () => {
    setShowSearchSuggestions(false); // Cerrar dropdown
    
    // Abrimos el proyector del mapa inmediatamente para el efecto visual
    if (onOpenMap) onOpenMap();
    
    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }

    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Tu navegador no soporta geolocalización.");
      return;
    }

    // Pedimos la ubicación
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
        setFiltroDistancia(25); // Filtro por defecto 25km
        setBusqueda(""); 
      },
      () => {
        setLocationError("No pudimos obtener tu ubicación. Revisá los permisos.");
        setFiltroDistancia(null);
        setUserCoords(null);
      }
    );
  };

  const handleDistanciaClick = (distancia: number) => {
    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }

    setOpenDropdown(null);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("La geolocalización no es soportada por tu navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setFiltroDistancia(distancia);
      },
      () => {
        setLocationError(
          "No se pudo obtener tu ubicación. Revisa los permisos del navegador."
        );
        setFiltroDistancia(null);
        setUserCoords(null);
      }
    );
  };

  const hayFiltrosActivos =
    filtroTipo.length > 0 ||
    filtroAmenidades.length > 0 ||
    filtroCapacidad !== null ||
    filtroEstrellas !== null ||
    filtroDistancia !== null;

  // Clase base para los botones de filtro (estilo limpio, sin fondo de pastilla)
  const filterButtonClass = (isActive: boolean, isOpen: boolean) => `
    text-sm font-medium flex items-center gap-1.5 transition-colors px-2 py-1 rounded-md
    ${isActive || isOpen
      ? 'text-blue-600 dark:text-blue-400 font-semibold' // Activo o abierto: color de acento
      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-700/30' // Inactivo: gris oscuro, hover sutil
    }
  `;

  // Clase para el contenedor de los dropdowns (más ancho para los multi-select)
  const dropdownContainerClass = (isWide: boolean = false) => `
    absolute top-full mt-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-200
    ${isWide ? 'w-72 -left-4' : 'w-56 left-1/2 -translate-x-1/2'}
  `;

  return (
    <>
    <section ref={headerRef} className="relative w-screen ml-[calc(50%-50vw)] -mt-8 h-[550px]">
      {/* Contenedor de Fondo con Imagen y Overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={bannerImg}
          alt="Banner Lugary" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
    </section>

      {/* Barra de Búsqueda Flotante (Sticky) */}
      {/* Usamos sticky para que el navegador maneje la posición suavemente */}
      {/* -mt-9 para que se superponga visualmente al banner (mitad de altura aprox) */}
      <div 
        ref={searchBarRef} 
        className={`sticky top-16 z-40 -mt-9 px-4 transition-all duration-500 ease-out ${isSearchBarSticky ? 'py-2' : 'py-0'}`}
      >
        <div className="mx-auto max-w-6xl transition-all duration-500 ease-out">
        <div className="w-full rounded-[24px] shadow-2xl shadow-slate-900/20 p-2.5 pl-6 flex items-center gap-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-white/20 dark:border-slate-700/30 relative z-20">
          
          {/* Input de búsqueda principal */}
          <div className="flex-grow flex items-center gap-3 relative">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-slate-400">
              <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1116.5 0 8.25 8.25 0 01-16.5 0zm11.03 7.47a.75.75 0 00-1.06 0l-4.5 4.5a.75.75 0 101.06 1.06l4.5-4.5a.75.75 0 000-1.06z" clipRule="evenodd" />
            </svg>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            // --- NUEVO: Abrimos sugerencias al hacer foco ---
            onFocus={() => {
              scrollToSearchBar();
              setShowSearchSuggestions(true);
              setOpenDropdown(null);
            }}
            placeholder="Buscar por nombre, ciudad o tipo..."
            className="w-full bg-transparent focus:outline-none py-2 text-slate-900 dark:text-white placeholder:text-slate-500 font-medium text-base"
          />
          
          {/* --- BOTÓN IA --- */}
          <button
            onClick={() => {
              if (!isLoggedIn) onAuthRequired();
              else setIsAIModalOpen(true);
            }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group mr-2"
            title="Asistente con IA"
          >
             <SparklesIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
             <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-600">Asistente</span>
          </button>

            {/* --- NUEVO: LISTA DESPLEGABLE TIPO AIRBNB (Sugerencias) --- */}
            {showSearchSuggestions && (
              <div className="absolute top-full left-0 w-full sm:w-[400px] mt-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 z-50">
                 <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Sugerencias
                 </div>
                 
                 {/* Opción: En la zona (Geolocalización) */}
                 <button
                    onClick={handleSearchNearMe}
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                 >
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                       <LuNavigation className="w-6 h-6 fill-current transform group-hover:rotate-45 transition-transform" />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Usar ubicación actual</p>
                       <p className="text-xs text-slate-500 dark:text-slate-400">Ver espacios disponibles cerca tuyo</p>
                    </div>
                 </button>
              </div>
            )}

          </div>
          
          {/* Divisor y Filtros */}
          <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 hidden lg:block"></div>
          
          <div className="hidden lg:flex items-center gap-1 relative">
            {/* --- FILTRO TIPO (Multi-select Categorizado) --- */}
            <div className="relative group">
              <button onClick={() => handleFilterToggle("tipo")} className={filterButtonClass(filtroTipo.length > 0, openDropdown === "tipo")}>
                {filtroTipo.length > 0 ? `${filtroTipo.length} seleccionados` : 'Tipo de lugar'}
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${openDropdown === "tipo" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openDropdown === "tipo" && (
                <div className={dropdownContainerClass(true)}>
                  <div className="max-h-96 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                    {tiposCategorizados.map((categoriaData) => (
                      <div key={categoriaData.categoria} className="mb-4 last:mb-0">
                        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-2">
                          {categoriaData.categoria}
                        </h4>
                        <div className="space-y-1">
                          {categoriaData.opciones.map((tipo) => {
                            const isSelected = filtroTipo.includes(tipo);
                            return (
                              <label
                                key={tipo}
                                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'}`}
                              >
                                <span className="text-sm">{tipo}</span>
                                {/* Checkbox visual */}
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                                  {isSelected && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white"><path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" /></svg>}
                                </div>
                                {/* Input oculto para accesibilidad y manejo de estado */}
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={isSelected}
                                  onChange={() => toggleTipo(tipo)}
                                />
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  {filtroTipo.length > 0 && (
                    <div className="border-t border-slate-100 mt-3 pt-3">
                      <button onClick={() => setFiltroTipo([])} className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-800 py-1">
                        Borrar selección
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-3"></div>

            {/* --- FILTRO CAPACIDAD --- */}
            <div className="relative">
              <button onClick={() => handleFilterToggle("capacidad")} className={filterButtonClass(filtroCapacidad !== null, openDropdown === "capacidad")}>
                {filtroCapacidad ? `+${filtroCapacidad} personas` : 'Capacidad'}
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${openDropdown === "capacidad" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openDropdown === "capacidad" && (
                 <div className={dropdownContainerClass()}>
                  {[10, 30, 50, 100, 200].map((cap) => (
                    <button key={cap} onClick={() => { setFiltroCapacidad(cap); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${filtroCapacidad === cap ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>Más de {cap} personas</button>
                  ))}
                </div>
              )}
            </div>

            {/* --- FILTRO CERCANÍA --- */}
             <div className="relative">
              <button onClick={() => handleFilterToggle("distancia")} className={filterButtonClass(filtroDistancia !== null, openDropdown === "distancia")}>
                {filtroDistancia ? `< ${filtroDistancia}km` : 'Cercanía'}
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${openDropdown === "distancia" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openDropdown === "distancia" && (
                <div className={dropdownContainerClass()}>
                  {[5, 10, 25, 50].map((dist) => (
                    <button key={dist} onClick={() => handleDistanciaClick(dist)} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${filtroDistancia === dist ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>A {dist} km</button>
                  ))}
                </div>
              )}
            </div>


            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-3"></div>

            {/* --- NUEVO FILTRO "VARIOS" (Multi-select) --- */}
            <div className="relative">
              <button onClick={() => handleFilterToggle("amenidades")} className={filterButtonClass(filtroAmenidades.length > 0, openDropdown === "amenidades")}>
                {filtroAmenidades.length > 0 ? `${filtroAmenidades.length} filtros` : 'Varios'}
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${openDropdown === "amenidades" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openDropdown === "amenidades" && (
                <div className={dropdownContainerClass(true)}>
                  <div className="space-y-1">
                    {amenidadesOpciones.map((amenidad) => {
                      const isSelected = filtroAmenidades.includes(amenidad);
                      return (
                        <label
                          key={amenidad}
                          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                        >
                          <span className="text-sm">{amenidad}</span>
                          {/* Checkbox visual */}
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                            {isSelected && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white"><path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" /></svg>}
                          </div>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={isSelected}
                            onChange={() => toggleAmenidad(amenidad)}
                          />
                        </label>
                      );
                    })}
                  </div>
                  {filtroAmenidades.length > 0 && (
                    <div className="border-t border-slate-100 mt-3 pt-3">
                      <button onClick={() => setFiltroAmenidades([])} className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-800 py-1">
                        Borrar selección
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* --- BOTÓN LIMPIAR --- */}
            {hayFiltrosActivos && (
              <>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-3"></div>
                <button
                  onClick={limpiarFiltros}
                  className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Limpiar
                </button>
              </>
            )}
          </div>

          {/* Botón de búsqueda */}
          <button
            aria-label="Buscar"
            className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg shadow-blue-500/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
        </div>
        {locationError && (
          <p className="text-center text-xs text-red-500 mt-2 bg-white/80 inline-block px-2 py-1 rounded-md">
            {locationError}
          </p>
        )}

        {/* PROYECTOR DEL MAPA (Integrado en el Header) */}
        <MapProjector isOpen={isMapOpen} onClose={onCloseMap} />
        </div>
      </div>

      {/* --- MODAL IA OPTIMIZADO PARA LUGARY --- */}
      {isAIModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop Blur más suave */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsAIModalOpen(false)}
          ></div>

          {/* Card del Modal */}
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-300">
            
            {/* Header: SLATE OSCURO + ACENTO NARANJA */}
            <div className="bg-slate-900 p-8 text-white text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><SparklesIcon className="w-24 h-24" /></div>
               
               <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-slate-700">
                  <SparklesIcon className="w-6 h-6 text-amber-500" />
               </div>
               
               <SparklesIcon className="w-10 h-10 mx-auto mb-3 opacity-90 animate-pulse-slow" />
               <h3 className="text-2xl font-bold tracking-tight">Asistente Inteligente</h3>
               <p className="text-blue-100 text-sm font-medium mt-1">Decime qué necesitás y yo configuro los filtros.</p>
            </div>

            <div className="p-6 sm:p-8">
              {/* Área de Texto con Micrófono Integrado */}
              <div className="relative group">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ej: Busco una quinta con pileta para festejar un cumpleaños de 50 personas este fin de semana..."
                  className="w-full h-32 p-4 pr-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none resize-none text-slate-700 dark:text-slate-200 transition-all placeholder:text-slate-400 text-base leading-relaxed shadow-inner"
                  autoFocus
                />
                
                {/* Botón Micrófono Flotante */}
                <button 
                  onClick={toggleMic}
                  className={`absolute bottom-3 right-3 p-2.5 rounded-full transition-all shadow-sm ${
                    isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-slate-400 hover:text-blue-600 border border-slate-100'
                  }`}
                  title="Hablar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                  </svg>
                </button>
              </div>

              {/* CHIPS DE SUGERENCIA (NUEVO UX) */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-slate-400 font-medium mr-1 self-center">Probá con:</span>
                {["Cumpleaños infantil", "Asado con amigos", "Fútbol 5", "Evento corporativo"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setAiPrompt(suggestion)}
                    className="px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              {/* Botones de Acción */}
              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setIsAIModalOpen(false)}
                  className="px-6 py-3 rounded-xl text-slate-500 hover:text-slate-800 font-medium hover:bg-slate-100 transition-all text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAIProcess}
                  disabled={!aiPrompt.trim() || isProcessing}
                  className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {isProcessing ? "Procesando..." : <><SparklesIcon className="w-5 h-5 text-amber-400" /> Buscar con Magia</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};