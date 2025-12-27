import { Dispatch, SetStateAction, useRef, useState, useEffect } from "react";
import bannerImg from "../../images/banner.png";

interface EspaciosHeaderProps {
  busqueda: string;
  setBusqueda: Dispatch<SetStateAction<string>>;
  filtroTipo: string | null;
  setFiltroTipo: Dispatch<SetStateAction<string | null>>;
  filtroCapacidad: number | null;
  setFiltroCapacidad: Dispatch<SetStateAction<number | null>>;
  filtroEstrellas: number | null;
  setFiltroEstrellas: Dispatch<SetStateAction<number | null>>;
  filtroDistancia: number | null;
  setFiltroDistancia: Dispatch<SetStateAction<number | null>>;
  openDropdown: "tipo" | "capacidad" | "estrellas" | "distancia" | null;
  setOpenDropdown: Dispatch<SetStateAction<"tipo" | "capacidad" | "estrellas" | "distancia" | null>>;
  isLoggedIn: boolean;
  onAuthRequired: () => void;
  setUserCoords: Dispatch<SetStateAction<{ lat: number; lon: number } | null>>;
  locationError: string | null;
  setLocationError: Dispatch<SetStateAction<string | null>>;
}

export const EspaciosHeader = ({
  busqueda,
  setBusqueda,
  filtroTipo,
  setFiltroTipo,
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
}: EspaciosHeaderProps) => {

  const searchBarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [isSearchBarSticky, setIsSearchBarSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current && searchBarRef.current) {
        const headerRect = headerRef.current.getBoundingClientRect();
        const headerBottom = headerRect.bottom;
        const navHeight = 64;
        
        // Solo hace sticky cuando header ya pasó completamente
        // Esto evita flickering y movimientos bruscos
        const shouldBeSticky = headerBottom <= navHeight;
        setIsSearchBarSticky(shouldBeSticky);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    menu: "tipo" | "capacidad" | "estrellas" | "distancia"
  ) => {
    if (!isLoggedIn) {
      onAuthRequired();
    } else {
      setOpenDropdown(openDropdown === menu ? null : menu);
      scrollToSearchBar();
    }
  };

  const limpiarFiltros = () => {
    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }
    setFiltroTipo(null);
    setFiltroCapacidad(null);
    setFiltroEstrellas(null);
    setFiltroDistancia(null);
    setUserCoords(null);
    setLocationError(null);
    setBusqueda("");
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
    filtroTipo !== null ||
    filtroCapacidad !== null ||
    filtroEstrellas !== null ||
    filtroDistancia !== null;

  return (
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

      {/* Barra de Búsqueda Flotante */}
      <div ref={searchBarRef} className={`${isSearchBarSticky ? 'fixed top-16 left-1/2 -translate-x-1/2 w-screen z-40 px-4 py-3' : 'absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 z-20 px-4'} w-full max-w-5xl transition-all duration-500 ease-out`}>
        <div className="w-full rounded-[20px] shadow-xl p-3 flex items-center gap-3 bg-white/95 dark:bg-slate-800/90 backdrop-blur-lg">
          {/* Input de búsqueda principal */}
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onFocus={scrollToSearchBar}
            placeholder="Buscar por nombre o ciudad..."
            className="flex-grow bg-transparent focus:outline-none px-5 py-4 text-slate-900 placeholder:text-slate-500 transition-all duration-200"
          />
          
          {/* Divisor y Filtros */}
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden lg:block"></div>
          
          <div className="hidden lg:flex items-center">
            {/* --- FILTRO TIPO --- */}
            <div className="relative">
              <button onClick={() => handleFilterToggle("tipo")} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors ${filtroTipo ? 'bg-white/100 dark:bg-slate-800/95 text-[#1A202C] font-semibold' : 'bg-white/80 dark:bg-slate-800/88 text-slate-800 dark:text-slate-200 hover:bg-white/95 dark:hover:bg-slate-800/95'}`}>
                {filtroTipo || 'Tipo'}
                <svg className={`w-3 h-3 transition-transform ${openDropdown === "tipo" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openDropdown === "tipo" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  {["Quincho", "Salón", "Camping", "Parque", "Cabaña"].map((tipo) => (
                    <button key={tipo} onClick={() => { setFiltroTipo(tipo); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${filtroTipo === tipo ? "bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>{tipo}</button>
                  ))}
                  {filtroTipo && <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2"><button onClick={() => { setFiltroTipo(null); setOpenDropdown(null); }} className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1">Borrar filtro</button></div>}
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

            {/* --- FILTRO CAPACIDAD --- */}
            <div className="relative">
              <button onClick={() => handleFilterToggle("capacidad")} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors ${filtroCapacidad ? 'bg-white/100 dark:bg-slate-800/95 text-[#1A202C] font-semibold' : 'bg-white/80 dark:bg-slate-800/88 text-slate-800 dark:text-slate-200 hover:bg-white/95 dark:hover:bg-slate-800/95'}`}>
                {filtroCapacidad ? `${filtroCapacidad}+ pers.` : 'Capacidad'}
                <svg className={`w-3 h-3 transition-transform ${openDropdown === "capacidad" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openDropdown === "capacidad" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  {[10, 30, 50, 100, 200].map((cap) => (
                    <button key={cap} onClick={() => { setFiltroCapacidad(cap); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${filtroCapacidad === cap ? "bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>Más de {cap} personas</button>
                  ))}
                  {filtroCapacidad && <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2"><button onClick={() => { setFiltroCapacidad(null); setOpenDropdown(null); }} className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1">Borrar filtro</button></div>}
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

            {/* --- FILTRO CALIFICACIÓN --- */}
            <div className="relative">
              <button onClick={() => handleFilterToggle("estrellas")} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors ${filtroEstrellas ? 'bg-white/100 dark:bg-slate-800/95 text-[#1A202C] font-semibold' : 'bg-white/80 dark:bg-slate-800/88 text-slate-800 dark:text-slate-200 hover:bg-white/95 dark:hover:bg-slate-800/95'}`}>
                {filtroEstrellas ? `${filtroEstrellas}★+` : 'Calificación'}
                <svg className={`w-3 h-3 transition-transform ${openDropdown === "estrellas" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openDropdown === "estrellas" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  {[4, 3, 2, 1].map((estrellas) => (
                    <button key={estrellas} onClick={() => { setFiltroEstrellas(estrellas); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${filtroEstrellas === estrellas ? "bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>{estrellas}+ estrellas</button>
                  ))}
                  {filtroEstrellas && <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2"><button onClick={() => { setFiltroEstrellas(null); setOpenDropdown(null); }} className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1">Borrar filtro</button></div>}
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

            {/* --- FILTRO CERCANÍA --- */}
            <div className="relative">
              <button onClick={() => handleFilterToggle("distancia")} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors ${filtroDistancia ? 'bg-white/100 dark:bg-slate-800/95 text-[#1A202C] font-semibold' : 'bg-white/80 dark:bg-slate-800/88 text-slate-800 dark:text-slate-200 hover:bg-white/95 dark:hover:bg-slate-800/95'}`}>
                {filtroDistancia ? `< ${filtroDistancia}km` : 'Cercanía'}
                <svg className={`w-3 h-3 transition-transform ${openDropdown === "distancia" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openDropdown === "distancia" && (
                <div className="absolute top-full right-0 mt-3 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  {[5, 10, 25, 50].map((dist) => (
                    <button key={dist} onClick={() => handleDistanciaClick(dist)} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${filtroDistancia === dist ? "bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>A {dist} km</button>
                  ))}
                  {filtroDistancia && <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2"><button onClick={() => { setFiltroDistancia(null); setUserCoords(null); setOpenDropdown(null); }} className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1">Borrar filtro</button></div>}
                </div>
              )}
            </div>

            {/* --- BOTÓN LIMPIAR --- */}
            {hayFiltrosActivos && (
              <>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                <button
                  onClick={limpiarFiltros}
                  className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white underline transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Limpiar
                </button>
              </>
            )}
          </div>

          {/* Botón de búsqueda */}
          <button
            aria-label="Buscar"
            className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg shadow-blue-500/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
        </div>
        {locationError && (
          <p className="text-center text-xs text-red-500 dark:text-red-400 mt-2">
            {locationError}
          </p>
        )}
      </div>
    </section>
  );
};
