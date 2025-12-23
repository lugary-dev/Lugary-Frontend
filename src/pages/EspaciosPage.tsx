import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import AuthRequiredModal from "../components/AuthRequiredModal";
import { useDebounce } from "../hooks/useDebounce";
import { EspaciosHeader } from "../components/EspaciosHeader";

// --- INTERFACES ---
interface Espacio {
  id: number;
  nombre: string;
  descripcion: string;
  direccion: string;
  ciudad?: string;
  provincia?: string;
  capacidadMaxima: number;
  precio: number;
  unidadPrecio: string;
  activo: boolean;
  imagenUrl?: string; // Legacy, para compatibilidad
  imagenes?: string[]; // [NUEVO] El backend ahora envía la galería completa
  tipo?: string; // Asegúrate de que tu backend devuelva esto si es posible
  calificacion?: number; // Asumo que el backend puede devolver esto
}

interface EspacioPage {
  content: Espacio[];
  last: boolean;
}

// --- UTILS ---
// Algoritmo Fisher-Yates para mezcla equitativa
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// --- COMPONENTE: CARRUSEL PREMIUM ---
const PromotedSection = ({ espacios, onCardClick }: { espacios: Espacio[], onCardClick: (id: number) => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // [NUEVO] Efecto para resetear el scroll al cambiar los espacios
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
      setShowLeftArrow(false);
      setShowRightArrow(scrollRef.current.scrollWidth > scrollRef.current.clientWidth);
    }
  }, [espacios]); // Se ejecuta cada vez que el array de espacios (randomizado) cambia

  // [NUEVO] Efecto para detectar scroll y mostrar/ocultar flecha izquierda
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
      }
    };
    const element = scrollRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (element) element.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === "left" ? -336 : 336; // Ancho de tarjeta + gap
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!espacios || espacios.length === 0) return null;

  return (
    <section className="w-screen ml-[calc(50%-50vw)] py-16 bg-amber-50 dark:bg-slate-900/50 px-4 sm:px-8">
      {/* Encabezado Premium */}
      <div className="flex items-center gap-3 mb-6 px-1">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-amber-600 dark:text-amber-400">
            <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM6.97 11.03a.75.75 0 111.06-1.06l.75.75a.75.75 0 01-1.06 1.06l-.75-.75z" clipRule="evenodd" />
            <path d="M18 9.75a.75.75 0 00-1.5 0v5a.75.75 0 001.5 0v-5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Destacados de la semana
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Experiencias premium seleccionadas para vos.</p>
        </div>
      </div>

      {/* Contenedor del Carrusel */}
      <div className="relative group">
        {/* Botón Izquierda */}
        {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-20 w-12 h-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 border border-slate-200 dark:border-slate-700 hidden lg:flex"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        )}

        {/* Lista Scrolleable */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-8 pt-2 px-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
        >
          {espacios.map((espacio) => (
            <div
              key={espacio.id}
              onClick={() => onCardClick(espacio.id)}
              className="flex-shrink-0 w-80 snap-center cursor-pointer group/card"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-amber-500/20 dark:hover:shadow-amber-500/10 transition-all duration-300 border border-amber-200 dark:border-amber-800 overflow-hidden h-full relative hover:-translate-y-1">
                
                {/* Borde Superior Dorado */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-300 z-10"></div>

                {/* Imagen */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <img
                      src={
                        (espacio.imagenes && espacio.imagenes.length > 0 ? espacio.imagenes[0] : espacio.imagenUrl) || 
                        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop"
                      }
                      alt={espacio.nombre}
                      onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop"; }}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700"
                    />
                  
                  {/* Badge Promocionado */}
                  <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-3 py-1.5 rounded-full text-xs font-extrabold text-amber-700 dark:text-amber-400 shadow-sm border border-amber-100 dark:border-amber-900/30 flex items-center gap-1.5 tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
                    PROMOCIONADO
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1 group-hover/card:text-amber-600 dark:group-hover/card:text-amber-400 transition-colors">
                      {espacio.nombre}
                    </h3>
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>★</span> {espacio.calificacion?.toFixed(1) || "N/A"}
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mb-4">
                    {[espacio.ciudad, espacio.provincia].filter(Boolean).join(", ") ||
                      (espacio.direccion.split(',').length > 1 ?
                        espacio.direccion.split(',').slice(1).join(',').trim() :
                        espacio.direccion)}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                      ${espacio.precio.toLocaleString("es-AR")}
                    </span>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 group-hover/card:underline">Ver detalles</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botón Derecha */}
        {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-20 w-12 h-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 border border-slate-200 dark:border-slate-700 hidden lg:flex"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
        )}
      </div>
    </section>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function EspaciosPage() {
  const navigate = useNavigate();

  // --- ESTADOS DE DATOS ---
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [cargando, setCargando] = useState(true); // Carga inicial de la página
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  // --- ESTADOS DE FILTROS ---
  const [busqueda, setBusqueda] = useState("");
  const debouncedBusqueda = useDebounce(busqueda, 500);

  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);
  const [filtroCapacidad, setFiltroCapacidad] = useState<number | null>(null);
  const [filtroEstrellas, setFiltroEstrellas] = useState<number | null>(null);
  const [filtroDistancia, setFiltroDistancia] = useState<number | null>(null);

  // --- ESTADOS DE PAGINACIÓN ---
  const [pagina, setPagina] = useState(0);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [hayMasResultados, setHayMasResultados] = useState(false);
  const PAGE_SIZE = 25;

  // --- ESTADOS DE UI (DROPDOWNS Y SCROLL) ---
  const [openDropdown, setOpenDropdown] = useState<
    "tipo" | "capacidad" | "estrellas" | "distancia" | null
  >(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // --- ESTADOS DE UBICACIÓN ---
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [locationError, setLocationError] = useState<string | null>(null);

  // --- ESTADO DE AUTENTICACIÓN ---
  const isLoggedIn = !!localStorage.getItem("userEmail");
  
  // Referencia para cerrar al hacer clic afuera (opcional, aquí usaremos un overlay simple)

  // --- [NUEVO] Efecto para controlar el scroll del body cuando el modal de autenticación está abierto ---

  // --- EFECTO: Resetear paginación al cambiar filtros ---
  useEffect(() => {
    setPagina(0);
  }, [debouncedBusqueda, filtroTipo, filtroCapacidad, filtroEstrellas, filtroDistancia, userCoords]);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const cargar = async () => {
      // Usar el spinner principal para la carga inicial (página 0)
      // y un spinner secundario para "cargar más"
      if (pagina === 0) {
        setCargando(true);
      } else {
        setCargandoMas(true);
      }
      setErrorMensaje(null);

      try {
        const params: any = { page: pagina, size: PAGE_SIZE };

        // 1. Búsqueda por texto
        if (debouncedBusqueda) params.busqueda = debouncedBusqueda;

        // 2. Filtros (El backend debe estar preparado para recibir estos parámetros)
        // Si tu backend aún no tiene estos @RequestParam en el Controller,
        // simplemente los ignorará y devolverá la lista filtrada solo por texto.
        if (filtroTipo) params.tipo = filtroTipo;
        if (filtroCapacidad) params.capacidadMinima = filtroCapacidad;
        if (filtroEstrellas) params.calificacionMinima = filtroEstrellas;

        // El filtro de distancia solo se aplica si tenemos las coordenadas del usuario
        if (filtroDistancia && userCoords) {
          params.latitud = userCoords.lat;
          params.longitud = userCoords.lon;
          params.radioKm = filtroDistancia;
        }

        const resp = await api.get<EspacioPage>("/espacios", { params });

        // Manejo defensivo de la respuesta para evitar crashes si la API no devuelve la estructura esperada.
        // Esto permite compatibilidad con backends que devuelven un array simple O un objeto de página.
        let content: Espacio[] = [];
        let last = true;

        if (Array.isArray(resp.data)) {
          // El backend devolvió un array simple (no paginado).
          console.warn("Respuesta de API no paginada. Mostrando todos los resultados. Considere actualizar el backend para devolver un objeto Page.");
          content = resp.data;
          last = true; // Asumimos que es la última página ya que no hay paginación.
        } else {
          // El backend devolvió un objeto de página.
          content = resp.data?.content || [];
          last = resp.data?.last ?? true;
        }

        setHayMasResultados(!last);
        if (pagina === 0) {
          setEspacios(content); // Reemplazar en la primera página
        } else {
          setEspacios((prev) => [...(prev || []), ...content]); // Añadir en páginas siguientes
        }
      } catch (error: any) {
        console.error("Error cargando espacios:", error);
        setErrorMensaje("No pudimos cargar los espacios. Intente nuevamente.");
      } finally {
        setCargando(false);
        setCargandoMas(false);
      }
    };

    cargar();
  }, [
    pagina, debouncedBusqueda, filtroTipo, filtroCapacidad, filtroEstrellas, filtroDistancia, userCoords
  ]);

  const handleCargarMas = () => {
    if (hayMasResultados && !cargandoMas) setPagina(p => p + 1);
  }

  const handleCardClick = (espacioId: number) => {
    // Si hay texto seleccionado en la página, es muy probable que el usuario
    // estuviera intentando copiar texto de la tarjeta y no navegar.
    // En ese caso, evitamos la acción de click para mejorar la experiencia.
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }
    navigate(`/espacios/${espacioId}`);
  };

  // --- DATOS COMPUTADOS ---
  // Simulamos que los primeros 6 espacios son los "Promocionados" para el carrusel.
  // En un caso real, podrías tener un endpoint separado o una propiedad 'promoted' en el objeto.
  const espaciosPromocionados = useMemo(() => {
    const destacados = espacios.slice(0, 6);
    return shuffleArray(destacados);
  }, [espacios]);

  // --- CONTENIDO PRINCIPAL ---
  return ( // Contenedor Raíz (full-width)
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white transition-colors duration-300">
      {/* MODAL GLOBAL DE REQUERIR LOGIN */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Overlay transparente para cerrar dropdowns al hacer clic afuera */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-20 bg-transparent"
          onClick={() => setOpenDropdown(null)}
        />
      )}

      {/* HEADER + BANNER + FILTROS */}
      <EspaciosHeader
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        filtroTipo={filtroTipo}
        setFiltroTipo={setFiltroTipo}
        filtroCapacidad={filtroCapacidad}
        setFiltroCapacidad={setFiltroCapacidad}
        filtroEstrellas={filtroEstrellas}
        setFiltroEstrellas={setFiltroEstrellas}
        filtroDistancia={filtroDistancia}
        setFiltroDistancia={setFiltroDistancia}
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
        isLoggedIn={isLoggedIn}
        onAuthRequired={() => setShowAuthModal(true)}
        setUserCoords={setUserCoords}
        locationError={locationError}
        setLocationError={setLocationError}
      />

      {/* Espacio de respiro */}
      <div className="pt-20"></div>

      {/* SECCIÓN DE ESPACIOS DESTACADOS (CARRUSEL) */}
      {!cargando && !errorMensaje && espacios.length > 0 && busqueda === "" && (
          <PromotedSection espacios={espaciosPromocionados} onCardClick={handleCardClick} />
      )}

      {/* GRID DE RESULTADOS (Contenido Centrado) */}
      <main className="max-w-7xl mx-auto px-2 md:px-4 py-12">
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p>Buscando espacios...</p>
          </div>
        ) : errorMensaje ? (
          <div className="text-center py-20">
            <p className="text-red-500 dark:text-red-400 mb-4">{errorMensaje}</p>
            <button
              onClick={() => navigate(0)}
              className="text-blue-600 underline"
            >
              Reintentar
            </button>
          </div>
        ) : espacios.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
              />
            </svg>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
              No hay resultados.
            </p>
            {/* Nota: El botón de limpiar filtros se movió al header, pero si quisieras uno aquí, tendrías que pasar la función limpiarFiltros desde el padre o duplicarla */}
          </div>
        ) : (
          <>
          {/* Título de la sección principal */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Explora nuestros espacios</h2>
            <p className="mt-1 text-md text-slate-500 dark:text-slate-400">Descubrí la variedad completa de lugares disponibles para tu evento.</p>
          </div>

          {/* GRID PRINCIPAL */}
          {/* Se elimina pt-8 porque el espaciado ahora lo maneja el título de arriba */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
            {espacios.map((espacio) => (
            <div
              key={espacio.id}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-blue-600/30 dark:hover:shadow-blue-400/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full min-w-0"
              onClick={() => handleCardClick(espacio.id)}
            >
              {/* Imagen */}
              <div className="relative aspect-[4/3] bg-slate-200 dark:bg-slate-800 overflow-hidden">
                {/* [MODIFICADO] Usar la primera imagen de la galería o el fallback de imagenUrl */}
                {(espacio.imagenes && espacio.imagenes.length > 0) || espacio.imagenUrl ? (
                  <img
                    src={
                      (espacio.imagenes && espacio.imagenes.length > 0 ? espacio.imagenes[0] : espacio.imagenUrl) as string
                    }
                    alt={espacio.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-300 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-12 h-12 text-slate-400 dark:text-slate-600 opacity-50"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                  </div>
                )}

                {/* Badge de capacidad */}
                <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm">
                  Hasta {espacio.capacidadMaxima} pers.
                </div>
              </div>

              {/* Cuerpo de la tarjeta */}
              <div className="p-5 flex flex-col flex-1">
                {/* Calificación */}
                {(espacio.calificacion ?? 0) > 0 ? (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.728c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {espacio.calificacion?.toFixed(1)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center h-5">
                    <p className="text-xs italic text-slate-400 dark:text-slate-500">
                      Sin calificación aún
                    </p>
                  </div>
                )}

                {/* Separador */}
                <div className="my-3 border-b border-slate-100 dark:border-slate-800"></div>

                {/* Nombre y Dirección */}
                <div className="mb-3">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 mb-1">
                    {espacio.nombre}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 min-w-0">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0">
                      <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.327-1.777C15.475 14.942 18 11.963 18 8.5c0-4.418-3.582-8-8-8s-8 3.582-8 8c0 3.463 2.525 6.442 4.308 8.076.882.81 1.707 1.393 2.327 1.777.31.193.57.337.757.433.094.049.187.096.281.14l.018.008.006.003zM10 11a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    <span className="truncate">
                      {[espacio.ciudad, espacio.provincia].filter(Boolean).join(", ") ||
                        (espacio.direccion.split(',').length > 1 ?
                          espacio.direccion.split(',').slice(1).join(',').trim() :
                          espacio.direccion)}
                    </span>
                  </p>
                </div>

                {/* Footer: precio */}
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mb-0.5">
                      Precio
                    </p>
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {`$${(espacio.precio || 0).toLocaleString("es-AR")}`} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/ {(espacio.unidadPrecio || "hora").toLowerCase()}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
          </>
        )}

        {/* BOTÓN CARGAR MÁS Y SPINNER */}
        {!cargando && (
          <div className="mt-12">
            {cargandoMas ? (
              <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
                <p className="text-sm">Cargando más...</p>
              </div>
            ) : hayMasResultados && espacios.length > 0 ? (
              <div className="flex w-full items-center gap-6">
                <div className="h-px flex-grow bg-slate-300 dark:bg-slate-700"></div>
                <button
                  onClick={handleCargarMas}
                  className="flex-shrink-0 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium px-6 py-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
                >
                  Cargar más
                </button>
                <div className="h-px flex-grow bg-slate-300 dark:bg-slate-700"></div>
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}